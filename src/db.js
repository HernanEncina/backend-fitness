'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('./config');

// Ensure parent directory exists for the SQLite file
const dir = path.dirname(path.resolve(config.dbPath));
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(config.dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;