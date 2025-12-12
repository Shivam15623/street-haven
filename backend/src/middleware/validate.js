import { ApiError } from "../utills/ApiError.js";
import fs from "fs";

export const validateRequest = (schema, property = "body") => {
  return async (req, res, next) => {
    try {
      // Validate using Joi
      const validatedData = await schema.validateAsync(req[property], {
        abortEarly: false, // return all errors
        stripUnknown: true, // remove unknown fields
      });

      // Overwrite request property with validated data
      req[property] = validatedData;
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
      next(new ApiError(400, "Validation failed", messages));
    }
  };
};
