import Joi from "joi";

export const editUserProfile = Joi.object({
  firstname: Joi.string().trim().min(3).messages({
    "string.min": "Firstname must be at least 3 characters",
    "string.empty": "Firstname cannot be empty",
  }),

  lastname: Joi.string().trim().min(3).messages({
    "string.min": "Lastname must be at least 3 characters",
    "string.empty": "Lastname cannot be empty",
  }),

  phoneNo: Joi.string()
    .pattern(
      /^(?:\+1\s?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/
    )
    .required()
    .messages({
      "string.pattern.base": "Enter a valid 10-digit Canadian phone number",
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
    }),
});
