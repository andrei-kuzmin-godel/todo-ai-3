# Recurring Tasks

Mark a todo to automatically reappear on a schedule.

## User story

> As a user, I want some todos to recur automatically (e.g., "Take vitamins" every day) so I don't have to re-create them manually.

## Behaviour

- When creating or editing a todo, an optional recurrence picker is available: **Daily**, **Weekly**, **Monthly**, or **None**.
- When a recurring todo is marked complete, a fresh copy is immediately created with the next occurrence date as its deadline. The completed original is kept in the completed list normally.
- The new copy inherits the same text, priority, and recurrence setting.

## Schema change

```ts
type RecurrenceType = 'daily' | 'weekly' | 'monthly' | null;

interface Todo {
  // ...existing fields...
  recurrence?: RecurrenceType;
}
```

## Dependency

Requires the [Due Dates](due-dates.md) feature to be implemented first (the next occurrence date is set as the deadline).

## Acceptance criteria

- Completing a daily recurring todo creates a new todo due tomorrow.
- Completing a weekly recurring todo creates a new todo due 7 days from now.
- A non-recurring todo behaves exactly as before.
