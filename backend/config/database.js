const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false  // Disable SSL for local development
});

module.exports = pool;