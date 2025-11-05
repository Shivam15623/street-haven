import { ApiError } from "../utills/ApiError.js";
import fs from "fs";
export const validateRequest = (schema, property = "body") => {
  return async (req, res, next) => {
    try {

      const validatedData = await schema.validate(req[property], {
        abortEarly: false, // return all errors, not just the first
        stripUnknown: true, // remove any unknown fields not defined in schema
      });
      // Overwrite the original req.body (or req.query/req.params) with validated & cleaned data
      req[property] = validatedData;
      next();
    } catch (err) {
      const deleteFile = (filePath) => {
        if (!filePath) return;
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Failed to delete file:", unlinkErr);
        });
      };

      // 🧹 Delete single uploaded file
      if (req.file?.path) {
        deleteFile(req.file.path);
      }

      // 🧹 Delete multiple uploaded files
      if (Array.isArray(req.files)) {
        req.files.forEach((file) => deleteFile(file.path));
      }

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
      const messages = err.inner?.map((e) => e.message) || [err.message];
      next(new ApiError(400, "Validation failed", messages));
    }
  };
};
