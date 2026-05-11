import api from "../api/api";

export const getWalletBalance = async () => {
  const { data } = await api.get("/wallet/balance");
  return data.balance; // number
};

export const getWalletTransactions = async () => {
  const { data } = await api.get("/wallet/transactions");
  return data; // array
};

export const topUpWallet = async (amount) => {
  const { data } = await api.post("/wallet/topup", { amount });
  return data.balance; // updated balance
};