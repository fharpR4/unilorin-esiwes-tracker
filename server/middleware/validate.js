const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware: Runs after express-validator chains.
 * Collects all validation errors and returns a 400 response if any exist.
 * Pass this as middleware AFTER your validation chain array.
 *
 * Usage:
 *   router.post('/register', [...validationRules], validate, registerController)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return next(
      new ApiError(400, 'Validation failed. Please check your input.', messages)
    );
  }

  next();
};

module.exports = validate;