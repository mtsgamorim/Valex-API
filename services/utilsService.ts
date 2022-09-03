import * as companyRepository from "../repositories/companyRepository.js";
import * as cardRepository from "../repositories/cardRepository.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
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
