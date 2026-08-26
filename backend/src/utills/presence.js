// presence.js
//
// Thin wrapper around the `activeRoomUsers` map you already maintain in
// index.js (populated by your existing `joinRoom` / `leaveRoom` socket
// handlers). No new state, no new socket events.
//
// NOTE: `activeRoomUsers[room]` is a Set of userId strings. If any code
// path ever adds a raw ObjectId instead of a string, `.has()` lookups
// here will silently return false. Make sure `joinRoom` always stores
// `String(userId)`.

import { activeRoomUsers } from "../index.js";



/**
 * @param {"Ticket"|"Task"} entityType
 * @param {string} entityId
 * @param {string} userId
 * @returns {boolean} true if this user currently has the entity room open
 */
export function isUserViewing(entityType, entityId, userId) {
  const room = `${entityType.toLowerCase()}:${entityId}`;
  return activeRoomUsers[room]?.has(String(userId)) ?? false;
}

/**
 * @param {"Ticket"|"Task"} entityType
 * @param {string} entityId
 * @returns {Set<string>} set of userIds currently viewing this entity
 */
export function getViewers(entityType, entityId) {
  const room = `${entityType.toLowerCase()}:${entityId}`;
  return activeRoomUsers[room] ?? new Set();
}