import CollectiveAgreement from "../model/Agreement.js";
import Announcement from "../model/announcement.js";

import ProgramManual from "../model/programManuals.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

export const searchAllContent = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Query is required" });

  const regex = new RegExp(query, "i");
  const today = new Date();

  const [


    programManuals,
    announcements,
    collectiveAgreements,
  ] = await Promise.all([
  
    ProgramManual.find({ title: regex }).select("title slug").limit(10),
    Announcement.find({ title: regex }).select("title slug").limit(10),
    CollectiveAgreement.find({ title: regex }).select("title slug").limit(10),
  ]);

  if (
  
  
    programManuals.length === 0 &&
    announcements.length === 0 &&
    collectiveAgreements.length === 0
  ) {
    return res.status(200).json(
      new ApiResponse(200, "No results found", {
        isEmpty: true,
        events: [],
        hrUpdates: [],
        meetingMinutes: [],
        programManuals: [],
        collectiveAgreements: [],
        announcements: [],
      }),
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Search content fetched Successfully", {
  
      programManuals: programManuals,
      collectiveAgreements: collectiveAgreements,
      announcements: announcements,
    }),
  );
});
