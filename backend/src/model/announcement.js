import mongoose, { Schema } from "mongoose";
import { customAlphabet } from "nanoid";
import slugify from "slugify";

const AnnouncementSchema = new Schema(
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
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);
AnnouncementSchema.pre("save", function (next) {
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
const Announcement = mongoose.model("Announcement", AnnouncementSchema);
export default Announcement;
