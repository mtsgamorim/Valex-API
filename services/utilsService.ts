import * as companyRepository from "../repositories/companyRepository.js";
import * as cardRepository from "../repositories/cardRepository.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import bcrypt from "bcrypt";
dayjs.extend(customParseFormat);

export async function verifyApiKey(apikey: string) {
  const company = await companyRepository.findByApiKey(apikey);
  if (!company) {
    throw { type: "unauthorized", message: "Api-Key invalid" };
  }
}

export async function findCard(id: string) {
  const card = await cardRepository.findById(Number(id));
  if (!card) {
    throw { type: "notFound", message: "Cartão não cadastrado" };
  }
  return card;
}

export function verifyCardIsActivated(password: string | null) {
  if (password === null) {
    throw { type: "badRequest", message: "Cartão não ativado" };
  }
}

export function validateDate(expirationDate: string) {
  const today = dayjs();
  const expiration = dayjs(expirationDate, "MM/YY");
  if (dayjs(today).isAfter(expiration)) {
    throw { type: "notAcceptable", message: "Cartão já não é mais válido" };
  }
}

export function verifyCardBlocked(bool: boolean) {
  if (bool) {
    throw { type: "badRequest", message: "Este cartão está bloqueado" };
  }
}

export function verifyPassword(password: string, cardPassword: string) {
  if (!bcrypt.compareSync(password, cardPassword)) {
    throw { type: "unauthorized", message: "Senha incorreta" };
  }
}

export function calculateBalance(payments: any, recharges: any) {
  let totalBuys = 0;
  let totalRecharges = 0;
  for (let i = 0; i < payments.length; i++) {
    totalBuys += payments[i].amount;
  }
  for (let i = 0; i < recharges.length; i++) {
    totalRecharges += recharges[i].amount;
  }
  return totalRecharges - totalBuys;
}

export function returnIdNumber(id: string) {
  const idNumber = Number(id);
  if (isNaN(idNumber)) {
    throw { type: "notFound", message: "Cartão ID deve ser um número" };
  }
  return idNumber;
}
