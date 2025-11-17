import mongoose, { Schema } from "mongoose";

const AnnouncementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },
    attachment: {
      fileName: String,
      fileUrl: String,
      fileType: String,
      size: Number,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // optional: simple visibility control
    isActive: {
      type: Boolean,
      default: true,
    },
  
  },
  { timestamps: true }
);

const Announcement = mongoose.model("Announcement", AnnouncementSchema);
export default Announcement;
