import Joi from "joi";

export const editUserProfileSchema = Joi.object({
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

    .messages({
      "string.pattern.base": "Enter a valid 10-digit phone number",
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
    }),
});

export const resetPasswordSchemauserProfile = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required",
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "New password must include at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character",
      "string.empty": "New password is required",
      "any.required": "New password is required",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Confirm password must match new password",
      "string.empty": "Confirm password is required",
      "any.required": "Confirm password is required",
    }),
});
