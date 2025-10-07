import { sendResetEmail } from "../helper/EmailsMailer/emailHandlers.js";
import User from "../model/user.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import generateTokens from "../utills/GenerateTokens.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
export const RegisterEmployee = asyncHandler(async (req, res) => {
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
    role: "employee",
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
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    throw new ApiError(404, "Account not found with this email");
  }
  const isPasswordCorrect = await findUser.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect password");
  }
  const { accessToken, refreshToken } = await generateTokens(findUser._id);

  // Sanitize user object for frontend
  const userToSend = {
    _id: findUser._id,
    firstName: findUser.firstname,
    lastName: findUser.lastname,
    email: findUser.email,
    phoneNo: findUser.phoneNo,
    role: findUser.role,
    slug: findUser.slug,
    profilePic: findUser.profilePic,
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
      new ApiResponse(200, "Login successful", {
        user: userToSend,
        accessToken,
        refreshToken,
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

  console.log(Date.now())
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
    const findUser = await User.findById(user._id).select(
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
  const finduser = await User.findById(user._id).select(
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
