import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ["broadcast", "personal"], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  resource: {
    resourceType: { type: String, required: true }, // e.g., 'employee', 'faq'
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "resource.resourceType",
    },
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
