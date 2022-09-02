import { Router } from "express";

import cardRounter from "./cardsRouter.js";

const routes = Router();

routes.use(cardRounter);

export default routes;
