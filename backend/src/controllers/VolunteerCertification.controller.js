// controllers/volunteerCertification.controller.js
import path from "path";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import VolunteerCertification from "../model/VolunteerCertification.js";

// --- Volunteer: submit a new certification ---
// controllers/volunteerCertification.controller.js — updated submitCertification
export const submitCertification = asyncHandler(async (req, res) => {
  const volunteerId = req.user._id;
  const { issuedBy, issueDate, expiryDate } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Certificate file is required");
  }

  const existing = await VolunteerCertification.findOne({ volunteer: volunteerId });

  if (existing && existing.status !== "rejected") {
    throw new ApiError(
      400,
      `You already have a training certificate that is ${existing.status}`,
    );
  }

  const uploadedFile = await uploadOnCloudinary(req.file.path);
  if (!uploadedFile?.secure_url) {
    throw new ApiError(500, "Certificate file upload failed");
  }

  const payload = {
    volunteer: volunteerId,
    title: "Training Completion Certificate", // fixed — not user-entered anymore
    fileUrl: uploadedFile.secure_url,
    issuedBy,
    issueDate: issueDate ? new Date(issueDate) : undefined,
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    status: "pending",
  };

  // if a rejected one exists, replace it rather than creating a second doc
  const certification = existing
    ? await VolunteerCertification.findByIdAndUpdate(existing._id, {
        ...payload,
        remarks: "", // clear previous rejection remark on resubmit
      }, { new: true })
    : await VolunteerCertification.create(payload);

  return res
    .status(201)
    .json(new ApiResponse(201, "Training certificate submitted successfully", certification));
});

// --- Volunteer: view own certifications ---
export const getMyCertification = asyncHandler(async (req, res) => {
  const volunteerId = req.user._id;
  const certification = await VolunteerCertification.findOne({ volunteer: volunteerId });

  return res
    .status(200)
    .json(new ApiResponse(200, "Certification fetched successfully", certification));
});

// --- Volunteer: delete/withdraw a pending submission (optional, only if still pending) ---
export const deleteCertification = asyncHandler(async (req, res) => {
  const volunteerId = req.user._id;
  const { certificationId } = req.params;

  const certification = await VolunteerCertification.findOne({
    _id: certificationId,
    volunteer: volunteerId,
  });

  if (!certification) throw new ApiError(404, "Certification not found");
  if (certification.status !== "pending") {
    throw new ApiError(400, "Only pending certifications can be deleted");
  }

  await certification.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, "Certification deleted successfully", null));
});

// --- Admin: view all certifications (filterable, paginated) ---
export const getAllCertifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { status, volunteer } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (volunteer) filter.volunteer = volunteer; // filter by specific volunteer if needed

  const [certifications, total] = await Promise.all([
    VolunteerCertification.find(filter)
      .populate("volunteer", "firstname lastname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    VolunteerCertification.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Certifications fetched successfully", {
      certifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }),
  );
});

// --- Admin: view single certification detail ---
export const getCertificationById = asyncHandler(async (req, res) => {
  const { certificationId } = req.params;

  const certification = await VolunteerCertification.findById(
    certificationId,
  ).populate("volunteer", "firstname lastname email");

  if (!certification) throw new ApiError(404, "Certification not found");

  return res
    .status(200)
    .json(new ApiResponse(200, "Certification fetched successfully", certification));
});

// --- Admin: approve or reject ---
export const updateCertificationStatus = asyncHandler(async (req, res) => {
  const { certificationId } = req.params;
  const { status, remarks } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be either 'approved' or 'rejected'");
  }

  const certification = await VolunteerCertification.findById(certificationId);
  if (!certification) throw new ApiError(404, "Certification not found");

  if (certification.status !== "pending") {
    throw new ApiError(
      400,
      `Certification is already ${certification.status} and cannot be updated again`,
    );
  }

  if (status === "rejected" && !remarks) {
    throw new ApiError(400, "Remarks are required when rejecting a certification");
  }

  certification.status = status;
  certification.remarks = remarks || "";
  await certification.save();

  return res
    .status(200)
    .json(new ApiResponse(200, `Certification ${status} successfully`, certification));
});