import { Router } from "express";
import { createCard } from "../controllers/cardController.js";
import { apiKeyValidator } from "../middlewares/apiKeyValidator.js";
import validateSchema from "../middlewares/schemaValidator.js";
import createCardSchema from "../schemas/createCardSchema.js";

const route = Router();

route.post(
  "/cards/create",
  apiKeyValidator,
  validateSchema(createCardSchema),
  createCard
);

export default route;
