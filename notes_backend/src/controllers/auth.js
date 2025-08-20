'use strict';

const authService = require('../services/auth');

class AuthController {
  // PUBLIC_INTERFACE
  async register(req, res, next) {
    /** Register a new user with email and password. Returns user and JWT. */
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
      }
      const { user, token } = await authService.registerUser(String(email).trim().toLowerCase(), password);
      return res.status(201).json({ user, token });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async login(req, res, next) {
    /** Log in an existing user by email/password. Returns user and JWT. */
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
      }
      const { user, token } = await authService.loginUser(String(email).trim().toLowerCase(), password);
      return res.status(200).json({ user, token });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async profile(req, res, next) {
    /** Return the profile of the authenticated user. */
    try {
      const uid = req.user?.id;
      if (!uid) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const profile = await authService.getUserProfile(uid);
      if (!profile) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ user: profile });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new AuthController();
