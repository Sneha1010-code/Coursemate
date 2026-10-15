# CourseMate

A study-buddy matching app for university students: sign up, add your course
and tutorial group details, set up a profile, then browse and connect with
other students in the same tutorial.

Built for BUS4012 Assignment 3 — React frontend, Python (FastAPI) backend,
Supabase (Postgres + Auth) database.

**Live app:** https://coursemate-five.vercel.app
**Live API:** https://coursemate-1-i4m1.onrender.com

## Architecture

```
frontend/   React 19 + Vite, React Router, Tailwind-free CSS design system
backend/    FastAPI, verifies Supabase auth tokens, talks to Postgres via
            the Supabase service-role key (server-side only)
```

- **Auth**: the frontend uses Supabase Auth directly (email + password) via
  the public `anon` key — this key is designed to be shipped in client code
  and is governed by Row Level Security.
- **Data**: all reads/writes (course details, profile, matches, connection
  requests) go through the FastAPI backend. The frontend sends the user's
  Supabase access token in the `Authorization` header; the backend verifies
  it against Supabase, then uses the private `service_role` key to read/write
  the database. The service role key never reaches the frontend.
- **Database**: two tables, `profiles` and `connections` (see
  `backend/schema.sql`). RLS is enabled on both with no client-facing
  policies, since only the backend's service-role key touches them.

## Local setup

### 1. Supabase

1. Create a free project at supabase.com.
2. In the SQL Editor, run `backend/schema.sql`.
3. From Project Settings → Data API, copy the Project URL and `anon` key.
   From Project Settings → API Keys, copy the `service_role` key.
4. (Recommended for local testing) Authentication → Sign In / Providers →
   Email → turn off "Confirm email", so signup doesn't require clicking an
   email link.

### 2. Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm run dev
```

Visit http://localhost:5173.

## Deployment

- **Frontend → Vercel**: import the repo, set the root directory to
  `frontend`, add the three `VITE_*` env vars (with `VITE_API_URL` pointing
  at the deployed backend) in Vercel's project settings, deploy.
- **Backend → Render**: new Web Service from this repo, root directory
  `backend`, build command `pip install -r requirements.txt`, start command
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Add `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL` (the deployed Vercel URL, for
  CORS), and `PYTHON_VERSION=3.12.8` (Render's newer default Python has no
  prebuilt wheel yet for one of the dependencies) as environment variables.

All secrets (Supabase service role key, DB connection details) are only ever
set as environment variables on Render/locally — never committed, never sent
to the frontend.

**Note for the demo video:** Render's free tier spins the backend down after
inactivity; the first request after idling can take 30–50s to wake it up.
Load the live app once a minute or two before you start recording so it's
already warm.

See `PROMPTS.md` for the prompt log used to build this project.
