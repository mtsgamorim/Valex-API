import Joi from "joi";

const amountValueSchema = Joi.object({
  amount: Joi.number().min(1).required(),
});

export default amountValueSchema;
