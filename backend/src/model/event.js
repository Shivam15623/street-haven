import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
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
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
      index: true, // faster queries for upcoming events
    },
    // ✅ Store start and end times
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
    facilitator: {
      type: String,
      trim: true,
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
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// 🔹 Pre-save hook: keep totalRegistered in sync
eventSchema.pre("save", function (next) {
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
