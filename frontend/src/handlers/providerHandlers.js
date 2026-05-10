import api from "../api/api";

// Provider handlers
export const getMyProviderDetails = async (userId) => {
  const response = await api.get(`/providers/me`); 
  return response.data;
};

export const addProviderService = async (data) => {
  const response = await api.post("/providers/me/services", data);
  return response.data;
};

export const deleteProviderService = async (serviceId) => {
  // Assuming a delete route exists
  const response = await api.delete(`/providers/services/${serviceId}`);
  return response.data;
};

export const getAllServices = async (skip = 0, limit = 100) => {
  const response = await api.get(`/providers/all-services?skip=${skip}&limit=${limit}`);
  console.log(response.data)
  return response.data.data;
};

export const searchProviders = async (lat, lng, maxDistanceKm = 10, categoryId = null) => {
  let url = `/providers/search?lat=${lat}&lng=${lng}&max_distance_km=${maxDistanceKm}`;
  if (categoryId && categoryId !== "ALL") {
    url += `&category_id=${categoryId}`;
  }
  const response = await api.get(url);
  return response.data; 
};


export const updateProviderLocation = async (lat, lng) => {
  const response = await api.put("/providers/me/location", { lat, lng });
  return response.data;
};