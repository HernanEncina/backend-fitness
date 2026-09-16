'use strict';

const { verifyToken } = require('../auth');
const { UnauthorizedError } = require('../errors');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      username: payload.username
    };
    next();
  } catch (err) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

module.exports = authenticate;