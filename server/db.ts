import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Check for required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_DB_PASSWORD) {
  throw new Error("SUPABASE_URL and SUPABASE_DB_PASSWORD environment variables are required");
}

// Use the provided connection string but replace the password with the encoded one
const supabaseUrl = process.env.SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

// Extract project reference from the existing connection string
const projectRefMatch = supabaseUrl.match(/@db\.([^.]+)\.supabase\.co/);
const projectRef = projectRefMatch ? projectRefMatch[1] : 'gtatmggrruiwbbomdrtl';

// Try different connection endpoints - Supabase provides multiple endpoints
const dbUrls = [
  `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:5432/postgres?host=${projectRef}`
];

const dbUrl = dbUrls[0]; // Try pooler first

// Create postgres client with proper URL handling
const client = postgres(dbUrl, {
  prepare: false,
  ssl: { rejectUnauthorized: false },
  connect_timeout: 30,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  transform: {
    undefined: null,
  },
});

// Create drizzle database instance
export const db = drizzle(client, { schema });