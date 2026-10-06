import Joi from "joi";

const richTextRequired = (fieldName) =>
  Joi.string()
    .custom((value, helpers) => {
      const text = value
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (!text) {
        return helpers.error("string.empty");
      }

      return value;
    })
    .required()
    .messages({
      "string.empty": `${fieldName} is required`,
      "any.required": `${fieldName} is required`,
    });

export const announcementSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),

  message: richTextRequired("Message"),
});

export const editAnnouncementSchema = Joi.object({
  title: Joi.string().trim().min(3).optional().messages({
    "string.empty": "Title cannot be empty",
    "string.min": "Title must be at least 3 characters",
  }),

  message: Joi.string()
    .custom((value, helpers) => {
      const text = value
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (!text) {
        return helpers.error("string.empty");
      }

      return value;
    })
    .min(5)
    .optional()
    .messages({
      "string.empty": "Message cannot be empty",
      "string.min": "Message must be at least 5 characters",
    }),
});

export const viewAnnouncementSchema = Joi.object({
  id: Joi.string().hex().length(24).optional(),
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  keyword: Joi.string().allow("").optional(),
});
