import { Router } from "express";

import cardRounter from "./cardsRouter.js";
import rechargeRounter from "./rechargeRouter.js";

const routes = Router();

routes.use(cardRounter);
routes.use(rechargeRounter);

export default routes;
