import { createServer as createHttpServer } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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

  for (const [target, content] of prepared) {
    await mkdir(resolve(target, '..'), { recursive: true });
    await writeFile(target, content, 'utf8');
  }
}

export function createDevServer(projectRoot = rootDir) {
  return createHttpServer(async (request, response) => {
    try {
      if (request.method === 'POST' && request.url === '/api/export-workspace') {
        const body = await readRequestBody(request);
        const payload = JSON.parse(body || '{}');
        await writeWorkspaceFiles(projectRoot, payload.files ?? {});
        sendJson(response, 200, { ok: true, written: Object.keys(payload.files ?? {}).length });
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
  const server = createDevServer(rootDir);
  server.listen(port, host, () => {
    console.log(`Harness RPG dev server running at http://${host}:${port}`);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} was busy; using ${port} instead.`);
    }
  });
}
