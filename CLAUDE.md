# CLAUDE.md

## Commands

```bash
npm run dev    # dev server on http://localhost:3000
npm run build  # production build
npm run lint   # ESLint
npm test       # run tests (Vitest, watch mode)
npm run test:coverage  # single run with coverage report
```

## Testing

- **Framework**: Vitest + React Testing Library + jsdom
- Test files live in `__tests__/` subdirectories next to the source they test
- `hooks/__tests__/useTodos.test.ts` — hook unit tests (CRUD, computed values, localStorage)
- `components/__tests__/Todo*.test.tsx` — component interaction tests

## Browser debugging

The app can be driven interactively in a real (headless) browser to debug and
visually verify UI changes — not just via Vitest.

- **Dev server**: `http://localhost:3000`. Dev mode has **no** basePath; the
  `/todo-ai-3` basePath only applies to the static export (see Build modes), so
  localhost works directly.
- **Driver**: the **Playwright MCP server** (configured in `.mcp.json`) exposes
  browser tools — `browser_navigate`, `browser_click`, `browser_type`,
  `browser_snapshot` (accessibility tree), `browser_take_screenshot`,
  `browser_console_messages`, `browser_network_requests`.
- **Provisioning**: `.claude/hooks/session-start.sh` (a SessionStart hook) runs
  each session to install the Playwright chromium binary and start the dev
  server, since the remote container is wiped between sessions. The browser is
  installed via the project-local Playwright pinned through `@playwright/mcp`, so
  its revision matches the MCP server.

## Architecture

- Next.js 16 App Router, **fully client-side** — every interactive file has `'use client'`
- All state and CRUD logic lives in `hooks/useTodos.ts` (single source of truth)
- Persistence: browser `localStorage` (key: `todo-ai-3-todos`), loaded on mount via `useEffect`
- No backend, no API routes, no server components, no external state library

```
app/           # Next.js App Router (layout, page, global CSS)
components/    # Presentational components (TodoInput, TodoItem, TodoFilter)
hooks/         # useTodos.ts — state + localStorage sync
types/         # todo.ts — Todo interface and FilterType union
```

## Build modes (critical)

The same codebase produces two output formats controlled by env vars at build time:

| Mode | Command | Output | Used by |
|---|---|---|---|
| Standalone | `npm run build` | `.next/` | Docker / `npm start` |
| Static export | `NEXT_OUTPUT=export REPO_NAME=todo-ai-3 npm run build` | `out/` | GitHub Pages |

**Never edit `next.config.ts` directly to change the output mode** — use the env vars. The CI workflow sets them automatically.

## Code conventions

- **Components**: default export, PascalCase filename, `components/` directory, props typed with an inline interface
- **Hooks**: named export, `use` prefix, `hooks/` directory
- All mutating functions in hooks wrapped in `useCallback`
- IDs generated with `crypto.randomUUID()` (browser built-in, no library needed)
- **Styling**: Tailwind utility classes only — no CSS modules, no inline `style` objects, no external CSS
- **Types**: defined in `types/todo.ts`, imported via the `@/types/todo` path alias

## Accessibility

Every interactive element must have an `aria-label`. Decorative SVGs use `aria-hidden="true"`. Follow the pattern established in `components/TodoItem.tsx` and `components/TodoInput.tsx`.
