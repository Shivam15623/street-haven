import ClientFeedback from "../model/clientFeedback.js";
import ClientIncident from "../model/clientIncidentReport.js";
import EmployeeIncidentReport from "../model/EmployeeIncident.js";
import FunctionalAbility from "../model/functionalAbilties.js";
import MediaConsent from "../model/mediaConsent.js";
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
  } = req.body;

  // Validate purchase details array
  if (
    !paymentDetails ||
    !Array.isArray(paymentDetails) ||
    paymentDetails.length === 0
  ) {
    throw new ApiError(400, "At least one purchase detail is required");
  }

  // Upload invoice if exists
  if (!req.file) {
    throw new ApiError(400, "Invoice attachment is required");
  }

  const uploadedInvoice = await uploadOnCloudinary(req.file.path);
  if (!uploadedInvoice?.secure_url) {
    throw new ApiError(500, "Invoice upload failed");
  }

  // Ensure each purchase detail has netAmount, hst, totalAmount
  const normalizedDetails = paymentDetails.map((item) => {
    const netAmount = Number(item.netAmount || item.amount || 0);
    const hst = Number(item.hst || 0);
    return {
      purchaseDate: item.purchaseDate,
      purchaseNature: item.purchaseNature,
      program: item.program,
      expenseCode: item.expenseCode,
      netAmount,
      hst,
      totalAmount: netAmount + hst,
    };
  });

  // Recalculate totalAmount
  const totalAmount = normalizedDetails.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );

  const payload = {
    paymentDetails: normalizedDetails,
    requestedBy,
    approvedBy,
    requestedDate,
    approvedDate,
    payeeName,
    totalAmount,
    invoiceAttachment: uploadedInvoice.secure_url,
  };

  const cPayment = await PaymentRequisition.create(payload);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Payment Requisition Form Submitted Successfully!",
        cPayment
      )
    );
});

export const createFAF = asyncHandler(async (req, res) => {
  const data = req.body;
  const fafNew = await FunctionalAbility.create(data);
  if (!fafNew) {
    throw new ApiError(500, "Server Side Error!");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "Form Submitted Successfully!"));
});

export const createMediaConsent = asyncHandler(async (req, res) => {
  const { date, name, printedname } = req.body;
  const payload = {
    date: date,
    name: name,
    printedname: printedname,
  };
  const mediaConsent = await MediaConsent.create(payload);

  if (!mediaConsent) {
    throw new ApiError(500, "Server Side Error");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Media Consent Form Submitted Successfully!"));
});

export const GetAllClientFeedback = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { clientName: { $regex: search, $options: "i" } },
      { clientEmail: { $regex: search, $options: "i" } },
      { visitLocation: { $regex: search, $options: "i" } },
      { complaintDescription: { $regex: search, $options: "i" } },
    ];
  }

  const data = await ClientFeedback.find(query)
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalCount = await ClientFeedback.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, "Client Feedback fetched successfully", {
      allfeedbackSubmissions: data,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  );
});

export const GetAllClientIncidents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "incidentDate",
    order = "desc",
  } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { affectedPerson: { $regex: search, $options: "i" } },
      { staffName: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const data = await ClientIncident.find(query)
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalCount = await ClientIncident.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, "Client Incidents fetched successfully", {
      data,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  );
});

export const GetAllEmployeeIncidents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "injuryDate",
    order = "desc",
  } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const data = await EmployeeIncidentReport.find(query)
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalCount = await EmployeeIncidentReport.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, "Employee Incidents fetched successfully", {
      data,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  );
});

export const GetAllFunctionalAbilities = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { workerName: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const data = await FunctionalAbility.find(query)
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalCount = await FunctionalAbility.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, "Functional Abilities fetched successfully", {
      data,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  );
});

export const GetAllMediaConsent = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "date",
    order = "desc",
  } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { printedname: { $regex: search, $options: "i" } },
    ];
  }

  const data = await MediaConsent.find(query)
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalCount = await MediaConsent.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, "Media Consent forms fetched successfully", {
      data,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  );
});
export const GetAllPaymentRequisitions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "requestedDate",
    order = "desc",
  } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { payeeName: { $regex: search, $options: "i" } },
      { requestedBy: { $regex: search, $options: "i" } },
    ];
  }

  const data = await PaymentRequisition.find(query)
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalCount = await PaymentRequisition.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, "Payment Requisitions fetched successfully", {
      data,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  );
});
