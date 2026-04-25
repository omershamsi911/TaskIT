// src/handlers/ai.js
import api from "../api/api";

/**
 * Get AI-matched providers for a service
 * GET /ai/match-providers
 */
export const fetchMatchedProviders = async ({
  subcategory_id,
  lat,
  lng,
  budget = null,
  limit = 5,
}) => {
  const { data } = await api.get("/ai/match-providers", {
    params: {
      subcategory_id,
      lat,
      lng,
      ...(budget && { budget }),
      limit,
    },
  });
  return data;
};