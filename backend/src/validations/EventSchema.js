import Joi from "joi";

export const createEventSchema = Joi.object({
  title: Joi.string().trim().min(3).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters",
    "any.required": "Title is required",
  }),

  description: Joi.string().trim().min(10).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters",
    "any.required": "Description is required",
  }),

  locationName: Joi.string().trim().required().messages({
    "string.empty": "Location name is required",
    "any.required": "Location name is required",
  }),

  locationUrl: Joi.string().uri().required().messages({
    "string.uri": "Location URL must be a valid URL",
    "any.required": "Location URL is required",
  }),

  capacity: Joi.number().integer().min(1).required().messages({
    "number.base": "Capacity must be a number",
    "number.integer": "Capacity must be an integer",
    "number.min": "Capacity must be greater than 0",
    "any.required": "Capacity is required",
  }),

  eventDate: Joi.date().min("now").required().messages({
    "date.base": "Invalid event date",
    "date.min": "Event date cannot be in the past",
    "any.required": "Event date is required",
  }),

  startTime: Joi.date().required().messages({
    "date.base": "Invalid start time",
    "any.required": "Start time is required",
  }),

  endTime: Joi.date().greater(Joi.ref("startTime")).required().messages({
    "date.base": "Invalid end time",
    "date.greater": "End time must be after start time",
    "any.required": "End time is required",
  }),
}).unknown(false);

export const editEventSchema = Joi.object({
  title: Joi.string().trim().min(3).messages({
    "string.min": "Title must be at least 3 characters",
  }),

  description: Joi.string().trim().min(10).messages({
    "string.min": "Description must be at least 10 characters",
  }),

  locationName: Joi.string().trim().messages({
    "string.empty": "Location name cannot be empty",
  }),

  locationUrl: Joi.string().uri().messages({
    "string.uri": "Location URL must be a valid URL",
  }),

  capacity: Joi.number().integer().min(1).messages({
    "number.base": "Capacity must be a number",
    "number.integer": "Capacity must be an integer",
    "number.min": "Capacity must be greater than 0",
  }),

  eventDate: Joi.date().min("now").messages({
    "date.base": "Invalid event date",
    "date.min": "Event date cannot be in the past",
  }),

  startTime: Joi.date().messages({
    "date.base": "Invalid start time",
  }),

  endTime: Joi.date().greater(Joi.ref("startTime")).messages({
    "date.base": "Invalid end time",
    "date.greater": "End time must be after start time",
  }),
})
  .min(1) // 🔥 Prevent empty PATCH requests
  .unknown(false);
