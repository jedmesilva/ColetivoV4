import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Replit database configuration
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required - ensure the database is provisioned");
}

// Create Postgres client for Replit database
const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  transform: { undefined: null },
});

// Export database connection
export const db = drizzle(client, { schema });