const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware: Verify JWT access token.
 * Attaches req.user to the request if token is valid.
 * Returns 401 if token is missing, invalid, or expired.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new ApiError(401, 'Not authorized. No token provided. Please log in.')
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(
        new ApiError(401, 'Session expired. Please refresh your token or log in again.')
      );
    }
    return next(
      new ApiError(401, 'Not authorized. Token is invalid.')
    );
  }

  const user = await User.findById(decoded.id).select('-password -passwordResetToken -passwordResetExpires');

  if (!user) {
    return next(
      new ApiError(401, 'The user belonging to this token no longer exists. Please log in again.')
    );
  }

  if (!user.isActive) {
    return next(
      new ApiError(401, 'Your account has been deactivated. Please contact the administrator.')
    );
  }

  req.user = user;
  next();
});

module.exports = { protect };