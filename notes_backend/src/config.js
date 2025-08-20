'use strict';

/**
 * PUBLIC_INTERFACE
 * getConfig
 * This module loads environment variables, applies sensible defaults, and exposes
 * configuration values for the application. It should be imported early in the
 * app lifecycle to ensure dotenv is initialized.
 *
 * Required env vars (to be provided by deployment via .env):
 * - DB_HOST
 * - DB_PORT
 * - DB_NAME
 * - DB_USER
 * - DB_PASSWORD
 *
 * If not provided, sensible defaults are used for local development.
 */

const path = require('path');
const dotenv = require('dotenv');

// Load .env from the project root (notes_backend). This will not throw if missing.
dotenv.config({
  path: path.resolve(__dirname, '..', '.env'),
});

/**
 * PUBLIC_INTERFACE
 * getConfig
 * Returns a frozen configuration object for use throughout the app.
 */
function getConfig() {
  /** This function returns the application configuration values. */
  const cfg = {
    nodeEnv: process.env.NODE_ENV || 'development',

    server: {
      host: process.env.HOST || '0.0.0.0',
      port: Number(process.env.PORT || 3000),
    },

    db: {
      host: process.env.DB_HOST || process.env.MYSQL_URL || '127.0.0.1',
      port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
      name: process.env.DB_NAME || process.env.MYSQL_DB || 'notes_app',
      user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
      password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
      connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
      waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS
        ? process.env.DB_WAIT_FOR_CONNECTIONS === 'true'
        : true,
      queueLimit: Number(process.env.DB_QUEUE_LIMIT || 0),
    },
  };

  return Object.freeze(cfg);
}

module.exports = {
  getConfig,
};
