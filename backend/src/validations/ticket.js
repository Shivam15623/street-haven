import Joi from "joi";

export const createTicketSchema = Joi.object({
  reqTitle: Joi.string().trim().required().messages({
    "any.required": "reuest Title is required",
    "string.base": "Request title must be a string",
  }),

  description: Joi.string().trim().messages({
    "any.required": "description is required",
    "string.base": "Description must be a string",
  }),

  priority: Joi.string()
    .valid("Low", "Medium", "High")
    .default("Low")
    .messages({
      "any.only": "Priority must be one of Low, Medium, or High",
      "string.base": "Priority must be a string",
    }),

  category: Joi.string()
    .valid("IT Help Desk", "Property Maintenance")
    .required()
    .messages({
      "any.only":
        "Category must be either IT Help Desk or Property Maintenance",
      "any.required": "Category is required",
      "string.empty": "Category is required",
    }),

  location: Joi.string().required().messages({
    "any.required": "Location is required",
    "string.empty": "Location is required",
  }),
});
