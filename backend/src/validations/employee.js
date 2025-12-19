import Joi from "joi";

import { ROLES } from "../model/user.js";

export const viewEmployees = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string()
    .pattern(/^[A-Za-z]+$/)
    .optional(),
  order: Joi.string()
    .valid("desc", "asc") // allowed roles
    .optional(),
  forDropdown: Joi.boolean().optional(),
});

export const createEmployeeSchema = Joi.object({
  firstname: Joi.string()
    .pattern(/^[A-Za-z]+$/)
    .required(),
  lastname: Joi.string()
    .pattern(/^[A-Za-z]+$/)
    .required(),

  email: Joi.string()
    .email({ tlds: { allow: false } }) // basic email format
    .pattern(/^[a-zA-Z0-9._%+-]+@streethaven\.com$/) // only allow abazsc.com domain
    .required()
    .messages({
      "string.pattern.base": "Email must be on the abazsc.com domain",
    }),

  phoneNo: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/
    ) // assuming 10-digit numbers
    .required()
    .messages({
      "string.pattern.base": "Phone number must be canadian",
    }),

  role: Joi.string()
    .valid(...Object.values(ROLES)) // allowed roles
    .required()
    .messages({
      "any.only": "Role must be one of admin, manager, or employee,",
    }),

  title: Joi.string().required(),

  hireDate: Joi.date().required(),
});

export const editEmployeeSchema = Joi.object({
  firstname: Joi.string()
    .pattern(/^[A-Za-z]+$/)
    .optional(),
  lastname: Joi.string()
    .pattern(/^[A-Za-z]+$/)
    .optional(),

  email: Joi.string()
    .email({ tlds: { allow: false } }) // basic email format
    .pattern(/^[a-zA-Z0-9._%+-]+@streethaven\.com$/) // only allow abazsc.com domain
    .optional()
    .messages({
      "string.pattern.base": "Email must be on the abazsc.com domain",
    }),

  phoneNo: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/
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

  hireDate: Joi.date().optional(),
});
