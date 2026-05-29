# CLAUDE.md

## Commands

```bash
npm run dev    # dev server on http://localhost:3000
npm run build  # production build
npm run lint   # ESLint
```

No test framework exists — there is no `npm test`.

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
