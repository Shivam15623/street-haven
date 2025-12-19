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

export const editTicketSchema = Joi.object({
  assignedId: Joi.string().hex().length(24).optional(),
  status: Joi.string()
    .valid("Open", "In Progress", "Under Review", "Completed")
    .optional(),
  description: Joi.string().optional(),
  requestTitle: Joi.string().trim().optional(),
  category: Joi.string()
    .valid("IT Help Desk", "Property Maintenance")
    .optional(),

  location: Joi.string().optional(),
  priority: Joi.string().valid("Low", "Medium", "High").optional(),
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
