import mongoose from "mongoose";

const incidentReportSchema = new mongoose.Schema(
  {
    dateOfIncident: {
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
  
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who submitted it in system
      required: true,
    },
  },
  { timestamps: true }
);
const IncidentReport = mongoose.model("IncidentReport", incidentReportSchema);
export default IncidentReport;
