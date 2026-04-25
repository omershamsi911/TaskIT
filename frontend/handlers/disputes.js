// src/handlers/disputes.js
import api from "../api/api";

// ─── DISPUTE HANDLERS ─────────────────────────────────────────────────────────

/**
 * Raise a new dispute
 * POST /disputes/
 */
export const raiseDispute = async (bookingId, disputeType, description) => {
  const { data } = await api.post("/disputes/", null, {
    params: {
      booking_id: bookingId,
      dispute_type: disputeType,
      description,
    },
  });
  return data;
};

/**
 * Get dispute details
 * GET /disputes/{dispute_id}
 */
export const fetchDispute = async (disputeId) => {
  const { data } = await api.get(`/disputes/${disputeId}`);
  return data;
};

/**
 * Send message in dispute
 * POST /disputes/{dispute_id}/messages
 */
export const sendDisputeMessage = async (disputeId, message) => {
  const { data } = await api.post(`/disputes/${disputeId}/messages`, null, {
    params: { message },
  });
  return data;
};

/**
 * Get dispute messages
 * GET /disputes/{dispute_id}/messages
 */
export const fetchDisputeMessages = async (disputeId) => {
  const { data } = await api.get(`/disputes/${disputeId}/messages`);
  return data;
};