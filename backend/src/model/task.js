import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      required: true, // volunteer
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // admin
    },

    status: {
      type: String,
      enum: ["new", "assigned", "under_review", "completed"],
      default: "new",
    },

    dueDate: {
      type: Date,
      default: null,
    },

    statusHistory: [
      {
        fromStatus: {
          type: String,
          enum: ["new", "assigned", "under_review", "completed"],
          default: null,
        },
        toStatus: {
          type: String,
          enum: ["new", "assigned", "under_review", "completed"],
        },
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    assignmentHistory: [
      {
        fromAssignedTo: {
          type: Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        assignedTo: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        assignedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

taskSchema.index({ assignedTo: 1, status: 1 }); // for volunteer's task list
taskSchema.index({ assignedBy: 1 }); // for admin's created-tasks view

const Task = mongoose.model("Task", taskSchema);
export default Task;
