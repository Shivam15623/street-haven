import { generatePdf } from "../helper/generatePdf.js";
import { buildHtmlFromTemplate } from "../helper/generateTemplates.js";
import ClientFeedback from "../model/clientFeedback.js";
import ClientIncident from "../model/clientIncidentReport.js";
import EmployeeIncidentReport from "../model/EmployeeIncident.js";
import FunctionalAbility from "../model/functionalAbilties.js";
import IncidentReport from "../model/incidentreport.js";
import MediaConsent from "../model/mediaConsent.js";
import PaymentRequisition from "../model/PaymentRequistion.js";
import StaffFeedback from "../model/staffFeedback.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import path from "path";
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
    preferredContactMethod,
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
    preferredContactMethod: preferredContactMethod,
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
    employee,
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
  console.log(req.body);
  const payload = {
    reportType: type,
    employee: employee,
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
  if (injuredBodyPartOrRisk) {
    payload.injuredBodyPartOrRisk = injuredBodyPartOrRisk;
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
  const typeMap = {
    image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    video: [".mp4", ".mov", ".avi", ".mkv"],
    audio: [".mp3", ".wav", ".ogg"],
    pdf: [".pdf"],
    doc: [".doc", ".docx"],
    ppt: [".ppt", ".pptx"],
    excel: [".xls", ".xlsx"],
    zip: [".zip", ".rar"],
  };

  const detectFileType = (ext) => {
    return (
      Object.keys(typeMap).find((key) => typeMap[key].includes(ext)) || "other"
    );
  };

  const ext = path.extname(req.file.originalname).toLowerCase();
  const fileType = detectFileType(ext);

  /* ======================
     UPLOAD TO CLOUDINARY
  ====================== */
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
    invoiceAttachment: {
      fileName: req.file.originalname,
      fileType, // pdf, image, etc
      fileUrl: uploadedInvoice.secure_url,
    },
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
      { incidentType: { $regex: search, $options: "i" } },
    ];
  }

  const data = await ClientIncident.find(query)
    .select("affectedPerson staffName incidentType incidentTime incidentDate")
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

  const matchStage = {};

  if (search) {
    matchStage.$or = [
      { location: { $regex: search, $options: "i" } },
      { jobTitle: { $regex: search, $options: "i" } },
      {
        $expr: {
          $regexMatch: {
            input: {
              $concat: ["$employee.firstname", " ", "$employee.lastname"],
            },
            regex: search,
            options: "i",
          },
        },
      },
      {
        $expr: {
          $regexMatch: {
            input: {
              $concat: ["$supervisor.firstname", " ", "$supervisor.lastname"],
            },
            regex: search,
            options: "i",
          },
        },
      },
    ];
  }

  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "employee",
        foreignField: "_id",
        as: "employee",
      },
    },
    { $unwind: "$employee" },

    {
      $lookup: {
        from: "users",
        localField: "supervisor",
        foreignField: "_id",
        as: "supervisor",
      },
    },
    { $unwind: "$supervisor" },

    { $match: matchStage },
    {
      $project: {
        injuryDate: 1,
        injuryTime: 1,
        location: 1,
        jobTitle: 1,
        description: 1,

        "employee._id": 1,
        "employee.firstname": 1,
        "employee.lastname": 1,
        "employee.title": 1,

        "supervisor._id": 1,
        "supervisor.firstname": 1,
        "supervisor.lastname": 1,
        "supervisor.title": 1,
      },
    },
    {
      $sort: { [sortBy]: order === "asc" ? 1 : -1 },
    },
    { $skip: (page - 1) * limit },
    { $limit: Number(limit) },
  ];

  const data = await EmployeeIncidentReport.aggregate(pipeline);

  const totalCount = await EmployeeIncidentReport.aggregate([
    ...pipeline.slice(
      0,
      pipeline.findIndex((s) => s.$sort)
    ),
    { $count: "count" },
  ]);

  res.status(200).json(
    new ApiResponse(200, "Employee Incidents fetched successfully", {
      data,
      pagination: {
        total: totalCount[0]?.count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
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
      {
        $expr: {
          $regexMatch: {
            input: { $concat: ["$worker.firstName", " ", "$worker.lastName"] },
            regex: search,
            options: "i",
          },
        },
      },
      { "worker.telephone": { $regex: search, $options: "i" } },
      { returnToWorkStatus: { $regex: search, $options: "i" } },
      { claimNo: { $regex: search, $options: "i" } },
      {},
    ];
  }

  const data = await FunctionalAbility.find(query)
    .select("worker returnToWorkStatus claimNo dateOfAccident")
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
      { approvedBy: { $regex: search, $options: "i" } },
    ];
  }

  const data = await PaymentRequisition.find(query)
    .select("payeeName requestedBy approvedBy totalAmount requestedDate")
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

