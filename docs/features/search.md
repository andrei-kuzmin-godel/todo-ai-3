# Search

Filter the visible todo list in real time as the user types.

## User story

> As a user with a long todo list, I want to type a keyword and instantly see only matching todos, so I can find what I need without scrolling.

## Behaviour

- Search input appears above the todo list inside the main card.
- Filtering is case-insensitive and matches anywhere in the todo text.
- The existing completion filter (All / Active / Completed) and the search filter apply together — i.e. "active todos matching 'milk'".
- When the query is empty the list shows all todos normally.
- A clear (×) button appears inside the input whenever the query is non-empty; clicking it resets the search.
- No result state: if no todos match, show the existing empty-state UI with a message like "No todos match your search."

## Scope

- No schema change to `Todo`.
- New state `searchQuery: string` in `useTodos`; the existing `filteredTodos` `useMemo` gains a second filter step after the completion filter.
- New component `components/SearchInput.tsx` (controlled, fully stateless).

## Out of scope

- Fuzzy / typo-tolerant matching.
- Searching across archived or deleted todos.

## Acceptance criteria

- Typing in the search box filters the list within the same render cycle.
- Clearing the box restores the full (filter-respecting) list.
- `aria-label="Search todos"` present on the input.
- All existing tests continue to pass; new unit tests cover the `searchQuery` filter path in `useTodos`.
