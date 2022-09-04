import * as paymentRepository from "../repositories/paymentRepository.js";
import * as businessRepository from "../repositories/businessRepository.js";
import * as rechargeRepository from "../repositories/rechargeRepository.js";

import {
  findCard,
  validateDate,
  verifyCardIsActivated,
  verifyCardBlocked,
  verifyPassword,
  calculateBalance,
  returnIdNumber,
} from "./utilsService.js";
import { TransactionTypes } from "../repositories/cardRepository.js";

export async function payment(
  id: string,
  amount: number,
  password: string,
  businessId: number
) {
  const idNumber = returnIdNumber(id);
  const card = await findCard(id);
  const business = await verifyBusinessId(businessId);
  verifyCardIsActivated(card.password);
  validateDate(card.expirationDate);
  verifyCardBlocked(card.isBlocked);
  verifyPassword(password, card.password);
  isSameType(card.type, business.type);
  const payments = await paymentRepository.findByCardId(idNumber);
  const recharges = await rechargeRepository.findByCardId(idNumber);
  const balance = calculateBalance(payments, recharges);
  compareBalanceWithAmount(balance, amount);
  await paymentRepository.insert({
    cardId: idNumber,
    businessId,
    amount,
  });
}

async function verifyBusinessId(businessId: number) {
  const business = await businessRepository.findById(businessId);
  if (!business) {
    throw { type: "unauthorized", message: "Está empresa não esta cadastrada" };
  }
  return business;
}

function isSameType(
  cardType: TransactionTypes,
  businessType: TransactionTypes
) {
  if (cardType !== businessType) {
    throw {
      type: "unauthorized",
      message: "Cartão sendo usado para compra de tipo diferente",
    };
  }
}

function compareBalanceWithAmount(balance: number, amount: number) {
  if (amount > balance) {
    throw { type: "badRequest", message: "Saldo insuficiente" };
  }
}
