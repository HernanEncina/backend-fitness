'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

// Column names are hardcoded constants (never user input), so string
// interpolation is safe here.
const QUERIES = {
  categories: `SELECT DISTINCT category AS value
               FROM exercises
               WHERE category IS NOT NULL AND TRIM(category) <> ''
               ORDER BY value COLLATE NOCASE ASC`,
  bodyParts: `SELECT DISTINCT body_part AS value
              FROM exercises
              WHERE body_part IS NOT NULL AND TRIM(body_part) <> ''
              ORDER BY value COLLATE NOCASE ASC`,
  equipment: `SELECT DISTINCT equipment AS value
              FROM exercises
              WHERE equipment IS NOT NULL AND TRIM(equipment) <> ''
              ORDER BY value COLLATE NOCASE ASC`
};

function distinctValues(sql) {
  return db.prepare(sql).all().map((r) => r.value);
}

router.get('/categories', (req, res, next) => {
  try {
    res.json(distinctValues(QUERIES.categories));
  } catch (err) {
    next(err);
  }
});

router.get('/body-parts', (req, res, next) => {
  try {
    res.json(distinctValues(QUERIES.bodyParts));
  } catch (err) {
    next(err);
  }
});

router.get('/equipment', (req, res, next) => {
  try {
    res.json(distinctValues(QUERIES.equipment));
  } catch (err) {
    next(err);
  }
});

module.exports = router;