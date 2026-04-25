// src/handlers/admin.js
import api from "../api/api";

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

/**
 * Get platform dashboard stats
 * GET /admin/dashboard/stats
 */
export const fetchDashboardStats = async () => {
  const { data } = await api.get("/admin/dashboard/stats");
  return data;
};

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

/**
 * List all users
 * GET /admin/users
 */
export const fetchUsers = async (skip = 0, limit = 50, status = null) => {
  const { data } = await api.get("/admin/users", {
    params: { skip, limit, ...(status && { status }) },
  });
  return data;
};

/**
 * Update user status (ban/suspend/activate)
 * PATCH /admin/users/{user_id}/status
 */
export const updateUserStatus = async (userId, status) => {
  const { data } = await api.patch(`/admin/users/${userId}/status`, null, {
    params: { status },
  });
  return data;
};

// ─── PROVIDER APPROVALS ───────────────────────────────────────────────────────

/**
 * Get providers pending approval
 * GET /admin/providers/pending-approval
 */
export const fetchPendingProviders = async () => {
  const { data } = await api.get("/admin/providers/pending-approval");
  return data;
};

/**
 * Approve a provider
 * POST /admin/providers/{provider_id}/approve
 */
export const approveProvider = async (providerId) => {
  const { data } = await api.post(`/admin/providers/${providerId}/approve`);
  return data;
};

// ─── DISPUTES ─────────────────────────────────────────────────────────────────

/**
 * List disputes
 * GET /admin/disputes
 */
export const fetchDisputes = async (status = null) => {
  const { data } = await api.get("/admin/disputes", {
    params: { ...(status && { status }) },
  });
  return data;
};

/**
 * Assign dispute to admin
 * POST /admin/disputes/{dispute_id}/assign
 */
export const assignDispute = async (disputeId) => {
  const { data } = await api.post(`/admin/disputes/${disputeId}/assign`);
  return data;
};

/**
 * Resolve dispute
 * POST /admin/disputes/{dispute_id}/resolve
 */
export const resolveDispute = async (disputeId, resolutionNote, refundAmount = null) => {
  const { data } = await api.post(`/admin/disputes/${disputeId}/resolve`, null, {
    params: {
      resolution_note: resolutionNote,
      ...(refundAmount !== null && { refund_amount: refundAmount }),
    },
  });
  return data;
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────

/**
 * List reports
 * GET /admin/reports
 */
export const fetchReports = async (status = null) => {
  const { data } = await api.get("/admin/reports", {
    params: { ...(status && { status }) },
  });
  return data;
};

// ─── PROMO CODES ──────────────────────────────────────────────────────────────

/**
 * Create promo code
 * POST /admin/promo-codes
 */
export const createPromoCode = async (promoData) => {
  const { data } = await api.post("/admin/promo-codes", promoData);
  return data;
};

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

/**
 * Get platform settings
 * GET /admin/settings
 */
export const fetchSettings = async () => {
  const { data } = await api.get("/admin/settings");
  return data;
};

/**
 * Update platform setting
 * PUT /admin/settings/{key}
 */
export const updateSetting = async (key, value) => {
  const { data } = await api.put(`/admin/settings/${key}`, null, {
    params: { value },
  });
  return data;
};