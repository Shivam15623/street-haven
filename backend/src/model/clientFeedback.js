import mongoose from "mongoose";

const clientFeedbackSchema = new mongoose.Schema(
  {
    visitDate: {
      type: Date,
      required: true,
    },
    visitLocation: {
      type: String, // "14:05", "09:30 AM"
      required: true,
    },

    clientName: {
      type: String,

      trim: true,
      index: true,
      default: null,
    },

    clientPhone: {
      type: String,
      match: [
        /^\+1\s?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/,
        "Please enter a valid Canadian phone number (e.g. +1 (416) 555-1234)",
      ],
      default: null,
    },

    clientEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      default: null,
    },

    clientAddress: {
      type: String,
      trim: true,
      default: null,
    },

    // ======================
    //  COMPLAINT DETAILS
    // ======================
    complaintNature: {
      type: String,
      enum: ["Staff Behaviour", "Product Issue", "Service Issue", "Other"],
      required: true,
      index: true,
    },

    // Required only if complaintNature = "Other"
    otherComplaintText: {
      type: String,
      trim: true,
      default: null,
    },

    complaintDescription: {
      type: String,
      required: true,
      trim: true,
    },
    preferredContactMethod: {
      type: String,
      required: true,
      enum: ["Phone", "Email", "Either"],
    },
    impact: {
      type: String,
      required: true,
      trim: true,
    },

    desiredOutcome: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// =========================
//  CONDITIONAL VALIDATION
// =========================
clientFeedbackSchema.pre("save", function (next) {
  if (this.complaintNature !== "Other") {
    this.otherComplaintText = ""; // auto clean
  }
  next();
});

// Helpful compound index for fast dashboard filtering
clientFeedbackSchema.index({ visitDate: -1, complaintNature: 1 });

const ClientFeedback = mongoose.model("ClientFeedback", clientFeedbackSchema);
export default ClientFeedback;
