// controllers/comment.controller.js
import path from "path";
import mongoose from "mongoose";
import { asyncHandler } from "../utills/AsyncHandler.js";
import Comment from "../model/comments.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import Ticket from "../model/ticket.js";
import Task from "../model/task.js";
import { ApiError } from "../utills/ApiError.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import { io } from "../index.js";
import User from "../model/user.js";

import {
  getEntityAccessUserIds,
  getTaskAccessUserIds,
  getTicketAccessUserIds,
} from "../helper/mentionAccess.js";
import EntityMembership from "../model/EntityMemberShip.js";
import { fanOutComment } from "../helper/fanoutComments.js";

const ENTITY_MODELS = {
  Ticket,
  Task,
};

const typeMap = {
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  video: [".mp4", ".mov", ".avi", ".mkv"],
  audio: [".mp3", ".wav", ".ogg"],
  pdf: [".pdf"],
  doc: [".doc", ".docx"],
  ppt: [".ppt", ".pptx"],
  excel: [".xls", ".xlsx"],
  zip: [".zip", ".rar"],
};

const detectFileType = (ext) =>
  Object.keys(typeMap).find((key) => typeMap[key].includes(ext)) || "other";

/**
 * Loads a Task/Ticket by its Mongo _id WITH whatever population each
 * entity's access-list resolver needs, so getEntityAccessUserIds can run
 * without a second query. Kept in one place since both
 * fetchCommentsForEntity and addCommentForEntity need it.
 */
const loadEntityForAccessCheck = async (entityType, entityId) => {
  const EntityModel = ENTITY_MODELS[entityType];
  if (!EntityModel) throw new ApiError(400, "Invalid entity type");

  if (entityType === "Task") {
    return EntityModel.findById(entityId)
      .select("assignedTo assignedBy slug taskNumber title")
      .populate({ path: "assignedTo", select: "_id superviserId" })
      .lean();
  }

  // Ticket
  return EntityModel.findById(entityId)
    .select(
      "location createdBy assignedTo approvedBy assignmentHistory slug ticketNumber req_title",
    )
    .lean();
};
// --- Shared core logic ---

export const fetchCommentsForEntity = asyncHandler(
  async (req, res, entityType) => {
    const { entityId } = req.params;
    const userId = req.user._id.toString();
    const isSuperAdmin = req.user.role === "super_admin";

    const entity = await loadEntityForAccessCheck(entityType, entityId);
    if (!entity) throw new ApiError(404, `${entityType} not found`);

    // Same visibility rule as commenting/mentioning — someone who can't
    // see this entity shouldn't be able to read its comment thread either.
    if (!isSuperAdmin) {
      const accessUserIds = await getEntityAccessUserIds(entityType, entity);
      if (!accessUserIds.has(userId)) {
        throw new ApiError(404, `${entityType} not found`);
      }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ entityType, entityId })
      .populate("userId", "firstname lastname email")
      .populate("mentions", "firstname lastname")
      .populate({
        path: "parentCommentId",
        select: "message userId",
        populate: { path: "userId", select: "firstname lastname" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ entityType, entityId });

    res.status(200).json(
      new ApiResponse(200, "Comments fetched successfully", {
        comments,
        paggination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      }),
    );
  },
);

