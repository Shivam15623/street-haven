import mongoose from "mongoose";

const EmployeeIncidentSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      enum: ["Injury", "Illness", "Near Miss"],
      required: true,
    },

    name: { type: String, required: true },
    jobTitle: { type: String },
    supervisor: { type: String, required: true },

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
    doctorPhone: { type: String },

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
