import Event from "../model/event.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    location,
    facilitator,
    capacity,
    eventDate,
    startTime,
    endTime,
  } = req.body;
  const { _id: userId } = req.user;

  const newEvent = await Event.create({
    title: title,
    description: description,
    location: location,
    facilitator: facilitator,
    capacity: capacity,
    eventDate: eventDate,
    createdBy: userId,
    startTime: startTime,
    endTime: endTime,
  });
  const findEvent = await Event.findById(newEvent._id);

  if (!findEvent) {
    throw ApiError(500, "Something Wrong happened !");
  }
  return res.status(200).json(new ApiResponse(201, "new Event Added!"));
});
export const editEvent = asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;

  const { title, description, location, facilitator, capacity, eventDate } =
    req.body;

  const existEvent = await Event.findById(eventId);
  if (!existEvent) {
    throw new ApiError(404, "Event Does Not Exists");
  }

  existEvent.title = title;
  existEvent.description = description;
  existEvent.location = location;
  existEvent.facilitator = facilitator;
  existEvent.capacity = capacity;
  existEvent.eventDate = eventDate;

  await existEvent.save();
  return res
    .status(200)
    .json(new ApiResponse(201, "Event Edited SuccessFully"));
});
export const GetUpcomingEvents = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = await Event.find({
    eventDate: { $gte: today },
  })
    .sort({ eventDate: 1 })
    .populate("createdBy", "firstname lastname");

  // Map through events to add `isRegistered`
  const eventsWithRegistration = upcomingEvents.map((event) => {
    const isRegistered = event.registeredUsers
      ? event.registeredUsers.includes(userId)
      : false; // if registrations field exists in Event
    return {
      ...event.toObject(),
      isRegistered,
    };
  });
  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        "All Upcoming Events Fetched Successfully",
        eventsWithRegistration
      )
    );
});
export const EventsCalendar = asyncHandler(async (req, res) => {
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
  }).sort({ eventDate: 1 });

  return res
    .status(200)
    .json(new ApiResponse(201, "events fetched Successfully", events));
});
export const EventSignUp = asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;
  const { _id: userId } = req.user;
  const event = await Event.findOne({
    _id: eventId,
    eventDate: { $gte: new Date() },
  });
  if (!event) {
    throw new ApiError(404, "Event Not Found");
  }
  if (event.registeredUsers.includes(userId)) {
    throw new ApiError(400, "User already registered for this event");
  }
  if (event.registeredUsers.length >= event.capacity) {
    throw new ApiError(400, "Event capacity reached");
  }
  event.registeredUsers.push(userId);
  await event.save();
  return res
    .status(200)
    .json(new ApiResponse(200, "User registered for the event successfully"));
});
