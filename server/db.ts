import { createClient } from "@supabase/supabase-js";

// Supabase configuration - using your existing Supabase database
if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is required");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
}

// Create Supabase client for backend operations (service role)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false }
  }
);