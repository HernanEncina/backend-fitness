'use strict';

const express = require('express');
const db = require('../db');
const config = require('../config');
const { parsePositiveInt } = require('../utils/pagination');
const { toLikePattern } = require('../utils/likePattern');
const { serializeExercise } = require('../utils/serialize');

const router = express.Router();

// Map of query param name -> DB column. Column names are hardcoded (safe).
const FILTERS = [
  { param: 'category', column: 'category' },
  { param: 'body_part', column: 'body_part' },
  { param: 'equipment', column: 'equipment' },
  { param: 'muscle_group', column: 'muscle_group' },
  { param: 'target', column: 'target' }
];

// IMPORTANT: /random must be declared before /:id, otherwise Express
// would match /:id with id = "random".
router.get('/random', (req, res, next) => {
  try {
    const row = db
      .prepare('SELECT * FROM exercises ORDER BY RANDOM() LIMIT 1')
      .get();

    if (!row) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    return res.json(serializeExercise(row));
  } catch (err) {
    return next(err);
  }
});

router.get('/', (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page, {
      name: 'page',
      defaultValue: 1
    });

    const limit = parsePositiveInt(req.query.limit, {
      name: 'limit',
      defaultValue: config.defaultPageSize,
      max: config.maxPageSize
    });

    const where = [];
    const params = [];

    for (const { param, column } of FILTERS) {
      const raw = req.query[param];
      if (raw === undefined || raw === '') continue;
      where.push(`LOWER(${column}) LIKE ? ESCAPE '\\'`);
      params.push(toLikePattern(raw));
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = db
      .prepare(`SELECT COUNT(*) AS c FROM exercises ${whereSql}`)
      .get(...params).c;

    const offset = (page - 1) * limit;

    const rows = db
      .prepare(
        `SELECT * FROM exercises
         ${whereSql}
         ORDER BY name COLLATE NOCASE ASC
         LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset);

    return res.json({
      data: rows.map(serializeExercise),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const row = db
      .prepare('SELECT * FROM exercises WHERE id = ?')
      .get(req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    return res.json(serializeExercise(row));
  } catch (err) {
    return next(err);
  }
});

module.exports = router;