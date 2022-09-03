import { Router } from "express";
import {
  createCard,
  activate,
  getTransactions,
  block,
  unblock,
} from "../controllers/cardController.js";
import { apiKeyValidator } from "../middlewares/apiKeyValidator.js";
import validateSchema from "../middlewares/schemaValidator.js";
import createCardSchema from "../schemas/createCardSchema.js";
import activateCardSchema from "../schemas/activateCardSchema.js";
import passwordCardSchema from "../schemas/passwordCardSchema.js";

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

route.get("/cards/transactions/:id", getTransactions);

route.patch("/cards/block/:id", validateSchema(passwordCardSchema), block);

route.patch("/cards/unblock/:id", validateSchema(passwordCardSchema), unblock);

export default route;
