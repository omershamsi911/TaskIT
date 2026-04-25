// src/handlers/payments.js
import api from "../api/api";

// ─── PAYMENT HANDLERS ─────────────────────────────────────────────────────────

/**
 * Initiate payment for a booking
 * POST /payments/bookings/{booking_id}/pay
 */
export const initiatePayment = async (bookingId, method) => {
  const { data } = await api.post(`/payments/bookings/${bookingId}/pay`, null, {
    params: { method },
  });
  return data;
};

// ─── WALLET HANDLERS ──────────────────────────────────────────────────────────

/**
 * Get wallet transaction history
 * GET /payments/wallet
 */
export const fetchWalletTransactions = async () => {
  const { data } = await api.get("/payments/wallet");
  return data;
};

/**
 * Top up wallet balance
 * POST /payments/wallet/topup
 */
export const topupWallet = async (amount) => {
  const { data } = await api.post("/payments/wallet/topup", null, {
    params: { amount },
  });
  return data;
};