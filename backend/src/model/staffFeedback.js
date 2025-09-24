import mongoose from "mongoose";

const staffFeedbackSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Safety", "Equipment", "Other", "Behavior"],
      default: "Other",
    },
    witnesses: [
      {
        type: String,
        trim: true,
      },
    ],
    actionsTaken: {
      type: String,
      trim: true,
    },
    reporterName: {
      type: String,
      required: true,
      trim: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who submitted it in system
      required: true,
    },
  },
  { timestamps: true }
);
const StaffFeedback = mongoose.model("StaffFeedback", staffFeedbackSchema);
export default StaffFeedback;
