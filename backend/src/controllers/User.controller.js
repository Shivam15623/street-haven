import Location from "../model/location.js";
import User, { ROLES } from "../model/user.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utills/cloudinary.js";


export const editUserDetails = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const findUser = await User.findById(userId);
  if (!findUser) {
    throw new ApiError(404, "No such user found");
  }

  const { firstname, lastname, phoneNo } = req.body;
  const updates = {};

  // If profile picture is uploaded → skip equality check and update
  if (req.file && req.file.path) {
    // ✅ Delete old profilePic from Cloudinary if it exists
    if (findUser.profilePic) {
      try {
        await deleteFromCloudinary(findUser.profilePic); // pass old URL
      } catch (err) {
        console.error("Error deleting old profile picture:", err.message);
      }
    }

    // ✅ Upload new profile pic
    const uploadedPic = await uploadOnCloudinary(req.file.path);
    if (!uploadedPic.secure_url) {
      throw new ApiError(500, "Error while uploading profile picture");
    }
    updates.profilePic = uploadedPic.secure_url;
  } else {
    // Only check equality when NO profile picture update
    const isSame =
      (firstname ? firstname === findUser.firstname : true) &&
      (lastname ? lastname === findUser.lastname : true) &&
      (phoneNo ? phoneNo === findUser.phoneNo : true);

    if (isSame) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, "No changes detected. Profile is the same.")
        );
    }
  }

  // Collect only changed fields
  if (firstname && firstname !== findUser.firstname)
    updates.firstname = firstname;
  if (lastname && lastname !== findUser.lastname) updates.lastname = lastname;
  if (phoneNo && phoneNo !== findUser.phoneNo) updates.phoneNo = phoneNo;

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new ApiError(500, "Error while updating user details");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User profile updated successfully", updatedUser)
    );
});

export const changePassword = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Find user
  const findUser = await User.findById(userId);
  if (!findUser) {
    throw new ApiError(404, "No such user found");
  }

  // Check current password
  const isPasswordCorrect = await findUser.isPasswordCorrect(currentPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect current password");
  }

  // Prevent using same password
  if (newPassword === currentPassword) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          "New password cannot be the same as the current password"
        )
      );
  }

  // Confirm password check
  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, "New password and confirm password do not match")
      );
  }

  // Update password
  findUser.password = newPassword;
  await findUser.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password updated successfully"));
});
export const GetUserProfile = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;

  // Find user and exclude password
  const user = await User.findById(userId).select(
    "-password -forgotPasswordToken -forgotPasswordTokenExpiry -refreshToken -slug"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let userObj = user.toObject();

  // If the user is a manager, attach their location
  if (user.role === ROLES.MANAGER) {
    const location = await Location.find({ managers: user._id }).select(
      "name slug isActive"
    );
    userObj.location = location || null;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User profile fetched successfully", userObj));
});
