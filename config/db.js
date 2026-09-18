// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT
// });

// module.exports = pool;

// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
//   // Hosted Postgres (Render, Railway, Supabase, RDS, etc.) requires SSL.
//   // Locally, DB_SSL won't be set, so this stays off for local dev.
//   ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
//   max: 10, // limit concurrent connections — prevents exhausting the host's connection limit
// });

// module.exports = pool;

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 10,
   connectionTimeoutMillis: 5000, // fail fast if the DB can't be reached, instead of hanging
  idleTimeoutMillis: 30000,      // close idle clients after 30s to avoid stale co
});

// Runs once, immediately, to confirm the database is actually reachable —
// without this, a wrong password/host would stay silent until your first
// real API call fails, which is much harder to debug.
pool.query("SELECT NOW()")
  .then((result) => {
    console.log("✅ Database connected:", result.rows[0].now);
  })
  .catch((err) => {
    // Connection-refused errors are AggregateErrors with an empty message,
    // so fall back to the code / inner errors to see what actually failed.
    const detail = err.message
      || (err.errors || []).map((e) => e.message).join("; ")
      || err.code;
    console.error(
      `❌ Database connection failed (${process.env.DB_HOST}:${process.env.DB_PORT}):`,
      detail
    );
  });

module.exports = pool;