import { Request, Response, NextFunction } from "express";

export async function apiKeyValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    throw { type: "unauthorized", message: "x-api-key não encontrada" };
  }
  res.locals.apiKey = apiKey;
  next();
}
