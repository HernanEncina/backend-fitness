'use strict';

const db = require('../src/db');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS exercises (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  category          TEXT,
  body_part         TEXT,
  equipment         TEXT,
  instructions_en   TEXT,
  instructions_es   TEXT,
  instructions_it   TEXT,
  instructions_tr   TEXT,
  instructions_ru   TEXT,
  instructions_zh   TEXT,
  instructions_hi   TEXT,
  instructions_pl   TEXT,
  instructions_ko   TEXT,
  instructions_fr   TEXT,
  muscle_group      TEXT,
  secondary_muscles TEXT,
  target            TEXT,
  image             TEXT,
  gif_url           TEXT,
  created_at        TEXT
);

CREATE INDEX IF NOT EXISTS idx_exercises_category     ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_body_part    ON exercises(body_part);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment    ON exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_target       ON exercises(target);
CREATE INDEX IF NOT EXISTS idx_exercises_name_nocase  ON exercises(name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT UNIQUE NOT NULL COLLATE NOCASE,
  username      TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS routines (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS routine_exercises (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  routine_id   INTEGER NOT NULL,
  exercise_id  TEXT NOT NULL,
  position     INTEGER NOT NULL,
  sets         INTEGER,
  reps         INTEGER,
  rest_seconds INTEGER,
  FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE INDEX IF NOT EXISTS idx_routines_user      ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_ex_routine ON routine_exercises(routine_id);
`;

db.exec(SCHEMA);
console.log('Schema created (or already existed).');
console.log(`Exercises: ${db.prepare('SELECT COUNT(*) AS c FROM exercises').get().c}`);
console.log(`Users:     ${db.prepare('SELECT COUNT(*) AS c FROM users').get().c}`);
console.log(`Routines:  ${db.prepare('SELECT COUNT(*) AS c FROM routines').get().c}`);
db.close();
EOF