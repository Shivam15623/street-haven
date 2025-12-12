import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import slugify from "slugify";

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true }, // original file name
  fileUrl: { type: String, required: true }, // where the file is stored (S3, Cloudinary, local, etc.)
  size: { type: Number, required: true }, // size in KB/MB
  fileType:{ type: String, required: true }, // total pages if PDF/doc
});

const meetingMinutesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true, // ensures unique in DB
      index: true,
    },
    meetingDate: {
      type: Date,
      required: true,
    },
    keyHighlights: [
      {
        type: String,
        trim: true,
      },
    ],
    attendees: { type: Number, required: true },
    keyTopicsDiscussed: [
      {
        type: String,
        trim: true,
      },
    ],
    attachment: attachmentSchema, // multiple files allowed
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);
meetingMinutesSchema.pre("save", function (next) {
  if (!this.slug || this.isNew) {
    // Use slugify to convert title to URL-friendly string
    const baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
    // Append Nano ID to ensure uniqueness
    this.slug = `${baseSlug}-${nanoid()}`;
  }
  next();
});
const MeetingMinutes = mongoose.model("MeetingMinutes", meetingMinutesSchema);
export default MeetingMinutes;
