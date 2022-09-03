import { Request, Response } from "express";
import * as rechargeServices from "../services/rechargeService.js";

export async function recharge(req: Request, res: Response) {
  const { amount } = req.body;
  const apiKey = res.locals.apiKey;
  const id = req.params.id;
  await rechargeServices.recharge(id, amount, apiKey);
  res.sendStatus(201);
}
