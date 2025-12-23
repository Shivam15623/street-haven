import { sendResetEmail } from "../helper/EmailsMailer/emailHandlers.js";
import User from "../model/user.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import generateTokens from "../utills/GenerateTokens.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import otplib from "otplib";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
export const RegisterEmployee = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role } = req.body;

  // Check if role is invalid
  const forbiddenRoles = ["super_admin", "admin", "director"];
  if (role && forbiddenRoles.includes(role.toLowerCase())) {
    throw new ApiError(400, `Role cannot be ${role}`);
  }

  // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ email: email }, { phoneNo: phone }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(400, "User already exists with this email");
    } else if (existingUser.phoneNo === phone) {
      throw new ApiError(400, "User already exists with this phone number");
    }
  }

  // Create user
  const newUser = await User.create({
    firstname: firstName,
    lastname: lastName,
    email: email,
    password: password,
    phoneNo: phone,
    role: role ? role.toLowerCase() : "employee", // default to employee
  });

  const findUser = await User.findById(newUser._id);
  if (!findUser) {
    throw new ApiError(500, "Account not created due to server error");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Account created successfully"));
});

export const RegisterAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  const ExistingUser = await User.findOne({
    $or: [{ email: email }, { phoneNo: phone }],
  });
  if (ExistingUser) {
    if (ExistingUser.email === email) {
      throw new ApiError(400, "User already exists with this email");
    } else if (ExistingUser.phoneNo === phone) {
      throw new ApiError(400, "User already exists with this phone number");
    }
  }

  const newUser = await User.create({
    firstname: firstName,
    lastname: lastName,
    email: email,
    password: password,
    phoneNo: phone,
    role: "admin",
  });
  const findUser = await User.findById(newUser._id);
  if (!findUser) {
    throw new ApiError(500, "Account not created due to server error");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "Admin account created successfully"));
});
export const LogOut = asyncHandler(async (req, res) => {
  // Clear cookies on the client
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }
  await User.findByIdAndUpdate(req.user._id, {
    refreshToken: "",
  });
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false, // must be true for HTTPS (Render uses HTTPS)
    sameSite: "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false, // must be true for HTTPS (Render uses HTTPS)
    sameSite: "lax",
  });

  return res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});
