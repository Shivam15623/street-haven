import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import User from "../model/user.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utills/cloudinary.js";
import { ApiError } from "../utills/ApiError.js";
export const AllEmployees = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    order = "asc",
    forDropdown = false, // toggle dropdown mode
  } = req.query;

  const query = {}; // always exclude admins for dropdown
  if (forDropdown === "true" || forDropdown === true) {
    query.role = { $ne: "admin" };
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

  const selectFields = isDropdown
    ? "_id firstname lastname email"
    : "-forgotPasswordToken -forgotPasswordTokenExpiry -refreshToken -password";

  if (forDropdown === "true" || forDropdown === true) {
    // Return all matching employees for dropdown, no pagination
    const employees = await User.find(query)
      .select(selectFields)
      .sort({ firstname: 1 });
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Employees fetched successfully", { employees })
      );
  }

  // Otherwise, paginated list
  const employees = await User.find(query)
    .select(selectFields)
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const totalEmployees = await User.countDocuments(query);

  if (employees.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(201, "Data Not Found", { employees: [] }));
  }

  return res.status(200).json(
    new ApiResponse(201, "Data Fetched Successfully", {
      employees,
      paggination: {
        total: totalEmployees,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalEmployees / Number(limit)),
      },
    })
  );
});
export const AddEmployee = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role, title, hireDate } =
    req.body;

  const ExistingUser = await User.findOne({
    $or: [{ email: email }, { phoneNo: phone }],
  });

  if (ExistingUser) {
    if (ExistingUser.email === email) {
      throw new ApiError(400, "User already exists with this email");
    }
    if (ExistingUser.phoneNo === phone) {
      throw new ApiError(400, "User already exists with this phone number");
    }
  }

  const newUser = await User.create({
    firstname: firstName,
    lastname: lastName,
    email,
    password,
    phoneNo: phone,
    role: role || "employee",
    title,
    hireDate: hireDate || new Date(),
    totpSecret: null,
    isTOTPEnabled: false,
    isTOTPVerified: false,
  });

  if (!newUser) {
    throw new ApiError(500, "Account not created due to server error");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Employee Account created successfully"));
});

export const EditEmployee = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const findUser = await User.findById(userId);
  if (!findUser) {
    throw new ApiError(404, "No such user found");
  }

  const { firstname, lastname, email, phoneNo, role, title, hireDate } =
    req.body;

  const updates = {};

  // If profile picture is uploaded → skip equality check and update
  if (req.file && req.file.path) {
    if (findUser.profilePic) {
      try {
        await deleteFromCloudinary(findUser.profilePic); // delete old picture
      } catch (err) {
        console.error("Error deleting old profile picture:", err.message);
      }
    }

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
      (email ? email === findUser.email : true) &&
      (phoneNo ? phoneNo === findUser.phoneNo : true) &&
      (role ? role === findUser.role : true) &&
      (title ? title === findUser.title : true) &&
      (hireDate
        ? new Date(hireDate).toISOString() === findUser.hireDate.toISOString()
        : true);

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
  if (email && email !== findUser.email) updates.email = email;
  if (phoneNo && phoneNo !== findUser.phoneNo) updates.phoneNo = phoneNo;
  if (role && role !== findUser.role) updates.role = role;
  if (title && title !== findUser.title) updates.title = title;
  if (
    hireDate &&
    new Date(hireDate).toISOString() !== findUser.hireDate.toISOString()
  )
    updates.hireDate = new Date(hireDate);
  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new ApiError(500, "Error while updating user details");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee profile updated successfully"));
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
      "confirm password does not match with new Password"
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
    .json(new ApiResponse(200, null, "Employee removed successfully"));
});
export const resetTotp = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const employee = await User.findById(userId);
  if (!employee) {
    throw new ApiError(404, "No such user found");
  }
  employee.totpSecret = null;
  employee.isTOTPEnabled = false;
  employee.isTOTPVerified = false;

  await employee.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `${employee.firstname} ${employee.lastname}'s Totp Reseted`
      )
    );
});
