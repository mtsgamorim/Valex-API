import * as cardRepository from "../repositories/cardRepository.js";
import * as companyRepository from "../repositories/companyRepository.js";
import * as employeeRepository from "../repositories/employeeRepository.js";
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import Cryptr from "cryptr";
import dotenv from "dotenv";

dotenv.config();
export async function insertCardService(
  apiKey: string,
  body: { employeeId: number; type: cardRepository.TransactionTypes }
) {
  const { employeeId, type } = body;
  const cryptr = new Cryptr(process.env.CRYPTR_SECRET);
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
