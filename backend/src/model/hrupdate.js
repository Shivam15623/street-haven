import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import slugify from "slugify";

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
    slug: {
      type: String,
      unique: true, // ensures unique in DB
      index: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Description is required"],
    },
    attachment: {
      type: attachmentSchema, // ✅ allows multiple attachments
      required: [true, "Attachment is required"],
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
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);
HRupdateSchema.pre("save", function (next) {
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

const HRupdate = mongoose.model("HRupdate", HRupdateSchema);

export default HRupdate;
