import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import slugify from "slugify";

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true }, // original file name
  fileUrl: { type: String, required: true }, // where the file is stored (S3, Cloudinary, local, etc.)
  size: { type: Number, required: true }, // size in KB/MB
  fileType: { type: String, required: true }, // total pages if PDF/doc
});

const CollectiveAgreementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: {
      type: String,
      unique: true, // ensures unique in DB
      index: true,
    },
    attachment: attachmentSchema,
    effectiveStartDate: {
      type: String,
      required: true,
    },
    effectiveEndDate: {
      type: String,
      required: true,
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
CollectiveAgreementSchema.pre("save", function (next) {
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
const CollectiveAgreement = mongoose.model(
  "CollectiveAgreement",
  CollectiveAgreementSchema
);
export default CollectiveAgreement;
