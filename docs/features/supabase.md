# Supabase — Cloud Sync & Multi-User Auth

Replace localStorage-only storage with a Supabase Postgres backend. Users sign up, log in, and see their todos across any device.

## User story

> As a user, I want to create an account so my todos are saved in the cloud and available on any device I log in from.

## What this unlocks

- Email/password sign-up and login.
- Todos stored in Supabase Postgres, scoped to the authenticated user via Row Level Security.
- Multi-device sync: same todos on laptop and phone.
- localStorage is kept as an offline fallback (optimistic writes).

## Deployment constraint

| Deployment | Email/password auth | OAuth (Google, GitHub) |
|---|---|---|
| GitHub Pages (static export, current) | Works | Does **not** work — OAuth requires a server-side callback route |
| Vercel / Railway | Works | Works — use `@supabase/ssr` instead of bare client |

If OAuth is required, move hosting to Vercel and switch to `@supabase/ssr`.

## Database schema

```sql
CREATE TABLE todos (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text        TEXT    NOT NULL,
  completed   BOOLEAN DEFAULT false,
  created_at  BIGINT,   -- createdAt timestamp ms
  priority    TEXT,     -- 'high' | 'medium' | 'low'
  deadline    BIGINT    -- ms timestamp; null = no deadline
);

CREATE INDEX ON todos(user_id);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own todos" ON todos
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

The single policy covers SELECT, INSERT, UPDATE, and DELETE — users can only touch their own rows.

## Environment variables

Both are safe to expose client-side (protected by RLS, not the key):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` — it bypasses RLS.

## New files

| File | Purpose |
|---|---|
| `lib/supabase.ts` | Single `createClient(URL, ANON_KEY)` instance |
| `hooks/useAuth.ts` | `signUp`, `signIn`, `signOut`, `user`, `session` state |
| `components/AuthForm.tsx` | Email/password login + sign-up form; toggle between modes |

## Changes to `useTodos`

- On mount: if `user` is authenticated, fetch todos from Supabase; merge with any existing localStorage todos (server wins on conflict).
- Each mutation (`addTodo`, `editTodo`, `deleteTodo`, `toggleTodo`, `clearCompleted`): optimistic localStorage update first → async Supabase write. On failure, surface error via toast.
- On sign-out: clear in-memory todos; keep localStorage intact for offline use.

## Auth flow in `page.tsx`

- If `user` is null: render `<AuthForm>` instead of (or above) the todo card.
- If `user` exists: render the todo card as normal, plus a sign-out button in the header.

## Migration from localStorage

No destructive migration. On first authenticated load:
1. Fetch todos from Supabase (initially empty for a new user).
2. If localStorage contains todos and Supabase is empty, offer to import them ("Import your existing todos?").
3. After import, Supabase becomes the source of truth.

## Packages

```
npm install @supabase/supabase-js        # static export / GitHub Pages
# OR
npm install @supabase/ssr                # Vercel deployment with OAuth
```

## Acceptance criteria

- User can sign up with email + password; confirmation email is optional (can disable in Supabase dashboard for dev).
- After login, todos are fetched from Supabase and displayed.
- Adding/editing/deleting a todo persists to Supabase; reload confirms persistence.
- A second browser session (same account) shows the same todos after reload.
- Signing out clears the in-memory list; the login form is shown again.
- RLS: querying the `todos` table without auth returns 0 rows.
- All Phase 1 features (search, priority, due dates, undo, drag-and-drop) continue to work.
