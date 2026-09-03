import mongoose from "mongoose";
import Task from "../model/task.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import {
  addCommentForEntity,
  fetchCommentsForEntity,
} from "./comments.controller.js";
import Comment from "../model/comments.js";
import { TaskNotificationService } from "../services/task.notification.service.js";
import dayjs from "dayjs";
import { htmlToText } from "html-to-text";

import ExcelJS from "exceljs";
import { createNotification } from "../helper/CreateNotoification.js";
import { io } from "../index.js";
import User from "../model/user.js";

import { flushTaskEffects } from "../services/task.notification.service.js";
export const createTask = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  const effects = [];
  try {
    session.startTransaction();

    const { title, description, assignedTo, dueDate } = req.body;
    const { _id: userId } = req.user;

    if (!title || !description) {
      throw new ApiError(400, "Title and description are required");
    }

    const now = new Date();

    const statusHistory = [
      {
        fromStatus: null,
        toStatus: "new",
        changedBy: userId,
        changedAt: now,
      },
    ];

    const assignmentHistory = [];

    let currentStatus = "new";

    if (assignedTo) {
      currentStatus = "assigned";

      statusHistory.push({
        fromStatus: "new",
        toStatus: "assigned",
        changedBy: userId,
        changedAt: now,
      });

      assignmentHistory.push({
        assignedTo,
        assignedBy: userId,
        assignedAt: now,
      });
    }

    const [task] = await Task.create(
      [
        {
          assignedBy: userId,
          assignedTo: assignedTo || null,
          status: currentStatus,
          title,
          description,
          dueDate,
          statusHistory,
          assignmentHistory,
        },
      ],
      { session },
    );

    if (!task) {
      throw new ApiError(500, "Internal Server Error");
    }
    // Run after commit
    if (task.assignedTo) {
      await TaskNotificationService.taskAssigned(
        task,
        req.user,
        session,
        effects,
      );
    }
    await session.commitTransaction();
    await flushTaskEffects(effects);

    return res
      .status(200)
      .json(new ApiResponse(200, "Task created Successfully", task));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    await session.endSession();
  }
});

