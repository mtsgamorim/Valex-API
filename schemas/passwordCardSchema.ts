import Joi from "joi";

const passwordCardSchema = Joi.object({
  password: Joi.string().required(),
});

export default passwordCardSchema;
