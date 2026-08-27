// controllers/comment.controller.js
import path from "path";
import { asyncHandler } from "../utills/AsyncHandler.js";
import Comment from "../model/comments.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import Ticket from "../model/ticket.js";
import Task from "../model/task.js";
import { ApiError } from "../utills/ApiError.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import { activeRoomUsers, io } from "../index.js";
import { resolveRecipients } from "../utills/recipients.js";
import mongoose from "mongoose";
import { isUserViewing } from "../utills/presence.js";
import { handleNewComment } from "../helper/commentNotification.js";
import Location from "../model/location.js";
import User from "../model/user.js";

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

// --- Shared core logic ---

export const fetchCommentsForEntity = asyncHandler(
  async (req, res, entityType) => {
    const { entityId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ entityType, entityId })
      .populate("userId", "firstname lastname email")
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
const pendingCommentBatches = new Map();
// key: `${entityType}:${entityId}:${authorId}` -> { timer, count, lastCommentId }

export const addCommentForEntity = asyncHandler(
  async (req, res, entityType) => {
    const { entityId } = req.params;
    const userId = req.user._id;
    const { message, clientId } = req.body;

    if (!message && (!req.files || req.files.length === 0)) {
      throw new ApiError(
        400,
        "Comment message or at least one attachment is required",
      );
    }

    const EntityModel = ENTITY_MODELS[entityType];
    const entity = await EntityModel.findById(entityId);
    if (!entity) {
      throw new ApiError(404, `${entityType} not found`);
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

    // --- comment creation: no transaction needed for a single insert ---
    const comment = await Comment.create(payload);

    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "firstname lastname email",
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

    // --- notification pipeline: fire-and-forget, AFTER the response ---
    // deliberately outside the request/response critical path and outside
    // any transaction — a notification failure must never affect whether
    // the comment was saved or what the user sees back.
    
  },
);


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

  // --------------------------------------------------
  // Check access
  // --------------------------------------------------
  const currentUserId = userId.toString();

  const isSuperAdmin = role === "super_admin";

  const isAssignedTo =
    task.assignedTo?._id?.toString() === currentUserId;

  const isAssignedBy =
    task.assignedBy?.toString() === currentUserId;

  if (!isSuperAdmin && !isAssignedTo && !isAssignedBy) {
    throw new ApiError(404, "Task not found");
  }

  // --------------------------------------------------
  // Build mentionable IDs
  // --------------------------------------------------
  const userIds = new Set();

  const addId = (id) => {
    if (id) {
      userIds.add(id.toString());
    }
  };

  // Assigned volunteer
  addId(task.assignedTo?._id);

  // Person who assigned/created the task
  addId(task.assignedBy);

  // Supervisor of assigned volunteer
  addId(task.assignedTo?.superviserId);

  // --------------------------------------------------
  // All active super admins
  // --------------------------------------------------
  const superAdmins = await User.find({
    role: "super_admin",
    status: "active",
  })
    .select("_id")
    .lean();

  superAdmins.forEach(({ _id }) => addId(_id));

  // --------------------------------------------------
  // Search
  // --------------------------------------------------
  const search = String(q).trim();

  const searchFilter = search
    ? {
        $or: [
          { firstname: { $regex: search, $options: "i" } },
          { lastname: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  // --------------------------------------------------
  // Final users
  // --------------------------------------------------
  const users = await User.find({
    _id: {
      $in: [...userIds].map(
        (id) => new mongoose.Types.ObjectId(id),
      ),
    },
    status: "active",
    ...searchFilter,
  })
    .select("_id firstname lastname slug role")
    .sort({
      firstname: 1,
      lastname: 1,
    })
    .limit(20)
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      "Mentionable users fetched successfully",
      users,
    ),
  );
});

export const getTicketMentionableUsers = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { q = "" } = req.query;
  const { _id: userId, role } = req.user;

  if (!slug) {
    throw new ApiError(400, "Ticket slug is required");
  }

  const ticket = await Ticket.findOne({ _id:slug })
    .select(
      "location assignedTo createdBy approvedBy assignmentHistory",
    )
    .lean();

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  // --------------------------------------------------
  // Get location
  // --------------------------------------------------
  const location = await Location.findById(ticket.location)
    .select("managers facilityManager")
    .lean();

  if (!location) {
    throw new ApiError(404, "Ticket location not found");
  }

  // --------------------------------------------------
  // Latest assignment
  // --------------------------------------------------
  const latestAssignment =
    ticket.assignmentHistory?.length > 0
      ? ticket.assignmentHistory[ticket.assignmentHistory.length - 1]
      : null;

  const latestAssignedBy = latestAssignment?.assignedBy || null;

  // --------------------------------------------------
  // Check whether current user can access this ticket
  // --------------------------------------------------
  const currentUserId = userId.toString();

  const isSuperAdmin = role === "super_admin";

  const isCreatedBy =
    ticket.createdBy?.toString() === currentUserId;

  const isAssignedTo =
    ticket.assignedTo?.toString() === currentUserId;

  const isApprovedBy =
    ticket.approvedBy?.toString() === currentUserId;

  const isAssignedBy =
    latestAssignedBy?.toString() === currentUserId;

  const isLocationManager = location.managers?.some(
    (managerId) => managerId.toString() === currentUserId,
  );

  const isFacilityManager =
    location.facilityManager?.toString() === currentUserId;

  if (
    !isSuperAdmin &&
    !isCreatedBy &&
    !isAssignedTo &&
    !isApprovedBy &&
    !isAssignedBy &&
    !isLocationManager &&
    !isFacilityManager
  ) {
    throw new ApiError(404, "Ticket not found");
  }

  // --------------------------------------------------
  // Build mentionable user IDs
  // --------------------------------------------------
  const userIds = new Set();

  const addId = (id) => {
    if (id) {
      userIds.add(id.toString());
    }
  };

  // Ticket creator
  addId(ticket.createdBy);

  // Current assignee
  addId(ticket.assignedTo);

  // Approver
  addId(ticket.approvedBy);

  // Person who made the latest assignment
  addId(latestAssignedBy);

  // Location managers
  location.managers?.forEach(addId);

  // Facility manager
  addId(location.facilityManager);

  // --------------------------------------------------
  // Always include all super admins
  // --------------------------------------------------
  const superAdmins = await User.find({
    role: "super_admin",
    status: "active",
  })
    .select("_id")
    .lean();

  superAdmins.forEach(({ _id }) => addId(_id));

  // --------------------------------------------------
  // Search
  // --------------------------------------------------
  const search = String(q).trim();

  const searchFilter = search
    ? {
        $or: [
          { firstname: { $regex: search, $options: "i" } },
          { lastname: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  // --------------------------------------------------
  // Fetch final mentionable users
  // --------------------------------------------------
  const users = await User.find({
    _id: {
      $in: [...userIds].map(
        (id) => new mongoose.Types.ObjectId(id),
      ),
    },
    status: "active",
    ...searchFilter,
  })
    .select("_id firstname lastname slug role")
    .sort({
      firstname: 1,
      lastname: 1,
    })
    .limit(20)
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      "Mentionable users fetched successfully",
      users,
    ),
  );
});