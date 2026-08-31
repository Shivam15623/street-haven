// presence.js
//
// Wraps the `activeRoomUsers` map (existing, in index.js) for "is this
// user in the room at all", and adds a small `scrollStateByRoom` map for
// "where are they scrolled" — needed to branch case #3/#11 (at bottom,
// emit-only) vs case #10 (scrolled up, emit + show chip) vs offline/
// elsewhere (notification path).
//
// No new socket connection state, no Redis — just a second in-memory
// map alongside the one you already have, updated by a new
// `scroll_state` socket event (see index.js changes).
//
// NOTE: `activeRoomUsers[room]` is a Set of userId STRINGS. Make sure
// every socket handler that touches it uses String(userId) consistently
// or `.has()` lookups will silently return false.

import { activeRoomUsers } from "../index.js";

// room -> Map<userId, { scrollState: 'bottom' | 'up', updatedAt: number }>
export const scrollStateByRoom = {};

function roomName(entityType, entityId) {
  return `${entityType.toLowerCase()}:${entityId}`;
}

/**
 * @returns {boolean} true if this user currently has the entity room open
 */
export function isUserViewing(entityType, entityId, userId) {
  const room = roomName(entityType, entityId);
  return activeRoomUsers[room]?.has(String(userId)) ?? false;
}

/**
 * @returns {'bottom'|'up'|null} null if not viewing, or no scroll signal yet
 *   (default to 'bottom' at call sites — see fanOutComment — since a user
 *   who just joined and hasn't scrolled is presumed to be at the latest
 *   comment).
 */
export function getScrollState(entityType, entityId, userId) {
  const room = roomName(entityType, entityId);
  return scrollStateByRoom[room]?.get(String(userId))?.scrollState ?? null;
}

/**
 * Called from the `scroll_state` socket handler. Client should debounce
 * this (~1-2s or on scroll-stop), never fire per scroll tick.
 */
export function setScrollState(entityType, entityId, userId, scrollState) {
  const room = roomName(entityType, entityId);
  if (!scrollStateByRoom[room]) scrollStateByRoom[room] = new Map();
  scrollStateByRoom[room].set(String(userId), {
    scrollState,
    updatedAt: Date.now(),
  });
}

/**
 * Call on leaveRoom / disconnect cleanup alongside activeRoomUsers
 * deletion, so scroll state doesn't leak across sessions.
 */
export function clearScrollState(entityType, entityId, userId) {
  const room = roomName(entityType, entityId);
  scrollStateByRoom[room]?.delete(String(userId));
}

/**
 * @returns {Set<string>} userIds currently viewing this entity
 */
export function getViewers(entityType, entityId) {
  const room = roomName(entityType, entityId);
  return activeRoomUsers[room] ?? new Set();
}