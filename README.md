# Solar Installer Lead Tracker (demo)

Small CRM demo: sign in, add leads, move them through **New → Contacted →
Signed**. Each lead has its own page (`/leads/:id`). Each user only ever sees
their own leads — enforced in Postgres via Row Level Security, not just in
the UI, so it holds even against a direct API call or a hand-edited URL.

Stack: **Vite + React + TypeScript**, **Tailwind CSS**, **Supabase**
(Postgres + Auth).

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local` with your Supabase project's URL and anon key (see
[`supabase/README.md`](./supabase/README.md) for creating the project,
running the schema, and creating the two test accounts).

```bash
npm run dev
```

## How login works

The form takes an **email or a username**. Supabase Auth only knows emails
natively, so a username is first resolved to an email via the
`login_lookup_email` Postgres RPC (see [`supabase/schema.sql`](./supabase/schema.sql))
before calling `signInWithPassword`. Both "no such user" and "wrong password"
show the same generic error, so this lookup can't be used to enumerate
accounts.

## Where the data isolation is enforced

The short answer: [`supabase/schema.sql`](./supabase/schema.sql) — the Row
Level Security policies on the `leads` table (`leads_select_own`,
`leads_insert_own`, `leads_update_own`, `leads_delete_own`), all scoped to
`user_id = auth.uid()`. The app never runs as a privileged/service-role
client, only with each signed-in user's own anon-key session, so:

- [`src/pages/Dashboard.tsx`](./src/pages/Dashboard.tsx) fetches leads with
  no `user_id` filter in the query at all — RLS alone restricts the result.
- [`src/pages/LeadDetail.tsx`](./src/pages/LeadDetail.tsx) fetches a single
  lead by the `id` in the URL; if it belongs to someone else, RLS makes
  Postgres return nothing, and the page shows "Lead not found" rather than
  another account's data.
- Inserts never send `user_id` from the client — the column defaults to
  `auth.uid()` in the database, and the insert policy's `WITH CHECK` would
  reject a spoofed value anyway.

## Project structure

```
src/
  lib/supabaseClient.ts   Supabase client (reads env vars)
  context/AuthContext.tsx Session state + sign in/out
  components/             ProtectedRoute, LeadForm, StageControl, Footer
  pages/                   Login, Dashboard, LeadDetail
  types/                   Lead, Profile types
supabase/
  schema.sql               Tables, triggers, RPC, RLS policies
  README.md                Setup + how to create the 2 test accounts
```

## Deploying

Any static host works (Vite builds to `dist/`). `vercel.json` and
`public/_redirects` are included so client-side routes like `/leads/:id`
don't 404 on refresh on Vercel/Netlify. Set the two `VITE_SUPABASE_*` env
vars in the host's dashboard before deploying.

Before sharing the live demo, fill in [`src/config/site.ts`](./src/config/site.ts)
(shown in the footer) with your Upwork name and the date you finished it, as
plain text.
