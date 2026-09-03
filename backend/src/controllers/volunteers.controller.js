import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import User, { ROLES } from "../model/user.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utills/cloudinary.js";
import { ApiError } from "../utills/ApiError.js";
import mongoose from "mongoose";

/* ============================================================
   ALL VOLUNTEERS
   - role is ALWAYS forced to "volunteer" here, regardless of
     what's in the query string. This endpoint should never be
     able to leak employee/manager/admin accounts.
============================================================ */
export const AllVolunteers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    order = "asc",
    forDropdown = false,
    status, // "active" | "inactive"
  } = req.query;

  const query = { role: ROLES.VOLUNTEER };

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { firstname: { $regex: search, $options: "i" } },
      { lastname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const isDropdown = String(forDropdown).toLowerCase() === "true";

  const selectFields = isDropdown
    ? "_id firstname lastname email status"
    : "-forgotPasswordToken -forgotPasswordTokenExpiry -refreshToken -password";

  if (isDropdown) {
    const volunteers = await User.find(query)
      .select(selectFields)
      .sort({ firstname: 1 });

    return res.status(200).json(
      new ApiResponse(200, "Volunteers fetched successfully", {
        volunteers,
      }),
    );
  }

  const volunteers = await User.find(query)
    .select(selectFields)
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const totalVolunteers = await User.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Volunteers fetched successfully", {
      volunteers,
      pagination: {
        total: totalVolunteers,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalVolunteers / Number(limit)),
      },
    }),
  );
});

/* ============================================================
   ADD VOLUNTEER
   role is always forced to ROLES.VOLUNTEER — this endpoint can
   never be used to create an employee/manager/admin account.
============================================================ */
export const AddVolunteer = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    title,
    hireDate, // volunteer "start date"
    superviserId,
    customPermissions,
  } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { phoneNo: phone }],
  });

  if (existingUser) {
    if (existingUser.email === email)
      throw new ApiError(400, "User already exists with this email");
    if (existingUser.phoneNo === phone)
      throw new ApiError(400, "User already exists with this phone number");
  }

  if (!hireDate) {
    throw new ApiError(400, "Volunteer start date is required.");
  }
  const resolvedStart = new Date(hireDate);

  let superviser = null;
  if (superviserId) {
    superviser = await User.findById(superviserId);
    if (!superviser) throw new ApiError(404, "No such superviser found");
  }

  const newVolunteer = await User.create({
    firstname: firstName,
    lastname: lastName,
    email,
    password,
    phoneNo: phone,
    role: ROLES.VOLUNTEER,
    title,
    hireDate: resolvedStart,
    superviserId: superviserId || null,
    customPermissions,
    totpSecret: null,
    isTOTPEnabled: false,
    isTOTPVerified: false,
    status: "active",
    volunteerStints: [
      {
        startAt: resolvedStart,
        endAt: null,
      },
    ],
    currentStint: {
      startAt: resolvedStart,
      endAt: null,
    },
  });

  if (!newVolunteer)
    throw new ApiError(500, "Account not created due to server error");

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Volunteer account created successfully", newVolunteer),
    );
});

/* ============================================================
   EDIT VOLUNTEER
   - 404s if the target user is not currently a volunteer, so
     volunteer_admin can never edit a staff/manager/admin record
     just by guessing an id.
   - role is NOT editable here. Promoting a volunteer to an
     employee role is treated as a separate, more sensitive
     action and should stay behind employee-management perms.
============================================================ */
export const EditVolunteer = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const findUser = await User.findById(userId);

  if (!findUser || findUser.role !== ROLES.VOLUNTEER) {
    throw new ApiError(404, "No such volunteer found");
  }

  const {
    firstname,
    lastname,
    email,
    phoneNo,
    title,
    hireDate, // maps to currentStint.startAt
    endAt,
    superviserId,
    customPermissions,
  } = req.body;

  const updates = {};

  /* PROFILE PIC */
  if (req.file?.path) {
    if (findUser.profilePic) {
      try {
        await deleteFromCloudinary(findUser.profilePic);
      } catch (err) {
        console.error("Error deleting old profile picture:", err.message);
      }
    }
    const uploadedPic = await uploadOnCloudinary(req.file.path);
    if (!uploadedPic.secure_url)
      throw new ApiError(500, "Error while uploading profile picture");
    updates.profilePic = uploadedPic.secure_url;
  }

  /* BASIC FIELD DIFFS */
  if (firstname && firstname !== findUser.firstname)
    updates.firstname = firstname;
  if (lastname && lastname !== findUser.lastname) updates.lastname = lastname;
  if (email && email !== findUser.email) updates.email = email;
  if (phoneNo && phoneNo !== findUser.phoneNo) updates.phoneNo = phoneNo;
  if (title && title !== findUser.title) updates.title = title;
  if (customPermissions) updates.customPermissions = customPermissions;

  /* STINT HANDLING
     - hireDate -> currentStint.startAt
     - endAt only applied if explicitly sent (never nulled/forced)
  */
  const currentStint = findUser.currentStint || {};

  if (hireDate) {
    const resolvedStart = new Date(hireDate);
    const existingStart = currentStint.startAt
      ? new Date(currentStint.startAt).toISOString()
      : null;

    if (resolvedStart.toISOString() !== existingStart) {
      updates["currentStint.startAt"] = resolvedStart;
    }
  }

  if (endAt !== undefined && endAt !== null && endAt !== "") {
    const resolvedEnd = new Date(endAt);
    const existingEnd = currentStint.endAt
      ? new Date(currentStint.endAt).toISOString()
      : null;

    if (resolvedEnd.toISOString() !== existingEnd) {
      updates["currentStint.endAt"] = resolvedEnd;
      updates.status = resolvedEnd <= new Date() ? "inactive" : "active";
    }
  }

  if (superviserId && superviserId !== String(findUser.superviserId)) {
    const superviser = await User.findById(superviserId);
    if (!superviser) throw new ApiError(404, "No such superviser found");
    updates.superviserId = superviserId;
  }

  if (!Object.keys(updates).length) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No changes detected. Profile is the same."));
  }

  const updatedVolunteer = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true },
  );

  if (!updatedVolunteer)
    throw new ApiError(500, "Error while updating volunteer details");

  /* Close out the matching open stint in history if endAt was applied */
  if (updates["currentStint.endAt"]) {
    const openStint = updatedVolunteer.volunteerStints.find((s) => !s.endAt);
    if (openStint) {
      openStint.endAt = updates["currentStint.endAt"];
      openStint.endedReason = "left";
      await updatedVolunteer.save({ validateModifiedOnly: true });
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Volunteer profile updated successfully", updatedVolunteer),
    );
});

