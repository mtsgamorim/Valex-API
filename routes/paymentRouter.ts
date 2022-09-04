import { Router } from "express";
import { payment } from "../controllers/paymentController.js";
import validateSchema from "../middlewares/schemaValidator.js";
import paymentSchema from "../schemas/paymenteSchema.js";

const route = Router();

route.post("/payment/:cardId", validateSchema(paymentSchema), payment);

export default route;
