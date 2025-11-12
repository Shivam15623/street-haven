import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
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
    enum: ["image", "video", "audio", "pdf", "doc", "excel", "zip", "other"],
    default: "other",
  },
});

const commentSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: { type: String, required: true },
  attachments: [attachmentSchema], // ✅ Embedded attachment schema
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
