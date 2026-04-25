// src/handlers/bookings.js
import api from "../api/api";

// ─── BOOKING CRUD ─────────────────────────────────────────────────────────────

/**
 * Create a new booking
 * POST /bookings
 */
export const createBooking = async (bookingData) => {
  const { data } = await api.post("/bookings", {
    provider_id: bookingData.provider_id,
    service_id: bookingData.service_id,
    address_id: bookingData.address_id,
    scheduled_at: bookingData.scheduled_at,
    description: bookingData.description || null,
    special_instructions: bookingData.special_instructions || null,
    quoted_price: bookingData.quoted_price,
  });
  return data;
};

/**
 * Get all bookings for current user
 * GET /bookings
 */
export const fetchUserBookings = async (status = null) => {
  const { data } = await api.get("/bookings", {
    params: { ...(status && { status }) },
  });
  return data;
};

/**
 * Get single booking by ID
 * GET /bookings/{booking_id}
 */
export const fetchBookingById = async (bookingId) => {
  const { data } = await api.get(`/bookings/${bookingId}`);
  return data;
};

// ─── BOOKING STATUS ───────────────────────────────────────────────────────────

/**
 * Accept a booking (provider)
 * PUT /bookings/{booking_id}/status
 */
export const acceptBooking = async (bookingId) => {
  const { data } = await api.put(`/bookings/${bookingId}/status`, {
    status: "accepted",
  });
  return data;
};

/**
 * Start a job (provider)
 * PUT /bookings/{booking_id}/status
 */
export const startJob = async (bookingId) => {
  const { data } = await api.put(`/bookings/${bookingId}/status`, {
    status: "in_progress",
  });
  return data;
};

/**
 * Mark job as completed (provider)
 * PUT /bookings/{booking_id}/status
 */
export const completeJob = async (bookingId) => {
  const { data } = await api.put(`/bookings/${bookingId}/status`, {
    status: "completed",
  });
  return data;
};

/**
 * Update booking status (generic)
 * PUT /bookings/{booking_id}/status
 */
export const updateBookingStatus = async (bookingId, status) => {
  const { data } = await api.put(`/bookings/${bookingId}/status`, { status });
  return data;
};

// ─── CANCELLATION ─────────────────────────────────────────────────────────────

/**
 * Cancel a booking
 * POST /bookings/{booking_id}/cancel
 */
export const cancelBooking = async (bookingId, reason) => {
  const { data } = await api.post(`/bookings/${bookingId}/cancel`, {
    reason,
  });
  return data;
};

// ─── JOB PHOTOS ───────────────────────────────────────────────────────────────

/**
 * Upload job photo (before/after/in_progress)
 * POST /bookings/{booking_id}/photos
 */
export const uploadJobPhoto = async (bookingId, photoType, file, caption = null) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("photo_type", photoType);
  if (caption) formData.append("caption", caption);

  const { data } = await api.post(`/bookings/${bookingId}/photos`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/**
 * Get job photos
 * GET /bookings/{booking_id}/photos
 */
export const fetchJobPhotos = async (bookingId) => {
  const { data } = await api.get(`/bookings/${bookingId}/photos`);
  return data;
};

// ─── PROVIDER BOOKINGS ────────────────────────────────────────────────────────

/**
 * Get bookings for provider
 * GET /provider/bookings
 */
export const fetchProviderBookings = async (status = null) => {
  const { data } = await api.get("/provider/bookings", {
    params: { ...(status && { status }) },
  });
  return data;
};

/**
 * Get incoming requests for provider
 * GET /provider/requests
 */
// export const fetchProviderRequests = async () => {
//   const { data } = await api.get("/provider/requests");
//   return data;
// };