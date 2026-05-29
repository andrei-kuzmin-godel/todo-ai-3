# Export / Import

Download your todos as a JSON file and re-import them later.

## User story

> As a user, I want to export my todos to a file for backup or to move them to another browser, and import them back when needed.

## Behaviour

### Export

- A small "Export" button in the footer or settings area downloads a `todos.json` file.
- The file contains the full todos array including all fields (text, completed, priority, deadline, etc.).
- Uses the browser `Blob` + `URL.createObjectURL` API — no server needed.

### Import

- An "Import" button opens a file picker (`<input type="file" accept=".json">`).
- After selection, the file is parsed and validated (each item must pass `isValidTodo`).
- The user is prompted: **Replace** existing todos or **Merge** (append, skipping duplicate IDs).
- Invalid items are silently skipped; the user sees a count of how many were imported.

## Scope

- Client-side only, no backend required.
- No schema change.
- Works before and after Supabase integration (exports from localStorage or Supabase, imports into whichever is active).

## Acceptance criteria

- Exported JSON can be re-imported and produces an identical list.
- Importing a file with some invalid entries imports only the valid ones and shows a count.
- Merge mode does not create duplicate todos (matched by `id`).
- Export and import buttons have accessible labels.
