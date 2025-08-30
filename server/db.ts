import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create postgres client
const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
});

// Create drizzle database instance
export const db = drizzle(client, { schema });