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
    expireAt,
  } = options;

  if (!type || !title || !message)
    throw new Error("Type, title, and message are required.");

  // 1️⃣ Create the notification
  const [notification] = await Notification.create(
    [
      {
        type,
        title,
        message,
        link,
        meta,
        isGlobal,
        expireAt,
        createdBy,
      },
    ],
    session ? { session } : {}
  );

  // 2️⃣ Only create mapping entries for targeted notifications
  if (!isGlobal && recipients.length > 0) {
    const bulkOps = recipients.map((userId) => ({
      updateOne: {
        filter: { userId, notificationId: notification._id },
        update: { $setOnInsert: { userId, notificationId: notification._id } },
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
    isGlobal: isGlobal,
  };
  return passNotification;
};
