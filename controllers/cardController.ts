import { Request, Response } from "express";
import * as cardServices from "../services/cardsService.js";

export async function createCard(req: Request, res: Response) {
  const body = req.body;
  const apiKey = res.locals.apiKey;
  await cardServices.insertCardService(apiKey, body);
  res.sendStatus(201);
}

export async function activate(req: Request, res: Response) {
  const id = req.params.id;
  const { securityCode, password } = req.body;
  const result = await cardServices.activateCard(id, securityCode, password);
  res.sendStatus(200);
}
