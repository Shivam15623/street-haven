import ClientFeedback from "../model/clientFeedback.js";
import ClientIncident from "../model/clientIncidentReport.js";
import EmployeeIncidentReport from "../model/EmployeeIncident.js";
import PaymentRequisition from "../model/PaymentRequistion.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";

export const createClientIncident = asyncHandler(async (req, res) => {
  const {
    date,
    time,
    place,
    type,
    affectedClient,
    staffName,
    staffEmail,
    witnessName,
    otherincidentType,
    description,
    action,
    debrief,
    reportingStaffName,
    reportedTo,
    reportingDate,
    followUp,
    reportedToDate,
  } = req.body;
  const payload = {
    incidentDate: date,
    incidentTime: time,
    incidentPlace: place,
    incidentType: type,
    affectedPerson: affectedClient,
    staffName: staffName,
    staffEmail: staffEmail,
    witnessName: witnessName,
    otherincidentText: otherincidentType,
    incidentDescription: description,
    ActionTaken: action,
    debrief: debrief,
    reportingStaffName: reportingStaffName,
    reportedTo: reportedTo,
    reportingDate: reportingDate,
    followup: followUp,
    reportedToDate: reportedToDate,
  };
  if (type === "Other" && otherincidentType) {
    payload.otherincidentText = otherincidentType;
  }
  const cIncident = await ClientIncident.create(payload);
  if (!cIncident) {
    throw new ApiError(500, "ServerSide Error");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Client Incident Report Form Submitted Successfully!"
      )
    );
});
export const createClientFeedback = asyncHandler(async (req, res) => {
  const {
    date,
    location,
    clientAddress,
    type,
    clientEmail,
    clientPhone,
    clientName,
    otherComplaint,
    impact,
    outcome,
    description,
  } = req.body;

  // ---------------------------
  // 1️⃣ Basic validation
  // ---------------------------
  if (!date || !location || !type || !impact || !outcome || !description) {
    throw new ApiError(400, "Missing required fields");
  }

  // ---------------------------
  // 2️⃣ Create Feedback Document
  // ---------------------------
  const cFeed = await ClientFeedback.create({
    visitDate: new Date(date),
    visitLocation: location,
    clientName: clientName || null,
    clientEmail: clientEmail || null,
    clientPhone: clientPhone || null,
    clientAddress: clientAddress || null,

    complaintNature: type,
    complaintDescription: description,
    desiredOutcome: outcome,
    impact: impact,

    otherComplaintText: otherComplaint || undefined,
  });

  if (!cFeed) {
    throw new ApiError(500, "Server Error. Could not submit feedback.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Client Feedback Form Submitted Successfully!"));
});
export const createEmployeeIncident = asyncHandler(async (req, res) => {
  const {
    type,
    name,
    jobTitle,
    supervisor,
    informedSupervisor,
    injuryDate,
    injuryTime,
    witnessName,
    location,
    activityAtTime,
    description,
    preventionSuggestion,
    injuredBodyPartOrRisk,
    doctorName,
    sawDoctor,
    doctorPhone,
    doctorVisitDate,
    doctorVisitTime,
    previousInjury,
    previousInjuryDate,
  } = req.body;
  const payload = {
    reportType: type,
    name: name,
    jobTitle,
    supervisor: supervisor,
    informedSupervisor: informedSupervisor,
    injuryDate: injuryDate,
    injuryTime: injuryTime,
    location: location,
    activityAtTime: activityAtTime,
    description: description,
    preventionSuggestion,
    injuredBodyPartOrRisk,
    sawDoctor,
    previousInjury,
  };
  if (witnessName) payload.witnessName === witnessName;
  if (sawDoctor === true) {
    payload.doctorName = doctorName;
    payload.doctorPhone = doctorPhone;
    payload.doctorVisitDate = doctorVisitDate;
    payload.doctorVisitTime = doctorVisitTime;
  }
  if (previousInjury === true) {
    payload.previousInjuryDate = previousInjuryDate;
  }
  const cEmpIncident = await EmployeeIncidentReport.create(payload);
  if (!cEmpIncident) {
    throw new ApiError(500, "Server Side Error");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Employee Incident Report Form Submitted Successfully!"
      )
    );
});
export const createPaymentRequisition = asyncHandler(async (req, res) => {
  const {
    paymentDetails,
    requestedBy,
    approvedBy,
    requestedDate,
    approvedDate,
    payeeName,
    totalAmount, // optional – we will re-calc below
  } = req.body;

  // Validate paymentDetails array
  if (
    !paymentDetails ||
    !Array.isArray(paymentDetails) ||
    paymentDetails.length === 0
  ) {
    throw new ApiError(400, "At least one purchase detail is required");
  }

  // If invoice file is uploaded (multer)
  let invoiceAttachment = null;
  if (req.file) {
    // or req.file.filename based on config
    const temp = await uploadOnCloudinary(req.file.path);
    if (!temp.secure_url) {
      throw new ApiError(500, "Error while uploading profile picture");
    }
    invoiceAttachment = temp.secure_url;
  }

  if (!invoiceAttachment) {
    throw new ApiError(400, "Invoice attachment is required");
  }

  // Auto-calc total amount for safety
  const calculatedTotal = paymentDetails.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const payload = {
    paymentDetails,
    requestedBy,
    approvedBy,
    requestedDate,
    approvedDate,
    payeeName,
    totalAmount: calculatedTotal, // overrides any user-provided amount
    invoiceAttachment,
  };

  const cPayment = await PaymentRequisition.create(payload);

  if (!cPayment) {
    throw new ApiError(500, "Server Side Error");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Payment Requisition Form Submitted Successfully!")
    );
});

export const createFAF = asyncHandler(async (req, res) => {});