export const editClientIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await ClientIncident.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new ApiError(404, "Client incident not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Client incident updated successfully", updated)
    );
});

export const editClientFeedback = asyncHandler(async (req, res) => {
  const feedback = await ClientFeedback.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!feedback) {
    throw new ApiError(404, "Client feedback not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Client feedback updated successfully", feedback)
    );
});

export const editEmployeeIncident = asyncHandler(async (req, res) => {
  const incident = await EmployeeIncidentReport.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!incident) {
    throw new ApiError(404, "Employee incident not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Employee incident updated successfully", incident)
    );
});

export const editFAF = asyncHandler(async (req, res) => {
  const faf = await FunctionalAbility.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!faf) {
    throw new ApiError(404, "Functional ability form not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Functional ability updated successfully", faf));
});

export const editPaymentRequisition = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    paymentDetails,
    requestedBy,
    approvedBy,
    requestedDate,
    approvedDate,
    payeeName,
  } = req.body;

  const payment = await PaymentRequisition.findById(id);

  if (!payment) {
    throw new ApiError(404, "Payment requisition not found");
  }

  /* ---------------- Invoice upload (optional) ---------------- */
  if (req.file) {
    const typeMap = {
      image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      video: [".mp4", ".mov", ".avi", ".mkv"],
      audio: [".mp3", ".wav", ".ogg"],
      pdf: [".pdf"],
      doc: [".doc", ".docx"],
      ppt: [".ppt", ".pptx"],
      excel: [".xls", ".xlsx"],
      zip: [".zip", ".rar"],
    };

    const detectFileType = (ext) => {
      return (
        Object.keys(typeMap).find((key) => typeMap[key].includes(ext)) ||
        "other"
      );
    };
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileType = detectFileType(ext);
    const uploadedInvoice = await uploadOnCloudinary(req.file.path);

    if (!uploadedInvoice?.secure_url) {
      throw new ApiError(500, "Invoice upload failed");
    }

    payment.invoiceAttachment = {
      fileName: req.file.originalname,
      fileType,
      fileUrl: uploadedInvoice.secure_url,
    };
  }

  /* ---------------- Payment details update ---------------- */
  if (paymentDetails) {
    if (!Array.isArray(paymentDetails) || paymentDetails.length === 0) {
      throw new ApiError(400, "At least one purchase detail is required");
    }

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

    payment.paymentDetails = normalizedDetails;

    // Recalculate totalAmount
    payment.totalAmount = normalizedDetails.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );
  }

  /* ---------------- Optional fields ---------------- */
  if (requestedBy !== undefined) payment.requestedBy = requestedBy;
  if (approvedBy !== undefined) payment.approvedBy = approvedBy;
  if (requestedDate !== undefined) payment.requestedDate = requestedDate;
  if (approvedDate !== undefined) payment.approvedDate = approvedDate;
  if (payeeName !== undefined) payment.payeeName = payeeName;

  await payment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Payment requisition updated successfully"));
});

export const editMediaConsent = asyncHandler(async (req, res) => {
  const consent = await MediaConsent.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!consent) {
    throw new ApiError(404, "Media consent not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Media consent updated successfully", consent));
});

export const deleteMediaConsent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mediaConsent = await MediaConsent.findByIdAndDelete(id);
  if (!mediaConsent) {
    throw new ApiError(404, "Media Consent not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Media Consent deleted successfully"));
});
export const getClientIncidentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const incident = await ClientIncident.findById(id);
  if (!incident) {
    throw new ApiError(404, "Client Incident not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Client Incident fetched successfully", incident)
    );
});

export const deleteClientIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const incident = await ClientIncident.findByIdAndDelete(id);
  if (!incident) {
    throw new ApiError(404, "Client Incident not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Client Incident deleted successfully"));
});

export const getClientFeedbackById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const feedback = await ClientFeedback.findById(id);
  if (!feedback) {
    throw new ApiError(404, "Client Feedback not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Client Feedback fetched successfully", feedback)
    );
});

export const deleteClientFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const feedback = await ClientFeedback.findByIdAndDelete(id);
  if (!feedback) {
    throw new ApiError(404, "Client Feedback not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Client Feedback deleted successfully"));
});

