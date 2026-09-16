'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const config = require('./config');
const requestLogger = require('./middleware/requestLogger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const exercisesRouter = require('./routes/exercises');
const metadataRouter = require('./routes/metadata');

const app = express();

app.disable('x-powered-by');

// CORS: '*' means reflect any origin. Otherwise, allow only listed origins.
const corsOptions = config.allowedOrigins.includes('*')
  ? { origin: true }
  : { origin: config.allowedOrigins };

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// Optional: serve the dataset's images/gifs as static files
if (config.mediaDir) {
  const abs = path.resolve(config.mediaDir);
  if (fs.existsSync(abs)) {
    app.use('/media', express.static(abs, { fallthrough: true, maxAge: '1h' }));
    console.log(`Serving static media from ${abs} at /media`);
  } else {
    console.warn(`MEDIA_DIR set but does not exist: ${abs}`);
  }
}

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/exercises', exercisesRouter);
app.use('/', metadataRouter); // /categories, /body-parts, /equipment

// 404 + error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;