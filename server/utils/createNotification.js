const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

/**
 * Creates an in-app notification for a user.
 * Always fire-and-forget — errors are logged but never crash the main request.
 *
 * @param {Object} options
 * @param {string|ObjectId} options.recipientId - The user who receives the notification
 * @param {string} options.type - Notification type
 * @param {string} options.title - Short title
 * @param {string} options.message - Full message text
 * @param {string} [options.link] - Frontend route to navigate to on click
 * @param {string|ObjectId} [options.relatedId] - ID of related document
 * @param {string} [options.relatedModel] - Model name of related document
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
  if (!recipientId || !type || !title || !message) {
    console.warn('[createNotification] Missing required fields — skipping.');
    return;
  }

  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      relatedId: relatedId || undefined,
      relatedModel: relatedModel || undefined,
    });
    return notification;
  } catch (err) {
    console.error('[createNotification] Failed to create notification:', err.message);
  }
};

/**
 * Logs a system activity for audit purposes.
 * Always fire-and-forget.
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
  if (!action) return;

  try {
    await ActivityLog.create({
      user: userId || undefined,
      action,
      description,
      entity: entity || undefined,
      entityId: entityId || undefined,
      metadata: metadata || undefined,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('[logActivity] Failed to log activity:', err.message);
  }
};

module.exports = { createNotification, logActivity };