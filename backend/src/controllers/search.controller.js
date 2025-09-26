import Event from "../model/event.js";
import HRupdate from "../model/hrupdate.js";
import MeetingMinutes from "../model/meetingminutes.js";
import ProgramManual from "../model/programManuals.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

export const searchAllContent = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Query is required" });

  const regex = new RegExp(query, "i");
  const today = new Date();

  const [events, hrUpdates, meetingMinutes, programManuals] = await Promise.all(
    [
      Event.find({ title: regex, eventDate: { $gte: today } })
        .select("title eventDate startTime endTime createdAt updatedAt")
        .limit(10),
      HRupdate.find({ $or: [{ title: regex }, { description: regex }] })
        .select("title createdAt updatedAt")
        .limit(10),
      MeetingMinutes.find({ title: regex })
        .select("title meetingDate createdAt updatedAt")
        .limit(10),
      ProgramManual.find({ title: regex })
        .select("title description createdAt updatedAt")
        .limit(10),
    ]
  );

    if (
    events.length === 0 &&
    hrUpdates.length === 0 &&
    meetingMinutes.length === 0 &&
    programManuals.length === 0
  ) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No results found", {
        isEmpty:true,
        events: [],
        hrUpdates: [],
        meetingMinutes: [],
        programManuals: [],
      }));
  }
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const markStatus = (items) =>
    items.map((item) => {
      let status = null;
      if (item.createdAt && item.createdAt >= sevenDaysAgo) status = "new";
      else if (
        item.updatedAt &&
        item.updatedAt > item.createdAt &&
        item.updatedAt >= sevenDaysAgo
      )
        status = "updated";

      return { ...item._doc, status };
    });

  const eventsWithStatus = markStatus(events);
  const hrUpdatesWithStatus = markStatus(hrUpdates);
  const meetingMinutesWithStatus = markStatus(meetingMinutes);
  const programManualsWithStatus = markStatus(programManuals);
  return res.status(200).json(
    new ApiResponse(200, "Search content fetched Successfully", {
      events: eventsWithStatus,
      hrUpdates: hrUpdatesWithStatus,
      meetingMinutes: meetingMinutesWithStatus,
      programManuals: programManualsWithStatus,
    })
  );
});
