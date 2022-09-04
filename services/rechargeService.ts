import * as rechargeRepository from "../repositories/rechargeRepository.js";

import {
  findCard,
  validateDate,
  verifyApiKey,
  verifyCardIsActivated,
  returnIdNumber,
} from "./utilsService.js";

export async function recharge(id: string, amount: number, apiKey: string) {
  await verifyApiKey(apiKey);
  const idNumber = returnIdNumber(id);
  const card = await findCard(id);
  verifyCardIsActivated(id);
  validateDate(card.expirationDate);
  await rechargeRepository.insert({
    cardId: idNumber,
    amount,
  });
}
