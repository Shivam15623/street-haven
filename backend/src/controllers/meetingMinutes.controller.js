import mongoose from "mongoose";
import { createNotification } from "../helper/CreateNotoification.js";
import MeetingMinutes from "../model/meetingminutes.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import path from "path";
import { io } from "../index.js";

/** -----------------------------------------
 *  Common File-Type Detection Utility
 * ----------------------------------------- */
export const typeMap = {
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  video: [".mp4", ".mov", ".avi", ".mkv"],
  audio: [".mp3", ".wav", ".ogg"],
  pdf: [".pdf"],
  doc: [".doc", ".docx"],
  ppt: [".ppt", ".pptx"],
  excel: [".xls", ".xlsx"],
  zip: [".zip", ".rar"],
};

export const detectFileType = (ext) => {
  return (
    Object.keys(typeMap).find((key) => typeMap[key].includes(ext)) || "other"
  );
};

/** -----------------------------------------
 *  Upload File Helper
 * ----------------------------------------- */
export const uploadAttachment = async (filePath) => {
  const uploaded = await uploadOnCloudinary(filePath);
  if (!uploaded || !uploaded.secure_url) {
    throw new ApiError(500, "Attachment upload failed");
  }

  const ext = path.extname(uploaded?.originalname || "").toLowerCase();
  return {
    fileName: uploaded.original_filename || "file",
    fileUrl: uploaded.secure_url,
    size: uploaded.bytes,
    fileType: detectFileType(ext),
  };
};

/** -----------------------------------------
 *  Add Meeting Minutes
 * ----------------------------------------- */
export const addMeetingMinutes = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { _id: userId } = req.user;
    const { title, attendees, keyTopicsDiscussed, meetingDate, keyHighlights } =
      req.body;

    if (!req?.file?.path) {
      throw new ApiError(400, "Attachment file is missing");
    }

    const attachmentData = await uploadAttachment(req.file.path);
    session.startTransaction();
    const meetingMinutes = await MeetingMinutes.create(
      [
        {
          title,
          attendees,
          createdBy: userId,
          keyTopicsDiscussed,
          meetingDate,
          keyHighlights,
          attachment: attachmentData,
        },
      ],
      { session }
    );

    if (!meetingMinutes) {
      throw new ApiError(500, "Server error while creating meeting minutes");
    }

    const savedMinute = meetingMinutes[0];
    const notification = await createNotification(
      {
        action: "created",
        category: "event_minute",
        severity: "info",
        title: "Event Minutes Available",
        message: `Minutes for "${title}" are now available. Click to view.`,
        link: `/agency_info?tab=event_minutes&item=${savedMinute.slug}`,
        isGlobal: true, // ✅ no per-user mappings
        createdBy: userId,
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        meta: {
          minuteId: savedMinute.slug,
          page: "agency_info",
          tab: "event_minutes",
        },
      },
      session
    );

    io.emit("newNotification", notification);
    await session.commitTransaction();
    session.endSession();
    return res
      .status(201)
      .json(new ApiResponse(201, "Meeting minutes created successfully"));
  } catch (error) {
    // Rollback
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

/** -----------------------------------------
 *  Edit Meeting Minutes
 * ----------------------------------------- */
export const editMeetingMinutes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, attendees, keyTopicsDiscussed, meetingDate, keyHighlights } =
    req.body;

  const meetingMinutes = await MeetingMinutes.findById(id);
  if (!meetingMinutes) {
    throw new ApiError(404, "Meeting minutes not found");
  }

  const updates = {};

  if (title && title !== meetingMinutes.title) updates.title = title;

  if (
    attendees &&
    JSON.stringify(attendees) !== JSON.stringify(meetingMinutes.attendees)
  )
    updates.attendees = attendees;

  if (
    keyTopicsDiscussed &&
    JSON.stringify(keyTopicsDiscussed) !==
      JSON.stringify(meetingMinutes.keyTopicsDiscussed)
  )
    updates.keyTopicsDiscussed = keyTopicsDiscussed;

  if (meetingDate && meetingDate !== meetingMinutes.meetingDate)
    updates.meetingDate = meetingDate;

  if (
    keyHighlights &&
    JSON.stringify(keyHighlights) !==
      JSON.stringify(meetingMinutes.keyHighlights)
  )
    updates.keyHighlights = keyHighlights;

  // Handle new file upload
  if (req?.file?.path) {
    const newAttachment = await uploadAttachment(req.file.path);
    if (newAttachment) {
      const fileUrl = meetingMinutes?.attachment?.fileUrl;
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
    }

    if (
      !meetingMinutes.attachment ||
      meetingMinutes.attachment.fileUrl !== newAttachment.fileUrl
    ) {
      updates.attachment = newAttachment;
    }
  }

  // If no changes
  if (Object.keys(updates).length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No changes detected, nothing updated"));
  }

  const updatedMeetingMinutes = await MeetingMinutes.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedMeetingMinutes) {
    throw new ApiError(500, "Error while updating meeting minutes");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Meeting minutes updated successfully",
        updatedMeetingMinutes
      )
    );
});

export const deleteMeetingMinutes = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const meetingMinutes = await MeetingMinutes.findById(id);
  if (!meetingMinutes) {
    throw new ApiError(404, "Meeting minutes not found");
  }
  const fileUrl = meetingMinutes?.attachment?.fileUrl;
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
  await MeetingMinutes.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Meeting minutes deleted successfully"));
});
export const getMeetingMinutes = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    slug = "",
    sortBy = "meetingDate",
    order = "desc",
  } = req.query;

  const query = {};

  // Search in title, keyHighlights, topics, attendees
  if (slug) {
    query.slug = slug; // exact match
  } else if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { keyHighlights: { $regex: search, $options: "i" } },
      { keyTopicsDiscussed: { $regex: search, $options: "i" } },
      { attendees: { $regex: search, $options: "i" } },
    ];
  }

  const meetingMinutes = await MeetingMinutes.find(query)
    .populate("createdBy", "firstname lastname email") // optional
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalCount = await MeetingMinutes.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Meeting minutes fetched successfully", {
      meetingMinutes,
      paggination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  );
});
