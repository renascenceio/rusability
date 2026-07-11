import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { __rusabilityPool?: Pool };

export const pool =
  globalForDb.__rusabilityPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__rusabilityPool = pool;
}

export const db = drizzle(pool, { schema });
