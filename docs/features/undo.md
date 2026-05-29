# Undo

Recover from accidental deletions with a one-step undo, triggered by a toast notification or keyboard shortcut.

## User story

> As a user, I want to undo the last delete or "clear completed" action so I don't lose todos by accident.

## Behaviour

### Triggering undo

- After `deleteTodo` or `clearCompleted`, a toast notification slides in at the bottom of the card.
- The toast shows a message ("Todo deleted" / "X completed todos cleared") and an **Undo** button.
- The toast auto-dismisses after 5 seconds.
- Pressing **Cmd+Z** (Mac) or **Ctrl+Z** (Windows/Linux) at any time also triggers undo.
- Undo restores the todos list to the state before the last destructive action.
- Only one level of undo is exposed in the UI (the toast shows only the most recent action). The hook stores up to 20 snapshots internally.

### Toast component

- Renders in a fixed position at the bottom of the main card.
- Contains: icon + message text + Undo button + optional dismiss (×) button.
- Automatically disappears after 5 s via a `useEffect` timeout.
- Is not shown when there is nothing to undo.

## Implementation notes

- `useTodos` maintains a `history: Todo[][]` stack (array of full snapshots), capped at 20 entries.
- `deleteTodo` and `clearCompleted` push the current `todos` snapshot onto `history` before mutating.
- `reorderTodos` (drag-and-drop) also pushes to history.
- `undo()` pops the last snapshot and calls `setTodos(snapshot)`.
- `canUndo: boolean` (derived from `history.length > 0`) is exposed from the hook.
- The keyboard listener lives in a `useEffect` in `useTodos`; cleanup removes the listener on unmount.

## Files touched

| File | Change |
|---|---|
| `hooks/useTodos.ts` | `history` stack; `undo()`; `canUndo`; history pushes in `deleteTodo` and `clearCompleted` |
| `components/Toast.tsx` | New component — message + Undo button + auto-dismiss |
| `app/page.tsx` | Mount `<Toast>` inside the card; wire `onUndo`/`canUndo`/`toastMessage` |

## Acceptance criteria

- Deleting a todo shows a toast; clicking Undo restores it.
- "Clear completed" shows a toast; clicking Undo restores all cleared todos.
- Toast disappears after 5 s if not acted on.
- Ctrl+Z / Cmd+Z restores the last state.
- Undo is not available after a non-destructive action (toggle, edit).
- All existing tests pass; new tests cover push/pop history, `canUndo` flag, and 20-item cap.
