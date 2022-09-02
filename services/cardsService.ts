import * as cardRepository from "../repositories/cardRepository.js";
import * as companyRepository from "../repositories/companyRepository.js";
import * as employeeRepository from "../repositories/employeeRepository.js";
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import Cryptr from "cryptr";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);
dotenv.config();
const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

export async function insertCardService(
  apiKey: string,
  body: { employeeId: number; type: cardRepository.TransactionTypes }
) {
  const { employeeId, type } = body;
  await verifyApiKey(apiKey);
  await verifyCardAlreadyExist(employeeId, type);
  const number = faker.finance.creditCardNumber("63[7-9]#-####-####-###L");
  const fullName = await employeeName(employeeId);
  const cardholderName = cardNameGenerate(fullName);
  const expirationDate = dayjs().add(5, "year").format("MM/YY");
  const cvc = faker.finance.creditCardCVV();
  const securityCode = cryptr.encrypt(cvc);
  const isVirtual = false;
  const isBlocked = false;

  const cardData = {
    employeeId,
    number,
    cardholderName,
    securityCode,
    expirationDate,
    isVirtual,
    isBlocked,
    type,
  };

  await cardRepository.insert(cardData);
}

async function verifyApiKey(apikey: string) {
  const company = await companyRepository.findByApiKey(apikey);
  if (!company) {
    throw { type: "unauthorized", message: "Api-Key invalid" };
  }
}

async function verifyCardAlreadyExist(
  employeeId: number,
  type: cardRepository.TransactionTypes
) {
  const alreadyExist = await cardRepository.findByTypeAndEmployeeId(
    type,
    employeeId
  );
  if (alreadyExist) {
    throw {
      type: "conflict",
      message: "Card type already exists for this user",
    };
  }
}

async function employeeName(id: number) {
  const employee = await employeeRepository.findById(id);
  if (!employee) {
    throw { type: "notFound", message: "Usuario não cadastrado" };
  }
  return employee.fullName;
}

function cardNameGenerate(fullName: string) {
  const arrayName = fullName.split(" ");
  const cardName = [];
  cardName.push(arrayName[0].toUpperCase());
  for (let i = 1; i < arrayName.length; i++) {
    if (i === arrayName.length - 1) {
      cardName.push(arrayName[i].toUpperCase());
    } else {
      if (arrayName[i].length >= 3) {
        cardName.push(arrayName[i][0].toUpperCase());
      }
    }
  }
  let nameGenerate = cardName.toString();
  return nameGenerate.replace(/,/g, " ");
}

export async function activateCard(id: string, cvc: string, password: string) {
  const idNumber = returnIdNumber(id);
  const card = await findCard(id);
  validateDate(card.expirationDate);
  verifyCardAlreadyActivated(card.password);
  verifyCVC(card.securityCode, cvc);
  verifyPasswordRegex(password);
  const passwordEncrypted = bcrypt.hashSync(password, 10);
  await cardRepository.update(idNumber, { password: passwordEncrypted });
}

async function findCard(id: string) {
  const card = await cardRepository.findById(Number(id));
  if (!card) {
    throw { type: "notFound", message: "Cartão não cadastrado" };
  }
  return card;
}

function returnIdNumber(id: string) {
  const idNumber = Number(id);
  if (isNaN(idNumber)) {
    throw { type: "notFound", message: "Cartão ID deve ser um número" };
  }
  return idNumber;
}

function validateDate(expirationDate: string) {
  const today = dayjs();
  const expiration = dayjs(expirationDate, "MM/YY");
  if (dayjs(today).isAfter(expiration)) {
    throw { type: "notAcceptable", message: "Cartão já não é mais válido" };
  }
}

function verifyCardAlreadyActivated(password: string | null) {
  if (password !== null) {
    throw { type: "badRequest", message: "Cartão ja cadastrado" };
  }
}

function verifyCVC(encryptCVC: string, digitedCVC: string) {
  if (cryptr.decrypt(encryptCVC) !== digitedCVC) {
    throw { type: "unauthorized", message: "CVC incorreto" };
  }
}

function verifyPasswordRegex(password: string) {
  const regex = /^[0-9]{4}$/;
  if (!regex.test(password)) {
    throw {
      type: "badRequest",
      message: "Senha deve ser 4 digitos e apenas numeros",
    };
  }
}
