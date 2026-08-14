import mongoose from "mongoose";
import slugify from "slugify";
import { customAlphabet } from "nanoid";
const FACILITIES_MANAGER_ID = process.env.FACILITIES_MANAGER_ID;
const LocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // e.g. "Toronto - Downtown", "Calgary Warehouse"
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    facilityManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: FACILITIES_MANAGER_ID,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);

LocationSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("name")) {
    const baseSlug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
    this.slug = `${baseSlug}-${nanoid()}`;
  }
  next();
});

const Location = mongoose.model("Location", LocationSchema);
export default Location;
