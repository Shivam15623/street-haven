import { getPdfPageCount } from "../helper/pdfpagecount.js";
import MeetingMinutes from "../model/meetingminutes.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";

export const addMeetingMinutes = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const { title, attendees, keyTopicsDiscussed, meetingDate, keyHighlights } =
    req.body;
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
  const meetingminutes = await MeetingMinutes.create({
    title: title,
    attendees: attendees,
    createdBy: userId,
    keyHighlights: keyHighlights,
    meetingDate: meetingDate,
    keyTopicsDiscussed: keyTopicsDiscussed,
    attachment: attachmentData,
  });
  if (!meetingminutes) {
    throw new ApiError(500, "Server side Error");
  }
  return res.status(200).json(new ApiResponse(201, "townhall minutes created"));
});
export const editMeetingMinutes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, attendees, keyTopicsDiscussed, meetingDate, keyHighlights } =
    req.body;

  const meetingMinutes = await MeetingMinutes.findById(id);
  if (!meetingMinutes) {
    throw new ApiError(404, "Meeting minutes not found");
  }

  const updates = {};

  // Only update if value has changed
  if (title && title !== meetingMinutes.title) updates.title = title;
  if (attendees && attendees !== meetingMinutes.attendees)
    updates.attendees = attendees;

  if (
    keyTopicsDiscussed &&
    JSON.stringify(keyTopicsDiscussed) !==
      JSON.stringify(meetingMinutes.keyTopicsDiscussed)
  ) {
    updates.keyTopicsDiscussed = keyTopicsDiscussed;
  }
  console.log("trecd", meetingDate === meetingMinutes.meetingDate);
  if (meetingDate && meetingDate !== meetingMinutes.meetingDate) {
    console.log(meetingDate, meetingMinutes.meetingDate);
    updates.meetingDate = meetingDate;
  }

  if (
    keyHighlights &&
    JSON.stringify(keyHighlights) !==
      JSON.stringify(meetingMinutes.keyHighlights)
  ) {
    updates.keyHighlights = keyHighlights;
  }

  // Handle new file upload if provided
  if (req?.file?.path) {
    const totalPages = await getPdfPageCount(req.file.path);
    const uploadedFile = await uploadOnCloudinary(req.file.path);

    if (!uploadedFile?.url) {
      throw new ApiError(500, "Attachment upload failed");
    }

    const newAttachment = {
      fileName: uploadedFile.original_filename || "meeting-minutes",
      fileUrl: uploadedFile.url,
      size: uploadedFile.bytes,
      totalPages: totalPages,
    };

    // Only update if file changed
    if (
      !meetingMinutes.attachment ||
      meetingMinutes.attachment.fileUrl !== newAttachment.fileUrl
    ) {
      updates.attachment = newAttachment;
    }
  }
  console.log("updates", updates);
  // ✅ No changes → skip DB write
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
    .json(new ApiResponse(200,"Meeting minutes deleted successfully"));
});
export const getMeetingMinutes = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "meetingDate",
    order = "desc",
  } = req.query;

  const query = {};

  // Search in title, keyHighlights, topics, attendees
  if (search) {
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
