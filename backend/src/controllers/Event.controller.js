import mongoose from "mongoose";
import Event from "../model/event.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import path from "path";
import { io } from "../index.js";
import { createNotification } from "../helper/CreateNotoification.js";
import { addActivityLog } from "../helper/addActivityLogs.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    locationName,
    locationUrl,
    facilitator,
    capacity,
    eventDate,
    startTime,
    endTime,
  } = req.body;
  const { _id: userId, firstname, lastname } = req.user;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newEvent = await Event.create(
      [
        {
          title,
          description,
          location: {
            location_name: locationName,
            location_url: locationUrl,
          },
          facilitator,
          capacity,
          eventDate,
          createdBy: userId,
          startTime,
          endTime,
        },
      ],
      { session }
    );

    const event = newEvent[0];
    if (!event) throw new ApiError(500, "Event creation failed");

    // 🔔 Create notification for event creation
    const notification = await createNotification(
      {
        type: "event_activity",
        title: "New Event Created",
        message: `The event "${title}" has been created by ${firstname} ${lastname}.`,
        link: `/events/${event._id}`,
        isGlobal: true, // ✅ no per-user mappings
        createdBy: userId,
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        meta: { eventId: event._id },
      },
      session
    );

    io.emit("newNotification", notification);
    await addActivityLog(
      {
        actionType: "EVENT_CREATED",
        performedBy: {
          id: req.user?._id,
          name: `${firstname} ${lastname}`,
          type: "user",
        },
        message: `A new event has been created: ${title}`,

        meta: {
          recordId: newEvent._id,
          moduleName: "event",
        },
      },
      session // <-- pass session
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(new ApiResponse(201, "New Event Added!"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, error.message || "Something went wrong!");
  }
});

export const editEvent = asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;

  const {
    title,
    description,
    locationName,
    locationUrl,
    facilitator,
    capacity,
    eventDate,
  } = req.body;

  const updateData = {};

  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (facilitator) updateData.facilitator = facilitator;
  if (capacity) updateData.capacity = capacity;
  if (eventDate) updateData.eventDate = eventDate;

  // For nested object location
  if (locationName || locationUrl) {
    updateData.location = {};
    if (locationName) updateData.location.location_name = locationName;
    if (locationUrl) updateData.location.location_url = locationUrl;
  }

  const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
    new: true, // return updated document
    runValidators: true,
  });

  if (!updatedEvent) {
    throw new ApiError(404, "Event does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Event updated successfully", updatedEvent));
});

export const GetUpcomingEvents = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;

  const {
    page = 1,
    limit = 10,
    search = "",
    slug = "",
    sortBy = "eventDate",
    order = "asc",
  } = req.query;

  const query = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Only upcoming events
  query.eventDate = { $gte: today };

  // Slug overrides search
  if (slug) {
    query.slug = slug;
  } else if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  const upcomingEvents = await Event.find(query)
    .populate("createdBy", "firstname lastname")
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const totalEvents = await Event.countDocuments(query);

  // Add `isRegistered` for current user
  const eventsWithRegistration = upcomingEvents.map((event) => {
    const isRegistered = event.registeredUsers
      ? event.registeredUsers.includes(userId)
      : false;
    return {
      ...event.toObject(),
      isRegistered,
    };
  });

  res.status(200).json(
    new ApiResponse(200, "Upcoming Events fetched successfully", {
      events: eventsWithRegistration,
      paggination: {
        total: totalEvents,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalEvents / Number(limit)),
      },
    })
  );
});
export const GetPastEvents = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;

  const {
    page = 1,
    limit = 10,
    search = "",
    slug = "",
    sortBy = "eventDate",
    order = "desc", // Usually you want latest past events first
  } = req.query;

  const query = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Only past events
  query.eventDate = { $lt: today };

  // Slug overrides search
  if (slug) {
    query.slug = slug;
  } else if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  const pastEvents = await Event.find(query)
    .populate("createdBy", "firstname lastname")
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const totalEvents = await Event.countDocuments(query);

  // Add `isRegistered` for current user
  const eventsWithRegistration = pastEvents.map((event) => {
    const isRegistered = event.registeredUsers
      ? event.registeredUsers.includes(userId)
      : false;
    return {
      ...event.toObject(),
      isRegistered,
    };
  });

  res.status(200).json(
    new ApiResponse(200, "Past Events fetched successfully", {
      events: eventsWithRegistration,
      paggination: {
        total: totalEvents,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalEvents / Number(limit)),
      },
    })
  );
});

