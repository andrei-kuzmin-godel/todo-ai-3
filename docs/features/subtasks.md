# Subtasks / Checklists

Break a complex todo into smaller, checkable steps.

## User story

> As a user, I want to add sub-items to a todo so I can track progress on multi-step tasks without creating separate top-level todos.

## Behaviour

- A todo can have zero or more subtasks.
- Subtasks are shown as an indented checklist below the parent todo text, revealed by clicking an expand toggle.
- Each subtask has its own completion checkbox.
- Subtasks can be added inline (small input at the bottom of the expanded list) and deleted individually.
- The parent todo shows a progress indicator ("2 / 5") next to its text when it has subtasks.
- Completing all subtasks does not automatically complete the parent (user must toggle the parent separately).

## Schema change

```ts
interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

interface Todo {
  // ...existing fields...
  subTasks?: SubTask[];
}
```

## Complexity note

This feature involves nested state mutations and is significantly more complex than Phase 1 features. It should be implemented after the Supabase backend is in place if cloud sync is desired, so subtasks are persisted in the `todos.sub_tasks` JSONB column.

## Acceptance criteria

- Adding a subtask shows it in the expanded checklist.
- Checking a subtask updates its `completed` state and the parent's progress indicator.
- Collapsing and re-expanding the parent retains subtask state.
- Subtasks persist to localStorage / Supabase on every mutation.
