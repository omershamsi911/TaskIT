/**
 * ProviderDashboard.jsx
 * ──────────────────────────────────────────────────────────────────
 * Provider-only dashboard showing:
 *  - Summary stats (total bookings, active, services count)
 *  - Quick-action cards linking to Manage Services and My Bookings
 *  - Active/pending booking feed
 *  - Profile snapshot + location status
 *
 * UPDATED: BookingRow now has a Chat button that opens the chat room.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import { getMe } from "../handlers/userHandlers";
import { getMyProviderDetails } from "../handlers/providerHandlers";
import { getMyBookings, updateBookingStatus } from "../handlers/bookingHandlers";
import { getOrCreateRoom } from "../handlers/chatHandlers";
import { useNotify } from "../context/NotificationContext";

const SectionBar = ({ left, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", background: T.IK }}>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>{left}</span>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f5f0e6" }}>{right}</span>
  </div>
);

const STATUS_COLORS = {
  requested: { bg: "#ff9f43", color: "#fff" },
  accepted:  { bg: T.IK,     color: "#fff" },
  completed: { bg: "#28c76f", color: "#fff" },
  cancelled: { bg: "#ea5455", color: "#fff" },
};

// ─── STAT CARD ────────────────────────────────────────────────────
const StatCard = ({ value, label, accent }) => (
  <div style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 28px", borderRight: `1px solid ${T.IK}`, background: "#fff" }}>
    <div style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, lineHeight: 1, color: accent || T.C, letterSpacing: "-0.03em" }}>{value}</div>
    <div style={{ marginTop: 6, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>{label}</div>
  </div>
);

// ─── QUICK ACTION CARD ────────────────────────────────────────────
const ActionCard = ({ to, title, desc, cta }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 28, border: `1px solid ${T.IK}`, textDecoration: "none", background: hov ? T.IK : "#fff", transition: "background 0.1s", color: hov ? T.CR : T.IK }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px", color: hov ? T.C : T.IK }}>{title}</h3>
        <p style={{ fontSize: 11, lineHeight: 1.6, color: hov ? "#bdbdbd" : T.LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>{desc}</p>
      </div>
      <div style={{ marginTop: 20, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: hov ? T.C : T.IK }}>{cta} →</div>
    </Link>
  );
};

// ─── ACTIVE BOOKING ROW ──────────────────────────────────────────
const BookingRow = ({ booking, onStatusUpdate, onOpenChat }) => {
  const sc = STATUS_COLORS[booking.status] || { bg: T.LIGHT_IK, color: "#fff" };
  const btnBase = { padding: "8px 14px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.1s" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: `1px solid ${T.IK}`, background: "#fff" }}>
      <div style={{ width: 4, alignSelf: "stretch", background: sc.bg, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: "16px 20px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ padding: "3px 8px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", background: sc.bg, color: sc.color }}>
            {booking.status}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.LIGHT_IK }}>#{booking.id}</span>
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.IK, margin: "0 0 2px" }}>
          {new Date(booking.scheduled_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
        </p>
        <p style={{ fontSize: 10, color: T.LIGHT_IK, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {booking.address}</p>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 16px", flexShrink: 0, alignItems: "center" }}>
        {booking.status === "requested" && (
          <>
            <button onClick={() => onStatusUpdate(booking.id, "accepted")} style={{ ...btnBase, background: T.IK, color: "#fff" }}
              onMouseEnter={e => e.currentTarget.style.background = T.C}
              onMouseLeave={e => e.currentTarget.style.background = T.IK}>
              ACCEPT
            </button>
            <button onClick={() => onStatusUpdate(booking.id, "rejected")} style={{ ...btnBase, background: "transparent", border: "1px solid #ea5455", color: "#ea5455" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ea5455"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ea5455"; }}>
              REJECT
            </button>
          </>
        )}
        {booking.status === "accepted" && (
          <button onClick={() => onStatusUpdate(booking.id, "completed")} style={{ ...btnBase, background: "#28c76f", color: "#fff" }}
            onMouseEnter={e => e.currentTarget.style.background = "#1fa055"}
            onMouseLeave={e => e.currentTarget.style.background = "#28c76f"}>
            MARK DONE
          </button>
        )}
        {(booking.status === "completed" || booking.status === "cancelled" || booking.status === "rejected") && (
          <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK }}>—</span>
        )}

        {/* Chat button — always visible for provider on active bookings */}
        {(booking.status === "requested" || booking.status === "accepted") && (
          <button
            onClick={() => onOpenChat(booking.id)}
            title="Chat with customer"
            style={{ ...btnBase, background: "transparent", border: `1px solid ${T.IK}`, color: T.IK, display: "flex", alignItems: "center", gap: 4 }}
            onMouseEnter={e => { e.currentTarget.style.background = T.IK; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.IK; }}>
            💬 CHAT
          </button>
        )}
      </div>
    </div>
  );
};

