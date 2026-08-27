import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
      min: [1, "File size must be greater than 0"],
    },
    type: {
      type: String,
      required: [true, "File type is required"],
      enum: [
        "image",
        "video",
        "audio",
        "pdf",
        "ppt",
        "doc",
        "excel",
        "zip",
        "other",
      ],
      default: "other",
    },
  },
  { _id: false },
);

const commentSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ["Ticket", "Task"],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "entityType",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // NEW: reply support
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
    index: true,
  },

  // NEW: mentions — store resolved user ids, not raw @text.
  // Resolving server-side (not trusting client-parsed ids) prevents someone
  // mentioning a user they can't actually see/message.
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  message: { type: String },
  attachments: [attachmentSchema],
  createdAt: { type: Date, default: Date.now },
});

commentSchema.index({ entityType: 1, entityId: 1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
