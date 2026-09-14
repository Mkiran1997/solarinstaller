# Supabase setup

## 1. Create a project

Create a free project at [supabase.com](https://supabase.com), then from
**Project Settings → API** copy:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

Put both in a `.env.local` file at the repo root (copy `.env.local.example`).
Never put the **service_role** key in this app or commit it anywhere — the
whole point of this demo is that the anon key alone is safe to ship to the
browser because Postgres Row Level Security enforces per-user access.

## 2. Run the schema

Open **SQL Editor** in Supabase Studio, paste the contents of
[`schema.sql`](./schema.sql), and run it. This creates the `profiles` and
`leads` tables, the username→email login trigger/RPC, and the Row Level
Security policies that keep each user's leads private.

## 3. Create the two test accounts (manual, no service_role key needed)

For each test account:

1. Go to **Authentication → Users → Add user**, enter an email + password,
   and check **Auto Confirm User** (so the demo doesn't need a real inbox).
2. Copy the new user's **UID** from the users table. A `profiles` row is
   created for it automatically (with a generated placeholder username, e.g.
   `user_...`) — the `handle_new_user` trigger in `schema.sql` does this for
   every new user, dashboard-created or not.
3. Back in **SQL Editor**, give it a friendlier username (replace the
   placeholders):

   ```sql
   update public.profiles set username = 'testuser1' where id = '<paste-the-uid>';
   ```

   This is what lets that account log in with either the email or
   `testuser1` as the identifier.
4. Optionally seed a sample lead for that account:

   ```sql
   insert into public.leads (user_id, name, email, phone, source, stage)
   values ('<paste-the-uid>', 'Jane Homeowner', 'jane@example.com', '555-0100', 'website', 'new');
   ```

Repeat for a second account (e.g. `testuser2`) so you have two accounts to
demonstrate isolation between them.

## Verifying isolation (what the security screen recording should show)

1. Log in as account A, add a couple of leads, open one and note its
   `/leads/<id>` URL.
2. Log out, log in as account B → the dashboard shows none of A's leads.
3. While logged in as B, edit the URL to A's lead id → the app shows
   "Lead not found", not A's data.
4. The actual enforcement point is in [`schema.sql`](./schema.sql): the
   `leads_select_own` (and insert/update/delete) policies, which restrict
   every query to `user_id = auth.uid()` inside Postgres itself — so it holds
   even for a raw REST call with B's access token against A's lead id, not
   just inside this app's UI.
