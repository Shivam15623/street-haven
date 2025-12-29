import Notification from "../model/notification.js";
import UserNotification from "../model/notificationTrack.js";

/**
 * Create a notification and link it to users if needed
 *
 * @param {Object} options
 * @param {String} options.category   // ticket | event | system | announcement
 * @param {String} options.action     // created | updated | assigned | status_changed
 * @param {String} [options.severity] // info | success | warning | error
 * @param {String} options.title
 * @param {String} options.message
 * @param {String} [options.link]
 * @param {Object} [options.meta]
 * @param {Boolean} [options.isGlobal=false]
 * @param {Array<{ userId: ObjectId }>} [options.recipients=[]]
 * @param {ObjectId} [options.createdBy]
 * @param {Date} [options.expireAt]
 * @param {mongoose.ClientSession} [session]
 */

export const createNotification = async (options, session = null) => {
  const {
    category,
    action,
    severity = "info",
    title,
    message,
    link,
    meta,
    isGlobal = false,
    recipients = [],
    createdBy,
    expireAt,
  } = options;

  if (!category || !action || !title || !message) {
    throw new Error("category, action, title and message are required.");
  }

  /* ======================
     EXPIRATION
  ====================== */
  const now = new Date();
  const defaultExpireAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const notificationExpireAt = expireAt || defaultExpireAt;

  /* ======================
     CREATE NOTIFICATION
  ====================== */
  const [notification] = await Notification.create(
    [
      {
        category,
        action,
        severity,
        title,
        message,
        link,
        meta,
        isGlobal,
        expireAt: notificationExpireAt,
        createdBy,
      },
    ],
    session ? { session } : {}
  );

  /* ======================
     USER NOTIFICATION MAP
  ====================== */
  if (!isGlobal && recipients.length > 0) {
    const bulkOps = recipients.map(({ userId }) => ({
      updateOne: {
        filter: { userId, notificationId: notification._id },
        update: {
          $setOnInsert: {
            userId,
            notificationId: notification._id,
            expiresAt: notificationExpireAt,
          },
        },
        upsert: true,
      },
    }));

    await UserNotification.bulkWrite(bulkOps, {
      ordered: false,
      ...(session && { session }),
    });
  }

  /* ======================
     SOCKET / API PAYLOAD
  ====================== */
  return {
    _id: notification._id.toString(),
    category: notification.category,
    action: notification.action,
    severity: notification.severity,
    title: notification.title,
    message: notification.message,
    link: notification.link,
    meta: notification.meta,
    createdBy: notification.createdBy,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
    isGlobal,
    isRead: false,
    readAt: null,
  };
};
