import Joi from "joi";

export const addNodeSchema = Joi.object({
  label: Joi.string().trim().min(1).required().messages({
    "string.empty": "Label is required",
    "any.required": "Label is required",
  }),
  department: Joi.string().trim().min(1).required().messages({
    "string.empty": "department is required",
    "any.required": "department is required",
  }),
  reportsTo: Joi.alternatives()
    .try(Joi.string().hex().length(24), Joi.valid(null))
    .required()
    .messages({
      "alternatives.match": "Invalid reportsTo value",
      "any.required": "reportsTo is required",
    }),
});
export const editNodeSchema = Joi.object({
  label: Joi.string().trim().min(1).messages({}),
  department: Joi.string().trim().min(1).messages({}),
  reportsTo: Joi.alternatives()
    .try(Joi.string().hex().length(24), Joi.valid(null))
    .messages({
      "alternatives.match": "Invalid reportsTo value",
      "any.required": "reportsTo is required",
    }),
});
