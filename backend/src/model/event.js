import mongoose from "mongoose";
import slugify from "slugify";
import { customAlphabet } from "nanoid";
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
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
      maxlength: 2000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // scalable: linked to User model
      required: true,
    },
    location: {
      location_name: {
        type: String,
        required: [true, "Location name is required"],
        trim: true,
      },
      location_url: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            // optional but must be a URL if provided
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: "Invalid location URL format",
        },
      },
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
      index: true,
    },
    startTime: {
      type: Date,
      required: [true, "Event start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "Event end time is required"],
      validate: {
        validator: function (v) {
          return v > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalRegistered: {
      type: Number,
      default: 0,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    documents: [
      {
        fileName: { type: String, required: true },
        fileType: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);
// 🔹 Pre-save hook: keep totalRegistered in sync
eventSchema.pre("save", function (next) {
  // Generate slug only if not set
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

  this.totalRegistered = this.registeredUsers.length;
  next();
});

// 🔹 Virtual: is event full?
eventSchema.virtual("isFull").get(function () {
  return this.totalRegistered >= this.capacity;
});

// 🔹 Index for better queries
eventSchema.index({ title: "text", description: "text", location: "text" });

const Event = mongoose.model("Event", eventSchema);
export default Event;
