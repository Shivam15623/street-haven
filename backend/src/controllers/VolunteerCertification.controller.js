// controllers/volunteerCertification.controller.js
import mongoose from "mongoose";
import path from "path";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import VolunteerCertification from "../model/VolunteerCertification.js";
import { io } from "../index.js";
import User, { ROLES } from "../model/user.js";
import { createNotification } from "../helper/CreateNotoification.js";

const emitNotification = (recipients, notification) => {
  console.log("Emitting notification to recipients:", recipients, notification);
  for (const r of recipients) {
    io.to(`user_${r.userId.toString()}`).emit("newNotification", notification);
  }
};

// --- Volunteer: submit a new certification ---
export const submitCertification = asyncHandler(async (req, res) => {
  const volunteerId = req.user._id;
  const { issuedBy, issueDate, expiryDate } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Certificate file is required");
  }

  const session = await mongoose.startSession();
  let notification = null;
  let recipients = [];

  try {
    session.startTransaction();

    const uploadedFile = await uploadOnCloudinary(req.file.path);
    if (!uploadedFile?.secure_url) {
      throw new ApiError(500, "Certificate file upload failed");
    }

    const payload = {
      volunteer: volunteerId,
      title: "Training Completion Certificate",
      fileUrl: uploadedFile.secure_url,

      issuedBy,
      issueDate: issueDate ? new Date(issueDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      status: "pending",
    };

    const certification = (
      await VolunteerCertification.create([payload], { session })
    )[0];

    const recipientIds = new Set();

    // 1. Get the volunteer's manager/supervisor
    const volunteer = await User.findById(volunteerId)
      .select("superviserId")
      .session(session);

    if (!volunteer) {
      throw new ApiError(404, "Volunteer not found");
    }

    if (volunteer.superviserId) {
      recipientIds.add(volunteer.superviserId.toString());
    }

    // 2. Get all super admins
    const superAdmins = await User.find({
      role: ROLES.SUPER_ADMIN,
    })
      .select("_id")
      .session(session);

    superAdmins.forEach((admin) => {
      recipientIds.add(admin._id.toString());
    });
    recipients = [...recipientIds].map((userId) => ({
      userId,
    }));
    notification = await createNotification(
      {
        category: "certificate",
        action: "created",
        severity: "info",
        title: "New Certificate Submitted",
        message: `${req.user.firstname} ${req.user.lastname} submitted a training certificate for review.`,
        link: `/certificates?status=pending`,
        meta: {
          certificationId: certification._id,
          volunteerId,
          event: "certification_submitted",
        },
        recipients,
        createdBy: volunteerId,
      },
      session,
    );

    await session.commitTransaction();

    if (notification && recipients.length) {
      emitNotification(recipients, notification);
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Training certificate submitted successfully",
          certification,
        ),
      );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

// --- Volunteer: view own certifications ---
export const getMyCertification = asyncHandler(async (req, res) => {
  const volunteerId = req.user._id;
  const certifications = await VolunteerCertification.find({
    volunteer: volunteerId,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Certifications fetched successfully",
        certifications,
      ),
    );
});

// --- Volunteer: delete/withdraw a pending submission ---
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

  // Non-super-admins can only see certifications of volunteers they supervise
  if (req.user.role !== ROLES.SUPER_ADMIN) {
    const managedVolunteers = await User.find(
      { superviserId: req.user._id },
      "_id",
    );
    const managedIds = managedVolunteers.map((u) => u._id);

    if (volunteer) {
      // If a specific volunteer was requested, make sure it's one they manage
      if (!managedIds.some((id) => id.equals(volunteer))) {
        return res.status(200).json(
          new ApiResponse(200, "Certifications fetched successfully", {
            certifications: [],
            pagination: { total: 0, page, limit, totalPages: 0 },
          }),
        );
      }
      filter.volunteer = volunteer;
    } else {
      filter.volunteer = { $in: managedIds };
    }
  } else if (volunteer) {
    // Super admin can filter by any volunteer
    filter.volunteer = volunteer;
  }

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
    .json(
      new ApiResponse(200, "Certification fetched successfully", certification),
    );
});

// --- Admin: approve or reject ---
export const updateCertificationStatus = asyncHandler(async (req, res) => {
  const { certificationId } = req.params;
  const { status, remarks } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be either 'approved' or 'rejected'");
  }

  const session = await mongoose.startSession();
  let notification = null;
  let recipients = [];

  try {
    session.startTransaction();

    const certification = await VolunteerCertification.findById(certificationId)
      .populate("volunteer", "firstname lastname")
      .session(session);
    if (!certification) throw new ApiError(404, "Certification not found");

    if (certification.status !== "pending") {
      throw new ApiError(
        400,
        `Certification is already ${certification.status} and cannot be updated again`,
      );
    }

    if (status === "rejected" && !remarks) {
      throw new ApiError(
        400,
        "Remarks are required when rejecting a certification",
      );
    }

    certification.status = status;
    certification.remarks = remarks || "";
    await certification.save({ session });

    recipients = [{ userId: certification.volunteer._id }];

    notification = await createNotification(
      {
        category: "certificate",
        action: "status_changed",
        severity: status === "approved" ? "success" : "warning",
        title:
          status === "approved"
            ? "Certificate Approved"
            : "Certificate Rejected",
        message:
          status === "approved"
            ? "Your training certificate has been approved."
            : `Your training certificate was rejected. Reason: ${remarks}`,
        link: `/profile?tab=training_certificate`,
        meta: {
          certificationId: certification._id,
          event: "certification_status_changed",
          status,
        },
        recipients,
        createdBy: req.user._id,
      },
      session,
    );
    const superAdmins = await User.find({ role: "super_admin" })
      .select("_id")
      .session(session);
    const superAdminIds = superAdmins
      .map((a) => a._id.toString())
      .filter((id) => id !== req.user._id.toString());

    let superAdminNotification = null;
    let superAdminRecipients = [];

    if (superAdminIds.length) {
      superAdminRecipients = superAdminIds.map((id) => ({ userId: id }));
      superAdminNotification = await createNotification(
        {
          category: "certificate",
          action: "status_changed",
          severity: status === "approved" ? "success" : "warning",
          title:
            status === "approved"
              ? "Certificate Approved"
              : "Certificate Rejected",
          message: `${req.user.firstname} ${req.user.lastname} ${status} a training certificate submitted by ${certification.volunteer.firstname} ${certification.volunteer.lastname}.`,
          link: `/certificates?status=${status}`,
          meta: {
            certificationId: certification._id,
            event: "certification_status_changed",
            status,
          },
          recipients: superAdminRecipients,
          createdBy: req.user._id,
        },
        session,
      );
    }
    await session.commitTransaction();

    emitNotification(recipients, notification);
    if (superAdminNotification && superAdminRecipients.length) {
      emitNotification(superAdminRecipients, superAdminNotification);
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `Certification ${status} successfully`,
          certification,
        ),
      );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});
