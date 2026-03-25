import { Pool } from 'pg';

// Cache the connection pool so we don't create a new one for every API request
// in development mode (Next.js fast refresh).
let pool: Pool | undefined;

/**
 * Returns a singleton instance of the pg Pool connected to AlloyDB.
 * Environment variables must be set correctly.
 */
export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      // Limit the maximum number of clients in the pool
      max: 10,
      // How long a client is allowed to remain idle before being closed
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}
