// src/handlers/chat.js
import api from "../api/api";

// ─── CHAT ROOMS ───────────────────────────────────────────────────────────────

/**
 * Get all chat rooms for current user
 * GET /chat/rooms
 */
export const fetchChatRooms = async () => {
  const { data } = await api.get("/chat/rooms");
  return data;
};

/**
 * Get messages for a chat room
 * GET /chat/rooms/{room_id}/messages
 */
export const fetchMessages = async (roomId, limit = 50) => {
  const { data } = await api.get(`/chat/rooms/${roomId}/messages`, {
    params: { limit },
  });
  return data;
};

/**
 * Send a message
 * POST /chat/rooms/{room_id}/messages
 */
export const sendMessage = async (roomId, content, messageType = "text") => {
  const { data } = await api.post(`/chat/rooms/${roomId}/messages`, {
    content,
    message_type: messageType,
  });
  return data;
};

/**
 * Mark message as read
 * PUT /chat/messages/{message_id}/read
 */
export const markMessageAsRead = async (messageId) => {
  const { data } = await api.put(`/chat/messages/${messageId}/read`);
  return data;
};

/**
 * Upload attachment in chat
 * POST /chat/rooms/{room_id}/attachments
 */
export const uploadAttachment = async (roomId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post(`/chat/rooms/${roomId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};