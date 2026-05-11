import api from "../api/api";

export const createBooking = async (data) => {
  const response = await api.post("/bookings/", data);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/");
  console.log("==================",response.data)
  return response.data;
};

export const updateBookingStatus = async (bookingId, status) => {
  const response = await api.patch(`/bookings/${bookingId}/status?status=${status}`);
  return response.data;
};
