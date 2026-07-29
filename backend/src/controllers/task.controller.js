import mongoose from "mongoose";
import Task from "../model/task.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { addCommentForEntity, fetchCommentsForEntity } from "./comments.controller.js";

export const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, dueDate } = req.body;
    const { _id: userId } = req.user;

    if (!title || !description || !assignedTo) {
        throw new ApiError(400, "Title, description and assignedTo are required");
    }

    const task = await Task.create({
        assignedBy: userId,
        assignedTo,
        status: "assigned",
        statusHistory: [
            {
                status: "assigned",
                changedBy: userId,
                changedAt: new Date(),
            },
        ],
        title,
        description,
        dueDate,
    });

    if (!task) {
        throw new ApiError(500, "Internal Server Error");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Task created Successfully", task));
});

export const editTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { _id: userId } = req.user;
    const { title, description, assignedTo, dueDate, status } = req.body;

    if (!mongoose.isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid task id");
    }

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Only the admin who created the task can edit its core fields
    if (task.assignedBy.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to edit this task");
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;

    if (status !== undefined && status !== task.status) {
        task.status = status;
        task.statusHistory.push({
            status,
            changedBy: userId,
            changedAt: new Date(),
        });
    }

    await task.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Task updated Successfully", task));
});

export const getTaskDetails = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid task id");
    }

    const task = await Task.findById(taskId)
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name email")
        .populate("statusHistory.changedBy", "name email");

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Task fetched Successfully", task));
});

export const getAllTasks = asyncHandler(async (req, res) => {
    const { _id: userId, role } = req.user;
    const { status, search, page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

    const filter = {};

    // Admins see tasks they created; volunteers see tasks assigned to them
    if (role === "admin" || role === "super_admin") {
        filter.assignedBy = userId;
    } else {
        filter.assignedTo = userId;
    }

    if (status) {
        filter.status = status;
    }

    if (search) {
        const searchRegex = new RegExp(search.trim(), "i");
        filter.$or = [
            { title: searchRegex },
            { description: searchRegex },
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const [tasks, total] = await Promise.all([
        Task.find(filter)
            .populate("assignedTo", "firstname lastname email")
            .populate("assignedBy", "firstname lastname email")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(Number(limit)),
        Task.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Tasks fetched Successfully", {
            tasks,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        })
    );
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
    const { taskId } = req.params;
    const { status } = req.body;
    const { _id: userId } = req.user;

    if (!mongoose.isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid task id");
    }

    const task = await Task.findById(taskId);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const current = task.status;

    switch (status) {

        case "under_review":

            // Only assigned volunteer can submit

            if (task.assignedTo.toString() !== userId.toString()) {
                throw new ApiError(403, "Only assigned volunteer can submit task.");
            }

            if (current !== "assigned") {
                throw new ApiError(400, "Task cannot be submitted.");
            }

            break;

        case "completed":

            // Only creator/admin can approve

            if (task.assignedBy.toString() !== userId.toString()) {
                throw new ApiError(403, "Only task creator can complete task.");
            }

            if (current !== "under_review") {
                throw new ApiError(400, "Task is not under review.");
            }

            break;

        case "assigned":

            // Admin sends back

            if (task.assignedBy.toString() !== userId.toString()) {
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
        status,
        changedBy: userId,
        changedAt: new Date(),
    });

    await task.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Task status updated successfully",
            task
        )
    );
});


export const FetchTaskComments = (req, res) =>
  fetchCommentsForEntity(req, res, "Task");

export const AddTaskComment = (req, res) =>
  addCommentForEntity(req, res, "Task");