import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import User, { ROLES } from "../model/user.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utills/cloudinary.js";
import { ApiError } from "../utills/ApiError.js";
import Location from "../model/location.js";
import mongoose from "mongoose";
import { sendNewUserCredentialsEmail } from "../helper/EmailsMailer/emailHandlers.js";
export const AllEmployees = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    order = "asc",
    forDropdown = false,
    managedBy = false, // <-- New
    role,
  } = req.query;

  const query = {};

  // Role filter
  if (role) {
    query.role = {
      $in: Array.isArray(role) ? role : role.split(","),
    };
  }

  // Managed-by filter — only show users supervised by req.user
  const isManagedBy = String(managedBy).toLowerCase() === "true";
  if (isManagedBy) {
    query.superviserId = req.user._id;
  }

  // Search
  if (search) {
    query.$or = [
      { firstname: { $regex: search, $options: "i" } },
      { lastname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const isDropdown = String(forDropdown).toLowerCase() === "true";

  // Only show super_admin users when this is the non-dropdown list
  // AND the requester is themselves a super_admin. Otherwise exclude them.
  const canSeeSuperAdmins = !isDropdown && req.user.role === ROLES.SUPER_ADMIN;
  if (!canSeeSuperAdmins) {
    if (query.role && query.role.$in) {
      // Respect an explicit role filter, but strip super_admin out of it
      query.role.$in = query.role.$in.filter((r) => r !== ROLES.SUPER_ADMIN);
    } else {
      query.role = { $ne: ROLES.SUPER_ADMIN };
    }
  }

  const selectFields = isDropdown
    ? "_id firstname lastname email role"
    : "-forgotPasswordToken -forgotPasswordTokenExpiry -refreshToken -password";

  if (isDropdown) {
    const employees = await User.find(query)
      .select(selectFields)
      .sort({ firstname: 1 });

    return res.status(200).json(
      new ApiResponse(200, "Employees fetched successfully", {
        employees,
      }),
    );
  }
  const employees = await User.aggregate([
    { $match: query },

    {
      $lookup: {
        from: "locations",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$$userId", "$managers"],
              },
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ],
        as: "locations",
      },
    },

    {
      $addFields: {
        locations: {
          $map: {
            input: "$locations",
            as: "location",
            in: "$$location._id",
          },
        },
      },
    },

    {
      $project: {
        password: 0,
        refreshToken: 0,
        forgotPasswordToken: 0,
        forgotPasswordTokenExpiry: 0,
      },
    },

    { $sort: { [sortBy]: order === "asc" ? 1 : -1 } },
    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) },
  ]);

  const totalEmployees = await User.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Employees fetched successfully", {
      employees,
      pagination: {
        total: totalEmployees,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalEmployees / Number(limit)),
      },
    }),
  );
});
export const AddEmployee = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      title,
      hireDate,
      superviserId,
      customPermissions,
      locations,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNo: phone }],
    }).session(session);

    if (existingUser) {
      if (existingUser.email === email)
        throw new ApiError(400, "User already exists with this email");
      if (existingUser.phoneNo === phone)
        throw new ApiError(400, "User already exists with this phone number");
    }

    const resolvedRole = role || ROLES.STAFF;

    // Hire Date / Volunteer Start Date is the same field for all roles now
    if (!hireDate) {
      throw new ApiError(
        400,
        resolvedRole === ROLES.VOLUNTEER
          ? "Volunteer start date is required."
          : "Hire date is required.",
      );
    }
    const resolvedHireDate = new Date(hireDate);

    // Supervisor is optional — only validate if one was actually provided
    let superviser = null;
    if (superviserId) {
      superviser = await User.findById(superviserId).session(session);
      if (!superviser) throw new ApiError(404, "No such superviser found");
    }

    /* ======================
       VALIDATE LOCATIONS (only relevant for managers)
    ====================== */
    let validLocationIds = [];

    if (locations?.length) {
      if (resolvedRole !== ROLES.MANAGER) {
        throw new ApiError(
          400,
          "Only users with the manager role can be assigned to locations",
        );
      }

      const invalidIds = locations.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id),
      );
      if (invalidIds.length)
        throw new ApiError(
          400,
          `Invalid location id(s): ${invalidIds.join(", ")}`,
        );

      const foundLocations = await Location.find({
        _id: { $in: locations },
      }).session(session);
      if (foundLocations.length !== locations.length) {
        const foundIds = foundLocations.map((l) => l._id.toString());
        const missing = locations.filter((id) => !foundIds.includes(id));
        throw new ApiError(404, `Location(s) not found: ${missing.join(", ")}`);
      }

      validLocationIds = foundLocations.map((l) => l._id);
    }

    const userData = {
      firstname: firstName,
      lastname: lastName,
      email,
      password,
      phoneNo: phone,
      role: resolvedRole,
      title,
      hireDate: resolvedHireDate,
      superviserId: superviserId || null,
      customPermissions,
      totpSecret: null,
      isTOTPEnabled: false,
      isTOTPVerified: false,
    };

    if (resolvedRole === ROLES.VOLUNTEER) {
      userData.status = "active";
      userData.volunteerStints = [
        {
          startAt: resolvedHireDate,
          endAt: null,
        },
      ];
      userData.currentStint = {
        startAt: resolvedHireDate,
        endAt: null,
      };
    }

    /* ======================
       CREATE USER
    ====================== */
    const [newUser] = await User.create([userData], { session });

    if (!newUser)
      throw new ApiError(500, "Account not created due to server error");

    /* ======================
       ASSIGN TO LOCATIONS (write on the Location side — single source of truth)
    ====================== */
    if (validLocationIds.length) {
      await Location.updateMany(
        { _id: { $in: validLocationIds } },
        { $addToSet: { managers: newUser._id } },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();
    await sendNewUserCredentialsEmail({
      email: newUser.email,
      userName: `${newUser.firstname} ${newUser.lastname}`,
      password, // plain password received from req.body
      role: newUser.role,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, "Employee account created successfully", newUser),
      );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

export const EditEmployee = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: userId } = req.params;
    const findUser = await User.findById(userId).session(session);
    if (!findUser) throw new ApiError(404, "No such user found");

    const {
      firstname,
      lastname,
      email,
      phoneNo,
      role,
      title,
      hireDate,
      endAt,
      superviserId,
      customPermissions,
      locations,
    } = req.body;

    const updates = {};

    /* ======================
       PROFILE PIC
    ====================== */
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

    /* ======================
       BASIC FIELD DIFFS
    ====================== */
    if (firstname && firstname !== findUser.firstname)
      updates.firstname = firstname;
    if (lastname && lastname !== findUser.lastname) updates.lastname = lastname;
    if (email && email !== findUser.email) updates.email = email;
    if (phoneNo && phoneNo !== findUser.phoneNo) updates.phoneNo = phoneNo;
    if (title && title !== findUser.title) updates.title = title;
    if (customPermissions) updates.customPermissions = customPermissions;

    let roleChangingAwayFromManager = false;
    const resolvedRole = role ?? findUser.role;

    if (role && role !== findUser.role) {
      updates.role = role;
      if (findUser.role === ROLES.MANAGER && role !== ROLES.MANAGER) {
        roleChangingAwayFromManager = true;
      }
    }

    /* ======================
       HIRE DATE vs VOLUNTEER STINT
       - Non-volunteers: hireDate is a plain top-level field.
       - Volunteers: hireDate maps to currentStint.startAt, and endAt is
         only ever applied if it was actually sent — never nulled/forced.
    ====================== */
    if (resolvedRole === ROLES.VOLUNTEER) {
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

      // Only touch endAt/status if endAt was actually provided.
      // Omitted/empty endAt leaves currentStint.endAt and status untouched.
      if (endAt !== undefined && endAt !== null && endAt !== "") {
        const resolvedEnd = new Date(endAt);
        const existingEnd = currentStint.endAt
          ? new Date(currentStint.endAt).toISOString()
          : null;

        if (resolvedEnd.toISOString() !== existingEnd) {
          updates["currentStint.endAt"] = resolvedEnd;
          // Inactive only once the end date has actually passed.
          updates.status = resolvedEnd <= new Date() ? "inactive" : "active";
        }
      }
    } else if (
      hireDate &&
      findUser.hireDate &&
      new Date(hireDate).toISOString() !== findUser.hireDate.toISOString()
    ) {
      updates.hireDate = new Date(hireDate);
    }

    if (superviserId && superviserId !== String(findUser.superviserId)) {
      const superviser = await User.findById(superviserId).session(session);
      if (!superviser) throw new ApiError(404, "No such superviser found");
      updates.superviserId = superviserId;
    }

    /* ======================
       LOCATIONS — only meaningful if resolved role is/stays manager
    ====================== */
    let desiredLocationIds = null;

    if (locations !== undefined) {
      if (resolvedRole !== ROLES.MANAGER) {
        throw new ApiError(
          400,
          "Only users with the manager role can be assigned to locations",
        );
      }
      const invalidIds = locations.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id),
      );
      if (invalidIds.length)
        throw new ApiError(
          400,
          `Invalid location id(s): ${invalidIds.join(", ")}`,
        );

      const foundLocations = await Location.find({
        _id: { $in: locations },
      }).session(session);
      if (foundLocations.length !== locations.length) {
        const foundIds = foundLocations.map((l) => l._id.toString());
        const missing = locations.filter((id) => !foundIds.includes(id));
        throw new ApiError(404, `Location(s) not found: ${missing.join(", ")}`);
      }
      desiredLocationIds = foundLocations.map((l) => l._id.toString());
    }

    /* ======================
       NO-OP CHECK
    ====================== */
    if (
      !Object.keys(updates).length &&
      desiredLocationIds === null &&
      !roleChangingAwayFromManager
    ) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(200)
        .json(
          new ApiResponse(200, "No changes detected. Profile is the same."),
        );
    }

    /* ======================
       APPLY USER UPDATES
    ====================== */
    const updatedUser = Object.keys(updates).length
      ? await User.findByIdAndUpdate(
          userId,
          { $set: updates },
          {
            new: true,
            runValidators: true,

            session,
          },
        )
      : findUser;

    if (!updatedUser)
      throw new ApiError(500, "Error while updating user details");

    /* ======================
       CLOSE OUT THE MATCHING OPEN STINT IN HISTORY
       (only runs when an endAt update was actually applied above)
    ====================== */
    if (updates["currentStint.endAt"]) {
      const openStint = updatedUser.volunteerStints.find((s) => !s.endAt);
      if (openStint) {
        openStint.endAt = updates["currentStint.endAt"];
        openStint.endedReason = "left";
        await updatedUser.save({ session, validateModifiedOnly: true });
      }
    }

    /* ======================
       SYNC LOCATION.managers
    ====================== */
    if (roleChangingAwayFromManager) {
      await Location.updateMany(
        { managers: userId },
        { $pull: { managers: userId } },
        { session },
      );
    } else if (desiredLocationIds !== null) {
      const currentlyManaging = await Location.find({ managers: userId })
        .select("_id")
        .session(session);
      const currentIds = currentlyManaging.map((l) => l._id.toString());

      const toAdd = desiredLocationIds.filter((id) => !currentIds.includes(id));
      const toRemove = currentIds.filter(
        (id) => !desiredLocationIds.includes(id),
      );

      if (toAdd.length) {
        await Location.updateMany(
          { _id: { $in: toAdd } },
          { $addToSet: { managers: userId } },
          { session },
        );
      }
      if (toRemove.length) {
        await Location.updateMany(
          { _id: { $in: toRemove } },
          { $pull: { managers: userId } },
          { session },
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Employee profile updated successfully",
          updatedUser,
        ),
      );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});