export const editTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { _id: userId } = req.user;

  const { title, description, assignedTo, dueDate, status } = req.body;

  if (!mongoose.isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid task id");
  }

  const session = await mongoose.startSession();

  // Socket + email effects are queued here and flushed only after commit
  const effects = [];

  try {
    session.startTransaction();

    const task = await Task.findById(taskId).session(session);

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // Only creator/admin can edit
    if (task.assignedBy.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to edit this task");
    }

    const changes = {
      dueDate: false,
      assignedTo: false,
      status: false,
    };

    const oldDueDate = task.dueDate;
    const oldAssignedTo = task.assignedTo;
    const oldStatus = task.status;

    const now = new Date();

    // -----------------------------------------
    // Basic details
    // -----------------------------------------

    if (title !== undefined) {
      task.title = title;
    }

    if (description !== undefined) {
      task.description = description;
    }

    // -----------------------------------------
    // Due date
    // -----------------------------------------

    if (dueDate !== undefined) {
      const newDueDate = dueDate ? new Date(dueDate) : null;

      const changed = oldDueDate?.getTime() !== newDueDate?.getTime();

      if (changed) {
        task.dueDate = newDueDate;
        changes.dueDate = true;
      }
    }

    // -----------------------------------------
    // Assignment
    // -----------------------------------------

    if (
      assignedTo !== undefined &&
      assignedTo?.toString() !== oldAssignedTo?.toString()
    ) {
      task.assignedTo = assignedTo || null;
      changes.assignedTo = true;

      if (assignedTo) {
        task.assignmentHistory.push({
          fromAssignedTo: oldAssignedTo || null,
          assignedTo,
          assignedBy: userId,
          assignedAt: now,
        });

        // If task was previously unassigned,
        // assigning it also changes status to assigned.
        if (!oldAssignedTo) {
          task.statusHistory.push({
            fromStatus: task.status,
            toStatus: "assigned",
            changedBy: userId,
            changedAt: now,
          });

          task.status = "assigned";
          changes.status = true;
        }
      }
    }

    // -----------------------------------------
    // Explicit status change
    // -----------------------------------------

    if (status !== undefined && status !== task.status) {
      task.statusHistory.push({
        fromStatus: task.status,
        toStatus: status,
        changedBy: userId,
        changedAt: now,
      });

      task.status = status;
      changes.status = true;
    }

    // -----------------------------------------
    // Save task
    // -----------------------------------------

    await task.save({ session });

    // -----------------------------------------
    // Notifications
    // -----------------------------------------

    /*
     * Assignment changed
     *
     * TaskNotificationService.taskReassigned()
     * handles:
     * - previous assignee
     * - new assignee
     * - super admins
     * - socket effects
     * - email effects
     */
    if (changes.assignedTo) {
      await TaskNotificationService.taskReassigned(
        task,
        oldAssignedTo,
        session,
        effects,
      );
    }

    /*
     * Status changed
     *
     * Notify the current assignee.
     *
     * Don't notify if the person making the change
     * is the assignee themselves.
     */
    if (changes.status && task.assignedTo) {
      const recipientId = task.assignedTo.toString();

      if (recipientId !== userId.toString()) {
        await TaskNotificationService.statusChanged(
          task,
          oldStatus,
          status,
          req.user,
          session,
          effects,
        );
      }
    }

    /*
     * Due date changed
     */
    if (changes.dueDate && task.assignedTo) {
      const recipientId = task.assignedTo.toString();

      if (recipientId !== userId.toString()) {
        await TaskNotificationService.dueDateChanged(
          task,
          oldDueDate,
          dueDate,

          session,
          effects,
        );
      }
    }

    // -----------------------------------------
    // Commit transaction
    // -----------------------------------------

    await session.commitTransaction();

    /*
     * IMPORTANT:
     *
     * DB notification records were created inside
     * the transaction.
     *
     * Socket + email are executed only AFTER
     * the transaction successfully commits.
     */
    flushTaskEffects(effects).catch((error) => {
      console.error("[notifications] Failed to flush task effects:", error);
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Task updated Successfully", task));
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
});

export const getTaskDetails = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!mongoose.isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid task id");
  }

  const task = await Task.findById(taskId)
    .select(
      `
      title
      description
      status
      dueDate
      assignedTo
      assignedBy
      statusHistory
      assignmentHistory
      createdAt
      updatedAt
      `,
    )
    .populate("assignedTo", "firstname lastname email")
    .populate("assignedBy", "firstname lastname email")
    .populate("statusHistory.changedBy", "firstname lastname email")
    .populate("assignmentHistory.assignedTo", "firstname lastname email")
    .populate("assignmentHistory.assignedBy", "firstname lastname email");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  const activity = [
    ...task.statusHistory.map((h) => ({
      _id: h._id,
      itemType: "activity",
      action: "status_change",
      field: "Status",
      fromValue: h.fromStatus || null,
      toValue: h.toStatus,
      userId: h.changedBy
        ? {
            _id: h.changedBy._id,
            firstname: h.changedBy.firstname,
            lastname: h.changedBy.lastname,
          }
        : { _id: null, firstname: "System", lastname: "" },
      createdAt: h.changedAt,
    })),
    ...task.assignmentHistory.map((h) => ({
      _id: h._id,
      itemType: "activity",
      action: "assignee_change",
      field: "Assignee",
      fromValue: h.fromAssignedTo
        ? `${h.fromAssignedTo.firstname} ${h.fromAssignedTo.lastname}`
        : null,
      toValue: h.assignedTo
        ? `${h.assignedTo.firstname} ${h.assignedTo.lastname}`
        : "Unassigned",
      userId: h.assignedBy
        ? {
            _id: h.assignedBy._id,
            firstname: h.assignedBy.firstname,
            lastname: h.assignedBy.lastname,
          }
        : { _id: null, firstname: "System", lastname: "" },
      createdAt: h.assignedAt,
    })),
  ];

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Task fetched Successfully", { task, activity }),
    );
});

const ALLOWED_STATUSES = ["new", "assigned", "under_review", "completed"];
const ALLOWED_SORT_FIELDS = [
  "title",
  "status",
  "dueDate",
  "dueStatus",
  "createdAt",
  "updatedAt",
];

const toArray = (val) => {
  if (val === undefined || val === null || val === "") return undefined;
  return Array.isArray(val) ? val : [val];
};

