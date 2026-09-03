import Joi from "joi";

export const editMeetingMinutesSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).optional().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must be at most 150 characters",
  }),

  attendees: Joi.number().positive().integer().optional().messages({
    "number.base": "Attendees must be a number",
    "number.positive": "Attendees must be greater than 0",
    "number.integer": "Attendees must be an integer",
  }),

  keyTopicsDiscussed: Joi.array()
    .items(
      Joi.string().trim().max(50).messages({
        "string.max": "Each topic must be at most 50 characters",
      })
    )
    .max(20)
    .optional()
    .messages({
      "array.max": "You can add at most 20 topics",
    }),

  meetingDate: Joi.date().optional().messages({
    "date.base": "Invalid meeting date format",
  }),

  keyHighlights: Joi.array()
    .items(
      Joi.string().trim().max(300).messages({
        "string.max": "Each highlight must be at most 300 characters",
      })
    )
    .max(20)
    .optional()
    .messages({
      "array.max": "You can add at most 20 highlights",
    }),
});

export const createMeetingMinutesSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must be at most 150 characters",
    "any.required": "Title is required",
  }),

  attendees: Joi.number().positive().integer().required().messages({
    "number.base": "Attendees must be a number",
    "number.positive": "Attendees must be greater than 0",
    "number.integer": "Attendees must be an integer",
    "any.required": "Attendees is required",
  }),

  keyTopicsDiscussed: Joi.array()
    .items(
      Joi.string().trim().max(50).messages({
        "string.max": "Each topic must be at most 50 characters",
      })
    )
    .max(20)
    .required()
    .messages({
      "array.max": "You can add at most 20 topics",
      "any.required": "Key topics discussed is required",
    }),

  meetingDate: Joi.date().max("now").optional().messages({
    "date.base": "Invalid meeting date format",
    "date.max": "Meeting date cannot be in the future",
  }),

  keyHighlights: Joi.array()
    .items(
      Joi.string().trim().max(300).messages({
        "string.max": "Each highlight must be at most 300 characters",
      })
    )
    .max(20)
    .required()
    .messages({
      "array.max": "You can add at most 20 highlights",
      "any.required": "Key highlights are required",
    }),
});
