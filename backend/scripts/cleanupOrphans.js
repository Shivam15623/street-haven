/**
 * cleanupOrphans.js
 *
 * Finds every user id that is referenced in the database but no longer has a
 * row in `users`, then removes / repairs everything that points at them so no
 * broken references remain. No reassigning: their content is deleted.
 *
 *   node scripts/cleanupOrphans.js              -> PREVIEW only, nothing changes
 *   node scripts/cleanupOrphans.js --execute    -> apply the cleanup
 *
 * Needs MONGODB_URI (or MONGO_URI) in .env. Take a mongodump before --execute.
 */
import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// ── Collection names (mongoose default pluralisation). Edit if yours differ.
const C = {
  users: "users",
  tickets: "tickets",
  tasks: "tasks",
  comments: "comments",
  memberships: "entitymemberships",
  commentNotifs: "usercommentnotifications",
  notifications: "notifications",
  locations: "locations",
  manuals: "programmanuals",
  certs: "volunteercertifications",
};

// Every field that stores a User _id (used to discover orphans + final audit).
// If you have other models that reference users (Event, Announcement, ...),
// add their fields here AND add a cleanup rule below.
const REF_FIELDS = [
  [C.tickets, ["createdBy", "assignedTo", "approvedBy", "rejectedBy", "overviewUpdatedBy", "assignmentHistory.assignedTo", "assignmentHistory.assignedBy", "statusHistory.changedBy"]],
  [C.tasks, ["assignedTo", "assignedBy", "assignmentHistory.assignedTo", "assignmentHistory.assignedBy", "assignmentHistory.fromAssignedTo", "ownershipHistory.from", "ownershipHistory.to", "ownershipHistory.changedBy", "statusHistory.changedBy"]],
  [C.comments, ["userId", "mentions"]],
  [C.memberships, ["userId"]],
  [C.commentNotifs, ["userId", "actorIds"]],
  [C.notifications, ["createdBy"]],
  [C.locations, ["managers", "facilityManager"]],
  [C.manuals, ["createdBy"]],
  [C.certs, ["volunteer"]],
  [C.users, ["superviserId"]],
];

const EXECUTE = process.argv.includes("--execute");
const log = (...m) => console.log(EXECUTE ? "[APPLY]" : "[PREVIEW]", ...m);
const isOid = (v) => v && v._bsontype === "ObjectId";

const backup = {};
const fileUrls = new Set();
let db;

// ── helpers ────────────────────────────────────────────────────────────────
function collectUrls(o) {
  if (!o || typeof o !== "object") return;
  for (const [k, v] of Object.entries(o)) {
    if (k === "fileUrl" && typeof v === "string") fileUrls.add(v);
    else if (v && typeof v === "object" && !isOid(v) && !(v instanceof Date)) collectUrls(v);
  }
}

async function ids(coll, filter) {
  return (await db.collection(coll).find(filter, { projection: { _id: 1 } }).toArray()).map((d) => d._id);
}

async function removeDocs(coll, filter) {
  const col = db.collection(coll);
  const docs = await col.find(filter).toArray();
  if (!docs.length) return [];
  (backup[coll] ||= []).push(...docs);
  docs.forEach(collectUrls);
  if (EXECUTE) await col.deleteMany({ _id: { $in: docs.map((d) => d._id) } });
  log(`${coll}: DELETE ${docs.length}`);
  return docs;
}

async function update(coll, label, filter, upd, options = {}) {
  const col = db.collection(coll);
  const n = await col.countDocuments(filter);
  if (!n) return;
  if (EXECUTE) await col.updateMany(filter, upd, options);
  log(`${coll}: ${label} on ${n} doc(s)`);
}

// ids stored in `field` of `coll` that do not exist in `targetColl`
async function missingIds(coll, field, targetColl) {
  const vals = (await db.collection(coll).distinct(field)).filter(isOid);
  if (!vals.length) return [];
  const present = new Set((await ids(targetColl, { _id: { $in: vals } })).map(String));
  return vals.filter((v) => !present.has(String(v)));
}