export const Login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "Account not found with this email");
  }

  // 2. Validate password
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect password");
  }

  // 3. Create a short-lived temp token (used for TOTP verification / setup)

  const tempToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

  // 4. If TOTP is already enabled → Ask for authenticator code
  if (user.isTOTPEnabled) {
    return res.status(200).json(
      new ApiResponse(201, "Please enter your 6-digit authenticator code", {
        status: "TOTP_REQUIRED",
        tempToken,
      })
    );
  }

  // 5. If TOTP is not enabled → Ask to set up 2FA
  return res.status(200).json(
    new ApiResponse(201, "Please complete two-factor setup", {
      status: "TOTP_SETUP_REQUIRED",
      tempToken,
    })
  );
});
export const ForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Please provide your email");
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }
  await sendResetEmail({ email }); // Function sends reset email with token
  // Here you would typically send a password reset email with a token
  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset link sent to your email"));
});
export const ResetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });
  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset time expired");
  }
  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset successfully"));
});
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Token mismatch or expired");
    }

    // Generate fresh tokens
    const { accessToken, refreshToken } = await generateTokens(user._id);

    // Fetch user again (sanitized fields)
    const findUser = await User.findById(user._id)
      .populate("role", "roleName permissions _id")
      .select(
        "-password -refreshToken -updatedAt -createdBy -createdAt -isActive -__v"
      );

    const userToSend = {
      _id: findUser._id,
      firstName: findUser.firstname,
      lastName: findUser.lastname,
      email: findUser.email,
      phoneNo: findUser.phoneNo,
      role: findUser.role,
      slug: findUser.slug,
      profilePic: findUser.profilePic,
      createdAt: findUser.createdAt,
      hireDate: findUser.hireDate,
    };

    const isProduction = process.env.NODE_ENV === "production";

    const accessOptions = {
      httpOnly: true,
      secure: isProduction, // must be true for HTTPS (Render uses HTTPS)
      sameSite: isProduction ? "None" : "lax", // must be 'None' for cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const refreshOptions = {
      httpOnly: true,
      secure: isProduction, // must be true for HTTPS (Render uses HTTPS)
      sameSite: isProduction ? "None" : "lax", // must be 'None' for cross-site cookies
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessOptions)
      .cookie("refreshToken", refreshToken, refreshOptions)
      .json(
        new ApiResponse(200, "Access token refreshed", {
          user: userToSend,
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export const silentAuth = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decodedToken._id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }
  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Token mismatch");
  }
  const { accessToken, refreshToken } = await generateTokens(user._id);
  const finduser = await User.findById(user._id)
    .populate("role", "roleName permissions _id")
    .select(
      "-password -refreshToken -updatedAt -createdBy -createdAt -isActive -__v"
    );
  const userToSend = {
    _id: finduser._id,
    firstName: finduser.firstname,
    lastName: finduser.lastname,
    email: finduser.email,
    phoneNo: finduser.phoneNo,
    role: finduser.role,
    slug: finduser.slug,
    profilePic: finduser.profilePic,
    createdAt: finduser.createdAt,
    hireDate: finduser.hireDate,
  };
  const isProduction = process.env.NODE_ENV === "production";

  const accessOptions = {
    httpOnly: true,
    secure: isProduction, // must be true for HTTPS (Render uses HTTPS)
    sameSite: isProduction ? "None" : "lax", // must be 'None' for cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const refreshOptions = {
    httpOnly: true,
    secure: isProduction, // must be true for HTTPS (Render uses HTTPS)
    sameSite: isProduction ? "None" : "lax", // must be 'None' for cross-site cookies
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  // if (process.env.Deploy_env === "development") {
  //   accessoptions.secure = true;
  //   accessoptions.sameSite = "None";
  //   refreshoptions.sameSite = "None";
  //   refreshoptions.secure = true;
  // }
  return res
    .status(201)
    .cookie("accessToken", accessToken, accessOptions)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json(
      new ApiResponse(200, "User Loggin Successfull", {
        user: userToSend,
        refreshToken,
        accessToken,
      })
    );
});
export const totpGenerate = asyncHandler(async (req, res) => {
  const { tempToken } = req.body;
  if (!tempToken) throw new ApiError(400, "Temp token required");

  let decoded;
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.userId);
  if (!user) throw new ApiError(404, "User not found");

  const secret = speakeasy.generateSecret({
    name: `StreetHaven (${user.email}) - ${user.slug}`,
  });

  user.totpSecret = secret.base32;
  user.isTOTPEnabled = false;
  await user.save({ validateBeforeSave: false });

  // 3. Create a short-lived temp token (used for TOTP verification / setup)
  const setupToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });
  const qrCode = await new Promise((resolve, reject) => {
    qrcode.toDataURL(secret.otpauth_url, (err, url) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
  return res.status(200).json(
    new ApiResponse(201, "Connect With Authenticator App", {
      qrCode,
      setupToken,
    })
  );
});

export const verifyTOTP = asyncHandler(async (req, res) => {
  const { tempToken, totpCode } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Expired token");
  }

  const user = await User.findById(decoded.userId).populate(
    "role",
    "roleName permissions _id"
  );

  const isValid = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: "base32",
    token: totpCode,
    window: 1,
  });

  if (!isValid) throw new ApiError(400, "Invalid TOTP");

  user.isTOTPEnabled = true;
  await user.save({ validateBeforeSave: false });

  // NOW CREATE NORMAL LOGIN TOKENS
  const { accessToken, refreshToken } = await generateTokens(user._id);
  const userToSend = {
    _id: user._id,
    firstName: user.firstname,
    lastName: user.lastname,
    email: user.email,
    phoneNo: user.phoneNo,
    role: user.role,
    slug: user.slug,
    profilePic: user.profilePic,
    createdAt: user.createdAt,
    hireDate: user.hireDate,
  };
  const isProduction = process.env.NODE_ENV === "production";

  const accessOptions = {
    httpOnly: true,
    secure: isProduction, // must be true for HTTPS (Render uses HTTPS)
    sameSite: isProduction ? "None" : "lax", // must be 'None' for cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const refreshOptions = {
    httpOnly: true,
    secure: isProduction, // must be true for HTTPS (Render uses HTTPS)
    sameSite: isProduction ? "None" : "lax", // must be 'None' for cross-site cookies
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, accessOptions)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json(
      new ApiResponse(200, "Access token refreshed", {
        user: userToSend,
        accessToken,
        refreshToken,
      })
    );
});

export const verifyTOTPSetup = asyncHandler(async (req, res) => {
  const { tempToken, totpCode } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Expired token");
  }

  const user = await User.findById(decoded.userId);

  const isValid = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: "base32",
    token: totpCode,
    window: 1,
  });

  if (!isValid) throw new ApiError(400, "Invalid TOTP");

  user.isTOTPEnabled = true;
  user.isTOTPVerified = true;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "user Totp setup Verified Now Login"));
});
