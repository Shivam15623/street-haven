import Notification from "../model/notification.js";
import UserNotification from "../model/notificationTrack.js";

/**
 * Create a notification and (if needed) link it to specific users.
 *
 * Supports:
 *  - Global notifications (visible to all users)
 *  - Targeted notifications (specific users)
 *
 * @param {Object} options
 * @param {String} options.type
 * @param {String} options.title
 * @param {String} options.message
 * @param {String} [options.link]
 * @param {Object} [options.meta]
 * @param {Boolean} [options.isGlobal=false]
 * @param {Array<ObjectId>} [options.recipients=[]]
 * @param {ObjectId} [options.createdBy]
 * @param {Date} [options.expireAt]
 * @param {mongoose.ClientSession} [session]
 */


export const createNotification = async (options, session = null) => {
  const {
    type,
    title,
    message,
    link,
    meta,
    isGlobal = false,
    recipients = [],
    createdBy,
    expireAt, // optional
  } = options;

  if (!type || !title || !message)
    throw new Error("Type, title, and message are required.");

  // 1️⃣ Calculate default expiration (30 days)
  const now = new Date();
  const defaultExpireAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const notificationExpireAt = expireAt || defaultExpireAt;

  // 2️⃣ Create the notification
  const [notification] = await Notification.create(
    [
      {
        type,
        title,
        message,
        link,
        meta,
        isGlobal,
        expireAt: notificationExpireAt, // always set value
        createdBy,
      },
    ],
    session ? { session } : {}
  );

  // 3️⃣ Create UserNotification mapping for targeted notifications
  if (!isGlobal && recipients.length > 0) {
    const bulkOps = recipients.map((userId) => ({
      updateOne: {
        filter: { userId, notificationId: notification._id },
        update: {
          $setOnInsert: {
            userId,
            notificationId: notification._id,
            expiresAt: notificationExpireAt, // 30-day global expiry
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

  const passNotification = {
    createdAt: notification.createdAt,
    createdBy: notification.createdBy,
    link: notification.link,
    message: notification.message,
    meta: notification.meta,
    title: notification.title,
    type: notification.type,
    updatedAt: notification.updatedAt,
    _id: notification._id.toString(),
    readAt: null,
    isRead: false,
    isGlobal,
  };

  return passNotification;
};