export const EmployeeStatusChange = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const { status, startAt, endAt } = req.body; // startAt required when reactivating

  const findUser = await User.findById(userId);
  if (!findUser) throw new ApiError(404, "No such User Exists");

  if (findUser.status === status) {
    throw new ApiError(400, `User is already ${status}`);
  }

  // --- Going INACTIVE ---
  if (status === "inactive") {
    if (findUser.role === "volunteer" && findUser.currentStint?.startAt) {
      const closedStint = {
        startAt: findUser.currentStint.startAt,
        endAt: endAt ? new Date(endAt) : new Date(),
        endedReason: "left", // or "admin_deactivated" based on who triggered this
      };
      findUser.volunteerStints.push(closedStint);
      findUser.currentStint = { startAt: undefined, endAt: undefined };
    }
    findUser.status = "inactive";
  }

  // --- Going ACTIVE (reactivation) ---
  if (status === "active") {
    if (findUser.role === "volunteer") {
      const lastStint =
        findUser.volunteerStints[findUser.volunteerStints.length - 1];

      if (lastStint?.endAt) {
        const oneYearMs = 365 * 24 * 60 * 60 * 1000;
        const gap = Date.now() - new Date(lastStint.endAt).getTime();

        if (gap > oneYearMs) {
          throw new ApiError(
            400,
            "This volunteer left more than a year ago. Please create a new profile instead of reactivating.",
          );
        }
      }

      if (!startAt) {
        throw new ApiError(
          400,
          "startAt is required to reactivate a volunteer",
        );
      }

      findUser.currentStint = { startAt: new Date(startAt), endAt: null };
    }
    findUser.status = "active";
  }

  await findUser.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "User status updated successfully", findUser));
});
export const EditEmployeePassword = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;

  const { newPassword, confirmPassword } = req.body;
  // Check if user exists
  const findUser = await User.findById(userId);
  if (!findUser) {
    throw new ApiError(404, "No such user found");
  }
  if (newPassword === confirmPassword) {
    throw new ApiError(
      400,
      "confirm password does not match with new Password",
    );
  }
  findUser.password = newPassword;
  await findUser.save();
  return res.status(200).json(new ApiResponse("user's Pasword changed"));
});
export const RemoveEmployee = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;

  // Check if user exists
  const findUser = await User.findById(userId);
  if (!findUser) {
    throw new ApiError(404, "No such user found");
  }

  // Delete user
  await User.findByIdAndDelete(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee removed successfully", null));
});
export const resetTotp = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;

  const employee = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        totpSecret: null,
        isTOTPEnabled: false,
        isTOTPVerified: false,
      },
    },
    {
      new: true,
      runValidators: false, // 👈 VERY IMPORTANT
    },
  );

  if (!employee) {
    throw new ApiError(404, "No such user found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        true,
        `${employee.firstname} ${employee.lastname}'s TOTP reset successfully`,
      ),
    );
});

