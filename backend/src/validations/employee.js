import Joi from "joi";

import { ROLES } from "../model/user.js";
import { PERMISSIONS } from "../auth/permissions.js";
import { objectId } from "./common.js";

export const viewEmployees = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().allow("").optional(),
  sortBy: Joi.string()
    .pattern(/^[A-Za-z]+$/)
    .optional(),
  order: Joi.string()
    .valid("desc", "asc") // allowed roles
    .optional(),
  forDropdown: Joi.boolean().optional(),
  role:Joi.string().trim().valid(...Object.values(ROLES)).optional()
});

export const createEmployeeSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .pattern(/^[A-Za-z ]+$/)
    .required()
    .messages({
      "string.pattern.base": "First name must contain only letters",
      "any.required": "First name is required",
    }),
  lastName: Joi.string()
    .trim()
    .pattern(/^[A-Za-z ]+$/)
    .required()
    .messages({
      "string.pattern.base": "Last name must contain only letters",
      "any.required": "Last name is required",
    }),

  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .pattern(/^[a-zA-Z0-9._%+-]/)
    .required()
    .messages({
      "string.pattern.base": "Email must be on the streethaven.com domain",
      "any.required": "Email is required",
      "string.email": "Email must be a valid email",
    }),

  phone: Joi.string()
    .trim()
    .pattern(
      /^(?:\+1\s?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/,
    )
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a valid Canadian number",
      "any.required": "Phone number is required",
    }),

  role: Joi.string()
    .trim()
    .valid(...Object.values(ROLES))
    .required()
    .messages({
      "any.only": "Role must be one of admin, manager, or employee",
      "any.required": "Role is required",
    }),

  title: Joi.string().trim().required().messages({
    "any.required": "Title is required",
  }),
  superviserId: Joi.string().hex().length(24),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[a-z]/, "lowercase")
    .pattern(/\d/, "number")
    .pattern(/[@$!%*?&#]/, "special")
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.name":
        "Password must contain at least one {#name} character",
      "any.required": "Password is required",
    }),

  hireDate: Joi.date().required().messages({
    "date.base": "Hire date must be a valid date",
    "any.required": "Hire date is required",
  }),
   locations: Joi.array()
    .items(
      Joi.string().custom(objectId).messages({
        "any.invalid": "Invalid location id",
      })
    )
    .default([])
    .messages({
      "array.base": "Locations must be an array",
    }),
  customPermissions: Joi.array()
    .items(Joi.string().valid(...Object.values(PERMISSIONS)))
    .default([])
    .messages({
      "array.base": "Custom permissions must be an array",
      "any.only": "Invalid permission selected",
    }),
});

export const editEmployeeSchema = Joi.object({
  firstname: Joi.string()
    .pattern(/^[A-Za-z ]+$/)
    .optional(),
  lastname: Joi.string()
    .pattern(/^[A-Za-z ]+$/)
    .optional(),

  email: Joi.string()
    .email({ tlds: { allow: false } }) // basic email format
    .pattern(/^[a-zA-Z0-9._%+-]/) // only allow abazsc.com domain
    .optional()
    .messages({
      "string.pattern.base": "Email must be on the abazsc.com domain",
    }),

  phoneNo: Joi.string()
    .pattern(
      /^(?:\+1\s?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/,
    ) // assuming 10-digit numbers
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be canadian",
    }),

  role: Joi.string()
    .valid(...Object.values(ROLES)) // allowed roles
    .optional()
    .messages({
      "any.only": "Role must be one of admin, manager, or employee,",
    }),

  title: Joi.string().optional(),
  superviserId: Joi.string().hex().length(24).optional(),
  hireDate: Joi.date().optional(),

  // Volunteer end date — optional on purpose. Omitted/undefined means
  // "don't touch endAt/status" on the controller side. When provided,
  // it must not be earlier than hireDate (if hireDate was also sent).
  endAt: Joi.date()
    .optional()
    .allow(null, "")
    .min(Joi.ref("hireDate"))
    .messages({
      "date.base": "End date must be a valid date",
      "date.min": "End date cannot be before the start/hire date",
    }),

  customPermissions: Joi.array()
    .items(Joi.string().valid(...Object.values(PERMISSIONS)))
    .default([])
    .messages({
      "array.base": "Custom permissions must be an array",
      "any.only": "Invalid permission selected",
    }),
  locations: Joi.array()
    .items(
      Joi.string().custom(objectId).messages({
        "any.invalid": "Invalid location id",
      }),
    )
    .optional()
    .messages({
      "array.base": "Locations must be an array",
    }),
});
