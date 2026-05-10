import { useEffect, useState } from "react";
import { getMyBookings, updateBookingStatus } from "../handlers/bookingHandlers";

const STATUS_COLORS = {
  requested: "bg-[#ff9f43] text-white",
  accepted: "bg-[#111111] text-white",
  completed: "bg-[#28c76f] text-white",
  cancelled: "bg-[#ea5455] text-white",
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem("user");
  const currentUser = userString
    ? JSON.parse(userString)
    : { role: "customer", id: null };

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (!window.confirm(`Confirm ${newStatus}?`)) return;

    try {
      await updateBookingStatus(bookingId, newStatus);
      fetchBookings();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (loading)
    return (
      <div className="font-bold uppercase text-xl animate-pulse">
        Loading Bookings...
      </div>
    );

    console.log(bookings)

  return (
    <div className="max-w-5xl">
      <h1 className="text-[40px] font-bold uppercase mb-8 leading-none tracking-tight">
        My Bookings
      </h1>

      {bookings.length === 0 ? (
        <div className="border border-[#1a1a1a] border-dashed p-12 text-center text-[#6b6b6b] bg-white">
          <p className="uppercase font-bold">No bookings found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => {
            const isCustomer = currentUser.id === booking.user_id;

            return (
              <div
                key={booking.id}
                className="bg-white border border-[#1a1a1a] p-6 flex flex-col md:flex-row justify-between gap-6"
              >
                {/* INFO */}
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 text-[10px] uppercase font-bold tracking-widest ${
                        STATUS_COLORS[booking.status]
                      }`}
                    >
                      {booking.status}
                    </span>

                    <span className="text-xs font-bold text-[#6b6b6b] uppercase">
                      ID: #{booking.id}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold uppercase">
                    {isCustomer ? "Your Booking" : "Service Request"}
                  </h3>

                  <p className="text-sm font-medium">
                    📅 {new Date(booking.scheduled_at).toLocaleString()}
                  </p>

                  <p className="text-sm text-[#6b6b6b]">
                    📍 {booking.address}
                  </p>

                  {booking.description && (
                    <p className="text-sm mt-2 border-l-2 border-[#ff4d2d] pl-3 italic text-[#6b6b6b]">
                      "{booking.description}"
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col justify-end gap-2 md:w-48 border-t md:border-t-0 md:border-l border-[#1a1a1a] pt-4 md:pt-0 md:pl-6">

                  {/* CUSTOMER ACTIONS */}
                  {isCustomer && (
                    <>
                      {booking.status === "requested" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking.id, "cancelled")
                          }
                          className="w-full bg-transparent border border-[#ea5455] text-[#ea5455] py-2 text-xs font-bold uppercase hover:bg-[#ea5455] hover:text-white"
                        >
                          Cancel Request
                        </button>
                      )}

                      {booking.status === "accepted" && (
                        <div className="text-xs text-center text-[#111] font-bold uppercase">
                          Provider is working
                        </div>
                      )}

                      {booking.status === "completed" && (
                        <div className="text-xs text-center text-[#28c76f] font-bold uppercase">
                          Completed — Leave Review
                        </div>
                      )}
                    </>
                  )}

                  {/* PROVIDER ACTIONS */}
                  {!isCustomer && (
                    <>
                      {booking.status === "requested" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking.id, "accepted")
                            }
                            className="w-full bg-[#111111] text-white py-2 text-xs font-bold uppercase hover:bg-[#ff4d2d]"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              handleStatusUpdate(booking.id, "rejected")
                            }
                            className="w-full bg-transparent border border-[#ea5455] text-[#ea5455] py-2 text-xs font-bold uppercase hover:bg-[#ea5455] hover:text-white"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {booking.status === "accepted" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking.id, "completed")
                          }
                          className="w-full bg-[#28c76f] text-white py-2 text-xs font-bold uppercase hover:bg-[#21a55c]"
                        >
                          Mark Completed
                        </button>
                      )}
                    </>
                  )}

                  {/* COMMON STATES */}
                  {booking.status === "cancelled" && (
                    <div className="text-center text-[#ea5455] font-bold uppercase text-xs">
                      Cancelled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;