// ─── PROVIDER DASHBOARD ───────────────────────────────────────────
const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [user,            setUser]            = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [bookings,        setBookings]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const notify = useNotify();

  // Guard: redirect non-providers
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const u = userStr ? (() => { try { return JSON.parse(userStr); } catch { return null; } })() : null;
    if (!u || (u.role !== "provider" && u.role !== "both")) {
      navigate("/");
      return;
    }

    Promise.all([getMe(), getMyProviderDetails(), getMyBookings()])
      .then(([userData, provData, bookingData]) => {
        setUser(userData);
        setProviderDetails(provData);
        setBookings(bookingData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const refreshBookings = () => getMyBookings().then(setBookings).catch(console.error);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (!window.confirm(`Confirm mark as "${newStatus}"?`)) return;
    try {
      await updateBookingStatus(bookingId, newStatus);
      refreshBookings();
    } catch {
      notify("Failed to update status.", "error");
    }
  };

  const handleOpenChat = async (bookingId) => {
    try {
      const room = await getOrCreateRoom(bookingId);
      navigate(`/chat/${room.id}`);
    } catch (err) {
      notify("Could not open chat. " + (err.response?.data?.detail || ""), "error");
    }
  };

  // Derived stats
  const activeBookings    = bookings.filter(b => b.status === "accepted");
  const pendingBookings   = bookings.filter(b => b.status === "requested");
  const completedBookings = bookings.filter(b => b.status === "completed");
  const serviceCount      = providerDetails?.services?.length ?? 0;

  // Show active + pending in the feed, newest first
  const feedBookings = bookings
    .filter(b => b.status === "requested" || b.status === "accepted")
    .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));

  return (
    <SharedLayout>
      <SectionBar left="PROVIDER DASHBOARD" right={user ? user.full_name?.toUpperCase() : "LOADING..."} />

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>LOADING DASHBOARD...</div>
      ) : (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px", display: "flex", flexDirection: "column", gap: 32 }}>

          {/* Location warning */}
          {(!providerDetails?.lat || !providerDetails?.lng) && (
            <div style={{ border: "1px solid #ea5455", background: "rgba(234,84,85,0.06)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ea5455" }}>⚠ Location Not Set — </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.IK }}>customers can't find you in local searches.</span>
              </div>
              <Link to="/profile" style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ea5455", textDecoration: "none", whiteSpace: "nowrap" }}>
                GO TO PROFILE TO FIX →
              </Link>
            </div>
          )}

          {/* Stats row */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, marginBottom: 12 }}>OVERVIEW</div>
            <div style={{ display: "flex", flexWrap: "wrap", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
              <StatCard value={bookings.length}        label="Total Bookings"   />
              <StatCard value={pendingBookings.length}  label="Pending"          accent="#ff9f43" />
              <StatCard value={activeBookings.length}   label="Active"           accent={T.IK} />
              <StatCard value={completedBookings.length} label="Completed"       accent="#28c76f" />
              <StatCard value={serviceCount}            label="Services Listed"  accent={T.C} />
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, marginBottom: 12 }}>QUICK ACTIONS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <ActionCard
                to="/manage-services"
                title="Manage Services"
                desc="Add, edit, or remove the services you offer. Keep your listing up to date."
                cta="Open Services"
              />
              <ActionCard
                to="/my-bookings"
                title="All Bookings"
                desc="See the full history of customer requests — past, present, and upcoming."
                cta="View All"
              />
              <ActionCard
                to="/chat"
                title="Messages"
                desc="Chat directly with customers about their bookings and requirements."
                cta="Open Chat"
              />
              <ActionCard
                to="/profile"
                title="My Profile"
                desc="Update your location coordinates and provider settings."
                cta="Edit Profile"
              />
            </div>
          </div>

          {/* Active booking feed */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>PENDING & ACTIVE BOOKINGS</div>
              <Link to="/my-bookings" style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.C, textDecoration: "none" }}>VIEW ALL →</Link>
            </div>
            <div style={{ border: `1px solid ${T.IK}`, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "10px 20px", background: T.IK, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>BOOKING FEED</span>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "#f5f0e6", opacity: 0.5 }}>{feedBookings.length} ITEMS</span>
              </div>
              {feedBookings.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", background: "#fff" }}>
                  <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, margin: 0 }}>No pending or active bookings.</p>
                </div>
              ) : (
                feedBookings.map(b => (
                  <BookingRow key={b.id} booking={b} onStatusUpdate={handleStatusUpdate} onOpenChat={handleOpenChat} />
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </SharedLayout>
  );
};

export default ProviderDashboard;