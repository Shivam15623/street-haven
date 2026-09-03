import Joi from "joi";
import { objectId } from "./common.js";

export const createLocationSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    "string.empty": "name is required",
    "any.required": "name is required",
  }),
  managerIds: Joi.array()
    .items(
      Joi.string()
        .custom(objectId)
        .messages({ "any.invalid": "Invalid manager id" }),
    )
    .optional()
    .default([]),
  facilityManager: Joi.string()
    .custom(objectId)
    .optional()
    .messages({ "any.invalid": "Invalid facility manager id" }),
});

export const updateLocationSchema = Joi.object({
  name: Joi.string().trim().min(1).messages({
    "string.empty": "name cannot be empty",
  }),
  managerIds: Joi.array()
    .items(
      Joi.string()
        .custom(objectId)
        .messages({ "any.invalid": "Invalid manager id" }),
    )
    .min(1)
    .messages({
      "array.min": "managers should not be empty",
    }),
  facilityManager: Joi.string()
    .custom(objectId)
    .messages({ "any.invalid": "Invalid facility manager id" }),
  isActive: Joi.boolean(),
}).min(1); // at least one field must be provided on update

export const fetchLocationsSchema = Joi.object({
  isActive: Joi.string().valid("true", "false"),
});

export const managerActionSchema = Joi.object({
  managerId: Joi.string().custom(objectId).required().messages({
    "any.required": "managerId is required",
    "any.invalid": "Invalid manager id",
  }),
});

export const facilityManagerActionSchema = Joi.object({
  facilityManagerId: Joi.string().custom(objectId).required().messages({
    "any.required": "facilityManagerId is required",
    "any.invalid": "Invalid facility manager id",
  }),
});
