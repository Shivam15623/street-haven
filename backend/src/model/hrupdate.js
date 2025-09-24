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
  totalPages: {
    type: Number,
    min: [1, "Total pages must be at least 1"],
    default: null,
  },
});

const HRupdateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Description is required"],
    },
    attachment: {
      type: attachmentSchema, // ✅ allows multiple attachments
      required:[true,"Attachment is required"]
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "CreatedBy (User) is required"],
    },
  },
  {
    timestamps: true,
  }
);

const HRupdate = mongoose.model("HRupdate", HRupdateSchema);

export default HRupdate;
