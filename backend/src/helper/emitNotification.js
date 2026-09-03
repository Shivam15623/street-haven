// utils/emitNotification.js  (add this once, reuse everywhere)
export const emitNotification = (io, notification, recipients = []) => {
  const perms = notification.requiredPermissions || [];

  if (perms.length > 0) {
    if (notification.permissionMatchType === "all") {
      // "all" gating doesn't map to a single room; fall back to a
      // composite room built at emit time, sorted for consistency.
      const room = `permission-all:${[...perms].sort().join("+")}`;
      io.to(room).emit("newNotification", notification);
    } else {
      // "any" — emit to each permission room; sockets in any of them get it once
      // (Socket.IO dedupes automatically if a socket is in multiple target rooms)
      perms.forEach((p) => io.to(`permission:${p}`).emit("newNotification", notification));
    }
  } else if (notification.isGlobal) {
    io.emit("newNotification", notification);
  } else {
    recipients.forEach(({ userId }) => {
      io.to(`user:${userId}`).emit("newNotification", notification);
    });
  }
};