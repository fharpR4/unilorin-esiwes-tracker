const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  generateSecureToken,
} = require('../utils/generateToken');

// ---- HELPER: Build password reset email HTML ----
const buildResetEmailHtml = (resetUrl) => `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background-color:#1a3a5c;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;">UniIlorin E-SIWES</h1>
      <p style="color:#cbd5e0;margin:8px 0 0 0;">Password Reset Request</p>
    </div>
    <div style="padding:32px 24px;">
      <p style="color:#374151;font-size:16px;line-height:1.6;">Hello,</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">You recently requested to reset your password for your <strong>UniIlorin E-SIWES Progress Tracker</strong> account.</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">Click the button below to reset your password. <strong>This link expires in 1 hour.</strong></p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${resetUrl}" style="display:inline-block;background-color:#1a3a5c;color:#ffffff;padding:14px 40px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">
          Reset Password
        </a>
      </div>
      <p style="color:#6b7280;font-size:14px;">If the button does not work, copy and paste this link into your browser:</p>
      <p style="background:#f3f4f6;padding:12px;border-radius:4px;word-break:break-all;font-size:13px;color:#4b5563;">${resetUrl}</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="color:#9ca3af;font-size:13px;">If you did not request this reset, please ignore this email. Your password will remain unchanged.</p>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">University of Ilorin &middot; E-SIWES Progress Tracker &middot; Making SIWES Digital</p>
    </div>
  </div>
`;

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    phone,
    institution,
    courseOfStudy,
    matricNumber,
    department,
    level,
  } = req.body;

  // Students and coordinators must belong to an institution
  if (['student', 'coordinator'].includes(role) && !institution) {
    return next(new ApiError(400, 'Institution is required for students and coordinators.'));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(409, 'An account with this email address already exists. Please log in.'));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
    phone,
    institution: institution || undefined,
    courseOfStudy,
    matricNumber,
    department,
    level,
  });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshTokenString = generateRefreshToken(user._id);

  await RefreshToken.create({
    token: refreshTokenString,
    user: user._id,
    expiresAt: getRefreshTokenExpiry(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: {
      user,
      accessToken,
      refreshToken: refreshTokenString,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new ApiError(401, 'Incorrect email or password. Please try again.'));
  }

  if (!user.isActive) {
    return next(new ApiError(401, 'Your account has been deactivated. Please contact the administrator.'));
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshTokenString = generateRefreshToken(user._id);

  // Clean up old revoked/expired tokens for this user before creating new one
  await RefreshToken.cleanupForUser(user._id);

  await RefreshToken.create({
    token: refreshTokenString,
    user: user._id,
    expiresAt: getRefreshTokenExpiry(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Strip password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      user,
      accessToken,
      refreshToken: refreshTokenString,
    },
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return next(new ApiError(400, 'Refresh token is required.'));
  }

  const storedToken = await RefreshToken.findOne({ token });

  if (!storedToken) {
    return next(new ApiError(401, 'Refresh token not found. Please log in again.'));
  }

  if (storedToken.isRevoked) {
    // Token reuse detected — revoke all tokens for this user (possible theft)
    await RefreshToken.revokeAllForUser(storedToken.user);
    return next(new ApiError(401, 'Refresh token has been revoked. Please log in again.'));
  }

  if (storedToken.expiresAt < new Date()) {
    return next(new ApiError(401, 'Refresh token has expired. Please log in again.'));
  }

  const user = await User.findById(storedToken.user);

  if (!user || !user.isActive) {
    return next(new ApiError(401, 'User account not found or deactivated. Please log in again.'));
  }

  const newAccessToken = generateAccessToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'Access token refreshed successfully.',
    data: {
      accessToken: newAccessToken,
    },
  });
});

// @desc    Logout user (revoke refresh token)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  const { refreshToken: token } = req.body;

  if (token) {
    await RefreshToken.findOneAndUpdate(
      { token, user: req.user._id },
      { isRevoked: true }
    );
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('institution', 'name acronym logoUrl');

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @desc    Forgot password — send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const genericResponse = {
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  };

  const user = await User.findOne({ email });

  // Always return generic response to prevent email enumeration attacks
  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const resetToken = generateSecureToken();
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'UniIlorin E-SIWES — Password Reset',
      html: buildResetEmailHtml(resetUrl),
    });

    res.status(200).json(genericResponse);
  } catch (error) {
    // Email failed — clear the token so user can try again
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ApiError(500, 'Failed to send password reset email. Please try again later.'));
  }
});

// @desc    Reset password using token from email
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    return next(new ApiError(400, 'Password reset link is invalid or has expired. Please request a new one.'));
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Revoke all refresh tokens — force re-login on all devices after password change
  await RefreshToken.revokeAllForUser(user._id);

  res.status(200).json({
    success: true,
    message: 'Password reset successful. Please log in with your new password.',
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};