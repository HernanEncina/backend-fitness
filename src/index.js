'use strict';

const app = require('./app');
const config = require('./config');
const db = require('./db');

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`Fitness API listening on http://0.0.0.0:${config.port}`);
  console.log(`  DB_PATH        = ${config.dbPath}`);
  console.log(`  MEDIA_DIR      = ${config.mediaDir || '(disabled)'}`);
  console.log(`  MEDIA_BASE_URL = ${config.mediaBaseUrl || '(empty)'}`);
  console.log(`  ALLOWED_ORIGINS= ${config.allowedOrigins.join(', ')}`);
  console.log(`  NODE_ENV       = ${config.nodeEnv}`);
});

function shutdown(signal) {
  console.log(`\n${signal} received — shutting down...`);
  server.close(() => {
    try {
      db.close();
    } catch {
      /* ignore */
    }
    process.exit(0);
  });
  // Force exit if connections refuse to close
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));