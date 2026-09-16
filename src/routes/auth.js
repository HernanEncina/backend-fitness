'use strict';

const express = require('express');
const db = require('../db');
const { hashPassword, verifyPassword, signToken } = require('../auth');
const {
  BadRequestError,
  ConflictError,
  UnauthorizedError
} = require('../errors');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeUser(row) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    created_at: row.created_at
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body || {};

    if (!email || !EMAIL_RE.test(email)) {
      throw new BadRequestError('Invalid email');
    }
    if (!username || username.trim().length < 3) {
      throw new BadRequestError('Username must be at least 3 characters');
    }
    if (!password || password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters');
    }

    const existing = db.prepare(
      'SELECT id FROM users WHERE email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE'
    ).get(email, username);

    if (existing) {
      throw new ConflictError('Email or username already taken');
    }

    const password_hash = await hashPassword(password);
    const created_at = new Date().toISOString();

    const info = db.prepare(
      'INSERT INTO users (email, username, password_hash, created_at) VALUES (?, ?, ?, ?)'
    ).run(email, username.trim(), password_hash, created_at);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    const token = signToken(user);

    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = db.prepare(
      'SELECT * FROM users WHERE email = ? COLLATE NOCASE'
    ).get(email);

    if (!user) throw new UnauthorizedError('Invalid credentials');

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) throw new UnauthorizedError('Invalid credentials');

    const token = signToken(user);
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, (req, res, next) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) throw new UnauthorizedError('User no longer exists');
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;