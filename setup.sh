#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: bash setup.sh [target-project]

Installs a project-local Harness RPG launcher into an existing Claude Code,
OpenCode, Copilot, Codex, or other agent workspace.

Examples:
  bash /path/to/harness-rpg/setup.sh
  bash /path/to/harness-rpg/setup.sh /path/to/agent-project

Then run from the target project:
  ./.harness-rpg/bin/harness-rpg
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
target_arg="${1:-$PWD}"
mkdir -p "$target_arg"
target_root="$(cd "$target_arg" && pwd -P)"

if [[ ! -f "$script_dir/scripts/dev-server.mjs" || ! -f "$script_dir/app/index.html" ]]; then
  echo "setup.sh must be run from a complete harness-rpg clone." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required to run Harness RPG, but no node binary was found." >&2
  exit 1
fi

install_dir="$target_root/.harness-rpg"
bin_dir="$install_dir/bin"
launcher="$bin_dir/harness-rpg"
env_file="$install_dir/harness-rpg.env"
readme_file="$install_dir/README.md"

mkdir -p "$bin_dir"

cat > "$launcher" <<LAUNCHER
#!/usr/bin/env bash
set -euo pipefail

export HARNESS_RPG_ROOT='$script_dir'
export HARNESS_RPG_PROJECT_ROOT='$target_root'

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required to run Harness RPG." >&2
  exit 1
fi

cd "\$HARNESS_RPG_ROOT"
exec node "\$HARNESS_RPG_ROOT/scripts/dev-server.mjs" "\$@"
LAUNCHER
chmod +x "$launcher"

cat > "$env_file" <<ENVFILE
HARNESS_RPG_ROOT=$script_dir
HARNESS_RPG_PROJECT_ROOT=$target_root
HARNESS_RPG_LAUNCHER=$launcher
ENVFILE

cat > "$readme_file" <<README
# Harness RPG project setup

This project is connected to a local Harness RPG clone for Claude Code, OpenCode, Copilot, Codex, and other agent workspaces.

Run:

\`\`\`bash
./.harness-rpg/bin/harness-rpg
\`\`\`

Optional environment variables:

- \`PORT=4173\` to choose the web server port.
- \`HOST=127.0.0.1\` to choose the bind host.
- \`OPENCODE_MODEL=openai/gpt-5.5-fast\` to choose the OpenCode model.
- \`OPENCODE_TIMEOUT_MS=60000\` to control node execution timeout.

Harness RPG writes graph exports, agent markdown, skills, bridge events, and result artifacts under this project's \`.harness-rpg/\` directory.
README

echo "Harness RPG installed for: $target_root"
echo "Launcher: $launcher"
echo "Run: $launcher"
