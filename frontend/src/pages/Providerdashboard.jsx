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
import { AlertCircle, MessageSquare, Settings, Calendar, CheckCircle, Clock, AlertTriangle, Loader, TrendingUp, Zap, ChevronRight, MapPin } from "lucide-react";

const SectionBar = ({ left, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: T.IK, flexWrap: "wrap", gap: 12 }}>
    <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>{left}</span>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f5f0e6", padding: "4px 12px", background: T.C, color: T.CR, borderRadius: 2 }}>{right}</span>
  </div>
);

const STATUS_COLORS = {
  requested: { bg: "#ff9f43", color: "#fff" },
  accepted:  { bg: T.IK,     color: "#fff" },
  completed: { bg: "#28c76f", color: "#fff" },
  cancelled: { bg: "#ea5455", color: "#fff" },
};

// ─── STAT CARD ────────────────────────────────────────────────────
const StatCard = ({ value, label, accent, icon: Icon }) => (
  <div style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "28px 24px", borderRight: `1px solid ${T.IK}`, background: "#fff", transition: "all 0.2s", minHeight: 140 }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 900, lineHeight: 1, color: accent || T.C, letterSpacing: "-0.02em" }}>{value}</div>
      {Icon && <Icon size={20} style={{ color: accent || T.C, opacity: 0.6, flexShrink: 0 }} />}
    </div>
    <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: T.LIGHT_IK, lineHeight: 1.4 }}>{label}</div>
  </div>
);