export const addCommentForEntity = asyncHandler(
  async (req, res, entityType) => {
    const { entityId } = req.params;
    const userId = req.user._id;
    const userIdStr = userId.toString();
    const isSuperAdmin = req.user.role === "super_admin";
    const { message, clientId, parentCommentId } = req.body;

    if (!message && (!req.files || req.files.length === 0)) {
      throw new ApiError(
        400,
        "Comment message or at least one attachment is required",
      );
    }

    const entity = await loadEntityForAccessCheck(entityType, entityId);
    if (!entity) {
      throw new ApiError(404, `${entityType} not found`);
    }

    // --------------------------------------------------
    // Access gate: previously MISSING — any authenticated user could
    // comment on any entity. Now uses the exact same rule as the
    // mentionable-users endpoints (assignee/creator/approver/managers/
    // super_admin), so "who can see this thread" and "who can post in it"
    // can never drift apart.
    // --------------------------------------------------
    const accessUserIds = await getEntityAccessUserIds(entityType, entity);
    if (!isSuperAdmin && !accessUserIds.has(userIdStr)) {
      throw new ApiError(403, "You do not have access to this thread");
    }

    // --------------------------------------------------
    // Reply validation: if a parent is given, it must exist and belong
    // to THIS entity — otherwise someone could reply-link a comment from
    // an entity they have no access to, leaking its author/snippet.
    // --------------------------------------------------
    let parentComment = null;
    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        throw new ApiError(400, "Invalid parentCommentId");
      }
      parentComment = await Comment.findOne({
        _id: parentCommentId,
        entityType,
        entityId,
      }).populate("userId", "firstname lastname email");

      if (!parentComment) {
        throw new ApiError(404, "Parent comment not found on this thread");
      }
    }

    // --------------------------------------------------
    // Mentions: never trust the client's ids outright — intersect with
    // the real access set computed above. Anything outside it (typo'd id,
    // tampered request, stale id from someone removed from the thread) is
    // silently dropped rather than erroring, so a bad mention never blocks
    // an otherwise-valid comment from posting.
    // --------------------------------------------------
    let trustedMentionIds = [];
    if (req.body.mentions) {
      let rawMentions;
      try {
        rawMentions = JSON.parse(req.body.mentions);
      } catch {
        throw new ApiError(400, "Invalid mentions payload");
      }
      if (!Array.isArray(rawMentions)) {
        throw new ApiError(400, "mentions must be an array");
      }

      trustedMentionIds = [
        ...new Set(
          rawMentions.filter((id) => mongoose.Types.ObjectId.isValid(id)),
        ),
      ].filter((id) => accessUserIds.has(id) && id !== userIdStr);
    }

    // --- attachments ---
    let attachments = [];
    if (req.files?.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const uploadedFile = await uploadOnCloudinary(file.path);
        if (!uploadedFile?.secure_url) {
          throw new ApiError(
            500,
            `Attachment upload failed for ${file.originalname}`,
          );
        }
        const ext = path.extname(file.originalname).toLowerCase();
        return {
          fileName: uploadedFile.original_filename,
          fileUrl: uploadedFile.secure_url,
          size: uploadedFile.bytes,
          type: detectFileType(ext),
        };
      });
      attachments = await Promise.all(uploadPromises);
    }

    const payload = { entityType, entityId, userId };
    if (message) payload.message = message;
    if (attachments.length !== 0) payload.attachments = attachments;
    if (parentComment) payload.parentCommentId = parentComment._id;
    if (trustedMentionIds.length) payload.mentions = trustedMentionIds;

    // --- comment creation: no transaction needed for a single insert ---
    const comment = await Comment.create(payload);

    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "firstname lastname email")
      .populate("mentions", "firstname lastname")
      .populate({
        path: "parentCommentId",
        select: "message userId",
        populate: { path: "userId", select: "firstname lastname" },
      });
    await EntityMembership.updateOne(
      { entityType, entityId, userId: req.user._id },
      { lastSeenCommentId: comment._id, lastSeenAt: new Date() },
    );
    // --- emit the live comment to everyone viewing the entity room ---
    // this happens regardless of notification outcome — the comment
    // itself is already durable at this point
    const room = `${entityType.toLowerCase()}:${entityId}`;
    io.to(room).emit("newComment", {
      comment: populatedComment,
      clientId,
    });

    res
      .status(201)
      .json(
        new ApiResponse(201, "Comment added successfully", populatedComment),
      );
    fanOutComment(comment, entity).catch((err) =>
      console.error("fanoutcomment failed", err),
    );
    // --- notification pipeline: fire-and-forget, AFTER the response ---
    // deliberately outside the request/response critical path — a
    // notification failure must never affect whether the comment was
    // saved or what the user sees back.
  },
);

// --------------------------------------------------------------------
// Mentionable-users endpoints — now thin wrappers around the shared
// access-list resolver, so this list can never drift from the actual
// commenting-permission check above.
// --------------------------------------------------------------------

const MENTIONABLE_USERS_LIMIT = 20;

const searchFilterFor = (q) => {
  const search = String(q || "").trim();
  if (!search) return {};
  return {
    $or: [
      { firstname: { $regex: search, $options: "i" } },
      { lastname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ],
  };
};

export const getTaskMentionableUsers = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { q = "" } = req.query;
  const { _id: userId, role } = req.user;

  if (!slug) {
    throw new ApiError(400, "Task slug is required");
  }

  const task = await Task.findOne({ slug })
    .select("assignedTo assignedBy")
    .populate({
      path: "assignedTo",
      select: "_id firstname lastname slug role superviserId",
    })
    .lean();

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const userIds = await getTaskAccessUserIds(task);
  const isSuperAdmin = role === "super_admin";

  if (!isSuperAdmin && !userIds.has(userId.toString())) {
    throw new ApiError(404, "Task not found");
  }

  const users = await User.find({
    _id: { $in: [...userIds].map((id) => new mongoose.Types.ObjectId(id)) },
    status: "active",
    ...searchFilterFor(q),
  })
    .select("_id firstname lastname slug role")
    .sort({ firstname: 1, lastname: 1 })
    .limit(MENTIONABLE_USERS_LIMIT)
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Mentionable users fetched successfully", users),
    );
});

