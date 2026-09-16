'use strict';

const config = require('../config');

function withMediaBase(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (!config.mediaBaseUrl) return url;
  return `${config.mediaBaseUrl.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
}

function parseSecondaryMuscles(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Convert a raw DB row into the JSON shape returned to clients.
 * Missing columns (e.g. instructions_fr on older schemas) become undefined
 * and are dropped by JSON.stringify automatically.
 */
function serializeExercise(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    body_part: row.body_part,
    equipment: row.equipment,
    instructions_en: row.instructions_en,
    instructions_es: row.instructions_es,
    instructions_it: row.instructions_it,
    instructions_tr: row.instructions_tr,
    instructions_ru: row.instructions_ru,
    instructions_zh: row.instructions_zh,
    instructions_hi: row.instructions_hi,
    instructions_pl: row.instructions_pl,
    instructions_ko: row.instructions_ko,
    instructions_fr: row.instructions_fr,
    muscle_group: row.muscle_group,
    secondary_muscles: parseSecondaryMuscles(row.secondary_muscles),
    target: row.target,
    image: withMediaBase(row.image),
    gif_url: withMediaBase(row.gif_url),
    created_at: row.created_at
  };
}

module.exports = { serializeExercise };