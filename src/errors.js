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

module.exports = { ApiError, BadRequestError, NotFoundError };