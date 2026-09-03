import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import slugify from "slugify";
import { getNextSequence } from "../utills/getNextSequence.js";

const photoSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
});

export const TICKET_STATUS = {
  OPEN: "Open", // just submitted, awaiting manager approval
  APPROVED: "Approved", // manager approved, priority now set, assigned to Angelo
  REJECTED: "Rejected", // manager rejected -> auto-closed
  IN_PROGRESS: "In Progress", // Angelo working on it
  COMPLETED: "Completed", // Angelo closed it
  CLOSED: "Closed", // terminal state for rejected tickets
};

const TicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: Number,
      unique: true,
      index: true,
    },
    req_title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: null, // not set at creation — only set by manager on approval
    },
    priorityLocked: {
      type: Boolean,
      default: false, // once a manager sets it, this flips true and it's final
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.OPEN,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketCategory",
      required: true,
    },
    photo: {
      type: photoSchema,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // gets set to Angelo's ID automatically on approval
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    latestComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    assignmentHistory: [
      {
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        assignedAt: { type: Date, default: Date.now },
      },
    ],
    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: Date,
  },
  { timestamps: true },
);

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);
TicketSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.ticketNumber = await getNextSequence("ticketNumber");
  }
  if (!this.slug || this.isNew) {
    const baseSlug = slugify(this.req_title, {
      lower: true,
      strict: true,
      trim: true,
    });
    this.slug = `${baseSlug}-${nanoid()}`;
  }
  next();
});
// virtual, doesn't touch the DB value
TicketSchema.virtual("displayId").get(function () {
  return `TICKET-${String(this.ticketNumber).padStart(5, "0")}`;
});
TicketSchema.set("toJSON", { virtuals: true });
const Ticket = mongoose.model("Ticket", TicketSchema);
export default Ticket;
