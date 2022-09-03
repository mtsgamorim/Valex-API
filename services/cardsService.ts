import * as cardRepository from "../repositories/cardRepository.js";
import * as companyRepository from "../repositories/companyRepository.js";
import * as employeeRepository from "../repositories/employeeRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";
import * as rechargeRepository from "../repositories/rechargeRepository.js";
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import Cryptr from "cryptr";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import {
  verifyApiKey,
  findCard,
  verifyCardIsActivated,
  validateDate,
} from "./utilsService.js";

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

function returnIdNumber(id: string) {
  const idNumber = Number(id);
  if (isNaN(idNumber)) {
    throw { type: "notFound", message: "Cartão ID deve ser um número" };
  }
  return idNumber;
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

export async function showTransactions(id: string) {
  const idNumber = returnIdNumber(id);
  const card = await findCard(id);
  verifyCardIsActivated(card.password);
  const payments = await paymentRepository.findByCardId(idNumber);
  const recharges = await rechargeRepository.findByCardId(idNumber);
  const balance = calculateBalance(payments, recharges);
  return {
    balance,
    transactions: payments,
    recharges: recharges,
  };
}

function calculateBalance(payments: any, recharges: any) {
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

export async function block(id: string, password: string) {
  const idNumber = returnIdNumber(id);
  const card = await findCard(id);
  verifyCardIsActivated(card.password);
  validateDate(card.expirationDate);
  verifyCardBlocked(card.isBlocked);
  verifyPassword(password, card.password);
  await cardRepository.update(idNumber, { isBlocked: true });
}

function verifyCardBlocked(bool: boolean) {
  if (bool) {
    throw { type: "badRequest", message: "Cartão ja bloqueado" };
  }
}

function verifyCardUnBlocked(bool: boolean) {
  if (!bool) {
    throw { type: "badRequest", message: "Cartão não bloqueado" };
  }
}

function verifyPassword(password: string, cardPassword: string) {
  if (!bcrypt.compareSync(password, cardPassword)) {
    throw { type: "unauthorized", message: "Senha incorreta" };
  }
}

export async function unblock(id: string, password: string) {
  const idNumber = returnIdNumber(id);
  const card = await findCard(id);
  verifyCardIsActivated(card.password);
  validateDate(card.expirationDate);
  verifyCardUnBlocked(card.isBlocked);
  verifyPassword(password, card.password);
  await cardRepository.update(idNumber, { isBlocked: false });
}
