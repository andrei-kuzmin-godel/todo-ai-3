# Keyboard Shortcuts

Power-user shortcuts for navigating and acting on todos without touching the mouse.

## User story

> As a power user, I want to navigate and manage my todos entirely from the keyboard so I can stay in flow.

## Shortcuts

| Shortcut | Action |
|---|---|
| `/` | Focus the search input |
| `n` | Focus the new todo input |
| `Ctrl/Cmd+Z` | Undo last destructive action (already part of [Undo](undo.md)) |
| `j` / `↓` | Move focus to the next todo in the list |
| `k` / `↑` | Move focus to the previous todo in the list |
| `Space` | Toggle completion on the focused todo |
| `e` | Enter edit mode on the focused todo |
| `Delete` / `Backspace` | Delete the focused todo (with confirmation or undo toast) |
| `Escape` | Clear search / cancel edit / dismiss toast |
| `?` | Show/hide the shortcut reference panel |

## Implementation notes

- A `useKeyboardNav` hook manages list focus state (index of the currently focused todo).
- Global shortcuts (`/`, `n`, `?`, `Ctrl+Z`) are registered in a `useEffect` at the page level, guarded to not fire when the user is typing in an input.
- A small `<KeyboardShortcutsHelp>` overlay component is toggled by `?`.

## Acceptance criteria

- Pressing `/` focuses the search input from anywhere on the page.
- Pressing `j`/`k` moves focus through the todo list with visible focus ring.
- All shortcuts are listed in the help overlay.
- Shortcuts do not fire while the user is typing in any text input.
