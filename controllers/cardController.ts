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
  await cardServices.activateCard(id, securityCode, password);
  res.sendStatus(200);
}

export async function getTransactions(req: Request, res: Response) {
  const id = req.params.id;
  const result = await cardServices.showTransactions(id);
  res.status(200).send(result);
}

export async function block(req: Request, res: Response) {
  const id = req.params.id;
  const { password } = req.body;
  await cardServices.block(id, password);
  res.sendStatus(200);
}

export async function unblock(req: Request, res: Response) {
  const id = req.params.id;
  const { password } = req.body;
  await cardServices.unblock(id, password);
  res.sendStatus(200);
}
