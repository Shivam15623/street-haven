import mongoose from "mongoose";
import { ApiError } from "../utills/ApiError.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ROLES } from "../model/user.js";
import User from "../model/user.js";
import Location from "../model/location.js";
import { ApiResponse } from "../utills/ApiResponse.js";

// ---------- Helper: validate manager IDs ----------
async function validateManagerIds(managerIds) {
  // Check all IDs are valid ObjectIds before hitting the DB
  const invalidIds = managerIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id),
  );
  if (invalidIds.length > 0) {
    throw new ApiError(400, `Invalid manager id(s): ${invalidIds.join(", ")}`);
  }

  const managers = await User.find({ _id: { $in: managerIds } });

  // Check all IDs actually exist
  if (managers.length !== managerIds.length) {
    const foundIds = managers.map((m) => m._id.toString());
    const missingIds = managerIds.filter((id) => !foundIds.includes(id));
    throw new ApiError(404, `Manager(s) not found: ${missingIds.join(", ")}`);
  }

  // Check all found users actually have the MANAGER role
  const nonManagers = managers.filter((m) => m.role !== ROLES.MANAGER);
  if (nonManagers.length > 0) {
    const names = nonManagers.map((m) => `${m.firstname} ${m.lastname}`);
    throw new ApiError(400, `User(s) are not managers: ${names.join(", ")}`);
  }

  return managers;
}

// ---------- Helper: validate a single facility manager ID ----------
async function validateFacilityManagerId(facilityManagerId) {
  if (!mongoose.Types.ObjectId.isValid(facilityManagerId)) {
    throw new ApiError(
      400,
      `Invalid facility manager id: ${facilityManagerId}`,
    );
  }

  const facilityManager = await User.findById(facilityManagerId);
  if (!facilityManager) {
    throw new ApiError(404, "Facility manager not found");
  }

  // Adjust this check if facility managers use a different role constant
  // if (
  //   ROLES.MANAGER &&
  //   facilityManager.role !== ROLES.MANAGER
  // ) {
  //   throw new ApiError(
  //     400,
  //     `${facilityManager.firstname} ${facilityManager.lastname} is not a facility manager`,
  //   );
  // }

  return facilityManager;
}

// ---------- CREATE ----------
export const create = asyncHandler(async (req, res) => {
  const { managerIds, name, facilityManager } = req.body;

  if (!name) {
    throw new ApiError(400, "name is required");
  }

  const existing = await Location.findOne({ name: name.trim() });
  if (existing) {
    throw new ApiError(409, "Location with this name already exists");
  }

  if (managerIds && managerIds.length > 0) {
    await validateManagerIds(managerIds);
  }

  if (facilityManager) {
    await validateFacilityManagerId(facilityManager);
  }

  const locationData = {
    name: name.trim(),
    managers: managerIds ?? [],
    isActive: false,
  };

  // Only set facilityManager if provided, otherwise let the schema default
  // (FACILITIES_MANAGER_ID) kick in.
  if (facilityManager) {
    locationData.facilityManager = facilityManager;
  }

  const location = await Location.create(locationData);

  return res
    .status(201)
    .json(new ApiResponse(201, "Location created successfully", location));
});

// ---------- GET ALL ----------
export const getAll = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const locations = await Location.find(filter)
    .populate("managers", "firstname lastname email role")
    .populate("facilityManager", "firstname lastname email role")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Locations fetched successfully", locations));
});

// ---------- GET ONE ----------
export const getOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid location id");
  }

  const location = await Location.findById(id)
    .populate("managers", "firstname lastname email role")
    .populate("facilityManager", "firstname lastname email role");

  if (!location) {
    throw new ApiError(404, "Location not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Location fetched successfully", location));
});

// ---------- UPDATE ----------
export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, managerIds, isActive, facilityManager } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid location id");
  }
  console.log("facilityManager", facilityManager);
  const location = await Location.findById(id);
  if (!location) {
    throw new ApiError(404, "Location not found");
  }

  if (name !== undefined) {
    if (!name.trim()) {
      throw new ApiError(400, "name cannot be empty");
    }
    const existing = await Location.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });
    if (existing) {
      throw new ApiError(409, "Location with this name already exists");
    }
    location.name = name.trim();
  }

  if (managerIds !== undefined) {
    if (managerIds.length === 0) {
      throw new ApiError(400, "managers should not be empty");
    }
    await validateManagerIds(managerIds);
    location.managers = managerIds;
  }

  if (facilityManager !== undefined) {
    if (!facilityManager) {
      throw new ApiError(400, "facilityManager should not be empty");
    }
    await validateFacilityManagerId(facilityManager);
    location.facilityManager = facilityManager;
  }

  if (isActive !== undefined) {
    location.isActive = isActive;
  }

  await location.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Location updated successfully", location));
});

// ---------- DELETE ----------
export const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid location id");
  }

  const location = await Location.findById(id);
  if (!location) {
    throw new ApiError(404, "Location not found");
  }

  // Soft delete is usually safer in production than hard delete,
  // since tickets may reference this location historically.
  location.isActive = false;
  await location.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Location deactivated successfully", location));
});

// ---------- ADD manager to a location ----------
export const addManager = asyncHandler(async (req, res) => {
  const { id } = req.params; // location id
  const { managerId } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(managerId)
  ) {
    throw new ApiError(400, "Invalid id");
  }

  const manager = await User.findById(managerId);
  if (!manager) throw new ApiError(404, "Manager not found");
  if (manager.role !== ROLES.MANAGER) {
    throw new ApiError(
      400,
      `${manager.firstname} ${manager.lastname} is not a manager`,
    );
  }

  const location = await Location.findByIdAndUpdate(
    id,
    { $addToSet: { managers: managerId } },
    { new: true },
  )
    .populate("managers", "firstname lastname email role")
    .populate("facilityManager", "firstname lastname email role");

  if (!location) throw new ApiError(404, "Location not found");

  return res
    .status(200)
    .json(new ApiResponse(200, "Manager added to location", location));
});

// ---------- REMOVE manager from a location ----------
export const removeManager = asyncHandler(async (req, res) => {
  const { id } = req.params; // location id
  const { managerId } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(managerId)
  ) {
    throw new ApiError(400, "Invalid id");
  }

  const location = await Location.findByIdAndUpdate(
    id,
    { $pull: { managers: managerId } },
    { new: true },
  )
    .populate("managers", "firstname lastname email role")
    .populate("facilityManager", "firstname lastname email role");

  if (!location) throw new ApiError(404, "Location not found");

  return res
    .status(200)
    .json(new ApiResponse(200, "Manager removed from location", location));
});

// ---------- SET facility manager for a location ----------
export const setFacilityManager = asyncHandler(async (req, res) => {
  const { id } = req.params; // location id
  const { facilityManagerId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid location id");
  }

  if (!facilityManagerId) {
    throw new ApiError(400, "facilityManagerId is required");
  }

  await validateFacilityManagerId(facilityManagerId);

  const location = await Location.findByIdAndUpdate(
    id,
    { facilityManager: facilityManagerId },
    { new: true },
  )
    .populate("managers", "firstname lastname email role")
    .populate("facilityManager", "firstname lastname email role");

  if (!location) throw new ApiError(404, "Location not found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Facility manager updated for location", location),
    );
});
