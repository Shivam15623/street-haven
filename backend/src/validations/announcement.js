import Joi from "joi";

export const announcementSchema = Joi.object({
  title: Joi.string().required(),
  message: Joi.string().required(),
});
export const editAnnouncementSchema = Joi.object({
  title: Joi.string().trim().min(3).optional(),
  message: Joi.string().trim().min(5).optional(),
});

export const viewAnnouncementSchema = Joi.object({
  id: Joi.string().hex().length(24).optional(),
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  keyword: Joi.string().allow("").optional(),
});
