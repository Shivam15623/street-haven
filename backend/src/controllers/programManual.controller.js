import mongoose from "mongoose";
import { io } from "../index.js";
import ProgramManual from "../model/programManuals.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { createNotification } from "../helper/CreateNotoification.js";
import { addActivityLog } from "../helper/addActivityLogs.js";
import { uploadAttachment } from "./meetingMinutes.controller.js";

export const AddProgramManual = asyncHandler(async (req, res) => {
  const { title, description, tags, type } = req.body;
  const { _id: userId, firstname, lastname } = req.user;
  const attachmentpath = req?.file?.path; // Fix typo

  if (!attachmentpath) throw new ApiError(400, "Attachment file is missing");

  const attachmentData = await uploadAttachment(attachmentpath);

  // Phase 2: Minimal transaction - DB only
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // Create Program Manual within the session
    const programmanual = await ProgramManual.create(
      [
        {
          title,
          description,
          tags,
          type,
          createdBy: userId,
          attachment: attachmentData,
        },
      ],
      { session }
    );

    if (!programmanual || programmanual.length === 0) {
      throw new ApiError(500, "Server Error");
    }

    // Create Notification within the session
    const notification = await createNotification(
      {
        action: "created",
        category: "program_mannual",
        severity: "info",
        title: "New Program Manual Added",
        message: `${firstname} added a new Program Manual: "${title}"`,
        link: `/programs&manuals?slug=${programmanual[0].slug}`,
        createdBy: userId,
        isGlobal: true,
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        meta: { programManualId: programmanual[0].slug },
      },

      session
    );
    await addActivityLog(
      {
        actionType: "PROGRAM_MANNUAL_CREATED",
        performedBy: {
          id: req.user?._id,
          name: `${firstname} ${lastname}`,
          type: "user",
        },
        message: `A new program manual has been created: ${title}`,

        meta: {
          recordId: programmanual._id,
          moduleName: "ProgramManual",
        },
      },
      session // <-- pass session
    );
    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Emit real-time notifications outside transaction

    io.emit("newNotification", notification);

    return res
      .status(200)
      .json(
        new ApiResponse(
          201,
          "Program Manual added and notifications sent successfully"
        )
      );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
});

// 📌 Edit Program Manual
export const EditProgramManual = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, tags, type } = req.body;

  const programManual = await ProgramManual.findById(id);
  if (!programManual) {
    throw new ApiError(404, "Program Manual not found");
  }

  const updates = {};
  let attachmentChanged = false;

  if (title && title !== programManual.title) {
    updates.title = title;
  }

  if (description && description !== programManual.description) {
    updates.description = description;
  }

  if (tags && JSON.stringify(tags) !== JSON.stringify(programManual.tags)) {
    updates.tags = tags;
  }

  if (type && type !== programManual.type) {
    updates.type = type;
  }

  /* ======================
     ATTACHMENT UPDATE
     (NOTIFY USERS)
  ====================== */
  if (req?.file?.path) {
    const attachmentData = await uploadAttachment(req.file.path);

    const currentAttachment = programManual.attachment || {};

    if (
      attachmentData.fileUrl !== currentAttachment.fileUrl ||
      attachmentData.fileName !== currentAttachment.fileName ||
      attachmentData.size !== currentAttachment.size
    ) {
      updates.attachment = attachmentData;
      attachmentChanged = true;
    }
  }

  if (Object.keys(updates).length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, programManual, "No changes detected"));
  }

  const updatedManual = await ProgramManual.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  /* ======================
     NOTIFICATION
     (ONLY FOR ATTACHMENT)
  ====================== */
  if (attachmentChanged) {
    const notification = await createNotification({
      category: "program_mannual",
      action: "updated",
      severity: "info",
      title: "Program manual updated",
      message: `The program manual "${updatedManual.title}" has been updated. Please refer to the latest version.`,
      link: `/programs&manuals?slug=${updatedManual.slug}`,
      isGlobal: true,
      createdBy: req.user?._id,
      meta: {
        manualId: updatedManual.slug,
        attachmentUpdated: true,
      },
    });
    io.emit("newNotification", notification);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Program Manual updated successfully"));
});

export const DeleteProgramManual = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const programManual = await ProgramManual.findById(id);
  if (!programManual) {
    throw new ApiError(404, "Program Manual not found");
  }

  // ✅ Safely check for attachment + fileUrl
  const fileUrl = programManual?.attachment?.fileUrl;
  if (fileUrl) {
    try {
      await deleteFromCloudinary(fileUrl);
    } catch (err) {
      console.error("Error deleting from Cloudinary:", err.message);
      // ❓ Choice: abort vs continue
      // If you want to block deletion when Cloudinary fails, uncomment below:
      // throw new ApiError(500, "Failed to delete file from Cloudinary");
    }
  }

  await ProgramManual.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Program Manual deleted successfully"));
});

export const GetProgramManuals = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    type,
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
      { tags: { $regex: search, $options: "i" } },
      { type: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by type (if given)
  if (type) {
    query.type = type;
  }

  const manuals = await ProgramManual.find(query)
    .populate("createdBy", "firstname lastname email") // optional
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalCount = await ProgramManual.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Program Manuals fetched successfully", {
      manuals,
      paggination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  );
});
