import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import * as schema from "@shared/schema";

// Use Supabase as the database
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required");
}

// Create Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Configure Supabase Postgres connection with SSL
// Use individual connection parameters to avoid URL parsing issues with special characters
const dbUrl = process.env.DATABASE_URL || '';
const matches = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

if (!matches) {
  throw new Error("Invalid DATABASE_URL format");
}

const [, username, password, host, port, database] = matches;

const client = postgres({
  host,
  port: parseInt(port),
  database,
  username,
  password,
  ssl: 'require',
  prepare: false,
  transform: { undefined: null },
});

export const db = drizzle(client, { schema });