const toObjectIds = (val) => {
  const arr = toArray(val);
  if (!arr) return undefined;
  return arr
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));
};

// Resolves datePreset -> {start, end}, falling back to explicit startDate/endDate
const resolveDateRange = ({ datePreset, startDate, endDate }) => {
  if (datePreset) {
    const now = dayjs();
    switch (datePreset) {
      case "today":
        return {
          start: now.startOf("day").toDate(),
          end: now.endOf("day").toDate(),
        };
      case "week":
        return {
          start: now.startOf("week").toDate(),
          end: now.endOf("week").toDate(),
        };
      case "month":
        return {
          start: now.startOf("month").toDate(),
          end: now.endOf("month").toDate(),
        };
      case "year":
        return {
          start: now.startOf("year").toDate(),
          end: now.endOf("year").toDate(),
        };
      default:
        break;
    }
  }

  if (startDate || endDate) {
    return {
      start: startDate ? dayjs(startDate).startOf("day").toDate() : undefined,
      end: endDate ? dayjs(endDate).endOf("day").toDate() : undefined,
    };
  }

  return {};
};

const dateFieldMap = {
  created: "createdAt",
  updated: "updatedAt",
  due: "dueDate",
};

export const getAllTasks = asyncHandler(async (req, res) => {
  const { _id: userId, role } = req.user;

  const {
    page = 1,
    limit = 10,
    search,
    slug = "",
    searchBy = "both", // title | description | both
    startDate,
    endDate,
    dateType = "created", // created | updated | due
    datePreset, // today | week | month | year
    status, // string | string[]
    assignedTo, // string | string[]
    assignedBy, // string | string[]
    dueStatus, // overdue | upcoming | today | noduedate
    hasDueDate,
    isCompleted,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.max(Number(limit) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
  const sortDir = sortOrder === "asc" ? 1 : -1;

  // ---------- base match (role scoping + explicit filters, NOT status) ----------
  const baseMatch = {};

  if (role === "super_admin") {
    // No restriction — super admin can see all tasks
  } else if (role === "volunteer_admin") {
    baseMatch.assignedBy = new mongoose.Types.ObjectId(userId);
  } else {
    baseMatch.assignedTo = new mongoose.Types.ObjectId(userId);
  }
  const assignedToIds = toObjectIds(assignedTo);
  if (assignedToIds?.length) {
    baseMatch.assignedTo = { $in: assignedToIds };
  }

  const assignedByIds = toObjectIds(assignedBy);

  if (assignedByIds?.length) {
    baseMatch.assignedBy = { $in: assignedByIds };
  }

  if (slug) {
    baseMatch.slug = slug; // exact match, bypasses text search
  } else if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    if (searchBy === "title") {
      baseMatch.title = searchRegex;
    } else if (searchBy === "description") {
      baseMatch.description = searchRegex;
    } else {
      baseMatch.$or = [{ title: searchRegex }, { description: searchRegex }];
    }
  }

  const { start, end } = resolveDateRange({ datePreset, startDate, endDate });
  if (start || end) {
    const field = dateFieldMap[dateType] || "createdAt";
    baseMatch[field] = {
      ...(start ? { $gte: start } : {}),
      ...(end ? { $lte: end } : {}),
    };
  }

  if (hasDueDate !== undefined) {
    baseMatch.dueDate =
      hasDueDate === "true" || hasDueDate === true
        ? { ...(baseMatch.dueDate || {}), $ne: null }
        : { ...(baseMatch.dueDate || {}), $eq: null };
  }

  if (isCompleted !== undefined) {
    baseMatch.status =
      isCompleted === "true" || isCompleted === true
        ? "completed"
        : { $ne: "completed" };
  }

  // baseMatch used for status-count aggregation (no status filter applied)
  // statusMatch adds the requested status filter on top, for the actual list
  const statusList = toArray(status)?.filter((s) =>
    ALLOWED_STATUSES.includes(s),
  );
  const statusMatch = { ...baseMatch };
  if (statusList?.length) {
    statusMatch.status =
      statusList.length === 1 ? statusList[0] : { $in: statusList };
  }

  // ---------- computed dueStatus field ----------
  // overdue: dueDate < today AND status !== completed
  // today: dueDate is today AND status !== completed
  // upcoming: dueDate > today AND status !== completed
  // noduedate: dueDate is null
  const startOfToday = dayjs().startOf("day").toDate();
  const endOfToday = dayjs().endOf("day").toDate();

  const dueStatusStage = {
    $addFields: {
      dueStatus: {
        $switch: {
          branches: [
            { case: { $eq: ["$dueDate", null] }, then: "noduedate" },
            {
              case: {
                $and: [
                  { $ne: ["$status", "completed"] },
                  { $lt: ["$dueDate", startOfToday] },
                ],
              },
              then: "overdue",
            },
            {
              case: {
                $and: [
                  { $ne: ["$status", "completed"] },
                  { $gte: ["$dueDate", startOfToday] },
                  { $lte: ["$dueDate", endOfToday] },
                ],
              },
              then: "today",
            },
            {
              case: {
                $and: [
                  { $ne: ["$status", "completed"] },
                  { $gt: ["$dueDate", endOfToday] },
                ],
              },
              then: "upcoming",
            },
          ],
          default: "noduedate",
        },
      },
    },
  };

  const dueStatusMatch = dueStatus ? { $match: { dueStatus } } : null;

  // ---------- shared pipeline pieces ----------
  const populateStage = [
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [{ $project: { firstname: 1, lastname: 1, email: 1 } }],
      },
    },
    { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "assignedBy",
        foreignField: "_id",
        as: "assignedBy",
        pipeline: [{ $project: { firstname: 1, lastname: 1, email: 1 } }],
      },
    },
    { $unwind: { path: "$assignedBy", preserveNullAndEmptyArrays: true } },
  ];

  const projectStage = {
    $project: {
      title: 1,
      description: 1,
      status: 1,
      dueDate: 1,
      dueStatus: 1,
      assignedTo: 1,
      assignedBy: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  };

  const dataPipeline = [
    { $match: statusMatch },
    dueStatusStage,
    ...(dueStatusMatch ? [dueStatusMatch] : []),
    ...populateStage,
    projectStage,
    { $sort: { [sortField]: sortDir } },
    { $skip: skip },
    { $limit: limitNum },
  ];

  // total matching current filters (status + dueStatus applied)
  const filteredCountPipeline = [
    { $match: statusMatch },
    dueStatusStage,
    ...(dueStatusMatch ? [dueStatusMatch] : []),
    { $count: "count" },
  ];

  // status counts ignore the `status` filter itself so tabs/badges stay stable,
  // but still respect dueStatus + all other filters
  const statusCountsPipeline = [
    { $match: baseMatch },
    dueStatusStage,
    ...(dueStatusMatch ? [dueStatusMatch] : []),
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ];

  const [tasks, filteredCountResult, statusCounts] = await Promise.all([
    Task.aggregate(dataPipeline),
    Task.aggregate(filteredCountPipeline),
    Task.aggregate(statusCountsPipeline),
  ]);

  const total = filteredCountResult[0]?.count || 0;

  const counts = {
    new: 0,
    assigned: 0,
    under_review: 0,
    completed: 0,
  };
  statusCounts.forEach(({ _id, count }) => {
    if (_id in counts) counts[_id] = count;
  });

  return res.status(200).json(
    new ApiResponse(200, "Tasks fetched Successfully", {
      tasks,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      counts,
    }),
  );
});

