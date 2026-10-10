import Joi from "joi";



export const Agreementschema = Joi.object({
  title: Joi.string().required(),

});

