import Joi from "joi";

export const createEventSchema = Joi.object({
  title: Joi.string()
    .required()
    .messages({
      "string.empty": "Title is required",
      "any.required": "Title is required",
    }),

  description: Joi.string()
    .required()
    .messages({
      "string.empty": "Description is required",
      "any.required": "Description is required",
    }),

  location: Joi.string()
    .required()
    .messages({
      "string.empty": "Location is required",
      "any.required": "Location is required",
    }),

  facilitator: Joi.string()
    .required()
    .messages({
      "string.empty": "Facilitator is required",
      "any.required": "Facilitator is required",
    }),

  capacity: Joi.number()
    .min(1)
    .required()
    .messages({
      "number.base": "Capacity must be a number",
      "number.min": "Capacity must be greater than 0",
      "any.required": "Capacity is required",
    }),

  eventDate: Joi.date()
    .min("now")
    .required()
    .messages({
      "date.base": "Invalid date format",
      "date.min": "Event date cannot be in the past",
      "any.required": "Event date is required",
    }),

  startTime: Joi.date()
    .min("now")
    .required()
    .messages({
      "date.base": "Invalid start time",
      "date.min": "Start time cannot be in the past",
      "any.required": "Start time is required",
    }),

  endTime: Joi.date()
    .greater(Joi.ref("startTime"))
    .required()
    .messages({
      "date.base": "Invalid end time",
      "date.greater": "End time must be after start time",
      "any.required": "End time is required",
    }),
});
