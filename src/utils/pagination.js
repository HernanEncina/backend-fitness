'use strict';

const { BadRequestError } = require('../errors');

/**
 * Parse a positive integer query param. Throws BadRequestError (400) on invalid.
 */
function parsePositiveInt(raw, { name, defaultValue, max } = {}) {
  if (raw === undefined || raw === '') return defaultValue;

  if (typeof raw !== 'string' && typeof raw !== 'number') {
    throw new BadRequestError(`${name} must be a positive integer`);
  }

  const str = String(raw);
  if (!/^\d+$/.test(str)) {
    throw new BadRequestError(`${name} must be a positive integer`);
  }

  const n = Number(str);
  if (!Number.isSafeInteger(n) || n < 1) {
    throw new BadRequestError(`${name} must be a positive integer`);
  }

  if (max !== undefined && n > max) {
    throw new BadRequestError(`${name} must be less than or equal to ${max}`);
  }

  return n;
}

module.exports = { parsePositiveInt };