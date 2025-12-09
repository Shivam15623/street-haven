import mongoose from "mongoose";
import { addActivityLog } from "../helper/addActivityLogs.js";
import { getPdfPageCount } from "../helper/pdfpagecount.js";
import HRupdate from "../model/hrupdate.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utills/cloudinary.js";

export const createhrUpdate = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { _id: userId, firstname, lastname } = req.user;

  const attachmentPath = req?.file?.path;
  if (!attachmentPath) {
    throw new ApiError(400, "Attachment file is missing");
  }

  // Start MongoDB session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Count PDF pages
    const totalPages = await getPdfPageCount(attachmentPath);

    // Upload file to Cloudinary
    const uploadedFile = await uploadOnCloudinary(attachmentPath);
    if (!uploadedFile?.secure_url) {
      throw new ApiError(500, "Attachment upload failed");
    }

    const attachmentData = {
      fileName: uploadedFile.original_filename || "manual",
      fileUrl: uploadedFile.secure_url,
      size: uploadedFile.bytes,
      totalPages,
    };

    // Create HR Update
    const hrUpdate = await HRupdate.create(
      [
        {
          title,
          description,
          attachment: attachmentData,
          createdBy: userId,
        },
      ],
      { session }
    );
    const hrUpdateDoc = hrUpdate[0];

    // Add Activity Log
    await addActivityLog(
      {
        actionType: "HR_UPDATE_CREATED",
        performedBy: {
          id: userId,
          name: `${firstname} ${lastname}`,
          type: "user",
        },
        message: `A new HR update has been added: ${title}`,
        meta: {
          recordId: hrUpdateDoc._id,
          moduleName: "HRupdate",
          attachment: attachmentData,
        },
      },
      session
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(new ApiResponse(201, "HR Update Added Successfully"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, error.message || "Something went wrong!");
  }
});

// Edit HR Update
export const edithrUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const hrupdate = await HRupdate.findById(id);

  if (!hrupdate) {
    throw new ApiError(404, "HR Update not found");
  }

  // If a new file is uploaded, replace old attachment
  if (req?.file?.path) {
    // Optionally delete old file from cloudinary
    if (hrupdate.attachment?.fileUrl) {
      await deleteFromCloudinary(hrupdate.attachment.fileUrl);
    }

    const uploadedFile = await uploadOnCloudinary(req.file.path);

    if (!uploadedFile?.url) {
      throw new ApiError(500, "Attachment upload failed");
    }

    hrupdate.attachment = {
      fileName: uploadedFile.original_filename || "manual",
      fileUrl: uploadedFile.secure_url,
      size: uploadedFile.bytes,
    };
  }

  // Update title & description
  if (title) hrupdate.title = title;
  if (description) hrupdate.description = description;

  await hrupdate.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "HR Update Edited Successfully"));
});

// Delete HR Update
export const deletehrUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hrupdate = await HRupdate.findById(id);

  if (!hrupdate) {
    throw new ApiError(404, "HR Update not found");
  }

  // Optionally delete attachment from Cloudinary
  if (hrupdate.attachment?.fileUrl) {
    await deleteFromCloudinary(hrupdate.attachment.fileUrl);
  }

  await hrupdate.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, "HR Update Deleted Successfully"));
});
export const viewhrUpdate = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    slug = "",
    sortBy = "createdAt",
    order = "desc",
  } = req.query;
  const query = {};

  // If search query exists → search in title, description, and tags
  if (slug) {
    query.slug = slug; // exact match
  } else if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const hrupdates = await HRupdate.find(query)
    .populate("createdBy", "firstname lastname email")
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalhrupdates = await HRupdate.countDocuments(query);
  return res.status(200).json(
    new ApiResponse(200, "Program Manuals fetched successfully", {
      hrupdates,
      paggination: {
        total: totalhrupdates,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalhrupdates / limit),
      },
    })
  );
});
