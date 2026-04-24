//db connection
import { Pool } from "pg";
// used in the api folders for db queries
console.log("DATABASE_URL check:", process.env.DATABASE_URL ? "✅ Loaded" : "❌ NOT FOUND");
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