export const getTicketMentionableUsers = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { q = "" } = req.query;
  const { _id: userId, role } = req.user;

  if (!slug) {
    throw new ApiError(400, "Ticket slug is required");
  }

  // FIXED: was `{ _id: slug }` — filtering the primary key by a slug
  // string, which never matches. Ticket lookup must go through `slug`.
  const ticket = await Ticket.findOne({ slug })
    .select("location assignedTo createdBy approvedBy assignmentHistory")
    .lean();

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const userIds = await getTicketAccessUserIds(ticket);
  const isSuperAdmin = role === "super_admin";

  if (!isSuperAdmin && !userIds.has(userId.toString())) {
    throw new ApiError(404, "Ticket not found");
  }

  const users = await User.find({
    _id: { $in: [...userIds].map((id) => new mongoose.Types.ObjectId(id)) },
    status: "active",
    ...searchFilterFor(q),
  })
    .select("_id firstname lastname slug role")
    .sort({ firstname: 1, lastname: 1 })
    .limit(MENTIONABLE_USERS_LIMIT)
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Mentionable users fetched successfully", users),
    );
});





export const updateReadCursor = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const { lastSeenCommentId } = req.body;
  const userId = req.user._id;

  if (!["Ticket", "Task"].includes(entityType)) {
    throw new ApiError(400, "Invalid entity type");
  }
  if (!mongoose.Types.ObjectId.isValid(lastSeenCommentId)) {
    throw new ApiError(400, "Invalid lastSeenCommentId");
  }

  const newCursor = new mongoose.Types.ObjectId(lastSeenCommentId);

  // The comment being marked-seen must actually belong to this entity —
  // otherwise a client bug/tamper could set the cursor to an unrelated
  // comment id and desync unread math.
  const commentExists = await Comment.exists({
    _id: newCursor,
    entityType,
    entityId,
  });
  if (!commentExists) {
    throw new ApiError(404, "Comment not found on this thread");
  }

  // Membership must exist and be active — someone whose access was
  // revoked shouldn't be able to move their own cursor (case #29).
  const membership = await EntityMembership.findOne({
    entityType,
    entityId,
    userId,
    removedAt: null,
  });
  if (!membership) {
    throw new ApiError(404, `${entityType} not found`);
  }

  // Cursor only ever moves FORWARD. A stale/out-of-order client request
  // (e.g. two tabs, one behind) must never rewind an already-advanced
  // cursor. ObjectId comparison works here (see earlier discussion on
  // BSON timestamp ordering) — safe for single-instance write patterns.
  if (
    membership.lastSeenCommentId &&
    newCursor.toString() <= membership.lastSeenCommentId.toString() &&
    newCursor.getTimestamp().getTime() <=
      membership.lastSeenCommentId.getTimestamp().getTime()
  ) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Cursor already up to date", { advanced: false }),
      );
  }

  await EntityMembership.updateOne(
    { _id: membership._id },
    { $set: { lastSeenCommentId: newCursor, lastSeenAt: new Date() } },
  );

  // fire-and-forget: recompute the user's activity notification for this
  // entity against what's ACTUALLY still unseen, so a stale "20 comments"
  // notification shrinks/resolves the moment the user catches up in the
  // thread itself — even if they never touch the notification center.
  reconcileActivityNotification(userId, entityType, entityId, newCursor).catch(
    (err) => console.error("reconcileActivityNotification failed", err),
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Read cursor updated", { advanced: true }));
});

/**
 * Recalculates (or resolves) the user's open activity notification for
 * this entity based on what's genuinely unseen after their cursor moved.
 * Mention/reply notifications are NOT touched here — those resolve only
 * via explicit notification-center actions (case #9's high-priority
 * notifications shouldn't silently vanish just because the thread was
 * scrolled past; the user should consciously ack them). If you want
 * mentions/replies to also auto-resolve once their target comment has
 * been scrolled past, that's a deliberate product choice to add later —
 * left out here on purpose.
 */
async function reconcileActivityNotification(
  userId,
  entityType,
  entityId,
  newCursor,
) {
  const openNotif = await UserCommentNotification.findOne({
    userId,
    entityType,
    entityId,
    type: "activity",
    isRead: false,
  });
  if (!openNotif) return; // nothing to reconcile

  const remaining = await Comment.find(
    { entityType, entityId, _id: { $gt: newCursor } },
    { userId: 1 },
  ).lean();

  if (remaining.length === 0) {
    await UserCommentNotification.updateOne(
      { _id: openNotif._id },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
          expireAt: computeExpireAt("activity"),
        },
      },
    );
    return;
  }

  const distinctActorIds = [
    ...new Set(remaining.map((c) => c.userId.toString())),
  ];

  await UserCommentNotification.updateOne(
    { _id: openNotif._id },
    {
      $set: {
        commentCount: remaining.length,
        actorIds: distinctActorIds.slice(-5),
        uniqueActorCount: distinctActorIds.length,
        commentId: remaining.at(-1)._id,
      },
    },
  );
}

function computeExpireAt(type) {
  const TTL_DAYS = {
    activity: 14,
    mention: 45,
    reply: 45,
    assignment: 45,
    other: 30,
  };
  return new Date(Date.now() + (TTL_DAYS[type] ?? 30) * 86400000);
}

