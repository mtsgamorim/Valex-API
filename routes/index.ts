import { Router } from "express";

import cardRouter from "./cardsRouter.js";
import rechargeRouter from "./rechargeRouter.js";
import paymentRouter from "./paymentRouter.js";

const routes = Router();

routes.use(cardRouter);
routes.use(rechargeRouter);
routes.use(paymentRouter);

export default routes;
