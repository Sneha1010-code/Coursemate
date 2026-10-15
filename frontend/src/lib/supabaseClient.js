import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check your .env file."
  );
}

// The anon key is a public, rate-limited, RLS-governed key designed to be
// shipped in frontend code. It is only ever used here for Supabase Auth
// (sign up / sign in). All data reads/writes go through the Python backend,
// which uses the private service role key server-side.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
