import Joi from "joi";
import { objectId } from "./common.js";

export const createTicketSchema = Joi.object({
  reqTitle: Joi.string().trim().required().messages({
    "any.required": "Request title is required",
    "string.empty": "Request title is required",
    "string.base": "Request title must be a string",
  }),

  description: Joi.string().trim().required().messages({
    "any.required": "Description is required",
    "string.empty": "Description is required",
    "string.base": "Description must be a string",
  }),

  category: Joi.string().required().messages({
    "any.only":
      "Category must be one of Plumbing, Electrical, HVAC, Carpentry, Appliances, or Cleaning",
    "any.required": "Category is required",
    "string.empty": "Category is required",
  }),

  location: Joi.string().custom(objectId).required().messages({
    "any.required": "Location is required",
    "string.empty": "Location is required",
    "any.invalid": "Invalid location id",
  }),
});

export const editTicketSchema = Joi.object({
  description: Joi.string().optional(),
  requestTitle: Joi.string().trim().optional(),
  category: Joi.string().optional().messages({
    "string.empty": "Category is required",
  }),

  location: Joi.string().custom(objectId).optional().messages({
    "string.empty": "Location is required",
    "any.invalid": "Invalid location id",
  }),
});
export const addCommentSchema = Joi.object({
  message: Joi.string().trim().allow("").optional(),

  filesCount: Joi.number().integer().min(0).required(),
})
  // 🔑 At least one of them must exist
  .custom((value, helpers) => {
    const hasMessage = value.message && value.message.trim().length > 0;
    const hasFiles = value.filesCount > 0;

    if (!hasMessage && !hasFiles) {
      return helpers.error("any.custom");
    }

    return value;
  })
  .messages({
    "any.custom": "Comment message or at least one attachment is required",
  });

export const fetchTicketsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional(),
  search: Joi.string().allow("").optional(),
  status: Joi.string().optional(),
  priority: Joi.string().optional(),
  order: Joi.string().valid("asc", "desc").optional(),
});
