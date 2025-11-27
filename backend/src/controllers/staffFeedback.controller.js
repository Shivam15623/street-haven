import StaffFeedback from "../model/staffFeedback.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

export const createStaffFeedBack = asyncHandler(async (req, res) => {
  const {
    date,
    category,
    location,
    description,
    witnesses,
    actionsTaken,
    reporterName,
  } = req.body;
  const submittedBy = req.user._id;
  const newfeedBack = await StaffFeedback.create({
    date,
    category,
    location,
    description,
    witnesses,
    actionsTaken,
    reporterName,
    submittedBy,
  });
  if (!newfeedBack) {
    throw new ApiError(500, "Failed to create incident report");
  }
  res
    .status(201)
    .json(new ApiResponse(true, "Staff feedback created successfully"));
});

export const GetAllStaffFeedBack = asyncHandler(async (req, res) => {
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
   
    ];
  }
  const allfeedbackSubmissions = await StaffFeedback.find(query)
    .populate("submittedBy", "firstname lastname email") 
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalCount = await StaffFeedback.countDocuments(query);
  return res.status(200).json(
    new ApiResponse(200, "Staff Feedback Submissions fetched successfully", {
      allfeedbackSubmissions,
      paggination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  );
});

export const generateComplaintPDF = async (req, res) => {
  const data = req.body;
  const finalHTML = renderTemplate(data);

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(finalHTML, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px" },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=complaint-form.pdf",
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ message: "Error generating PDF" });
  }
};