export const getEmployeeIncidentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const incident = await EmployeeIncidentReport.findById(id)
    .populate("employee", "firstname lastname title")
    .populate("supervisor", "firstname lastname title");

  if (!incident) {
    throw new ApiError(404, "Employee Incident not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Employee Incident fetched successfully", incident)
    );
});

export const deleteEmployeeIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const incident = await EmployeeIncidentReport.findByIdAndDelete(id);
  if (!incident) {
    throw new ApiError(404, "Employee Incident not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee Incident deleted successfully"));
});

export const getPaymentRequisitionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await PaymentRequisition.findById(id);
  if (!payment) {
    throw new ApiError(404, "Payment Requisition not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Payment Requisition fetched successfully", payment)
    );
});

export const deletePaymentRequisition = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await PaymentRequisition.findByIdAndDelete(id);
  if (!payment) {
    throw new ApiError(404, "Payment Requisition not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Payment Requisition deleted successfully"));
});

export const getFAFById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const faf = await FunctionalAbility.findById(id);
  if (!faf) {
    throw new ApiError(404, "Functional Ability Form not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Form fetched successfully", faf));
});

export const deleteFAF = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const faf = await FunctionalAbility.findByIdAndDelete(id);
  if (!faf) {
    throw new ApiError(404, "Functional Ability Form not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Form deleted successfully"));
});

export const generatefilledPaymentPdf = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dataFromDB = await PaymentRequisition.findById(id);

  console.log(dataFromDB);
  const plainData = dataFromDB.toObject();
  const html = buildHtmlFromTemplate("payment-requistion", plainData);

  const pdf = await generatePdf(html);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=payment.pdf",
  });

  res.send(pdf);
});

export const generatefilledStaffFeedbackpdf = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dataFromDB = await StaffFeedback.findById(id).populate(
    "submittedBy",
    "firstname lastname"
  );

  const payload = {
    date: dataFromDB.date ? dataFromDB.date.toLocaleDateString() : "",
    time: dataFromDB.date ? dataFromDB.date.toLocaleTimeString() : "",
    location: dataFromDB.location || "",
    category: dataFromDB.category || "",
    description: dataFromDB.description || "",
    witnesses: dataFromDB.witnesses || [],
    actionsTaken: dataFromDB.actionsTaken || "",
    reporterName:
      `${dataFromDB.submittedBy?.firstname} ${dataFromDB.submittedBy?.lastname}` ||
      "",
  };
  const html = buildHtmlFromTemplate("staff-feedback", payload);

  const pdf = await generatePdf(html);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=staff-feedback.pdf",
  });

  res.send(pdf);
});

export const generateFilledClientIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await ClientIncident.findById(id);

  console.log(doc);

  const payload = {
    incidentDate: new Date(doc.incidentDate).toLocaleDateString(),
    incidentTime: doc.incidentTime,
    incidentPlace: doc.incidentPlace,
    affectedPerson: doc.affectedPerson,
    staffName: doc.staffName,
    staffEmail: doc.staffEmail,
    witnessName: doc.witnessName,

    incidentDescription: doc.incidentDescription,
    ActionTaken: doc.ActionTaken,
    debrief: doc.debrief,
    followup: doc.followup,

    reportingStaffName: doc.reportingStaffName,
    reportingDate: new Date(doc.reportingDate).toLocaleDateString(),
    reportedTo: doc.reportedTo,
    reportedToDate: new Date(doc.reportedToDate).toLocaleDateString(),

    incidentTypes: {
      disaster: doc.incidentType === "Disaster",
      drugs: doc.incidentType === "Drugs",
      property: doc.incidentType === "Property Destruction",
      theft: doc.incidentType === "Theft",
      medical: doc.incidentType.includes("Medical"),
      intruders: doc.incidentType === "Intruders",
      police: doc.incidentType === "Police Action",
      physical: doc.incidentType === "Actual Physical / Sexual Violence",
      threat: doc.incidentType === "Threat of Physical / Sexual Violence",
      bomb: doc.incidentType === "Bomb Threat",
      other: doc.incidentType === "Other",
    },

    otherincidentText: doc.otherincidentText,
  };

  const html = buildHtmlFromTemplate("client-incident", payload);

  const pdf = await generatePdf(html);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=client-incident.pdf",
  });

  res.send(pdf);
});