async function findOrphanUserIds() {
  const referenced = new Map();
  for (const [coll, fields] of REF_FIELDS)
    for (const f of fields)
      (await db.collection(coll).distinct(f)).filter(isOid).forEach((v) => referenced.set(String(v), v));
  const all = [...referenced.values()];
  if (!all.length) return [];
  const present = new Set((await ids(C.users, { _id: { $in: all } })).map(String));
  return all.filter((v) => !present.has(String(v)));
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("Set MONGODB_URI (or MONGO_URI) in .env");
  await mongoose.connect(uri);
  db = mongoose.connection.db;

  const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));
  for (const [k, v] of Object.entries(C))
    if (!existing.has(v)) console.warn(`⚠ collection "${v}" (${k}) not found - check the names at the top of the script`);

  // 1 ─ discover deleted users
  const U = await findOrphanUserIds();
  console.log(`Deleted users still referenced: ${U.length}`);
  U.forEach((id) => console.log(`  - ${id}`));
  const IN = { $in: U };

  // 2 ─ tickets & tasks that die with their user (children first => safe to re-run)
  const ticketIds = await ids(C.tickets, { createdBy: IN });
  const taskIds = await ids(C.tasks, { $or: [{ assignedTo: IN }, { assignedBy: IN }] });
  for (const [type, entIds] of [["Ticket", ticketIds], ["Task", taskIds]]) {
    if (!entIds.length) continue;
    const f = { entityType: type, entityId: { $in: entIds } };
    await removeDocs(C.comments, f);
    await removeDocs(C.memberships, f);
    await removeDocs(C.commentNotifs, f);
  }
  await removeDocs(C.tickets, { _id: { $in: ticketIds } });
  await removeDocs(C.tasks, { _id: { $in: taskIds } });

  // 3 ─ rows owned by the deleted users
  await removeDocs(C.comments, { userId: IN });
  await removeDocs(C.memberships, { userId: IN });
  await removeDocs(C.commentNotifs, { userId: IN });
  await removeDocs(C.certs, { volunteer: IN });
  await removeDocs(C.manuals, { createdBy: IN });

  // 4 ─ references inside content that survives
  // Tickets
  await update(C.tickets, "set assignedTo=null", { assignedTo: IN }, { $set: { assignedTo: null } });
  await update(C.tickets, "set approvedBy=null", { approvedBy: IN }, { $set: { approvedBy: null } });
  await update(C.tickets, "set rejectedBy=null", { rejectedBy: IN }, { $set: { rejectedBy: null } });
  await update(C.tickets, "unset overviewUpdatedBy", { overviewUpdatedBy: IN }, { $unset: { overviewUpdatedBy: "" } });
  await update(C.tickets, "pull assignmentHistory entries (assignedTo)", { "assignmentHistory.assignedTo": IN }, { $pull: { assignmentHistory: { assignedTo: IN } } });
  await update(C.tickets, "null assignmentHistory.assignedBy", { "assignmentHistory.assignedBy": IN }, { $set: { "assignmentHistory.$[e].assignedBy": null } }, { arrayFilters: [{ "e.assignedBy": IN }] });
  await update(C.tickets, "null statusHistory.changedBy", { "statusHistory.changedBy": IN }, { $set: { "statusHistory.$[e].changedBy": null } }, { arrayFilters: [{ "e.changedBy": IN }] });

  // Tasks (history subdocs have REQUIRED user fields, so the entry is pulled instead of nulled)
  await update(C.tasks, "pull assignmentHistory entries (assignedTo)", { "assignmentHistory.assignedTo": IN }, { $pull: { assignmentHistory: { assignedTo: IN } } });
  await update(C.tasks, "pull assignmentHistory entries (assignedBy)", { "assignmentHistory.assignedBy": IN }, { $pull: { assignmentHistory: { assignedBy: IN } } });
  await update(C.tasks, "null assignmentHistory.fromAssignedTo", { "assignmentHistory.fromAssignedTo": IN }, { $set: { "assignmentHistory.$[e].fromAssignedTo": null } }, { arrayFilters: [{ "e.fromAssignedTo": IN }] });
  await update(C.tasks, "pull ownershipHistory entries (from)", { "ownershipHistory.from": IN }, { $pull: { ownershipHistory: { from: IN } } });
  await update(C.tasks, "pull ownershipHistory entries (to)", { "ownershipHistory.to": IN }, { $pull: { ownershipHistory: { to: IN } } });
  await update(C.tasks, "null ownershipHistory.changedBy", { "ownershipHistory.changedBy": IN }, { $set: { "ownershipHistory.$[e].changedBy": null } }, { arrayFilters: [{ "e.changedBy": IN }] });
  await update(C.tasks, "null statusHistory.changedBy", { "statusHistory.changedBy": IN }, { $set: { "statusHistory.$[e].changedBy": null } }, { arrayFilters: [{ "e.changedBy": IN }] });

  // Comments / notifications / misc
  await update(C.comments, "pull from mentions", { mentions: IN }, { $pull: { mentions: IN } });
  await update(C.commentNotifs, "pull from actorIds", { actorIds: IN }, { $pull: { actorIds: IN } });
  if (EXECUTE) await removeDocs(C.commentNotifs, { type: "activity", actorIds: { $size: 0 } }); // group with no actors left
  await update(C.notifications, "set createdBy=null", { createdBy: IN }, { $set: { createdBy: null } });
  await update(C.users, "set superviserId=null", { superviserId: IN }, { $set: { superviserId: null } });
  await update(C.locations, "pull from managers", { managers: IN }, { $pull: { managers: IN } });
  await update(C.locations, "set facilityManager=null", { facilityManager: IN }, { $set: { facilityManager: null } });

  // 5 ─ comment / membership / notification rows whose ticket or task no longer exists
  for (const [type, entColl] of [["Ticket", C.tickets], ["Task", C.tasks]])
    for (const coll of [C.comments, C.memberships, C.commentNotifs]) {
      const vals = (await db.collection(coll).distinct("entityId", { entityType: type })).filter(isOid);
      if (!vals.length) continue;
      const present = new Set((await ids(entColl, { _id: { $in: vals } })).map(String));
      const gone = vals.filter((v) => !present.has(String(v)));
      if (gone.length) await removeDocs(coll, { entityType: type, entityId: { $in: gone } });
    }

  // 6 ─ pointers to comments that no longer exist
  const badParents = await missingIds(C.comments, "parentCommentId", C.comments);
  if (badParents.length) await update(C.comments, "set parentCommentId=null", { parentCommentId: { $in: badParents } }, { $set: { parentCommentId: null } });

  const badSeen = await missingIds(C.memberships, "lastSeenCommentId", C.comments);
  if (badSeen.length) await update(C.memberships, "set lastSeenCommentId=null", { lastSeenCommentId: { $in: badSeen } }, { $set: { lastSeenCommentId: null } });

  const badNotif = await missingIds(C.commentNotifs, "commentId", C.comments);
  if (badNotif.length) {
    await removeDocs(C.commentNotifs, { commentId: { $in: badNotif }, type: { $in: ["mention", "reply"] } });
    await update(C.commentNotifs, "set commentId=null", { commentId: { $in: badNotif } }, { $set: { commentId: null } });
  }

  const badLatest = await missingIds(C.tickets, "latestComment", C.comments);
  if (badLatest.length) {
    const tickets = await db.collection(C.tickets).find({ latestComment: { $in: badLatest } }, { projection: { _id: 1 } }).toArray();
    for (const t of tickets) {
      const [last] = await db.collection(C.comments).find({ entityType: "Ticket", entityId: t._id }).sort({ createdAt: -1 }).limit(1).toArray();
      log(`tickets: latestComment of ${t._id} -> ${last ? last._id : "unset"}`);
      if (EXECUTE)
        await db.collection(C.tickets).updateOne({ _id: t._id }, last ? { $set: { latestComment: last._id } } : { $unset: { latestComment: "" } });
    }
  }

  // 7 ─ audit (apply mode): re-scan, everything must be clean
  if (EXECUTE) {
    let bad = 0;
    const left = await findOrphanUserIds();
    if (left.length) { bad += left.length; console.error(`✗ ${left.length} deleted-user id(s) still referenced`); }
    for (const [type, entColl] of [["Ticket", C.tickets], ["Task", C.tasks]])
      for (const coll of [C.comments, C.memberships, C.commentNotifs]) {
        const vals = (await db.collection(coll).distinct("entityId", { entityType: type })).filter(isOid);
        const present = new Set((await ids(entColl, { _id: { $in: vals } })).map(String));
        const n = vals.filter((v) => !present.has(String(v))).length;
        if (n) { bad += n; console.error(`✗ ${coll}: ${n} ${type} id(s) point to missing ${type.toLowerCase()}s`); }
      }
    for (const [coll, field] of [[C.comments, "parentCommentId"], [C.memberships, "lastSeenCommentId"], [C.commentNotifs, "commentId"], [C.tickets, "latestComment"]]) {
      const n = (await missingIds(coll, field, C.comments)).length;
      if (n) { bad += n; console.error(`✗ ${coll}.${field}: ${n} missing comment id(s)`); }
    }
    console.log(bad ? `\nAudit FAILED: ${bad} problem(s) left` : "\n✓ Audit passed: no broken references remain");
  }

  // 8 ─ reports
  if (EXECUTE) {
    fs.mkdirSync("backups", { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const E = mongoose.mongo.BSON?.EJSON;
    fs.writeFileSync(path.join("backups", `cleanup-${stamp}.json`), E ? E.stringify(backup, undefined, 2) : JSON.stringify(backup, null, 2));
    if (fileUrls.size) fs.writeFileSync(path.join("backups", `cleanup-${stamp}-files-to-delete.txt`), [...fileUrls].join("\n"));
    console.log(`Backup of deleted docs saved in ./backups (${fileUrls.size} uploaded file URL(s) listed for storage cleanup)`);
  } else {
    console.log("\nPreview only. Run again with --execute to apply.");
  }
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());