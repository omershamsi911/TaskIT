// src/handlers/providerHandlers.js
import api from "../api/api";

// ─── PROVIDER SEARCH & PROFILE HANDLERS ───────────────────────────────────────

/**
 * Search providers with filters
 * GET /providers/search
 */
export const searchProviders = async (filters) => {
  const { data } = await api.get("/providers/search", {
    params: {
      lat: filters.lat,
      lng: filters.lng,
      category_id: filters.category_id || undefined,
      subcategory_id: filters.subcategory_id || undefined,
      max_distance_km: filters.max_distance_km || 10.0,
      min_rating: filters.min_rating || 0.0,
      sort_by: filters.sort_by || "recommended",
    },
  });
  return data;
};

/**
 * Get single provider details
 * GET /providers/{provider_id}
 */
export const fetchProviderById = async (providerId) => {
  const { data } = await api.get(`/providers/${providerId}`);
  return data;
};

/**
 * Get provider by current user (for provider's own profile)
 * This would need a different endpoint — using /providers/me or similar
 */
export const fetchMyProviderProfile = async () => {
  const { data } = await api.get("/providers/me/profile");
  return data;
};

// ─── PROVIDER SERVICES HANDLERS ───────────────────────────────────────────────

/**
 * Get all services from all providers
 * GET /providers/all-services
 */
export const fetchAllProviderServices = async (skip = 0, limit = 100) => {
  const { data } = await api.get("/providers/all-services", {
    params: { skip, limit },
  });

  // Transform to match your frontend format
  return data.data.map((service) => ({
    id: service.id,
    provider_id: service.provider_id,
    title: service.title,
    description: service.description,
    base_price: service.base_price,
    pricing_type: service.pricing_type,
  }));
};

/**
 * Get services for a specific provider
 * Extracted from provider details response
 */
export const fetchProviderServices = async (providerId) => {
  // The provider detail endpoint includes services in the response
  const provider = await fetchProviderById(providerId);
  return provider.services || [];
};

/**
 * Add a new service (for provider's own profile)
 * POST /providers/me/services
 */
export const addProviderService = async (serviceData) => {
  const payload = {
    subcategory_id: serviceData.subcategory_id,
    title: serviceData.title,
    description: serviceData.description || null,
    pricing_type: serviceData.pricing_type || "fixed",
    base_price: serviceData.base_price,
    max_price: serviceData.max_price || null,
    price_unit: serviceData.price_unit || null,
    estimated_hours: serviceData.estimated_hours || null,
    is_active: serviceData.is_active !== undefined ? serviceData.is_active : true,
  };

  const { data } = await api.post("/providers/me/services", payload);
  return data;
};

// ─── PROVIDER AVAILABILITY HANDLERS ───────────────────────────────────────────

/**
 * Get provider availability
 * This endpoint may need to be created on backend
 * GET /providers/{provider_id}/availability
 */
export const fetchProviderAvailability = async (providerId) => {
  const { data } = await api.get(`/providers/${providerId}/availability`);
  return data;
};

/**
 * Update provider availability (for provider's own profile)
 * POST /providers/me/availability
 */
export const updateProviderAvailability = async (availabilityData) => {
  const { data } = await api.post("/providers/me/availability", availabilityData);
  return data;
};

/**
 * Toggle provider online/offline status
 * PUT /providers/me/status
 */
export const toggleProviderStatus = async (status) => {
  const { data } = await api.put("/providers/me/status", { availability_status: status });
  return data;
};