import IncidentReport from "../model/incidentreport.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

export const createIncidentreport = asyncHandler(async (req, res) => {
  const {
    date,
    location,
    description,
    witnesses,
    actionsTaken,
    reporterName,
  } = req.body;
  const submittedBy = req.user._id;
  const newReport = await IncidentReport.create({
    dateOfIncident: date,
    location,
    description,
    witnesses,
    actionsTaken,
    reporterName,
    submittedBy,
  });
  if (!newReport) {
    throw new ApiError(500, "Failed to create incident report");
  }
  res
    .status(201)
    .json(new ApiResponse(true, "Incident report created successfully"));
});

export const GetAllIncidentreports = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    order = "desc",
  } = req.query;
  const query = {};

  // Search in title, keyHighlights, topics, attendees
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { reporterName: { $regex: search, $options: "i" } },
      { date: { $regex: search, $options: "i" } },
    ];
  }
  const allIncidentSubmissions = await IncidentReport.find(query)
    .populate("submittedBy", "firstname lastname email") 
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalCount = await IncidentReport.countDocuments(query);
  return res.status(200).json(
    new ApiResponse(200, "Incident Report Submissions fetched successfully", {
      allIncidentSubmissions,
      paggination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  );
});
