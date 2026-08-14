import TicketCategory from "../model/ticketCategory.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { ApiError } from "../utills/ApiError.js";

// GET ALL TICKET CATEGORIES
export const getTicketCategories = asyncHandler(async (req, res) => {
  const { isActive = "true" } = req.query;

  const filter = {};

  if (isActive !== "all") {
    filter.isActive = isActive === "true";
  }

  const categories = await TicketCategory.find(filter).sort({ name: 1 }).lean();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Ticket categories fetched successfully",
        categories,
      ),
    );
});

// CREATE TICKET CATEGORY
export const createTicketCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, "Category name is required");
  }

  const trimmedName = name.trim();

  // Check duplicate name
  const existingCategory = await TicketCategory.findOne({
    name: trimmedName,
  });

  if (existingCategory) {
    throw new ApiError(409, "Ticket category already exists");
  }

  const category = await TicketCategory.create({
    name: trimmedName,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Ticket category created successfully", category),
    );
});

// EDIT TICKET CATEGORY
export const editTicketCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, "Category name is required");
  }

  const category = await TicketCategory.findById(id);

  if (!category) {
    throw new ApiError(404, "Ticket category not found");
  }

  const trimmedName = name.trim();

  const existingCategory = await TicketCategory.findOne({
    name: trimmedName,
    _id: { $ne: id },
  });

  if (existingCategory) {
    throw new ApiError(409, "Ticket category already exists");
  }

  category.name = trimmedName;

  await category.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Ticket category updated successfully", category),
    );
});

// DELETE / DEACTIVATE TICKET CATEGORY
export const deleteTicketCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await TicketCategory.findById(id);

  if (!category) {
    throw new ApiError(404, "Ticket category not found");
  }

  if (!category.isActive) {
    throw new ApiError(400, "Ticket category is already inactive");
  }

  category.isActive = false;

  await category.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Ticket category deleted successfully", category),
    );
});