// ─── QUICK ACTION CARD ────────────────────────────────────────────
const ActionCard = ({ to, title, desc, cta, icon: Icon }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "28px 24px", border: `1px solid ${T.IK}`, textDecoration: "none", background: hov ? T.IK + "12" : "#fff", transition: "all 0.2s", color: hov ? T.IK : T.IK, transform: hov ? "translateY(-4px)" : "translateY(0)", boxShadow: hov ? `0 8px 16px rgba(0,0,0,0.08)` : "none" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {Icon && <Icon size={24} style={{ color: hov ? T.C : T.IK, flexShrink: 0 }} />}
        </div>
        <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px", color: T.IK }}>{title}</h3>
        <p style={{ fontSize: 10, lineHeight: 1.6, color: T.LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>{desc}</p>
      </div>
      <div style={{ marginTop: 18, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: hov ? T.C : T.IK, display: "flex", alignItems: "center", gap: 4 }}>{cta} <ChevronRight size={12} /></div>
    </Link>
  );
};

// ─── ACTIVE BOOKING ROW ──────────────────────────────────────────
const BookingRow = ({ booking, onStatusUpdate, onOpenChat }) => {
  const sc = STATUS_COLORS[booking.status] || { bg: T.LIGHT_IK, color: "#fff" };
  const btnBase = { padding: "8px 14px", fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.15s", borderRadius: 2 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: `1px solid ${T.IK}20`, background: "#fff", hover: { background: T.IK + "05" }, transition: "all 0.2s" }}>
      <div style={{ width: 4, alignSelf: "stretch", background: sc.bg, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: "18px 20px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ padding: "6px 10px", fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", background: sc.bg, color: sc.color, borderRadius: 2 }}>
            {booking.status}
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, color: T.LIGHT_IK }}>ID #{booking.id}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.IK, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={14} style={{ color: T.LIGHT_IK }} />
            {new Date(booking.scheduled_at).toLocaleString("en-PK", { dateStyle: "short", timeStyle: "short" })}
          </p>
        </div>
        <p style={{ fontSize: 10, color: T.LIGHT_IK, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={13} style={{ color: T.LIGHT_IK, flexShrink: 0 }} />
          {booking.address}
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 16px", flexShrink: 0, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
        {booking.status === "requested" && (
          <>
            <button onClick={() => onStatusUpdate(booking.id, "accepted")} style={{ ...btnBase, background: T.IK, color: "#fff", display: "flex", alignItems: "center", gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.background = T.C}
              onMouseLeave={e => e.currentTarget.style.background = T.IK}>
              <CheckCircle size={12} />
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
          <button onClick={() => onStatusUpdate(booking.id, "completed")} style={{ ...btnBase, background: "#28c76f", color: "#fff", display: "flex", alignItems: "center", gap: 4 }}
            onMouseEnter={e => e.currentTarget.style.background = "#1fa055"}
            onMouseLeave={e => e.currentTarget.style.background = "#28c76f"}>
            <CheckCircle size={12} />
            MARK DONE
          </button>
        )}
        {(booking.status === "completed" || booking.status === "cancelled" || booking.status === "rejected") && (
          <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK }}>—</span>
        )}

        {/* Chat button — always visible for provider on active bookings */}
        {(booking.status === "requested" || booking.status === "accepted") && (
          <button
            onClick={() => onOpenChat(booking.id)}
            title="Chat with customer"
            style={{ ...btnBase, background: "transparent", border: `1px solid ${T.IK}`, color: T.IK, display: "flex", alignItems: "center", gap: 4 }}
            onMouseEnter={e => { e.currentTarget.style.background = T.IK; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.IK; }}>
            <MessageSquare size={12} />
            CHAT
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", minHeight: "60vh", gap: 16 }}>
          <Loader size={40} style={{ color: T.C, animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK }}>LOADING DASHBOARD...</span>
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px", display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Location warning */}
          {(!providerDetails?.lat || !providerDetails?.lng) && (
            <div style={{ border: "2px solid #ea5455", background: "#ea545510", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", borderRadius: 4 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <AlertTriangle size={18} style={{ color: "#ea5455", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ea5455", display: "block", marginBottom: 4 }}>Location Not Set</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: T.IK }}>Customers can't find you in local searches.</span>
                </div>
              </div>
              <Link to="/profile" style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ea5455", textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", border: "1px solid #ea5455", borderRadius: 2, transition: "all 0.1s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#ea5455"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ea5455"; }}>
                FIX NOW <ChevronRight size={12} />
              </Link>
            </div>
          )}

          {/* Stats row */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, marginBottom: 14 }}>OVERVIEW</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 0, border: `1px solid ${T.IK}`, overflow: "hidden", borderRadius: 2 }}>
              <StatCard value={bookings.length}        label="Total Bookings"   icon={Calendar} />
              <StatCard value={pendingBookings.length}  label="Pending"          accent="#ff9f43" icon={Clock} />
              <StatCard value={activeBookings.length}   label="Active"           accent={T.IK} icon={Zap} />
              <StatCard value={completedBookings.length} label="Completed"       accent="#28c76f" icon={CheckCircle} />
              <StatCard value={serviceCount}            label="Services"         accent={T.C} icon={TrendingUp} />
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, marginBottom: 14 }}>QUICK ACTIONS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <ActionCard
                to="/manage-services"
                title="Manage Services"
                desc="Add, edit, or remove the services you offer to customers."
                cta="Manage"
                icon={Settings}
              />
              <ActionCard
                to="/my-bookings"
                title="All Bookings"
                desc="See the complete history of customer requests and bookings."
                cta="View All"
                icon={Calendar}
              />
              <ActionCard
                to="/chat"
                title="Messages"
                desc="Chat with customers about their requirements and bookings."
                cta="Open Chat"
                icon={MessageSquare}
              />
              <ActionCard
                to="/profile"
                title="My Profile"
                desc="Update location coordinates and provider information."
                cta="Edit Profile"
                icon={Settings}
              />
            </div>
          </div>

          {/* Active booking feed */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>PENDING & ACTIVE BOOKINGS</div>
              <Link to="/my-bookings" style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.C, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", transition: "all 0.1s" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                VIEW ALL <ChevronRight size={12} />
              </Link>
            </div>
            <div style={{ border: `1px solid ${T.IK}`, overflow: "hidden", borderRadius: 2 }}>
              {/* Header */}
              <div style={{ padding: "14px 20px", background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: T.C }}>BOOKING FEED</span>
                <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#f5f0e6", opacity: 0.6, padding: "4px 10px", background: T.C + "20", borderRadius: 2 }}>{feedBookings.length} ITEMS</span>
              </div>
              {feedBookings.length === 0 ? (
                <div style={{ padding: "48px 20px", textAlign: "center", background: "#fff" }}>
                  <div style={{ fontSize: 40, opacity: 0.15, marginBottom: 12 }}>📋</div>
                  <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: T.LIGHT_IK, margin: 0 }}>No Pending or Active Bookings</p>
                  <p style={{ fontSize: 9, color: T.LIGHT_IK, margin: "6px 0 0", fontFamily: "Georgia, serif", fontWeight: 400 }}>Your pending and active bookings will appear here</p>
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
