import { getPdfPageCount } from "../helper/pdfpagecount.js";
import ProgramManual from "../model/programManuals.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
export const AddProgramManual = asyncHandler(async (req, res) => {
  const { title, description, tags, type } = req.body;
  const { _id: userId } = req.user;
  const atttchmentpath = req?.file?.path;
  if (!atttchmentpath) {
    throw new ApiError(400, "attachment file is missing");
  }
  const totalPages = await getPdfPageCount(atttchmentpath);

  const uploadedFile = await uploadOnCloudinary(atttchmentpath);

  if (!uploadedFile?.url) {
    throw new ApiError(500, "attachment upload failed");
  }

  const attachmentData = {
    fileName: uploadedFile.original_filename || "manual",
    fileUrl: uploadedFile.url,
    size: uploadedFile.bytes, // Cloudinary gives bytes
    totalPages: totalPages,
  };
  const programmanual = await ProgramManual.create({
    title: title,
    description: description,
    tags: tags,
    type: type,
    createdBy: userId,
    attachment: attachmentData,
  });
  if (!programmanual) {
    throw new ApiError(500, "server Error");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, "program Mannual Added Successfully "));
});
// 📌 Edit Program Manual
export const EditProgramManual = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, tags, type } = req.body;
  console.log("called", title, description, tags, type);

  const programManual = await ProgramManual.findById(id);
  if (!programManual) {
    throw new ApiError(404, "Program Manual not found");
  }

  const updates = {};

  // Only update fields that are different
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

  // If a new file is uploaded
  if (req?.file?.path) {
    const totalPages = await getPdfPageCount(req.file.path);
    const uploadedFile = await uploadOnCloudinary(req.file.path);

    if (!uploadedFile?.url) {
      throw new ApiError(500, "Attachment upload failed");
    }

    const attachmentData = {
      fileName: uploadedFile.original_filename || "manual",
      fileUrl: uploadedFile.url,
      size: uploadedFile.bytes,
      totalPages,
    };

    // Only update if different (by URL or size or filename etc.)
    const currentAttachment = programManual.attachment || {};
    if (
      attachmentData.fileUrl !== currentAttachment.fileUrl ||
      attachmentData.fileName !== currentAttachment.fileName ||
      attachmentData.size !== currentAttachment.size ||
      attachmentData.totalPages !== currentAttachment.totalPages
    ) {
      updates.attachment = attachmentData;
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

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedManual, "Program Manual updated successfully")
    );
});

// 📌 Delete Program Manual
// 📌 Delete Program Manual
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
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query = {};

  // If search query exists → search in title, description, and tags
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
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
