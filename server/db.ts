import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import * as schema from "@shared/schema";

// ⚠️  SECURITY WARNING: THIS PROJECT EXCLUSIVELY USES SUPABASE AS DATABASE ⚠️
// Any attempt to connect to a different database is a SECURITY VIOLATION
// ONLY Supabase connections are allowed - NO OTHER databases permitted

// Verify Supabase environment variables are present
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE credentials are required - SUPABASE_URL and SUPABASE_ANON_KEY must be set");
}

// SECURITY CHECK: Verify we're connecting to Supabase ONLY
if (!process.env.DATABASE_URL?.includes('supabase.co')) {
  throw new Error("SECURITY VIOLATION: Only Supabase database is allowed. DATABASE_URL must be a supabase.co URL");
}

// Create Supabase client - THIS IS THE ONLY ALLOWED DATABASE CLIENT
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Configure SUPABASE Postgres connection with SSL
// Parse SUPABASE DATABASE_URL and extract connection parameters
const supabaseDbUrl = process.env.DATABASE_URL || '';
const matches = supabaseDbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

if (!matches) {
  throw new Error("Invalid SUPABASE DATABASE_URL format");
}

const [, username, password, host, port, database] = matches;

// Create SUPABASE Postgres client - THIS IS THE ONLY ALLOWED DATABASE CONNECTION
const client = postgres({
  host, // MUST be supabase.co host
  port: parseInt(port),
  database,
  username,
  password,
  ssl: 'require', // REQUIRED for Supabase security
  prepare: false,
  transform: { undefined: null },
});

// Export SUPABASE-ONLY database connection
export const db = drizzle(client, { schema });