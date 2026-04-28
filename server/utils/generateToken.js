const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generates a short-lived JWT access token (15 minutes).
 * Contains user ID and role for authorization middleware.
 */
const generateAccessToken = (userId, role) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is not defined in environment variables.');
  }
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Generates a long-lived JWT refresh token (7 days).
 * Contains only user ID — used to issue new access tokens.
 */
const generateRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables.');
  }
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Calculates the expiry date for a refresh token (7 days from now).
 * Used when storing the token in the database.
 */
const getRefreshTokenExpiry = () => {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
};

/**
 * Generates a cryptographically secure random token string.
 * Used for password reset tokens (the unhashed version sent in the email).
 */
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  generateSecureToken,
};