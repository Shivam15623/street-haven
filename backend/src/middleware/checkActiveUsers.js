import { ApiError } from "../utills/ApiError.js";

export const checkActiveUser = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized"));
  }

  if (req.user.status !== "active") {
    return next(new ApiError(403, "Your account has been deactivated. Please contact an administrator."));
  }

  next();
};