import mongoose, { Schema } from "mongoose";
import { customAlphabet } from "nanoid";
import { getNextSequence } from "../utills/getNextSequence.js";
import slugify from "slugify";
import softDelete from "../../plugin/softDelete.js";

const taskSchema = new Schema(
  {
    taskNumber: {
      type: Number,
      unique: true,
      index: true,
    },
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
    slug: {
      type: String,
      unique: true,
      index: true,
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
      enum: ["new", "assigned", "in_progress", "under_review", "completed"],
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
          enum: ["new", "assigned", "in_progress", "under_review", "completed"],
          default: null,
        },
        toStatus: {
          type: String,
          enum: ["new", "assigned", "in_progress", "under_review", "completed"],
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
    ownershipHistory: [
      {
        from: { type: Schema.Types.ObjectId, ref: "User", required: true },
        to: { type: Schema.Types.ObjectId, ref: "User", required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);
taskSchema.plugin(softDelete);
taskSchema.index(
  { deletedAt: 1 },
  { partialFilterExpression: { isDeleted: true } },
);
taskSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.taskNumber = await getNextSequence("taskNumber");
  }
  if (!this.slug || this.isNew) {
    const baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
    this.slug = `${baseSlug}-${nanoid()}`;
  }
  next();
});
taskSchema.index({ assignedTo: 1, status: 1 }); // volunteer's task list
// REPLACE  taskSchema.index({ assignedBy: 1 });
taskSchema.index({ assignedBy: 1, status: 1 }); // admin's created-tasks view + deleteUser blocker check
taskSchema.virtual("displayId").get(function () {
  return `TASK-${String(this.taskNumber).padStart(5, "0")}`;
});
taskSchema.set("toJSON", { virtuals: true });
const Task = mongoose.model("Task", taskSchema);
export default Task;
