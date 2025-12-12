import Joi from "joi";

export const createProgramManualSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must be at most 150 characters",
    "any.required": "Title is required",
  }),

  description: Joi.string().trim().min(10).required().messages({
    "string.min": "Description must be at least 10 characters",

    "any.required": "Description is required",
  }),

  tags: Joi.array()
    .items(
      Joi.string().trim().max(50).messages({
        "string.max": "Each tag must be at most 50 characters",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one tag is required",
      "any.required": "Tags are required",
    }),

  type: Joi.string()
    .trim()
    .valid("HR", "Technical", "Finance", "Operations", "Other")
    .required()
    .messages({
      "any.only": "Invalid type",
      "any.required": "Type is required",
    }),
});

export const editProgramManualSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).optional().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must be at most 150 characters",
  }),

  description: Joi.string().trim().min(10).optional().messages({
    "string.min": "Description must be at least 10 characters",
  }),

  tags: Joi.array()
    .items(
      Joi.string().trim().max(50).messages({
        "string.max": "Each tag must be at most 50 characters",
      })
    )
    .optional(),

  type: Joi.string()
    .trim()
    .valid("HR", "Technical", "Finance", "Operations", "Other")
    .optional()
    .messages({
      "any.only": "Invalid type",
    }),
});
