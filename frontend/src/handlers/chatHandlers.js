import api from "../api/api";

/**
 * Get or create a chat room for a specific booking.
 * Returns { id, booking_id }
 */
export const getOrCreateRoom = async (bookingId) => {
  const response = await api.post(`/chat/rooms/booking/${bookingId}`);
  return response.data;
};

/**
 * Get all chat rooms for the current user.
 * Returns array of room objects with last_message + unread_count.
 */
export const getChatRooms = async () => {
  const response = await api.get("/chat/rooms");
  return response.data;
};

/**
 * Get message history for a room.
 * @param {number} roomId
 * @param {number} limit
 * @param {number|null} beforeId  – for pagination (load older messages)
 */
export const getRoomMessages = async (roomId, limit = 50, beforeId = null) => {
  let url = `/chat/rooms/${roomId}/messages?limit=${limit}`;
  if (beforeId) url += `&before_id=${beforeId}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Build a WebSocket URL for a room.
 * Reads the base URL from the same env var as api.js and swaps http(s) → ws(s).
 */
export const buildWsUrl = (roomId) => {
  const token   = localStorage.getItem("access_token");
  const baseURL = import.meta.env.VITE_baseURL || "http://localhost:8000/api";
  const wsBase  = baseURL.replace(/^http/, "ws");
  return `${wsBase}/chat/ws/${roomId}?token=${token}`;
};