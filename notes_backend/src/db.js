'use strict';

/**
 * PUBLIC_INTERFACE
 * query
 * Database module that initializes a MySQL connection pool using environment-driven
 * configuration and exposes a simple query function.
 *
 * Environment variables expected (with defaults handled in config.js):
 * - DB_HOST
 * - DB_PORT
 * - DB_NAME
 * - DB_USER
 * - DB_PASSWORD
 *
 * This module uses mysql2/promise for convenient async/await usage.
 */

const mysql = require('mysql2/promise');
const { getConfig } = require('./config');

const config = getConfig();

let pool;

/**
 * Initialize (or return existing) MySQL connection pool.
 * Ensures a single pool instance across the application.
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      connectionLimit: config.db.connectionLimit,
      waitForConnections: config.db.waitForConnections,
      queueLimit: config.db.queueLimit,
      // Enable namedPlaceholders for safer queries if desired later
      namedPlaceholders: true,
    });

    // Optional: basic connectivity check on startup
    pool
      .getConnection()
      .then((conn) => {
        return conn
          .ping()
          .then(() => {
            // eslint-disable-next-line no-console
            console.log(
              `[DB] Connected to MySQL ${config.db.host}:${config.db.port}/${config.db.name}`
            );
          })
          .finally(() => conn.release());
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[DB] Failed to connect to MySQL:', err.message);
      });
  }
  return pool;
}

/**
 * PUBLIC_INTERFACE
 * query
 * Execute a SQL query using the pool.
 * @param {string} sql - SQL string with placeholders
 * @param {Array|Object} params - Values for placeholders (supports positional array or named object if namedPlaceholders enabled)
 * @returns {Promise<{rows: any, fields: any}>}
 */
async function query(sql, params = []) {
  try {
    const [rows, fields] = await getPool().execute(sql, params);
    return { rows, fields };
  } catch (error) {
    // Wrap and rethrow for centralized error handling
    const err = new Error(`Database query error: ${error.message}`);
    err.cause = error;
    throw err;
  }
}

module.exports = {
  getPool,
  query,
};
