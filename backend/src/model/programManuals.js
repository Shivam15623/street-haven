import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import slugify from "slugify";

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  size: { type: Number, required: true }, // in KB/MB
  totalPages: { type: Number },
});

const programManualSchema = new mongoose.Schema(
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
    description: {
      type: String,
      trim: true,
    },
    attachment: attachmentSchema,
    type: {
      type: String,
      trim: true,
      enum: ["HR", "Technical", "Finance", "Operations", "Other"], // customizable
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);
programManualSchema.pre("save", function (next) {

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
const ProgramManual = mongoose.model("ProgramManual", programManualSchema);
export default ProgramManual;