export const employeeSuperviserForm = asyncHandler(async (req, res) => {
  const employees = await User.find({})
    .select("firstname lastname title superviserId")
    .populate({
      path: "superviserId",
      select: "firstname lastname title",
    })
    .lean();

  const formattedEmployees = employees.map((emp) => ({
    _id: emp._id,
    firstname: emp.firstname,
    lastname: emp.lastname,
    title: emp.title,
    superviser: emp.superviserId
      ? {
          _id: emp.superviserId._id,
          firstname: emp.superviserId.firstname,
          lastname: emp.superviserId.lastname,
          title: emp.superviserId.title,
        }
      : null,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Employees with supervisor data fetched successfully",
        formattedEmployees,
      ),
    );
});
export const getEmployeeById = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;

  // 🔹 Base fields (always)
  let selectFields =
    "firstname lastname title email role profilePic phoneNo hireDate superviserId";

  // 🔹 Extra fields only for org chart view

  // 🔹 Build query dynamically
  let query = User.findById(userId).select(selectFields);

  // 🔹 Populate supervisor ONLY if org chart is requested

  const user = await query;

  if (!user) {
    throw new ApiError(404, "Employee not found");
  }

  // 🔹 Fetch subordinates only for org chart

  res.status(200).json(
    new ApiResponse(200, "Employee fetched successfully", {
      employee: user,
    }),
  );
});

export const EmployeeActiveInactiveToggle = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "Employee Not Found");
  }

  const isVolunteer = user.role === ROLES.VOLUNTEER;

  if (user.status === "active") {
    // --- DEACTIVATE ---
    user.status = "inactive";

    if (isVolunteer) {
      const now = new Date();
      user.volunteerStints.push({
        startAt: user.currentStint?.startAt || user.hireDate,
        endAt: now,
        endedReason: "admin_deactivated",
      });
      user.currentStint = { startAt: undefined, endAt: undefined };
    }

    await user.save({ validateModifiedOnly: true });
    return res
      .status(200)
      .json(new ApiResponse(200, "User marked inactive", user));
  } else {
    // --- REACTIVATE ---
    if (isVolunteer) {
      const lastStint = user.volunteerStints[user.volunteerStints.length - 1];

      if (lastStint && lastStint.endAt) {
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
    }

    // For non-volunteers, just flip status back — no stint tracking, no time limit
    user.status = "active";

    await user.save({ validateModifiedOnly: true });
    return res.status(200).json(new ApiResponse(200, "User reactivated", user));
  }
});
