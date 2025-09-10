import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use Replit's built-in database first, fallback to Supabase if needed
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create postgres client
const client = postgres(databaseUrl, {
  prepare: false,
  ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1') ? false : { rejectUnauthorized: false },
  connect_timeout: 30,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  transform: {
    undefined: null,
  },
});

// Create drizzle database instance
export const db = drizzle(client, { schema });