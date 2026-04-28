const ApiError = require('../utils/ApiError');

/**
 * Global Express error handling middleware.
 * Must be the LAST middleware registered in index.js.
 *
 * Handles:
 * - ApiError (our custom operational errors)
 * - Mongoose CastError (invalid ObjectId)
 * - Mongoose ValidationError (schema validation failures)
 * - Mongoose duplicate key error (code 11000)
 * - JWT errors (should be caught upstream, but handled here as fallback)
 * - All unhandled errors (500)
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Mongoose: Invalid ObjectId (e.g. /api/users/not-a-real-id)
  if (err.name === 'CastError') {
    error = new ApiError(404, `Resource not found with id: ${err.value}`);
  }

  // Mongoose: Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new ApiError(
      409,
      `An account with this ${field} (${value}) already exists. Please use a different ${field} or log in.`
    );
  }

  // Mongoose: Schema validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, 'Validation failed.', messages);
  }

  // JWT: expired or invalid (fallback — should be caught in auth middleware)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Invalid or expired token. Please log in again.');
  }

  const response = {
    success: false,
    message: error.message || 'Internal server error.',
  };

  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;