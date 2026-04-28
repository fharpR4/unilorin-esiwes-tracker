const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

/**
 * Creates an in-app notification for a user.
 * Fire-and-forget — errors are swallowed so they never break the main request.
 */
const createNotification = async ({
  recipientId,
  type,
  title,
  message,
  link = '',
  relatedId = null,
  relatedModel = null,
}) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      relatedId,
      relatedModel,
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

/**
 * Logs a system activity for audit purposes.
 * Fire-and-forget.
 */
const logActivity = async ({
  userId,
  action,
  description = '',
  entity = null,
  entityId = null,
  metadata = null,
  ipAddress = '',
  userAgent = '',
}) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      description,
      entity,
      entityId,
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

module.exports = { createNotification, logActivity };