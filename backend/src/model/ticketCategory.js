import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import slugify from "slugify";

const ticketCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);
ticketCategorySchema.pre("validate", async function (next) {
  if (!this.slug) {
    const baseSlug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
    this.slug = `${baseSlug}-${nanoid()}`;
  }
  next();
});
const TicketCategory = mongoose.model("TicketCategory", ticketCategorySchema);

export default TicketCategory;
