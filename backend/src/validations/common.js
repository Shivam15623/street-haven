// validations/common.js (or agreements.js)
import Joi from "joi";

export const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});
import mongoose from "mongoose";

export const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};