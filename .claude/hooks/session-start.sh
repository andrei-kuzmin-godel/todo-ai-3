#!/bin/bash
# SessionStart hook — provision interactive browser debugging.
#
# The remote (Claude Code on the web) container is ephemeral and wiped between
# sessions, so each session must reinstall the Playwright chromium binary and
# start the dev server. Once ready, the Playwright MCP server (see .mcp.json)
# can drive the app at http://localhost:3000 to debug and verify changes.
set -euo pipefail

# Only needed in the remote container; skip on local machines.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# 1. Node dependencies (idempotent; npm install benefits from container caching).
if [ ! -d node_modules ]; then
  npm install
fi

# 2. Playwright chromium binary the MCP server launches. Resolves the
#    project-local Playwright pinned via @playwright/mcp, so the browser
#    revision matches the MCP. Skips the download if already present.
npx playwright install chromium

# 3. Dev server on http://localhost:3000 — start only if not already running.
if ! curl -sf -o /dev/null http://localhost:3000; then
  nohup npm run dev > /tmp/todo-dev.log 2>&1 &
  # Wait (without a foreground sleep) for it to accept connections.
  curl -sf --retry 30 --retry-delay 1 --retry-connrefused -o /dev/null \
    http://localhost:3000 || echo "dev server slow to start; see /tmp/todo-dev.log"
fi

echo "Browser debugging ready: dev server on http://localhost:3000 (drive it via the Playwright MCP)"
