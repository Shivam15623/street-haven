import Joi from "joi";

const ALLOWED_ROLES = [ "employee", "manager"];
export const registerUserSchema = Joi.object({
  firstName: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "First name must contain only letters",
      "string.empty": "First name is required",
      "any.required": "First name is required",
    }),

  lastName: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "Last name must contain only letters",
      "string.empty": "Last name is required",
      "any.required": "Last name is required",
    }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  role: Joi.string()
    .trim()
    .valid(...ALLOWED_ROLES)
    .required()
    .messages({
      "any.only": "Role must be one of admin, manager, or employee",
      "any.required": "Role is required",
    }),
  phone: Joi.string()
    .pattern(
      /^\+1\s?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/
    )
    .required()
    .messages({
      "string.pattern.base": "Please enter a valid Canadian phone number",
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
    }),

  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must include at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
});
export const loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": "Token is required",
    "any.required": "Token is required",
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
export const setupTotpSchema = Joi.object({
  tempToken: Joi.string().required(),

  totpCode: Joi.number().integer().min(100000).max(999999).required().messages({
    "number.base": "TOTP code must be a number",
    "number.integer": "TOTP code must be an integer",
    "number.min": "TOTP code must be a 6-digit number",
    "number.max": "TOTP code must be a 6-digit number",
    "any.required": "TOTP code is required",
  }),
});
