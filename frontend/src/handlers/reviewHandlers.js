import api from "../api/api";

/**
 * Submit a new review.
 * The backend will automatically run AI analysis on the comment
 * and set the `is_verified` flag.
 * 
 * @param {Object} data - { booking_id: number, rating: number, comment: string }
 */
export const submitReview = async (data) => {
  try {
    const response = await api.post("/reviews/", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to submit review.";
  }
};

/**
 * Fetch all verified reviews for a specific user (can be a provider or customer).
 * 
 * @param {number} userId - The ID of the user being reviewed.
 */
export const getUserReviews = async (userId) => {
  try {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to fetch reviews.";
  }
};