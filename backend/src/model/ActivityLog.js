import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    actionType: { type: String, required: true },
    performedBy: { type: String, required: true },


    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      index: { expires: 0 }, // TTL index (delete automatically once expiresAt is reached)
    },

    details: { type: String ,required: true},
  },
  {
    timestamps: true,
  }
);

const ActivityLog = mongoose.model("ActivityLog", ActivityLogSchema);
export default ActivityLog;
