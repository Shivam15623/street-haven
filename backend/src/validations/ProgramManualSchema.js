import * as yup from "yup";

// CREATE Program Manual Schema
export const createProgramManualSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be at most 150 characters")
    .required("Title is required"),

  description: yup
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters")
    .required("Description is required"),

  tags: yup
    .array()
    .of(
      yup
        .string()
        .trim()
        .max(50, "Each tag must be at most 50 characters")
    )
    .min(1, "At least one tag is required")
    .required("Tags are required"),

  type: yup
    .string()
    .trim()
    .oneOf(["guide", "policy", "procedure", "other"], "Invalid type") // adjust as per your categories
    .required("Type is required"),
});

// EDIT Program Manual Schema
export const editProgramManualSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be at most 150 characters")
    .optional(),

  description: yup
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters")
    .optional(),

  tags: yup
    .array()
    .of(
      yup
        .string()
        .trim()
        .max(50, "Each tag must be at most 50 characters")
    )
    .optional(),

  type: yup
    .string()
    .trim()
    .oneOf(["guide", "policy", "procedure", "other"], "Invalid type")
    .optional(),
});
