'use strict';

/**
 * Build a case-insensitive LIKE pattern with escaped wildcards.
 * Pair with: LOWER(column) LIKE ? ESCAPE '\'
 */
function toLikePattern(input) {
  const escaped = String(input).replace(/[\\%_]/g, '\\$&');
  return `%${escaped.toLowerCase()}%`;
}

module.exports = { toLikePattern };