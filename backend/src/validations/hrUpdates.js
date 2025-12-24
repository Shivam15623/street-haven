import Joi from "joi";

export const createHrUpdateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title must not exceed 100 characters",
  }),

  description: Joi.string().trim().min(10).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters long",

  }),
});
export const updateHrUpdateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).messages({
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title must not exceed 100 characters",
  }),

  description: Joi.string().trim().min(10).messages({
    "string.min": "Description must be at least 10 characters long",
  }),
})
  // 🔥 Require at least one field to be present
  .min(1)
  // ❌ Disallow extra fields
  .unknown(false);
