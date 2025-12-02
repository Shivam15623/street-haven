import Role from "../model/role.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

export const createRole = asyncHandler(async (req, res) => {
  const { roleName, description, permissions } = req.body;
  const newRole = await Role.create({
    roleName: roleName,
    description: description,
    permissions: permissions,
  });
  if (!newRole) {
    throw new ApiError(500, "Server Side Error");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, `New Role ${roleName} Added Successfully!`));
});
export const editRole = asyncHandler(async (req, res) => {
  const { id: roleId } = req.params;
  const { roleName, description, permissions } = req.body;
  const findRole = await Role.findById(roleId);
  if (!findRole) {
    throw new ApiError(404, "No Such Role Exists");
  }
});
export const deleteRole = asyncHandler(async (req, res) => {
  const { id: roleId } = req.params;
  const findRole = await Role.findById(roleId);
  if (!findRole) {
    throw new ApiError(404, "No Such Role Exists");
  }
});
export const allRoles = asyncHandler(async (req, res) => {
  const { formOnly = true } = req.body;

  let allRoles;
  if (formOnly === true) {
    allRoles = await Role.find().select("roleName _id");
  } else {
    allRoles = await Role.find();
  }
  return res.status(200).json(new ApiResponse(200, "roles fetched!", allRoles));
});

export const getRoleById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Invalid role ID provided"));
  }

  const role = await Role.findById(id);

  if (!role) {
    return res.status(404).json(new ApiResponse(404, "Role not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Role fetched successfully!", role));
});