export const generateFilledclientFeedbackPdf = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const doc = await ClientFeedback.findById(id);
    const payload = {
      visitDate: new Date(doc.visitDate).toLocaleDateString(),
      visitLocation: doc.visitLocation,

      clientName: doc.clientName || "N-A",
      clientPhone: doc.clientPhone || "N-A",
      clientEmail: doc.clientEmail || "N-A",
      clientAddress: doc.clientAddress || "N-A",

      complaintDescription: doc.complaintDescription,
      impact: doc.impact,
      desiredOutcome: doc.desiredOutcome,
      otherComplaintText: doc.otherComplaintText || "",

      preferredContactMethod: doc.preferredContactMethod?.join(", ") || "",

      complaintNature: {
        staff: doc.complaintNature === "Staff Behaviour",
        product: doc.complaintNature === "Product Issue",
        service: doc.complaintNature === "Service Issue",
        other: doc.complaintNature === "Other",
      },
    };
    const html = buildHtmlFromTemplate("client-feedback", payload);

    const pdf = await generatePdf(html);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=client-feedback.pdf",
    });

    res.send(pdf);
  }
);
export const generateFilledIncidentReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dataFromDB = await IncidentReport.findById(id).populate(
    "submittedBy",
    "firstname lastname"
  );

  const payload = {
    date: dataFromDB.dateOfIncident
      ? dataFromDB.dateOfIncident.toLocaleDateString()
      : "",
    time: dataFromDB.dateOfIncident
      ? dataFromDB.dateOfIncident.toLocaleTimeString()
      : "",
    location: dataFromDB.location || "",

    description: dataFromDB.description || "",
    witnesses: dataFromDB.witnesses || [],
    actionsTaken: dataFromDB.actionsTaken || "",
    reporterName:
      `${dataFromDB.submittedBy?.firstname} ${dataFromDB.submittedBy?.lastname}` ||
      "",
  };
  const html = buildHtmlFromTemplate("incident-report", payload);

  const pdf = await generatePdf(html);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=incident-report.pdf",
  });

  res.send(pdf);
});

export const generateFilledMediaConsent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dataFromDB = await MediaConsent.findById(id);
  const payload = {
    date: dataFromDB.date ? dataFromDB.date.toLocaleDateString() : "",
    name: dataFromDB.name,
    printedname: dataFromDB.printedname,
  };
  const html = buildHtmlFromTemplate("media-consent", payload);

  const pdf = await generatePdf(html);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=media-consent.pdf",
  });

  res.send(pdf);
});

export const generateFilledEmployeeIncidentPdf = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    const doc = await EmployeeIncidentReport.findById(id)
      .populate("employee", "firstname lastname")
      .populate("supervisor", "firstname lastname");

    if (!doc) {
      res.status(404);
      throw new Error("Incident report not found");
    }

    const payload = {
      employeeName: `${doc.employee.firstname} ${doc.employee.lastname}`,
      jobTitle: doc.jobTitle,
      supervisorName: doc.supervisor
        ? `${doc.supervisor.firstname} ${doc.supervisor.lastname}`
        : "",

      reportType: {
        injury: doc.reportType === "Injury",
        illness: doc.reportType === "Illness",
        nearMiss: doc.reportType === "Near Miss",
      },

      informedSupervisor: {
        yes: doc.informedSupervisor === true,
        no: doc.informedSupervisor === false,
      },

      injuryDate: new Date().toDateString(),
      injuryTime: doc.injuryTime,

      witnessName: doc.witnessName || "N-A",
      location: doc.location,

      activityAtTime: doc.activityAtTime,
      description: doc.description,
      preventionSuggestion: doc.preventionSuggestion,
      injuredBodyPartOrRisk: doc.injuredBodyPartOrRisk || "N-A",

      sawDoctor: {
        yes: doc.sawDoctor === true,
        no: doc.sawDoctor === false,
      },

      doctorName: doc.doctorName || "N-A",
      doctorPhone: doc.doctorPhone || "N-A",

      doctorVisitDate: new Date(doc.doctorVisitDate).toDateString() || "N-A",
      doctorVisitTime: doc.doctorVisitTime || "N-A",

      previousInjury: {
        yes: doc.previousInjury === true,
        no: doc.previousInjury === false,
      },

      previousInjuryDate: new Date(doc.previousInjuryDate).toDateString(),
    };

    const html = buildHtmlFromTemplate("employee-incident", payload);
    const pdf = await generatePdf(html);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=employee-incident.pdf",
    });

    res.send(pdf);
  }
);
