# Roadmap

## Phase 1 — Core UX (no backend, ~7 h)

Each feature is self-contained and deployable independently.

| # | Feature | File | Effort |
|---|---|---|---|
| 1 | [Priority Levels](features/priority.md) | `TodoInput`, `TodoItem`, `TodoFilter` | 2 h |
| 2 | [Due Dates](features/due-dates.md) | `TodoInput`, `TodoItem` | 2 h |
| 3 | [Undo](features/undo.md) | `useTodos`, `Toast` component | 2 h |
| 4 | [Drag-and-Drop Reordering](features/drag-and-drop.md) | `TodoItem`, `page.tsx`, `@dnd-kit` | 3 h |

## Phase 2 — Cloud Backend (~5 h)

Requires a Supabase project. Email/password auth works on the current GitHub Pages static export. OAuth requires moving to Vercel.

| # | Feature | File | Effort |
|---|---|---|---|
| 6 | [Supabase Auth + Cloud Sync](features/supabase.md) | `lib/supabase.ts`, `useAuth`, `AuthForm` | 4–5 h |

## Phase 3 — Polish (optional)

| Feature | File |
|---|---|
| [Subtasks / Checklists](features/subtasks.md) | |
| [Recurring Tasks](features/recurring-tasks.md) | |
| [Keyboard Shortcuts](features/keyboard-shortcuts.md) | |
| [Export / Import](features/export-import.md) | |
