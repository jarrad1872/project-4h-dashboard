import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const fallbackUrl = "http://127.0.0.1:54321";
const fallbackKey = "public-anon-key";

// Public client (browser-safe, uses anon key)
export const supabase = createClient(supabaseUrl || fallbackUrl, supabaseAnonKey || fallbackKey);

// Server client (API routes only, uses service role key for full access)
export const supabaseAdmin = createClient(
  supabaseUrl || fallbackUrl,
  supabaseServiceKey || supabaseAnonKey || fallbackKey,
);
