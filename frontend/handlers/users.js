// src/handlers/userHandlers.js
import api from "../api/api";

// ─── USER PROFILE HANDLERS ────────────────────────────────────────────────────

/**
 * Fetch current user profile
 * GET /users/me
 */
export const fetchUserProfile = async () => {
  const { data } = await api.get("/users/me");
  return data;
};

/**
 * Update current user profile
 * PUT /users/me
 */
export const updateUserProfile = async (profileData) => {
  const { data } = await api.put("/users/me", profileData);
  return data;
};

/**
 * Upload avatar
 * POST /users/me/avatar
 */
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// ─── ADDRESS HANDLERS ─────────────────────────────────────────────────────────

/**
 * Fetch all user addresses
 * GET /users/addresses
 */
export const fetchAddresses = async () => {
  const { data } = await api.get("/users/addresses");
  return data;
};

/**
 * Get single address by ID
 * GET /users/addresses/{address_id}
 */
export const fetchAddressById = async (addressId) => {
  const { data } = await api.get(`/users/addresses/${addressId}`);
  return data;
};

/**
 * Add new address
 * POST /users/addresses
 */
export const addAddress = async (addressData) => {
  const payload = {
    label: addressData.label || "Home",
    address_line1: addressData.address_line1,
    address_line2: addressData.address_line2 || null,
    city: addressData.city,
    province: addressData.province,
    postal_code: addressData.postal_code || null,
    lat: addressData.lat,
    lng: addressData.lng,
    is_default: addressData.is_default || false,
  };

  const { data } = await api.post("/users/addresses", payload);
  return data;
};

/**
 * Update existing address
 * PUT /users/addresses/{address_id}
 */
export const updateAddress = async (addressId, addressData) => {
  const payload = {
    label: addressData.label,
    address_line1: addressData.address_line1,
    address_line2: addressData.address_line2 || null,
    city: addressData.city,
    province: addressData.province,
    postal_code: addressData.postal_code || null,
    lat: addressData.lat,
    lng: addressData.lng,
    is_default: addressData.is_default || false,
  };

  const { data } = await api.put(`/users/addresses/${addressId}`, payload);
  return data;
};

/**
 * Delete address
 * DELETE /users/addresses/{address_id}
 */
export const deleteAddress = async (addressId) => {
  const { data } = await api.delete(`/users/addresses/${addressId}`);
  return data;
};

/**
 * Set address as default
 * Fetches address first, then updates with is_default=true
 */
export const setDefaultAddress = async (addressId) => {
  const address = await fetchAddressById(addressId);

  if (!address) {
    throw new Error("Address not found");
  }

  return await updateAddress(addressId, {
    label: address.label,
    address_line1: address.address_line1,
    address_line2: address.address_line2,
    city: address.city,
    province: address.province,
    postal_code: address.postal_code,
    lat: address.lat,
    lng: address.lng,
    is_default: true,
  });
};

// ─── CONVENIENCE METHODS ──────────────────────────────────────────────────────

/**
 * Fetch complete profile data (user + addresses)
 */
export const fetchCompleteProfile = async () => {
  const [userData, addressesData] = await Promise.all([
    fetchUserProfile(),
    fetchAddresses(),
  ]);
  return {
    user: userData,
    addresses: addressesData,
  };
};

/**
 * Add address and set as default
 */
export const addDefaultAddress = async (addressData) => {
  return await addAddress({
    ...addressData,
    is_default: true,
  });
};

/**
 * Fetch public platform stats (no auth required)
 * GET /users/stats
 */
export const fetchPublicStats = async () => {
  const { data } = await api.get("/users/stats");
  return data;
};