import { useEffect, useState } from "react";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import { getMyBookings, updateBookingStatus } from "../handlers/bookingHandlers";

const STATUS_COLORS = {
  requested: { bg: "#ff9f43", color: "#fff" },
  accepted:  { bg: T.IK,     color: "#fff" },
  completed: { bg: "#28c76f", color: "#fff" },
  cancelled: { bg: "#ea5455", color: "#fff" },
  rejected:  { bg: "#ea5455", color: "#fff" },
};

const SectionBar = ({ left, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", background: T.IK }}>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>{left}</span>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f5f0e6" }}>{right}</span>
  </div>
);

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const userStr    = localStorage.getItem("user");
  const currentUser = userStr ? (() => { try { return JSON.parse(userStr); } catch { return { role: "customer", id: null }; } })() : { role: "customer", id: null };

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

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (!window.confirm(`Confirm mark as "${newStatus}"?`)) return;
    try {
      await updateBookingStatus(bookingId, newStatus);
      fetchBookings();
    } catch {
      alert("Failed to update status.");
    }
  };

  return (
    <SharedLayout>
      <SectionBar left="MY BOOKINGS" right={`${bookings.length} TOTAL`} />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 32px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>
            LOADING BOOKINGS...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ border: `1px dashed ${T.IK}`, padding: "64px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: T.IK, opacity: 0.08, marginBottom: 16 }}>◈</div>
            <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>No bookings found.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {bookings.map(booking => {
              const isCustomer = currentUser.id === booking.user_id;
              const sc = STATUS_COLORS[booking.status] || { bg: T.LIGHT_IK, color: "#fff" };
              return (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isCustomer={isCustomer}
                  statusColor={sc}
                  onStatusUpdate={handleStatusUpdate}
                />
              );
            })}
          </div>
        )}
      </div>
    </SharedLayout>
  );
};

const BookingCard = ({ booking, isCustomer, statusColor, onStatusUpdate }) => {
  const btnBase = { padding: "10px 0", width: "100%", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer", transition: "all 0.1s", border: "none", fontFamily: "inherit" };

  return (
    <div style={{ background: "#fff", border: `1px solid ${T.IK}`, display: "flex", flexDirection: "row", gap: 0 }}>
      {/* Status strip */}
      <div style={{ width: 6, background: statusColor.bg, flexShrink: 0 }} />

      {/* Info */}
      <div style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ padding: "4px 10px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", background: statusColor.bg, color: statusColor.color }}>
            {booking.status}
          </span>
          <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: T.LIGHT_IK }}>
            ID: #{booking.id}
          </span>
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: T.LIGHT_IK }}>
            {isCustomer ? "YOUR BOOKING" : "SERVICE REQUEST"}
          </span>
        </div>
        <p style={{ fontSize: 12, fontWeight: 700, color: T.IK, margin: 0 }}>
          📅 {new Date(booking.scheduled_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
        </p>
        <p style={{ fontSize: 11, color: T.LIGHT_IK, margin: 0 }}>📍 {booking.address}</p>
        {booking.description && (
          <p style={{ fontSize: 11, color: T.LIGHT_IK, fontFamily: "Georgia, serif", fontStyle: "italic", margin: 0, paddingLeft: 12, borderLeft: `2px solid ${T.C}` }}>
            "{booking.description}"
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ width: 180, borderLeft: `1px solid ${T.IK}`, padding: "20px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, flexShrink: 0 }}>
        {/* Customer actions */}
        {isCustomer && booking.status === "requested" && (
          <button onClick={() => onStatusUpdate(booking.id, "cancelled")}
            style={{ ...btnBase, background: "transparent", border: `1px solid #ea5455`, color: "#ea5455" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#ea5455"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ea5455"; }}>
            Cancel Request
          </button>
        )}
        {isCustomer && booking.status === "accepted" && (
          <div style={{ textAlign: "center", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.IK }}>Provider is on the way</div>
        )}
        {isCustomer && booking.status === "completed" && (
          <div style={{ textAlign: "center", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#28c76f" }}>✓ Completed</div>
        )}

        {/* Provider actions */}
        {!isCustomer && booking.status === "requested" && (
          <>
            <button onClick={() => onStatusUpdate(booking.id, "accepted")}
              style={{ ...btnBase, background: T.IK, color: "#fff" }}
              onMouseEnter={e => { e.currentTarget.style.background = T.C; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.IK; }}>
              Accept
            </button>
            <button onClick={() => onStatusUpdate(booking.id, "rejected")}
              style={{ ...btnBase, background: "transparent", border: `1px solid #ea5455`, color: "#ea5455" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ea5455"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ea5455"; }}>
              Reject
            </button>
          </>
        )}
        {!isCustomer && booking.status === "accepted" && (
          <button onClick={() => onStatusUpdate(booking.id, "completed")}
            style={{ ...btnBase, background: "#28c76f", color: "#fff" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1fa055"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#28c76f"; }}>
            Mark Completed
          </button>
        )}

        {/* Common terminal states */}
        {(booking.status === "cancelled" || booking.status === "rejected") && (
          <div style={{ textAlign: "center", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ea5455" }}>
            {booking.status === "cancelled" ? "Cancelled" : "Rejected"}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;