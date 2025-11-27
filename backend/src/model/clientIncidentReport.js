import mongoose from "mongoose";

const ClientIncidentSchema = new mongoose.Schema(
  {
    // ======================
    // INCIDENT BASIC DETAILS
    // ======================
    incidentDate: {
      type: Date,
      required: true,
    },

    incidentTime: {
      type: String, // Example: "14:05" or "09:30 AM"
      required: true,
    },

    incidentPlace: {
      type: String,
      required: true,
      trim: true,
    },

    affectedPerson: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================
    // STAFF + WITNESS INFO
    // ======================
    staffName: {
      type: String,
      required: true,
      trim: true,
    },

    staffEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    witnessName: {
      type: String,
      trim: true,
      default: "",
    },

    // ======================
    // INCIDENT TYPE
    // ======================
    incidentType: {
      type: String,
      enum: [
        "Disaster",
        "Drugs",
        "Property Destruction",
        "Theft",
        "Medical / Injury / Health Emergency",
        "Intruders",
        "Police Action",
        "Actual Physical / Sexual Violence",
        "Threat of Physical / Sexual Violence",
        "Bomb Threat",
        "Other",
      ],
      required: true,
      index: true,
    },

    // Required only if incidentType === "Other"
    otherincidentText: {
      type: String,
      trim: true,
      default: "",
    },

    // ======================
    // INCIDENT DETAILS
    // ======================
    incidentDescription: {
      type: String,
      required: true,
      trim: true,
    },

    ActionTaken: {
      type: String,
      required: true,
      trim: true,
    },

    debrief: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================
    // REPORTING DETAILS
    // ======================
    reportingStaffName: {
      type: String,
      required: true,
      trim: true,
    },

    reportedTo: {
      type: String,
      required: true,
      trim: true,
    },

    reportingDate: {
      type: Date,
      required: true,
    },
    reportedToDate: {
      type: Date,
      required: true,
    },

    followup: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

ClientIncidentSchema.pre("save", function (next) {
  if (this.incidentType !== "Other") {
    this.otherincidentText = ""; // clean unwanted data
  }
  next();
});

// Helpful index for dashboards
ClientIncidentSchema.index({ incidentDate: -1, incidentType: 1 });

const ClientIncident = mongoose.model("ClientIncident", ClientIncidentSchema);
export default ClientIncident;
