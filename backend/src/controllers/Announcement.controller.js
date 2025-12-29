import mongoose from "mongoose";
import Announcement from "../model/announcement.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import path from "path";
import { createNotification } from "../helper/CreateNotoification.js";
import { io } from "../index.js";
import { addActivityLog } from "../helper/addActivityLogs.js";

// ----------------------------------------
// Create Announcement
// ----------------------------------------
export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  const { _id: userId, firstname, lastname } = req.user;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!title || !message) {
      throw new ApiError(400, "Title and message are required");
    }

    let attachment = null;

    // Handle file upload
    if (req?.file?.path) {
      const uploadedFile = await uploadOnCloudinary(req.file.path);

      if (!uploadedFile?.secure_url) {
        throw new ApiError(500, "Attachment upload failed");
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      let type = "other";

      if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext))
        type = "image";
      else if ([".mp4", ".mov", ".avi", ".mkv"].includes(ext)) type = "video";
      else if ([".mp3", ".wav", ".ogg"].includes(ext)) type = "audio";
      else if ([".pdf"].includes(ext)) type = "pdf";
      else if ([".doc", ".docx"].includes(ext)) type = "doc";
      else if ([".xls", ".xlsx"].includes(ext)) type = "excel";
      else if ([".zip", ".rar"].includes(ext)) type = "zip";

      attachment = {
        fileName: uploadedFile.original_filename,
        fileUrl: uploadedFile.secure_url,
        size: uploadedFile.bytes,
        fileType: type,
      };
    }

    const newAnnouncement = await Announcement.create(
      [
        {
          title,
          message,
          createdBy: userId,
          attachment,
        },
      ],
      { session }
    );
    const announcement = newAnnouncement[0];
    const notification = await createNotification(
      {
        action: "created",
        severity:"info",
        category: "announcement",
        title: "New Announcement",
        message: `The new Announcement "${title}" has been created by ${firstname} ${lastname}.`,
        link: `/agency_info/${announcement._id}`,
        isGlobal: true, // ✅ no per-user mappings
        createdBy: userId,
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        meta: { announcementId: announcement._id },
      },
      session
    );

    io.emit("newNotification", notification);
    await addActivityLog(
      {
        actionType: "ANNOUNCEMENT_CREATED",
        performedBy: {
          id: req.user?._id,
          name: `${firstname} ${lastname}`,
          type: "user",
        },
        message: `A new announcement has been created: ${title}`,
        meta: {
          recordId: announcement._id,
          moduleName: "Announcement",
        },
      },
      session // <-- pass session
    );
    await session.commitTransaction();
    session.endSession();
    return res
      .status(201)
      .json(new ApiResponse(201, "New Announcement Added!"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, error.message || "Something went wrong!");
  }
});

// ----------------------------------------
// Edit Announcement
// ----------------------------------------
export const editAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, message } = req.body;

  let updateData = {};
  if (title) updateData.title = title;
  if (message) updateData.message = message;

  // Replace attachment if new file uploaded
  if (req?.file?.path) {
    const uploadedFile = await uploadOnCloudinary(req.file.path);

    if (!uploadedFile?.secure_url) {
      throw new ApiError(500, "Attachment upload failed");
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let type = "other";

    if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext))
      type = "image";
    else if ([".mp4", ".mov", ".avi", ".mkv"].includes(ext)) type = "video";
    else if ([".mp3", ".wav", ".ogg"].includes(ext)) type = "audio";
    else if ([".pdf"].includes(ext)) type = "pdf";
    else if ([".doc", ".docx"].includes(ext)) type = "doc";
    else if ([".xls", ".xlsx"].includes(ext)) type = "excel";
    else if ([".zip", ".rar"].includes(ext)) type = "zip";

    updateData.attachment = {
      fileName: uploadedFile.original_filename,
      fileUrl: uploadedFile.secure_url,
      size: uploadedFile.bytes,
      fileType: type,
    };
  }

  const updated = await Announcement.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!updated) throw new ApiError(404, "Announcement not found");

  return res
    .status(201)
    .json(new ApiResponse(201, `Announcement Updated Successfully`));
});

// ----------------------------------------
// Delete Announcement
// ----------------------------------------
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const removed = await Announcement.findByIdAndDelete(id);

  if (!removed) throw new ApiError(404, "Announcement not found");

  return res
    .status(201)
    .json(new ApiResponse(201, `Announcement Deleted Successfully`));
});

// ----------------------------------------
// Fetch All or Single Announcement
// ----------------------------------------
export const fetchAnnouncement = asyncHandler(async (req, res) => {
  const { id, page = 1, limit = 10, keyword = "" } = req.query;

  // ------------------------------------
  // If ID is provided → fetch single doc
  // ------------------------------------
  if (id) {
    const announcement = await Announcement.findById(id).populate("createdBy");

    if (!announcement) throw new ApiError(404, "Announcement not found");

    return res.json({
      success: true,
      data: announcement,
    });
  }

  let filter = {};

  if (keyword && keyword.trim() !== "") {
    filter = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { message: { $regex: keyword, $options: "i" } },
      ],
    };
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const totalAnnouncements = await Announcement.countDocuments(filter);

  const announcements = await Announcement.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate("createdBy", "firstname lastname");

  res.status(200).json(
    new ApiResponse(200, "Upcoming Events fetched successfully", {
      announcements: announcements,
      paggination: {
        total: totalAnnouncements,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalAnnouncements / Number(limit)),
      },
    })
  );
});
export const recentAnnouncementCount = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Set to midnight 00:00:00.000
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const count = await Announcement.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, `Recent Announcements fetched Successfully`, count)
    );
});