export const getTaskBySlug = asyncHandler(async (req, res) => {
  const { _id: userId, role } = req.user;
  const { slug } = req.params;

  if (!slug) {
    throw new ApiError(400, "Slug is required");
  }

  const match = { slug };

  // Role-based access
  if (role === "super_admin") {
    // Super admin can access any task.
    // No additional restriction on match.
  } else if (role === "volunteer_admin") {
    // Volunteer admin can access tasks they assigned.
    match.assignedBy = new mongoose.Types.ObjectId(userId);
  } else {
    // Normal volunteer/user can access tasks assigned to them.
    match.assignedTo = new mongoose.Types.ObjectId(userId);
  }

  const startOfToday = dayjs().startOf("day").toDate();
  const endOfToday = dayjs().endOf("day").toDate();

  const [task] = await Task.aggregate([
    { $match: match },

    {
      $addFields: {
        dueStatus: {
          $switch: {
            branches: [
              {
                case: { $eq: ["$dueDate", null] },
                then: "noduedate",
              },
              {
                case: {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$dueDate", startOfToday] },
                  ],
                },
                then: "overdue",
              },
              {
                case: {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $gte: ["$dueDate", startOfToday] },
                    { $lte: ["$dueDate", endOfToday] },
                  ],
                },
                then: "today",
              },
              {
                case: {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $gt: ["$dueDate", endOfToday] },
                  ],
                },
                then: "upcoming",
              },
            ],
            default: "noduedate",
          },
        },
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              firstname: 1,
              lastname: 1,
              email: 1,
            },
          },
        ],
      },
    },

    {
      $unwind: {
        path: "$assignedTo",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "assignedBy",
        foreignField: "_id",
        as: "assignedBy",
        pipeline: [
          {
            $project: {
              firstname: 1,
              lastname: 1,
              email: 1,
            },
          },
        ],
      },
    },

    {
      $unwind: {
        path: "$assignedBy",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        title: 1,
        description: 1,
        status: 1,
        dueDate: 1,
        dueStatus: 1,
        slug: 1,
        assignedTo: 1,
        assignedBy: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task fetched successfully", task));
});
export const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { _id: userId } = req.user;

  if (!mongoose.isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid task id");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (task.assignedBy.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this task");
  }

  await Task.findByIdAndDelete(taskId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Task deleted Successfully", {}));
});
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  const effects = [];

  try {
    await session.withTransaction(async () => {
      const { taskId } = req.params;
      const { status, remark } = req.body;
      const { _id: userId, role } = req.user;

      if (!mongoose.isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid task id");
      }

      const task = await Task.findById(taskId).session(session);

      if (!task) {
        throw new ApiError(404, "Task not found");
      }

      const current = task.status;

      switch (status) {
        case "under_review":
          // Super admin can update any task.
          // Otherwise only assigned volunteer can submit.
          if (
            role !== "super_admin" &&
            task.assignedTo.toString() !== userId.toString()
          ) {
            throw new ApiError(403, "Only assigned volunteer can submit task.");
          }

          if (current !== "assigned") {
            throw new ApiError(400, "Task cannot be submitted.");
          }

          break;

        case "completed":
          // Super admin can complete any task.
          // Otherwise only task creator can complete.
          if (
            role !== "super_admin" &&
            task.assignedBy.toString() !== userId.toString()
          ) {
            throw new ApiError(403, "Only task creator can complete task.");
          }

          if (current !== "under_review") {
            throw new ApiError(400, "Task is not under review.");
          }

          break;

        case "assigned":
          // Super admin can reassign/send back any task.
          // Otherwise only task creator can do it.
          if (
            role !== "super_admin" &&
            task.assignedBy.toString() !== userId.toString()
          ) {
            throw new ApiError(403, "Only task creator can reassign.");
          }

          if (current !== "under_review") {
            throw new ApiError(400, "Task cannot be reassigned.");
          }

          break;

        default:
          throw new ApiError(400, "Invalid status");
      }

      task.status = status;

      task.statusHistory.push({
        fromStatus: current,
        toStatus: status,
        changedBy: userId,
        changedAt: new Date(),
      });

      await task.save({ session });

      switch (status) {
        case "under_review":
          await TaskNotificationService.submittedForReview(
            task,
            session,
            effects,
          );
          break;

        case "completed":
          await TaskNotificationService.approved(
            task,
            userId,
            session,
            effects,
          );
          break;

        case "assigned":
          await TaskNotificationService.sentBack(
            task,
            userId,
            remark,
            session,
            effects,
          );
          break;
      }
    });

    await flushTaskEffects(effects);

    return res
      .status(200)
      .json(new ApiResponse(200, "Task status updated successfully"));
  } finally {
    await session.endSession();
  }
});

