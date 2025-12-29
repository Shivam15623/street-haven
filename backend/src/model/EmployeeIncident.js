
import mongoose from "mongoose";

const EmployeeIncidentSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      enum: ["Injury", "Illness", "Near Miss"],
      required: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobTitle: { type: String ,required:true},
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default:null,
      required: true,
    },

    informedSupervisor: { type: Boolean, required: true },

    injuryDate: { type: Date, required: true },
    injuryTime: { type: String, required: true },

    witnessName: { type: String },

    location: { type: String, required: true },

    activityAtTime: { type: String, required: true },

    description: { type: String, required: true },

    preventionSuggestion: { type: String, required: true },

    injuredBodyPartOrRisk: { type: String },

    sawDoctor: { type: Boolean, required: true },
    doctorName: { type: String },
    doctorPhone: {
      type: String,
      match: [
        /^\+1\s?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/,
        "Please enter a valid Canadian phone number (e.g. +1 (416) 555-1234)",
      ],
    },

    doctorVisitDate: { type: Date },
    doctorVisitTime: { type: String },

    previousInjury: { type: Boolean, required: true },
    previousInjuryDate: { type: Date },
  },
  { timestamps: true }
);
const EmployeeIncidentReport = mongoose.model(
  "EmployeeIncidentReport",
  EmployeeIncidentSchema
);

export default EmployeeIncidentReport;
