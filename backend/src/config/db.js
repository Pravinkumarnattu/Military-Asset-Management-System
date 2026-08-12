const { Pool } = require("pg");
require("dotenv").config();

// A "pool" keeps a handful of open connections ready to reuse,
// instead of opening a new database connection for every request.
//
// ssl: hosted providers (Render, Neon, Supabase, etc.) require SSL for
// connections coming from outside their own network. Locally, Postgres
// usually doesn't need it, so this only turns SSL on when DATABASE_URL
// points somewhere other than localhost.
const isLocal = (process.env.DATABASE_URL || "").includes("localhost");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL...");
});

pool.on("error", (err) => {
  console.error("Unexpected database error: " + err.message);
});

module.exports = pool;