export const FetchTaskComments = (req, res) =>
  fetchCommentsForEntity(req, res, "Task");

export const AddTaskComment = (req, res) =>
  addCommentForEntity(req, res, "Task");

// --- cursor helpers ---
const encodeCursor = (item) =>
  Buffer.from(
    JSON.stringify({ createdAt: item.createdAt, _id: item._id.toString() }),
  ).toString("base64");

const decodeCursor = (cursor) => {
  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
    return { createdAt: new Date(decoded.createdAt), _id: decoded._id };
  } catch {
    throw new ApiError(400, "Invalid cursor");
  }
};

// total order: createdAt desc, then _id desc as tiebreaker (must match Mongo sort below)
const compareDesc = (a, b) => {
  const diff = new Date(b.createdAt) - new Date(a.createdAt);
  if (diff !== 0) return diff;
  return String(b._id).localeCompare(String(a._id));
};

export const GetTaskTimeline = asyncHandler(async (req, res) => {
  const { entityId: id } = req.params;
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 50);
  const cursorParam = req.query.cursor || null;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid task id");
  }

  const cursor = cursorParam ? decodeCursor(cursorParam) : null;

  const task = await Task.findById(id)
    .select("statusHistory assignmentHistory")
    .populate("statusHistory.changedBy", "firstname lastname email")
    .populate("assignmentHistory.assignedTo", "firstname lastname email")
    .populate("assignmentHistory.assignedBy", "firstname lastname email")
    .populate("assignmentHistory.fromAssignedTo", "firstname lastname email");

  if (!task) throw new ApiError(404, "Task not found");

  // --- full activity list (bounded, embedded — safe to load entirely every time) ---
  let activity = [
    ...task.statusHistory.map((h) => ({
      _id: h._id,
      itemType: "activity",
      action: "status_change",
      field: "Status",
      fromValue: h.fromStatus || null,
      toValue: h.toStatus,
      userId: h.changedBy
        ? {
            _id: h.changedBy._id,
            firstname: h.changedBy.firstname,
            lastname: h.changedBy.lastname,
          }
        : { _id: null, firstname: "System", lastname: "" },
      createdAt: h.changedAt,
    })),
    ...task.assignmentHistory.map((h) => ({
      _id: h._id,
      itemType: "activity",
      action: "assignee_change",
      field: "Assignee",
      fromValue: h.fromAssignedTo
        ? `${h.fromAssignedTo.firstname} ${h.fromAssignedTo.lastname}`
        : null,
      toValue: h.assignedTo
        ? `${h.assignedTo.firstname} ${h.assignedTo.lastname}`
        : "Unassigned",
      userId: h.assignedBy
        ? {
            _id: h.assignedBy._id,
            firstname: h.assignedBy.firstname,
            lastname: h.assignedBy.lastname,
          }
        : { _id: null, firstname: "System", lastname: "" },
      createdAt: h.assignedAt,
    })),
  ];

  // keep only activity strictly "older" than the cursor
  if (cursor) {
    activity = activity.filter((a) => compareDesc(a, cursor) > 0);
  }

  // --- comments: fetch only top (limit) before cursor, +1 extra just to detect "more" ---
  const commentFilter = { entityType: "Task", entityId: id };
  if (cursor) {
    commentFilter.$or = [
      { createdAt: { $lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, _id: { $lt: cursor._id } },
    ];
  }

  const commentsRaw = await Comment.find(commentFilter)
    .populate("userId", "firstname lastname email")
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1);

  const hasExtraComment = commentsRaw.length > limit;
  const commentsForPage = commentsRaw.slice(0, limit).map((c) => ({
    _id: c._id,
    itemType: "comment",
    message: c.message,
    attachments: c.attachments,
    userId: c.userId
      ? {
          _id: c.userId._id,
          firstname: c.userId.firstname,
          lastname: c.userId.lastname,
          email: c.userId.email,
        }
      : null,
    createdAt: c.createdAt,
  }));

  // --- merge & slice ---
  const candidates = [...activity, ...commentsForPage].sort(compareDesc);
  const pageItems = candidates.slice(0, limit);

  const hasMore = candidates.length > limit || hasExtraComment;
  const nextCursor =
    hasMore && pageItems.length
      ? encodeCursor(pageItems[pageItems.length - 1])
      : null;

  return res.status(200).json(
    new ApiResponse(200, "Task timeline fetched successfully", {
      items: pageItems,
      pagination: { limit, hasMore, nextCursor },
    }),
  );
});
/* ------------------------------------------------------------------
   GET /api/tickets/report/export
   Same filter, no pagination — streams an .xlsx file.
-------------------------------------------------------------------*/
const stripHtml = (html) => {
  if (!html) return "-";
  return htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
    ],
  }).trim();
};

