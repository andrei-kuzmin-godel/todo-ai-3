# Drag-and-Drop Reordering

Reorder todos by dragging them up or down the list. Works on mouse and touch.

## User story

> As a user, I want to drag a todo to a new position in the list so I can arrange tasks in the order I want to work on them.

## Behaviour

- Each `TodoItem` shows a drag handle (grip icon) on its left side.
- The handle is visible at low opacity and becomes fully visible on row hover.
- Dragging a row repositions it live; dropping it commits the new order.
- The reordered order is persisted to localStorage immediately.
- Touch devices are supported (pointer sensor from dnd-kit).
- The drag handle is keyboard-accessible: focus it, then use arrow keys to move the item.
- Reorder is push-to-history so it can be undone (see [Undo](undo.md)).

## Interaction with sort modes

Drag-and-drop is the manual order. It is active when `sortMode === 'default'`. When the user switches to Priority or Deadline sort, manual dragging is disabled (the handle is not rendered or is visually dimmed with a tooltip explaining why).

## Dependencies

```
@dnd-kit/core       — DnD context and sensor machinery
@dnd-kit/sortable   — useSortable hook and SortableContext
@dnd-kit/utilities  — arrayMove helper
```

These three packages are peer-dependent; all three must be installed together.

## Implementation notes

- `useTodos` gains `reorderTodos(activeId: string, overId: string)` — calls `arrayMove` on the `todos` array after pushing a history snapshot.
- `TodoItem` uses `useSortable(todo.id)` from `@dnd-kit/sortable`. The drag handle element is the activator, keeping the rest of the row's click targets (toggle, edit, delete) unaffected.
- `page.tsx` wraps `<ul>` in `<DndContext onDragEnd={...}>` + `<SortableContext items={todoIds}>`.
- The `onDragEnd` handler extracts `active.id` and `over.id` and calls `reorderTodos`.

## Files touched

| File | Change |
|---|---|
| `hooks/useTodos.ts` | `reorderTodos(activeId, overId)` |
| `components/TodoItem.tsx` | `useSortable` integration; drag handle button |
| `app/page.tsx` | `DndContext` + `SortableContext` providers; `onDragEnd` handler |
| `package.json` | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |

## Acceptance criteria

- Dragging a todo to a new position visually and persistently reorders it.
- Order survives a page reload (localStorage persisted).
- Clicking toggle / edit / delete still works normally — drag handle does not interfere.
- Touch drag works on mobile.
- When `sortMode` is not `'default'`, the drag handle is hidden/disabled.
- Reorder can be undone via Ctrl+Z or the Undo toast.
- All existing tests pass; new tests cover `reorderTodos` array mutation and localStorage persistence (dnd interaction tested via the hook, not simulated pointer events).
