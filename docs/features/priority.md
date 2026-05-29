# Priority Levels

Let users mark each todo as High, Medium, or Low priority, and optionally sort by priority.

## User story

> As a user, I want to mark tasks as high, medium, or low priority so I can focus on what matters most.

## Behaviour

### Setting priority

- `TodoInput` gains three small toggle buttons — **High**, **Medium**, **Low** — below the text field.
- The selected button is visually highlighted (`ring-2`). Default selection is **Medium**.
- Each button has a colored dot: red (High), yellow (Medium), green (Low).
- Priority is submitted with the todo when the form is submitted.

### Displaying priority

- Each `TodoItem` shows a colored left border stripe (`border-l-4`):
  - High → `border-l-red-400`
  - Medium → `border-l-yellow-400`
  - Low → `border-l-emerald-400`
  - Completed → `border-l-transparent` (priority de-emphasised)
- Priority can be changed inline from `TodoItem` (small pill selector visible on hover, same three options).

### Sorting

- `TodoFilter` gains a sort toggle: **Default** | **Priority** | **Deadline**.
- Priority sort order: High → Medium → Low; completed todos always appear after active ones regardless of priority.

## Schema change

```ts
// types/todo.ts
export type PriorityLevel = 'high' | 'medium' | 'low';
export type SortMode = 'default' | 'priority' | 'deadline';

interface Todo {
  // ...existing fields...
  priority?: PriorityLevel;   // undefined treated as 'medium'
}
```

Old todos stored in localStorage have no `priority` field; they pass the existing `isValidTodo` guard unchanged and are treated as `'medium'` everywhere.

## Files touched

| File | Change |
|---|---|
| `types/todo.ts` | Add `PriorityLevel`, `SortMode`, `priority?` field |
| `hooks/useTodos.ts` | `addTodo` gains `priority?` arg; `sortMode` state; priority sort in `filteredTodos` useMemo |
| `components/TodoInput.tsx` | Priority selector buttons; `onAdd` prop gains `priority` arg |
| `components/TodoItem.tsx` | Left border stripe; inline priority change on hover |
| `components/TodoFilter.tsx` | Sort mode toggle; new `sortMode`/`setSortMode` props |

## Acceptance criteria

- New todo created with High priority shows red border stripe.
- Sort-by-priority places High todos before Medium before Low; completed todos always last.
- Old localStorage todos without a `priority` field load and display correctly (treated as Medium).
- `aria-pressed` on each priority button reflects the current selection.
- All existing tests pass; new tests cover priority sort and `addTodo` with priority.
