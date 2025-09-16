const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,  // Disable SSL for local development
  max: 20,     // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;