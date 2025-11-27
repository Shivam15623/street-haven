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
      default:null
    },

    clientPhone: {
      type: String,

      match: /^[0-9]{10,15}$/,
      default:null
    },

    clientEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      default:null
    },

    clientAddress: {
      type: String,
      trim: true,
      default:null
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
      default: "",
    },

    complaintDescription: {
      type: String,
      required: true,
      trim: true,
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
