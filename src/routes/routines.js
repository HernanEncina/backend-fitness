'use strict';

const express = require('express');
const db = require('../db');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError
} = require('../errors');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Todas las rutas de este router requieren login
router.use(authenticate);

function loadRoutineForUser(id, userId) {
  const routine = db.prepare('SELECT * FROM routines WHERE id = ?').get(id);
  if (!routine) throw new NotFoundError('Routine not found');
  if (routine.user_id !== userId) throw new ForbiddenError('Not your routine');
  return routine;
}

function loadRoutineWithExercises(id, userId) {
  const routine = loadRoutineForUser(id, userId);

  const exercises = db.prepare(`
    SELECT
      re.id AS item_id,
      re.position,
      re.sets,
      re.reps,
      re.rest_seconds,
      e.id, e.name, e.category, e.body_part, e.equipment,
      e.muscle_group, e.target, e.image, e.gif_url
    FROM routine_exercises re
    JOIN exercises e ON e.id = re.exercise_id
    WHERE re.routine_id = ?
    ORDER BY re.position ASC
  `).all(id);

  return { ...routine, exercises };
}

router.get('/', (req, res, next) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM routines WHERE user_id = ? ORDER BY updated_at DESC'
    ).all(req.user.id);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    if (!name || !name.trim()) throw new BadRequestError('Name is required');

    const now = new Date().toISOString();
    const info = db.prepare(
      'INSERT INTO routines (user_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).run(req.user.id, name.trim(), description || null, now, now);

    const routine = db.prepare('SELECT * FROM routines WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ ...routine, exercises: [] });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    res.json(loadRoutineWithExercises(req.params.id, req.user.id));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const routine = loadRoutineForUser(req.params.id, req.user.id);
    const { name, description } = req.body || {};
    const now = new Date().toISOString();

    db.prepare(
      'UPDATE routines SET name = ?, description = ?, updated_at = ? WHERE id = ?'
    ).run(
      name ?? routine.name,
      description ?? routine.description,
      now,
      routine.id
    );

    res.json(loadRoutineWithExercises(routine.id, req.user.id));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const routine = loadRoutineForUser(req.params.id, req.user.id);
    db.prepare('DELETE FROM routines WHERE id = ?').run(routine.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post('/:id/exercises', (req, res, next) => {
  try {
    const routine = loadRoutineForUser(req.params.id, req.user.id);
    const { exercise_id, position, sets, reps, rest_seconds } = req.body || {};
    if (!exercise_id) throw new BadRequestError('exercise_id is required');

    const exercise = db.prepare('SELECT id FROM exercises WHERE id = ?').get(exercise_id);
    if (!exercise) throw new NotFoundError('Exercise not found');

    const maxPos = db.prepare(
      'SELECT COALESCE(MAX(position), 0) AS m FROM routine_exercises WHERE routine_id = ?'
    ).get(routine.id).m;

    const info = db.prepare(`
      INSERT INTO routine_exercises (routine_id, exercise_id, position, sets, reps, rest_seconds)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      routine.id,
      exercise_id,
      position ?? maxPos + 1,
      sets ?? null,
      reps ?? null,
      rest_seconds ?? null
    );

    db.prepare('UPDATE routines SET updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), routine.id);

    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/exercises/:itemId', (req, res, next) => {
  try {
    const routine = loadRoutineForUser(req.params.id, req.user.id);

    const info = db.prepare(
      'DELETE FROM routine_exercises WHERE id = ? AND routine_id = ?'
    ).run(req.params.itemId, routine.id);

    if (info.changes === 0) throw new NotFoundError('Routine exercise not found');

    db.prepare('UPDATE routines SET updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), routine.id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;