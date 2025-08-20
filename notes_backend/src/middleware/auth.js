'use strict';

const { verifyJwt } = require('../services/auth');

// PUBLIC_INTERFACE
function authMiddleware(req, res, next) {
  /** Express middleware: verifies Bearer JWT and attaches req.user. */
  try {
    const auth = req.headers.authorization || '';
    const [scheme, token] = auth.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const payload = verifyJwt(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = authMiddleware;
