import { createServer as createHttpServer } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const appDir = join(rootDir, 'app');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

export async function findAvailablePort(preferredPort, host = '127.0.0.1') {
  for (let port = preferredPort; port < preferredPort + 50; port += 1) {
    if (await canListen(port, host)) return port;
  }
  throw new Error(`No available port found from ${preferredPort}`);
}

function canListen(port, host) {
  return new Promise((resolveListen) => {
    const server = createNetServer();
    server.once('error', () => resolveListen(false));
    server.once('listening', () => server.close(() => resolveListen(true)));
    server.listen(port, host);
  });
}

export async function writeWorkspaceFiles(projectRoot, files) {
  const normalizedRoot = resolve(projectRoot);
  const entries = Object.entries(files);
  const prepared = entries.map(([relativePath, content]) => {
    const cleanPath = normalize(relativePath);
    const target = resolve(normalizedRoot, cleanPath);
    if (cleanPath.startsWith('..') || cleanPath.startsWith('/') || !target.startsWith(`${normalizedRoot}/`)) {
      throw new Error(`Refusing to write outside project root: ${relativePath}`);
    }
    return [target, String(content)];
  });

  await removeStaleGraphNodeFiles(normalizedRoot, files);

  for (const [target, content] of prepared) {
    await mkdir(resolve(target, '..'), { recursive: true });
    await writeFile(target, content, 'utf8');
  }
}

export async function runOpenCodeNode(projectRoot, payload, options = {}) {
  const normalizedRoot = resolve(projectRoot);
  await writeWorkspaceFiles(normalizedRoot, payload.files ?? {});
  const runner = options.runner ?? runCommand;
  const model = options.model ?? process.env.OPENCODE_MODEL ?? 'openai/gpt-5.5-fast';
  const timeoutMs = Number(options.timeoutMs ?? process.env.OPENCODE_TIMEOUT_MS ?? 60000);
  const { stdout, stderr } = await runner('opencode', ['run', '--dir', normalizedRoot, '--model', model, payload.prompt], { cwd: normalizedRoot, timeoutMs });
  const artifact = `.harness-rpg/opencode/${payload.nodeId}-result.md`;
  await writeWorkspaceFiles(normalizedRoot, {
    [artifact]: `${stdout || stderr || 'OpenCode completed without text output.'}\n`,
  });
  return {
    ok: true,
    nodeId: payload.nodeId,
    agentId: payload.agentId,
    agentIds: payload.agentIds ?? [],
    skills: payload.skills ?? [],
    stdout,
    stderr,
    artifact,
  };
}

function runCommand(command, args, options) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { ...options, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    const killChild = (signal) => {
      try {
        process.kill(-child.pid, signal);
      } catch {
        child.kill(signal);
      }
    };
    let forceKill = null;
    const timeout = options.timeoutMs ? setTimeout(() => {
      killChild('SIGTERM');
      forceKill = setTimeout(() => killChild('SIGKILL'), 1000);
      reject(new Error(`opencode timed out after ${options.timeoutMs}ms`));
    }, options.timeoutMs) : null;
    child.on('error', (error) => {
      if (timeout) clearTimeout(timeout);
      if (forceKill) clearTimeout(forceKill);
      reject(error);
    });
    child.on('close', (code) => {
      if (timeout) clearTimeout(timeout);
      if (forceKill) clearTimeout(forceKill);
      if (code === 0) {
        resolveRun({ stdout: stdout.trim(), stderr: stderr.trim() });
        return;
      }
      const error = new Error(`opencode exited with code ${code}: ${stderr || stdout}`);
      error.stdout = stdout.trim();
      error.stderr = stderr.trim();
      reject(error);
    });
  });
}

async function removeStaleGraphNodeFiles(projectRoot, files) {
  const graphDir = resolve(projectRoot, '.harness-rpg/graphs/current');
  const expected = new Set(Object.keys(files)
    .filter((relativePath) => relativePath.startsWith('.harness-rpg/graphs/current/'))
    .map((relativePath) => resolve(projectRoot, normalize(relativePath))));
  if (!expected.size) return;
  let entries;
  try {
    entries = await readdir(graphDir);
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  await Promise.all(entries
    .filter((entry) => /^\d{2}_.+_NODE\.md$/.test(entry))
    .map((entry) => resolve(graphDir, entry))
    .filter((target) => !expected.has(target))
    .map((target) => unlink(target)));
}

export function createDevServer(projectRoot = rootDir, options = {}) {
  return createHttpServer(async (request, response) => {
    try {
      if (request.method === 'POST' && request.url === '/api/export-workspace') {
        const body = await readRequestBody(request);
        const payload = JSON.parse(body || '{}');
        await writeWorkspaceFiles(projectRoot, payload.files ?? {});
        sendJson(response, 200, { ok: true, written: Object.keys(payload.files ?? {}).length });
        return;
      }

      if (request.method === 'POST' && request.url === '/api/opencode-node') {
        const body = await readRequestBody(request);
        const payload = JSON.parse(body || '{}');
        try {
          const result = await runOpenCodeNode(projectRoot, payload, options.opencode ?? {});
          sendJson(response, 200, result);
        } catch (error) {
          sendJson(response, 200, { ok: false, nodeId: payload.nodeId, error: error.message });
        }
        return;
      }

      if (request.method === 'GET' && request.url === '/api/project-info') {
        sendJson(response, 200, {
          projectRoot: resolve(projectRoot),
          harnessRoot: rootDir,
        });
        return;
      }

      if (request.method !== 'GET') {
        sendText(response, 405, 'Method Not Allowed');
        return;
      }

      const requestPath = new URL(request.url ?? '/', 'http://localhost').pathname;
      const filePath = resolve(appDir, requestPath === '/' ? 'index.html' : `.${requestPath}`);
      if (!filePath.startsWith(`${appDir}/`)) {
        sendText(response, 403, 'Forbidden');
        return;
      }

      const content = await readFile(filePath);
      response.writeHead(200, { 'content-type': mimeTypes[extname(filePath)] ?? 'application/octet-stream' });
      response.end(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        sendText(response, 404, 'Not Found');
        return;
      }
      sendJson(response, 500, { ok: false, error: error.message });
    }
  });
}

function readRequestBody(request) {
  return new Promise((resolveBody, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => resolveBody(body));
    request.on('error', reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, { 'content-type': 'text/plain; charset=utf-8' });
  response.end(text);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const preferredPort = Number(process.env.PORT ?? 4173);
  const host = process.env.HOST ?? '127.0.0.1';
  const port = await findAvailablePort(preferredPort, host);
  const projectRoot = resolve(process.env.HARNESS_RPG_PROJECT_ROOT ?? rootDir);
  const server = createDevServer(projectRoot);
  server.listen(port, host, () => {
    console.log(`Harness RPG dev server running at http://${host}:${port}`);
    console.log(`Harness RPG project root: ${projectRoot}`);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} was busy; using ${port} instead.`);
    }
  });
}