export const EventsCalendar = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const { startDate, endDate } = req.body;
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Start date and end date are required" });
  }
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // include whole end day

  const events = await Event.find({
    eventDate: { $gte: start, $lte: end },
  })
    .populate("createdBy", "firstname lastname")
    .sort({ eventDate: 1 });
  // Add `isRegistered` for current user
  const eventsWithRegistration = events.map((event) => {
    const isRegistered = event.registeredUsers
      ? event.registeredUsers.includes(userId)
      : false;
    return {
      ...event.toObject(),
      isRegistered,
    };
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        201,
        "events fetched Successfully",
        eventsWithRegistration
      )
    );
});
export const EventSignUp = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id: eventId } = req.params;
    const { _id: userId, firstname, lastname } = req.user;

    const event = await Event.findOne({
      _id: eventId,
      eventDate: { $gte: new Date() },
    }).session(session);

    if (!event) throw new ApiError(404, "Event not found");
    if (event.registeredUsers.includes(userId))
      throw new ApiError(400, "User already registered for this event");
    if (event.registeredUsers.length >= event.capacity)
      throw new ApiError(400, "Event capacity reached");

    // ✅ Add user to registered list
    event.registeredUsers.push(userId);
    await event.save({ session });

    const notification = await createNotification(
      {
        recipients: [userId],
        type: "event_activity",
        title: "Event Registration Successful",
        message: `You have successfully registered for "${event.title}".`,
        link: `/events/${event._id}`,
        createdBy: userId,
        expireAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        meta: {
          eventId: event._id,
          eventTitle: event.title,
          action: "signup",
          performedBy: userId,
        },
      },
      session
    );

    io.to(`user_${userId.toString()}`).emit("newNotification", notification);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(
      new ApiResponse(200, {
        success: true,
        message: "User registered for the event successfully",
      })
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

export const EventSignOut = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id: eventId } = req.params;
    const { _id: userId, firstname, lastname } = req.user;

    const event = await Event.findOne({
      _id: eventId,
      eventDate: { $gte: new Date() },
    }).session(session);

    if (!event) throw new ApiError(404, "Event not found");
    if (!event.registeredUsers.includes(userId))
      throw new ApiError(400, "You are not registered for this event");

    // ✅ Remove user from registered list
    event.registeredUsers = event.registeredUsers.filter(
      (id) => id.toString() !== userId.toString()
    );
    await event.save({ session });

    // ✅ Create sign-out notification

    const notification = await createNotification(
      {
        recipients: [userId],
        type: "event_activity",
        title: "Event Registration Cancelled",
        message: `You have cancelled your registration for "${event.title}".`,
        link: `/events/${event._id}`,
        createdBy: userId,
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        meta: {
          eventId: event._id,
          eventTitle: event.title,
          action: "signout",
          performedBy: userId,
        },
      },
      session
    );

    io.to(`user_${userId.toString()}`).emit("newNotification", notification);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(
      new ApiResponse(200, {
        success: true,
        message: "User unregistered from the event successfully",
      })
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

export const fetchRegisterations = asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;

  if (!eventId) {
    return res.status(400).json({ message: "Event ID is required" });
  }

  // Populate registered users
  const event = await Event.findById(eventId)
    .populate("registeredUsers", "firstname lastname email phoneNo slug") // choose fields
    .select("title registeredUsers totalRegistered capacity");

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "User unregistered from the event successfully",
        event
      )
    );
});

export const EventDetails = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const findevent = await Event.findOne({ slug: slug }).populate(
    "createdBy",
    "firstname lastname"
  );
  if (!findevent) {
    throw new ApiError(400, "No Such Event Found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `Event data of ${findevent.title} fetched`,
        findevent
      )
    );
});

export const uploadEventDocuments = asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;
  const userId = req.user?._id;
  const files = req.files || [];

  // 1. Fetch event once
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found");

  const now = new Date();

  // 2. Auto-update status if event is completed
  if (event.endTime < now && event.status !== "completed") {
    event.status = "completed";
    await event.save();
  }

  // 3. Block uploads if event is NOT completed
  if (event.endTime > now) {
    throw new ApiError(400, "Event is not completed yet");
  }

  // 4. If no files, return directly
  if (files.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No files uploaded", event));
  }

  // 5. File type map (faster lookup)
  const typeMap = {
    image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    video: [".mp4", ".mov", ".avi", ".mkv"],
    audio: [".mp3", ".wav", ".ogg"],
    pdf: [".pdf"],
    doc: [".doc", ".docx"],
    ppt: [".ppt", ".pptx"],
    excel: [".xls", ".xlsx"],
    zip: [".zip", ".rar"],
  };

  const detectFileType = (ext) => {
    return (
      Object.keys(typeMap).find((key) => typeMap[key].includes(ext)) || "other"
    );
  };

  // 6. Upload all files in parallel
  const attachments = await Promise.all(
    files.map(async (file) => {
      const uploaded = await uploadOnCloudinary(file.path);

      if (!uploaded?.secure_url) {
        throw new ApiError(500, `Upload failed for ${file.originalname}`);
      }

      const ext = path.extname(file.originalname).toLowerCase();
   

      return {
        fileName: uploaded.original_filename,
        fileUrl: uploaded.secure_url,
        size: uploaded.bytes,
        fileType: detectFileType(ext),
        uploadedAt: new Date(),
        uploadedBy: userId,
      };
    })
  );

  // 7. Merge new attachments with old ones
  event.documents = [...event.documents, ...attachments];
  await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Attachments uploaded", event));
});

export const deleteEventDocument = asyncHandler(async (req, res) => {
  const { eventId, docId } = req.params;
  const userId = req.user?._id;

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found");

  // Find the document inside the event's documents array
  const document = event.documents.id(docId);
  if (!document) throw new ApiError(404, "Document not found");

  // Optional: restrict document deletion to uploader
  // if (String(document.uploadedBy) !== String(userId)) {
  //   throw new ApiError(403, "You cannot delete this document");
  // }

  // Remove the document from array
  document.deleteOne();

  await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Document deleted successfully", event));
});
