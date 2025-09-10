import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import * as schema from "@shared/schema";

// Use Supabase REST API instead of direct postgres connection
if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_ANON_KEY environment variable is required");
}

// Create Supabase client
export const supabase = createClient(
  "https://gtatmggrruiwbbomdrtl.supabase.co",
  process.env.SUPABASE_ANON_KEY
);

// For now, create a mock postgres connection that won't be used
// We'll use Supabase client directly in storage
const client = postgres("postgresql://localhost/dummy", {
  prepare: false,
  transform: { undefined: null },
});

export const db = drizzle(client, { schema });