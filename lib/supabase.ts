import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Placeholder URL/key for client initialization when env vars are missing.
// All API routes check isSupabaseConfigured before querying — these are never hit in production.
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder";

// Public client (browser-safe, uses anon key)
export const supabase = createClient(supabaseUrl || PLACEHOLDER_URL, supabaseAnonKey || PLACEHOLDER_KEY);

// Server client (API routes only, uses service role key for full access)
export const supabaseAdmin = createClient(
  supabaseUrl || PLACEHOLDER_URL,
  supabaseServiceKey || supabaseAnonKey || PLACEHOLDER_KEY,
);
