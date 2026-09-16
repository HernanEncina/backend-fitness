'use strict';

require('dotenv').config();

const parseOrigins = (raw) => {
  if (!raw || raw.trim() === '' || raw.trim() === '*') return ['*'];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
};

const config = {
  port: Number(process.env.PORT) || 8000,
  dbPath: process.env.DB_PATH || './data/fitness.db',
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
  mediaDir: process.env.MEDIA_DIR || '',
  mediaBaseUrl: process.env.MEDIA_BASE_URL || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  defaultPageSize: 20,
  maxPageSize: 100,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

module.exports = config;