import { ApiError } from "../utills/ApiError.js";
import fs from "fs";
import { addCommentSchema } from "../validations/ticket.js";

export const validateRequest = (schema, property = "body") => {
  return async (req, res, next) => {
    try {
      // Validate using Joi

      const validatedData = await schema.validateAsync(req[property], {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
        convert: true, // ✅ THIS IS THE KEY
      });

      // Overwrite request property with validated data

      // ✅ Safe assignment
      if (property === "query") {
        Object.assign(req.query, validatedData);
      } else {
        req[property] = validatedData;
      }

      next();
    } catch (err) {
      // Helper to delete uploaded file(s)
      const deleteFile = (filePath) => {
        if (!filePath) return;
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Failed to delete file:", unlinkErr);
        });
      };

      // Delete single uploaded file
      if (req.file?.path) deleteFile(req.file.path);

      // Delete multiple uploaded files
      if (Array.isArray(req.files)) {
        req.files.forEach((file) => deleteFile(file.path));
      }

      // Delete files in object format (e.g., multiple fields)
      if (
        req.files &&
        typeof req.files === "object" &&
        !Array.isArray(req.files)
      ) {
        Object.values(req.files).forEach((fileArr) => {
          if (Array.isArray(fileArr)) {
            fileArr.forEach((file) => deleteFile(file.path));
          }
        });
      }

      // Extract Joi error messages
      const messages = err.details?.map((e) => e.message) || [err.message];
      next(
        new ApiError(
          400,
          "Validation failed",
          messages,
          "",
          "VALIDATION_FAILED",
        ),
      );
    }
  };
};
export const validateAddComment = (req, res, next) => {
  const { error } = addCommentSchema.validate({
    message: req.body.message,
    filesCount: req.files?.length || 0,
  });

  if (error) {
    return next(new ApiError(400, error.message));
  }

  next();
};
