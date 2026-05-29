# Due Dates

Attach an optional deadline to any todo and see at a glance whether it is overdue, due soon, or in the future.

## User story

> As a user, I want to set a deadline on a todo so I know when it needs to be done — and get a clear warning when I'm running late.

## Behaviour

### Setting a deadline

- `TodoInput` gains an optional `<input type="date">` below the text field.
- The field is labelled "Due date (optional)". Leaving it empty means no deadline.
- Deadline is cleared when the form is submitted successfully.

### Displaying a deadline

A small `<time>` element appears below the todo text in `TodoItem`. It is **not shown for completed todos**.

| Condition | Display | Style |
|---|---|---|
| No deadline | Nothing | — |
| Completed | Nothing | — |
| Past deadline | "2 days overdue" | Red text |
| Due today | "Due today" | Amber text |
| Due tomorrow | "Due tomorrow" | Neutral |
| Future | "Jan 15" (via `Intl.DateTimeFormat`) | Neutral muted |

### Sorting by deadline

The sort toggle in `TodoFilter` (introduced in the Priority feature) gains a **Deadline** mode:
- Todos with earlier deadlines sort first.
- Todos with no deadline sort last.
- Completed todos always sort after active ones.

## Schema change

```ts
// types/todo.ts
interface Todo {
  // ...existing fields...
  deadline?: number;   // ms timestamp (Date.getTime()); undefined = no deadline
}
```

Old todos without a `deadline` field pass `isValidTodo` unchanged and display no deadline indicator.

## Files touched

| File | Change |
|---|---|
| `types/todo.ts` | Add `deadline?` field |
| `hooks/useTodos.ts` | `addTodo` gains `deadline?` arg; deadline sort mode in `filteredTodos` useMemo |
| `components/TodoInput.tsx` | Date picker input; `onAdd` prop gains `deadline?` arg |
| `components/TodoItem.tsx` | Conditional `<time>` element below text with colour-coded label |

## Acceptance criteria

- Setting a deadline of yesterday shows red "1 day overdue" text.
- Setting a deadline of today shows "Due today".
- Completed todos never show an overdue indicator.
- No deadline → no `<time>` element rendered.
- Sort-by-deadline places nearer deadlines higher; no-deadline todos go last.
- All existing tests pass; new tests cover overdue/today/tomorrow/future display logic.
