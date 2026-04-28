const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, 'Token string is required.'],
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required.'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Token expiry date is required.'],
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    // Store IP and user agent for security auditing
    ipAddress: {
      type: String,
      maxlength: [50, 'IP address cannot exceed 50 characters.'],
    },
    userAgent: {
      type: String,
      maxlength: [500, 'User agent cannot exceed 500 characters.'],
    },
  },
  {
    timestamps: true,
  }
);

// TTL index — MongoDB automatically deletes expired token documents
// This keeps the collection clean without a cron job
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for fast lookup by user (list all sessions for a user)
refreshTokenSchema.index({ user: 1, isRevoked: 1 });

// ---- STATIC METHOD: Revoke all tokens for a user (force logout all devices) ----
refreshTokenSchema.statics.revokeAllForUser = async function (userId) {
  return await this.updateMany(
    { user: userId, isRevoked: false },
    { isRevoked: true }
  );
};

// ---- STATIC METHOD: Clean up expired/revoked tokens for a user ----
refreshTokenSchema.statics.cleanupForUser = async function (userId) {
  return await this.deleteMany({
    user: userId,
    $or: [
      { isRevoked: true },
      { expiresAt: { $lt: new Date() } },
    ],
  });
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);