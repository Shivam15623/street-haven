import CollectiveAgreement from "../model/Agreement.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { deleteFromCloudinary } from "../utills/cloudinary.js";
import mongoose from "mongoose";
import { addActivityLog } from "../helper/addActivityLogs.js";
import { uploadAttachment } from "./meetingMinutes.controller.js";
import { io } from "../index.js";
import { createNotification } from "../helper/CreateNotoification.js";

export const createCollectiveAgreement = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { title, startDate, endDate } = req.body;
    const { firstname, lastname, _id: userId } = req.user;
    const attachmentpath = req?.file?.path; // Fix typo

    if (!attachmentpath) throw new ApiError(400, "Attachment file is missing");

    const attachmentData = await uploadAttachment(attachmentpath);

    // Save in DB (inside transaction)
    const newAgreement = await CollectiveAgreement.create(
      [
        {
          title,
          attachment: attachmentData,
          effectiveStartDate: startDate,
          effectiveEndDate: endDate,
          createdBy: userId,
        },
      ],
      { session }
    );

    const savedAgreement = newAgreement[0];

    const notification = await createNotification(
      {
        action: "created",
        category: "collective_agreement",
        severity: "info",
        title: "New Collective Agreement Published",
        message: `A new collective agreement "${title}" has been published by ${firstname} ${lastname}.`,
        link: `/agency_info?tab=collective_agreement&item=${savedAgreement.slug}`,
        isGlobal: true, // ✅ no per-user mappings
        createdBy: userId,
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        meta: {
          agreementId: savedAgreement.slug,
          page: "agency_info",
          tab: "collective_agreement",
        },
      },
      session
    );

    io.emit("newNotification", notification);

    // 🔥 Activity Log (inside same session)
    await addActivityLog(
      {
        actionType: "COLLECTIVE_AGREEMENT_CREATED",
        performedBy: {
          id: req.user?._id,
          name: `${firstname} ${lastname}`,
          type: "user",
        },
        message: `A new collective agreement uploaded: ${title}`,
        meta: {
          recordId: savedAgreement._id,
          moduleName: "CollectiveAgreement",
          attachment: attachmentData,
        },
      },
      session // <-- pass session
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Collective Agreement Created Successfully!",
          savedAgreement
        )
      );
  } catch (err) {
    // Rollback
    // ✅ SAFE ABORT
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    throw err;
  }
});

// --------------------------------------------------------
// READ — FETCH ALL
// --------------------------------------------------------
export const fetchCollectiveAgreements = asyncHandler(async (req, res) => {
  const agreements = await CollectiveAgreement.find().sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Collective Agreements fetched successfully",
        agreements
      )
    );
});

// --------------------------------------------------------
// UPDATE — EDIT AGREEMENT (with optional attachment replace)
// --------------------------------------------------------
export const editCollectiveAgreement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, startDate, endDate } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const agreement = await CollectiveAgreement.findById(id).session(session);
    if (!agreement) {
      throw new ApiError(404, "Agreement not found");
    }

    /* ======================
       TRACK CHANGES
    ====================== */
    const changes = {
      startDateChanged: false,
      endDateChanged: false,
      attachmentChanged: false,
    };

    if (
      startDate &&
      new Date(startDate).toISOString() !==
        new Date(agreement.effectiveStartDate).toISOString()
    ) {
      changes.startDateChanged = true;
      agreement.effectiveStartDate = startDate;
    }

    if (
      endDate &&
      new Date(endDate).toISOString() !==
        new Date(agreement.effectiveEndDate).toISOString()
    ) {
      changes.endDateChanged = true;
      agreement.effectiveEndDate = endDate;
    }

    /* ======================
       ATTACHMENT UPDATE
    ====================== */
    if (req.file?.path) {
      changes.attachmentChanged = true;

      // delete old file AFTER upload succeeds
      const uploadedAttachment = await uploadAttachment(req.file.path);

      if (agreement.attachment?.fileUrl) {
        await deleteFromCloudinary(agreement.attachment.fileUrl);
      }

      agreement.attachment = uploadedAttachment;
    }

    /* ======================
       OTHER UPDATES
    ====================== */
    if (title) {
      agreement.title = title;
    }

    await agreement.save({ session });

    /* ======================
       CREATE NOTIFICATION
       (ONLY IF REQUIRED)
    ====================== */
    if (
      changes.startDateChanged ||
      changes.endDateChanged ||
      changes.attachmentChanged
    ) {
      const updatedParts = [];

      if (changes.startDateChanged || changes.endDateChanged) {
        updatedParts.push("validity period");
      }
      if (changes.attachmentChanged) {
        updatedParts.push("agreement document");
      }

      const readableParts =
        updatedParts.length === 1
          ? updatedParts[0]
          : updatedParts.slice(0, -1).join(", ") +
            " and " +
            updatedParts.slice(-1);

      const notification = await createNotification(
        {
          category: "collective_agreement",
          action: "updated",
          severity: "warning",
          title: "Collective agreement updated",
          message: `The ${readableParts} for "${agreement.title}" has been updated. Please review the latest version.`,
          link: `/agency_info?tab=collective_agreement&item=${agreement.slug}`,
          meta: {
            agreementId: agreement.slug,
            changes,
          },
          isGlobal: true, // usually agreements are global
          createdBy: req.user?._id,
        },
        session
      );
      io.emit("newNotification", notification);
    }

    await session.commitTransaction();

    return res
      .status(200)
      .json(new ApiResponse(200, "Agreement updated successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// --------------------------------------------------------
// DELETE — REMOVE AGREEMENT + Delete Cloudinary file
// --------------------------------------------------------
export const deleteCollectiveAgreement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const agreement = await CollectiveAgreement.findById(id);
  if (!agreement) {
    throw new ApiError(404, "Agreement not found");
  }

  // Delete file from Cloudinary
  if (agreement.attachment?.fileUrl) {
    await deleteFromCloudinary(agreement.attachment.fileUrl);
  }

  // Delete from DB
  await CollectiveAgreement.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Agreement deleted successfully"));
});
