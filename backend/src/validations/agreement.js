import Joi from "joi";



export const Agreementschema = Joi.object({
  title: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate:Joi.date().required(),
});

