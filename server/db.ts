import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use Replit's built-in PostgreSQL database (force use of Replit PG vars)
const databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

if (!process.env.PGHOST || !process.env.PGUSER || !process.env.PGPASSWORD) {
  throw new Error("Database connection credentials are required");
}

// Create postgres connection
const client = postgres(databaseUrl, {
  prepare: false,
  transform: { undefined: null },
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(client, { schema });