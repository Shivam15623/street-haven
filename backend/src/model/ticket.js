import mongoose from "mongoose";
const photoSchema = new mongoose.Schema({
  fileName: { type: String, required: true }, // original file name
  fileUrl: { type: String, required: true }, // where the file is stored (S3, Cloudinary, local, etc.)
});
const TicketSchema = new mongoose.Schema(
  {
    req_title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Under Review", "Completed"],
      default: "Open",
    },
    location: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["IT Help Desk", "Property Maintenance"],
      required: true,
    },
    photo: {
      type: photoSchema,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User model
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who raised the ticket
      required: true,
    },
    latestComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment", // who raised the ticket
    },
    assignmentHistory: [
      {
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    statusHistory: [
      {
        status: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedAt: Date,
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);
const Ticket = mongoose.model("Ticket", TicketSchema);
export default Ticket;