/* ============================================================
   EDIT VOLUNTEER PASSWORD
============================================================ */
export const EditVolunteerPassword = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const { newPassword, confirmPassword } = req.body;

  const findUser = await User.findById(userId);
  if (!findUser || findUser.role !== ROLES.VOLUNTEER) {
    throw new ApiError(404, "No such volunteer found");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "confirm password does not match with new password");
  }

  findUser.password = newPassword;
  await findUser.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Volunteer's password changed successfully"));
});

/* ============================================================
   REMOVE VOLUNTEER
============================================================ */
export const RemoveVolunteer = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;

  const findUser = await User.findById(userId);
  if (!findUser || findUser.role !== ROLES.VOLUNTEER) {
    throw new ApiError(404, "No such volunteer found");
  }

  await User.findByIdAndDelete(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Volunteer removed successfully", null));
});

/* ============================================================
   RESET TOTP
============================================================ */
export const resetVolunteerTotp = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;

  const volunteer = await User.findOne({ _id: userId, role: ROLES.VOLUNTEER });
  if (!volunteer) throw new ApiError(404, "No such volunteer found");

  volunteer.totpSecret = null;
  volunteer.isTOTPEnabled = false;
  volunteer.isTOTPVerified = false;
  await volunteer.save({ validateModifiedOnly: true });

  return res
    .status(200)
    .json(
      new ApiResponse(
        true,
        `${volunteer.firstname} ${volunteer.lastname}'s TOTP reset successfully`,
      ),
    );
});

/* ============================================================
   GET VOLUNTEER BY ID
============================================================ */
export const getVolunteerById = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;

  const volunteer = await User.findOne({ _id: userId, role: ROLES.VOLUNTEER }).select(
    "firstname lastname title email profilePic phoneNo hireDate superviserId status currentStint volunteerStints",
  );

  if (!volunteer) {
    throw new ApiError(404, "Volunteer not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Volunteer fetched successfully", { volunteer }));
});

/* ============================================================
   VOLUNTEER SUPERVISOR FORM
============================================================ */
export const volunteerSuperviserForm = asyncHandler(async (req, res) => {
  const volunteers = await User.find({ role: ROLES.VOLUNTEER })
    .select("firstname lastname title superviserId")
    .populate({
      path: "superviserId",
      select: "firstname lastname title",
    })
    .lean();

  const formatted = volunteers.map((v) => ({
    _id: v._id,
    firstname: v.firstname,
    lastname: v.lastname,
    title: v.title,
    superviser: v.superviserId
      ? {
          _id: v.superviserId._id,
          firstname: v.superviserId.firstname,
          lastname: v.superviserId.lastname,
          title: v.superviserId.title,
        }
      : null,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Volunteers with supervisor data fetched successfully",
        formatted,
      ),
    );
});

/* ============================================================
   ACTIVE / INACTIVE TOGGLE
   Reuses the stint-tracking logic that used to live inline in
   EmployeeActiveInactiveToggle, but restricted to volunteers.
============================================================ */
export const VolunteerActiveInactiveToggle = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const user = await User.findOne({ _id: userId, role: ROLES.VOLUNTEER });

  if (!user) {
    throw new ApiError(404, "Volunteer Not Found");
  }

  if (user.status === "active") {
    // --- DEACTIVATE ---
    const now = new Date();
    user.volunteerStints.push({
      startAt: user.currentStint?.startAt || user.hireDate,
      endAt: now,
      endedReason: "admin_deactivated",
    });
    user.currentStint = { startAt: undefined, endAt: undefined };
    user.status = "inactive";

    await user.save({ validateModifiedOnly: true });
    return res
      .status(200)
      .json(new ApiResponse(200, "Volunteer marked inactive", user));
  } else {
    // --- REACTIVATE ---
    const lastStint = user.volunteerStints[user.volunteerStints.length - 1];

    if (lastStint?.endAt) {
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const gap = Date.now() - new Date(lastStint.endAt).getTime();

      if (gap > oneYearMs) {
        throw new ApiError(
          400,
          "This volunteer's last stint ended over a year ago. Please create a new profile instead of reactivating.",
        );
      }
    }

    user.currentStint = {
      startAt: req.body?.startAt ? new Date(req.body.startAt) : new Date(),
      endAt: undefined,
    };
    user.status = "active";

    await user.save({ validateModifiedOnly: true });
    return res
      .status(200)
      .json(new ApiResponse(200, "Volunteer reactivated", user));
  }
});