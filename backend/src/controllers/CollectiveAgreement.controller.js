import CollectiveAgreement from "../model/Agreement.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";

import { getPdfPageCount } from "../helper/pdfpagecount.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utills/cloudinary.js";

import mongoose from "mongoose";
import { addActivityLog } from "../helper/addActivityLogs.js";

export const createCollectiveAgreement = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { title, startDate, endDate } = req.body;
    const { firstname, lastname } = req.user;
    const attachmentPath = req?.file?.path;

    if (!attachmentPath) {
      throw new ApiError(400, "Attachment file is missing");
    }

    // Count pages
    const [totalPages, uploadedFile] = await Promise.all([
      getPdfPageCount(attachmentPath),
      uploadOnCloudinary(attachmentPath),
    ]);
    if (!uploadedFile?.url) {
      throw new ApiError(500, "Attachment upload failed");
    }

    const attachmentData = {
      fileName: uploadedFile.original_filename || "manual",
      fileUrl: uploadedFile.secure_url,
      size: uploadedFile.bytes,
      totalPages,
      publicId: uploadedFile.public_id,
    };
    session.startTransaction();
    // Save in DB (inside transaction)
    const newAgreement = await CollectiveAgreement.create(
      [
        {
          title,
          attachment: attachmentData,
          effectiveStartDate: startDate,
          effectiveEndDate: endDate,
        },
      ],
      { session }
    );

    const savedAgreement = newAgreement[0];

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
    await session.abortTransaction();
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

  let agreement = await CollectiveAgreement.findById(id);
  if (!agreement) {
    throw new ApiError(404, "Agreement not found");
  }

  let updatedAttachment = agreement.attachment;

  // If user uploads a new file
  if (req.file?.path) {
    const attachmentPath = req.file.path;
    console.log("Attachment Path:", attachmentPath);
    // Delete old file from Cloudinary

    if (agreement.attachment?.publicId) {
      await deleteFromCloudinary(agreement.attachment.publicId);
    }
    const [totalPages, uploadedFile] = await Promise.all([
      getPdfPageCount(attachmentPath),
      uploadOnCloudinary(attachmentPath),
    ]);

    updatedAttachment = {
      fileName: uploadedFile.original_filename || "manual",
      fileUrl: uploadedFile.secure_url,
      size: uploadedFile.bytes,
      totalPages,
      publicId: uploadedFile.public_id,
    };
  }

  // Update DB
  agreement.title = title || agreement.title;
  agreement.attachment = updatedAttachment;
  agreement.effectiveStartDate = startDate || agreement.effectiveStartDate;
  agreement.effectiveEndDate = endDate || agreement.effectiveEndDate;

  await agreement.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Agreement updated successfully", agreement));
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
  if (agreement.attachment?.publicId) {
    await deleteFromCloudinary(agreement.attachment.publicId);
  }

  // Delete from DB
  await CollectiveAgreement.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Agreement deleted successfully"));
});
