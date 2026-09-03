import { PERMISSIONS } from "../auth/permissions.js";
import { ROLE_PERMISSIONS } from "../auth/rolePermissions.js";
import CollectiveAgreement from "../model/Agreement.js";
import Announcement from "../model/announcement.js";

import ProgramManual from "../model/programManuals.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";


export const searchAllContent = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Query is required" });

  const regex = new RegExp(query, "i");

  // --- Resolve requester's permissions ---
  const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

  const canViewProgramManuals = userPermissions.includes(
    PERMISSIONS.VIEW_PROGRAM_MANUALS,
  );
  const canViewAnnouncements = userPermissions.includes(
    PERMISSIONS.VIEW_ANNOUNCEMENTS,
  );
  const canViewCollectiveAgreements = userPermissions.includes(
    PERMISSIONS.VIEW_COLLECTIVE_AGREEMENTS,
  );

  // --- Run only the queries the user is permitted to see ---
  const [programManuals, announcements, collectiveAgreements] =
    await Promise.all([
      canViewProgramManuals
        ? ProgramManual.find({ title: regex }).select("title slug").limit(10)
        : Promise.resolve([]),
      canViewAnnouncements
        ? Announcement.find({ title: regex }).select("title slug").limit(10)
        : Promise.resolve([]),
      canViewCollectiveAgreements
        ? CollectiveAgreement.find({ title: regex })
            .select("title slug")
            .limit(10)
        : Promise.resolve([]),
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
      programManuals,
      collectiveAgreements,
      announcements,
    }),
  );
});
