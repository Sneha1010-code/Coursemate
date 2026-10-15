# Prompt Log

Prompts used with Claude Code to build CourseMate, in the order they were
given. Follow-up prompts are grouped under the main prompt they relate to.

GitHub repository: https://github.com/Sneha1010-code/Coursemate

---

### 1. Main build prompt

> "You are my autonomous software development assistant... [full
> requirements: read the assignment PDF and reference images, treat the PDF
> as the source of truth, build the entire application end-to-end using
> React + Python + Supabase, deploy it, don't stop after a partial
> implementation, ask only when genuinely blocked on credentials/config,
> never commit secrets, use a proper .gitignore, confirm before first push]"

**Intent:** Kick off the whole assignment — read the spec and reference
screenshots, scope the app, and build a complete, deployable, working
application rather than a prototype.

**What it produced:** Reading of `assignment_req/vibecodingassignment.pdf`
and `Reference_images/`, identification of the required stack (React +
FastAPI + Supabase) and the five-screen signup → course details → profile
setup → browse matches → pending requests flow, then the initial
architecture decision (Supabase Auth for login direct from the frontend
with the public anon key; all data access routed through a FastAPI backend
using the private service-role key, so secrets never reach the browser).

### 2. "ok start"

**Intent:** Confirm the proposed plan (React/FastAPI/Supabase, Vercel +
Render deployment) and give the go-ahead to begin implementation without
further upfront questions.

**What it produced:** Node.js installed locally via nvm (wasn't present on
the machine), the Vite React app and FastAPI backend scaffolded, the
Supabase schema (`profiles`, `connections` tables with RLS enabled and no
client-facing policies) written, and all six screens (Sign Up, Log In,
Course Details, Profile Setup, Browse Matches, Pending Requests) built to
match the reference mockups' layout, typography and colour scheme.

### 3. Supabase project credentials provided

> "SUPABASE PROJECT URL: ... SUPABASE PUBLISHABLE KEY: ... SUPABASE
> SERVICE_ROLE KEY: ..."

**Intent:** Supply the real Supabase project so the app could be wired up
and tested against a live database instead of placeholders.

**What it produced:** Local `.env` files for both frontend and backend
populated with the real credentials (never committed — both are in
`.gitignore`), and a request to run `backend/schema.sql` in the Supabase
SQL Editor to create the `profiles` and `connections` tables.

### 4. "done" / "done, run it now" (schema applied)

**Intent:** Confirm the schema had been run, so automated end-to-end
testing against the live database could proceed.

**What it produced:** A full two-user Playwright-driven test through the
real UI (sign up → course details → profile setup → browse matches →
connect → accept), which surfaced two real bugs that were fixed in the
same pass:

1. Supabase's default "Confirm email" setting blocked sign-ups behind an
   email-confirmation step.
2. After turning that off, sign-ups still failed with
   `over_email_send_rate_limit` — the default shared Supabase SMTP service
   has a very low hourly email quota, and the public `signUp()` endpoint is
   rate-limited against it regardless of the confirm-email setting. This
   would have blocked sign-ups live during the demo recording too, not just
   during testing.

   **Fix:** added a `POST /auth/signup` backend endpoint
   (`backend/app/routers/auth.py`) that creates the user via Supabase's
   admin API using the service-role key (`email_confirm: true`, no email
   sent, not subject to that rate limit), inserts the profile row, and lets
   the frontend immediately sign the user in with
   `signInWithPassword()`. This is also a more robust design for the actual
   demo video, since it removes a flaky third-party dependency from the
   signup path.

After the fix, the full flow was re-verified end-to-end with two accounts,
and the resulting rows (`profiles`, `connections` with `status: accepted`)
were confirmed directly via the Supabase API to make sure they were
genuinely persisted, not just reflected in the UI. Test accounts were then
deleted so the project is clean for the real demo recording.

---

<!-- Further entries (deployment) are appended below as the build
     progresses. -->
