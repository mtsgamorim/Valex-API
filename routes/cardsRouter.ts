import { Router } from "express";
import { createCard, activate } from "../controllers/cardController.js";
import { apiKeyValidator } from "../middlewares/apiKeyValidator.js";
import validateSchema from "../middlewares/schemaValidator.js";
import createCardSchema from "../schemas/createCardSchema.js";
import activateCardSchema from "../schemas/activateCardSchema.js";

const route = Router();

route.post(
  "/cards/create",
  apiKeyValidator,
  validateSchema(createCardSchema),
  createCard
);

route.patch(
  "/cards/activate/:id",
  validateSchema(activateCardSchema),
  activate
);

export default route;
