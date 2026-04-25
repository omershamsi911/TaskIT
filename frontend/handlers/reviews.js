// src/handlers/reviews.js
import api from "../api/api";

// ─── REVIEW HANDLERS ──────────────────────────────────────────────────────────

/**
 * Create a review for a booking
 * POST /reviews/
 */
export const createReview = async (reviewData) => {
  const { data } = await api.post("/reviews/", {
    booking_id: reviewData.booking_id,
    rating: reviewData.rating,
    comment: reviewData.comment || null,
  });
  return data;
};

/**
 * Get all reviews for a provider
 * GET /reviews/provider/{provider_id}
 */
export const fetchProviderReviews = async (providerId) => {
  const { data } = await api.get(`/reviews/provider/${providerId}`);
  return data;
};

/**
 * Mark a review as helpful
 * POST /reviews/{review_id}/helpful
 */
export const markReviewHelpful = async (reviewId) => {
  const { data } = await api.post(`/reviews/${reviewId}/helpful`);
  return data;
};

/**
 * Reply to a review (provider only)
 * POST /reviews/{review_id}/reply
 */
export const replyToReview = async (reviewId, reply) => {
  const { data } = await api.post(`/reviews/${reviewId}/reply`, null, {
    params: { reply },
  });
  return data;
};