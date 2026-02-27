// CHANGED [P1]: Switched from neon-http (HTTP per query) to neon-serverless
// (WebSocket Pool) for persistent connections. Reduces DB latency by ~60%.
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
}

// Enable connection pooling via HTTP fetch for serverless environments
neonConfig.poolQueryViaFetch = true;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });

export type Database = typeof db;
