'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { query } = require('../db');
const { getConfig } = require('../config');

const config = getConfig();

// Helper to get JWT secret from env
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Do not throw; but log warning. In production this must be set.
    // eslint-disable-next-line no-console
    console.warn('[AUTH] JWT_SECRET is not set. Using an insecure default for development purposes.');
  }
  return secret || 'dev-insecure-secret-change-me';
}

// PUBLIC_INTERFACE
async function hashPassword(plainPassword) {
  /** Hash a plain-text password using bcrypt. */
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  return bcrypt.hash(plainPassword, saltRounds);
}

// PUBLIC_INTERFACE
async function comparePassword(plainPassword, hashed) {
  /** Compare a plain-text password to a hashed password. */
  return bcrypt.compare(plainPassword, hashed);
}

// PUBLIC_INTERFACE
function signJwt(payload, options = {}) {
  /** Sign a JWT token with configured secret. */
  const expiresIn = options.expiresIn || process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

// PUBLIC_INTERFACE
function verifyJwt(token) {
  /** Verify a JWT and return its payload if valid; throws on error. */
  return jwt.verify(token, getJwtSecret());
}

// PUBLIC_INTERFACE
async function findUserByEmail(email) {
  /** Find a user by email; returns user row or null. */
  const sql = 'SELECT id, email, password_hash AS passwordHash, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE email = ? LIMIT 1';
  const { rows } = await query(sql, [email]);
  return rows.length ? rows[0] : null;
}

// PUBLIC_INTERFACE
async function createUser({ email, passwordHash }) {
  /** Create a new user; returns created row (id, email, timestamps). */
  const sql = 'INSERT INTO users (email, password_hash) VALUES (?, ?)';
  const { rows: result } = await query(sql, [email, passwordHash]);
  const id = result.insertId;
  const { rows } = await query('SELECT id, email, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ?', [id]);
  return rows[0];
}

// PUBLIC_INTERFACE
async function registerUser(email, plainPassword) {
  /** Register a user if email not taken. Returns created user and token. */
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }
  const passwordHash = await hashPassword(plainPassword);
  const user = await createUser({ email, passwordHash });
  const token = signJwt({ sub: user.id, email: user.email });
  return { user, token };
}

// PUBLIC_INTERFACE
async function loginUser(email, plainPassword) {
  /** Validate user credentials; return user and token. */
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const ok = await comparePassword(plainPassword, user.passwordHash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const token = signJwt({ sub: user.id, email: user.email });
  // Do not include passwordHash in response
  const safeUser = { id: user.id, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt };
  return { user: safeUser, token };
}

// PUBLIC_INTERFACE
async function getUserProfile(userId) {
  /** Return safe user profile by id. */
  const { rows } = await query('SELECT id, email, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows.length ? rows[0] : null;
}

module.exports = {
  hashPassword,
  comparePassword,
  signJwt,
  verifyJwt,
  findUserByEmail,
  createUser,
  registerUser,
  loginUser,
  getUserProfile,
  config, // exported for potential future use
};
