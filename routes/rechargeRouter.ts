import { Router } from "express";
import { recharge } from "../controllers/rechargeController.js";
import { apiKeyValidator } from "../middlewares/apiKeyValidator.js";
import validateSchema from "../middlewares/schemaValidator.js";
import amountValueSchema from "../schemas/amountValueSchema.js";

const route = Router();

route.post(
  "/recharge/:id",
  apiKeyValidator,
  validateSchema(amountValueSchema),
  recharge
);

export default route;