/* ---- Pull the timestamp of a specific status transition from statusHistory ---- */
/* ---- Latest timestamp a status transition happened, not the first ---- */
const getStatusDate = (statusHistory, statusName) => {
  if (!statusHistory?.length) return null;
  const entry = [...statusHistory]
    .reverse()
    .find((h) => h.toStatus === statusName);
  return entry ? entry.changedAt : null;
};

/* ---- Latest assignment date from assignmentHistory, not the first ---- */
const getAssignedDate = (assignmentHistory) => {
  if (!assignmentHistory?.length) return null;
  return assignmentHistory[assignmentHistory.length - 1].assignedAt;
};
/* ---- Format a Date (or null) for Excel display ---- */
const formatDate = (date) => (date ? new Date(date).toLocaleString() : "-");

/* ---- Human-readable duration between two dates ---- */
const getDuration = (start, end) => {
  if (!start || !end) return "-";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs < 0) return "-";
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
};
export const buildReportFilter = async (req) => {
  const { _id: userId, role } = req.user;

  const {
    search,
    searchBy = "both",
    startDate,
    endDate,
    dateType = "created",
    datePreset,
    status,
    assignedTo,
    assignedBy,
    dueStatus,
    hasDueDate,
    isCompleted,
  } = req.query;

  const filter = {};

  // ---------- role scoping ----------
  if (role === "volunteer_admin" || role === "super_admin") {
    filter.assignedBy = new mongoose.Types.ObjectId(userId);
  } else {
    filter.assignedTo = new mongoose.Types.ObjectId(userId);
  }

  // admin/super_admin can further narrow by assignedTo
  const assignedToIds = toObjectIds(assignedTo);
  if (
    (role === "volunteer_admin" || role === "super_admin") &&
    assignedToIds?.length
  ) {
    filter.assignedTo = { $in: assignedToIds };
  }

  const assignedByIds = toObjectIds(assignedBy);
  if (assignedByIds?.length) {
    filter.assignedBy = { $in: assignedByIds };
  }

  // ---------- search ----------
  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    if (searchBy === "title") {
      filter.title = searchRegex;
    } else if (searchBy === "description") {
      filter.description = searchRegex;
    } else {
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }
  }

  // ---------- date range (created/updated/due) ----------
  const { start, end } = resolveDateRange({ datePreset, startDate, endDate });
  if (start || end) {
    const field = dateFieldMap[dateType] || "createdAt";
    filter[field] = {
      ...(filter[field] || {}),
      ...(start ? { $gte: start } : {}),
      ...(end ? { $lte: end } : {}),
    };
  }

  // ---------- hasDueDate ----------
  if (hasDueDate !== undefined) {
    filter.dueDate =
      hasDueDate === "true" || hasDueDate === true
        ? { ...(filter.dueDate || {}), $ne: null }
        : { ...(filter.dueDate || {}), $eq: null };
  }

  // ---------- isCompleted ----------
  if (isCompleted !== undefined) {
    filter.status =
      isCompleted === "true" || isCompleted === true
        ? "completed"
        : { $ne: "completed" };
  }

  // ---------- status ----------
  const statusList = toArray(status)?.filter((s) =>
    ALLOWED_STATUSES.includes(s),
  );
  if (statusList?.length) {
    // if isCompleted already narrowed status above, an explicit status filter wins
    filter.status =
      statusList.length === 1 ? statusList[0] : { $in: statusList };
  }

  // ---------- dueStatus (computed, translated into dueDate/status conditions) ----------
  // overdue: dueDate < today AND status !== completed
  // today: dueDate is today AND status !== completed
  // upcoming: dueDate > today AND status !== completed
  // noduedate: dueDate is null
  if (dueStatus) {
    const startOfToday = dayjs().startOf("day").toDate();
    const endOfToday = dayjs().endOf("day").toDate();

    switch (dueStatus) {
      case "noduedate":
        filter.dueDate = null;
        break;
      case "overdue":
        filter.dueDate = { ...(filter.dueDate || {}), $lt: startOfToday };
        filter.status = { $ne: "completed" };
        break;
      case "today":
        filter.dueDate = {
          ...(filter.dueDate || {}),
          $gte: startOfToday,
          $lte: endOfToday,
        };
        filter.status = { $ne: "completed" };
        break;
      case "upcoming":
        filter.dueDate = { ...(filter.dueDate || {}), $gt: endOfToday };
        filter.status = { $ne: "completed" };
        break;
      default:
        break;
    }
  }

  return filter;
};
export const ExportTasksReport = asyncHandler(async (req, res) => {
  const filter = await buildReportFilter(req);

  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .populate("assignedTo", "firstname lastname email")
    .populate("assignedBy", "firstname lastname email")
    .populate("statusHistory.changedBy", "firstname lastname email")
    .populate("assignmentHistory.assignedTo", "firstname lastname email")
    .populate("assignmentHistory.assignedBy", "firstname lastname email")
    .lean();

  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Tasks Report");

  sheet.columns = [
    { header: "Task ID", key: "taskId", width: 26 },
    { header: "Title", key: "title", width: 28 },
    { header: "Description", key: "description", width: 40 },
    { header: "Status", key: "status", width: 16 },
    { header: "Assigned To", key: "assignedTo", width: 22 },
    { header: "Assigned To Email", key: "assignedToEmail", width: 26 },
    { header: "Assigned By", key: "assignedBy", width: 22 },
    { header: "Due Date", key: "dueDate", width: 18 },
    { header: "Created Date", key: "createdDate", width: 20 },
    { header: "Assigned Date", key: "assignedDate", width: 20 },
    {
      header: "Submitted For Review Date",
      key: "reviewSubmittedDate",
      width: 22,
    },
    { header: "Completed By", key: "completedBy", width: 22 }, // <- worker who did the task
    { header: "Approved By", key: "approvedBy", width: 22 }, // <- admin who marked it completed
    { header: "Completed Date", key: "completedDate", width: 20 },
    { header: "Times Reassigned", key: "reassignedCount", width: 16 },
    { header: "Resolution Time", key: "resolutionTime", width: 16 },
    { header: "Last Updated Date", key: "updatedDate", width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" },
  };

  tasks.forEach((t) => {
    const assignedDate = getAssignedDate(t.assignmentHistory);
    const reviewSubmittedDate = getStatusDate(t.statusHistory, "under_review");
    const completedHistory = [...(t.statusHistory || [])]
      .reverse()
      .find((history) => history.toStatus === "completed");

    const reassignedCount = (t.statusHistory || []).filter(
      (history) =>
        history.fromStatus === "under_review" &&
        history.toStatus === "assigned",
    ).length;

    sheet.addRow({
      taskId: t._id.toString(),
      title: t.title,
      description: stripHtml(t.description),
      status: t.status,
      assignedTo: t.assignedTo
        ? `${t.assignedTo.firstname} ${t.assignedTo.lastname}`
        : "-",
      assignedToEmail: t.assignedTo?.email || "-",
      assignedBy: t.assignedBy
        ? `${t.assignedBy.firstname} ${t.assignedBy.lastname}`
        : "-",
      dueDate: t.dueDate ? formatDate(t.dueDate) : "-",
      createdDate: formatDate(t.createdAt),
      assignedDate: formatDate(assignedDate),
      reviewSubmittedDate: formatDate(reviewSubmittedDate),
      // worker who actually completed the task = whoever it was assigned to
      completedBy:
        t.status === "completed" && t.assignedTo
          ? `${t.assignedTo.firstname} ${t.assignedTo.lastname}`
          : "-",
      // admin who approved/marked it completed
      approvedBy: completedHistory?.changedBy
        ? `${completedHistory.changedBy.firstname} ${completedHistory.changedBy.lastname}`
        : "-",
      completedDate: formatDate(completedHistory?.changedAt),
      reassignedCount,
      resolutionTime: getDuration(t.createdAt, completedHistory?.changedAt),
      updatedDate: formatDate(t.updatedAt),
    });
  });

  if (tasks.length === 0) {
    sheet.addRow({ taskId: "No tasks found for the selected filters." });
  }

  // Wrap long text columns for readability
  sheet.getColumn("description").alignment = {
    wrapText: true,
    vertical: "top",
  };

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="tasks-report-${Date.now()}.xlsx"`,
  );

  await workbook.xlsx.write(res);
  res.end();
});
