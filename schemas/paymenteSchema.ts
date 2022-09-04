import Joi from "joi";

const amountValueSchema = Joi.object({
  amount: Joi.number().min(1).required(),
  password: Joi.string().required(),
  businessId: Joi.number().required(),
});

export default amountValueSchema;
