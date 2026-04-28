const ApiError = require('../utils/ApiError');

/**
 * Middleware factory: Restrict route access to specific roles.
 * Must be called AFTER the `protect` middleware (which sets req.user).
 *
 * Usage: router.get('/admin-only', protect, authorize('admin'), handler)
 * Usage: router.get('/multi-role', protect, authorize('coordinator', 'admin'), handler)
 *
 * @param {...string} allowedRoles - One or more role strings from: student, supervisor, coordinator, admin
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(401, 'Not authorized. Please log in first.')
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Role '${req.user.role}' is not authorized to perform this action. Required role(s): ${allowedRoles.join(', ')}.`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };