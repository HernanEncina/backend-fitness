'use strict';

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

class BadRequestError extends ApiError {
  constructor(message) {
    super(400, message);
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Not found') {
    super(404, message);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

module.exports = {
  ApiError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError
};