'use strict';

function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const ts = new Date().toISOString();
    const line = `[${ts}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(2)}ms`;
    if (res.statusCode >= 500) {
      console.error(line);
    } else {
      console.log(line);
    }
  });

  next();
}

module.exports = requestLogger;