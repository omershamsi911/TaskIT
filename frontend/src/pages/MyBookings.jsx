import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SharedLayout from "../components/layouts/Sharedlayout";

import {
  getMyBookings,
  updateBookingStatus,
} from "../handlers/bookingHandlers";

import ReviewModal from "../components/ReviewModal";
import { getOrCreateRoom } from "../handlers/chatHandlers";
import api from "../api/api";
import { useNotify } from "../context/NotificationContext";
import { MapPin, Calendar, MessageSquare, AlertTriangle, CheckCircle, ChevronRight, Loader, X, Send } from "lucide-react";

const T = {
  C: "#FF5733",
  CR: "#F5F0E6",
  IK: "#1A1A1A",
  LIGHT_IK: "#6B6B6B",
};

const STATUS_COLORS = {
  requested: {
    bg: "#ff9f43",
    border: "#ff9f43",
    text: "#fff",
  },
  accepted: {
    bg: T.IK,
    border: T.IK,
    text: "#fff",
  },
  completed: {
    bg: "#28c76f",
    border: "#28c76f",
    text: "#fff",
  },
  cancelled: {
    bg: "#ea5455",
    border: "#ea5455",
    text: "#fff",
  },
  rejected: {
    bg: "#ea5455",
    border: "#ea5455",
    text: "#fff",
  },
};

// ─── CONFIRMATION MODAL ──────────────────────────────────────────
const ConfirmationModal = ({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, isDanger }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px"
    }}>
      <div style={{
        background: "#fff", borderRadius: 4, boxShadow: "0 12px 32px rgba(0,0,0,0.12)", maxWidth: 400, width: "100%", padding: "28px 24px"
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.IK, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 10 }}>
          {isDanger && <AlertTriangle size={20} style={{ color: "#ea5455" }} />}
          {title}
        </h3>
        <p style={{ fontSize: 11, color: T.LIGHT_IK, lineHeight: 1.6, margin: "0 0 24px" }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: "transparent", border: `1px solid ${T.IK}`, color: T.IK, cursor: "pointer", borderRadius: 2, transition: "all 0.1s"
          }} onMouseEnter={e => { e.currentTarget.style.background = T.IK + "10"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            {cancelText}
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "10px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: isDanger ? "#ea5455" : T.C, color: "#fff", border: "none", cursor: "pointer", borderRadius: 2, transition: "all 0.1s"
          }} onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }} onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DISPUTE MODAL ──────────────────────────────────────────────
const DisputeModal = ({ isOpen, onSubmit, onCancel }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    await onSubmit(reason);
    setSubmitting(false);
  };

  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px"
    }}>
      <div style={{
        background: "#fff", borderRadius: 4, boxShadow: "0 12px 32px rgba(0,0,0,0.12)", maxWidth: 450, width: "100%", padding: "28px 24px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.IK, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={20} style={{ color: "#ea5455" }} />
            REPORT ISSUE
          </h3>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: T.LIGHT_IK }}><X size={20} /></button>
        </div>
        <p style={{ fontSize: 10, color: T.LIGHT_IK, margin: "0 0 14px" }}>Describe the issue so admin can assist you properly.</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Explain what went wrong..."
          style={{
            width: "100%", minHeight: 100, padding: "12px 14px", fontSize: 10, fontWeight: 500, border: `1px solid ${T.IK}`, borderRadius: 4, color: T.IK, outline: "none", resize: "none", transition: "border-color 0.1s", fontFamily: "inherit"
          }}
          onFocus={e => { e.target.style.borderColor = T.C; }}
          onBlur={e => { e.target.style.borderColor = T.IK; }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: "transparent", border: `1px solid ${T.IK}`, color: T.IK, cursor: "pointer", borderRadius: 2, transition: "all 0.1s"
          }} onMouseEnter={e => { e.currentTarget.style.background = T.IK + "10"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            CANCEL
          </button>
          <button onClick={handleSubmit} disabled={!reason.trim() || submitting} style={{
            flex: 1, padding: "10px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: !reason.trim() || submitting ? T.LIGHT_IK : "#ea5455", color: "#fff", border: "none", cursor: !reason.trim() || submitting ? "default" : "pointer", borderRadius: 2, transition: "all 0.1s", opacity: !reason.trim() || submitting ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6
          }} onMouseEnter={e => { if (reason.trim() && !submitting) e.currentTarget.style.opacity = "0.9"; }} onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
            {submitting ? <><Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> SUBMITTING</> : "SUBMIT REPORT"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionBar = ({ left, right }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 20px",
      background: T.IK,
      flexWrap: "wrap",
      gap: 12,
    }}
  >
    <span
      style={{
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: T.C,
      }}
    >
      {left}
    </span>

    <span
      style={{
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: T.CR,
        padding: "4px 12px",
        background: T.C,
        color: T.CR,
        borderRadius: 2,
      }}
    >
      {right}
    </span>
  </div>
);

const MyBookings = () => {
  const reduxUser = useSelector((state) => state.auth?.user);
  const {notify} = useNotify();

  const userStr = localStorage.getItem("user");

  const fallbackUser = userStr
    ? (() => {
        try {
          return JSON.parse(userStr);
        } catch {
          return { role: "customer", id: null };
        }
      })()
    : { role: "customer", id: null };

  const currentUser = reduxUser || fallbackUser;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, bookingId: null, newStatus: null });
  const [disputeModal, setDisputeModal] = useState({ isOpen: false, bookingId: null });

  const navigate = useNavigate();

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] =
    useState(false);

  const [selectedBooking, setSelectedBooking] =
    useState(null);

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

  const handleStatusUpdate = (bookingId, newStatus) => {
    setConfirmModal({ isOpen: true, bookingId, newStatus });
  };

  const confirmStatusUpdate = async () => {
    const { bookingId, newStatus } = confirmModal;
    try {
      await updateBookingStatus(bookingId, newStatus);
      fetchBookings();
      setConfirmModal({ isOpen: false, bookingId: null, newStatus: null });
      notify(`Booking marked as ${newStatus.toUpperCase()}`, "success");
    } catch (err) {
      notify("Failed to update booking status.", "error");
    }
  };

  const openReview = (booking) => {
    setSelectedBooking(booking);
    setReviewModalOpen(true);
  };

  const handleOpenChat = async (bookingId) => {
    try {
      const room = await getOrCreateRoom(bookingId);
      navigate(`/chat/${room.id}`);
    } catch (err) {
      notify(
        "Could not open chat. " +
          (err.response?.data?.detail || ""),
          "error"
      );
    }
  };

  const fileDispute = (bookingId) => {
    setDisputeModal({ isOpen: true, bookingId });
  };

  const submitDispute = async (reason) => {
    const { bookingId } = disputeModal;
    try {
      await api.post("/admin/disputes", {
        booking_id: bookingId,
        reason,
      });
      notify("Issue reported. Admin will reach out shortly.", "success");
      setDisputeModal({ isOpen: false, bookingId: null });
      fetchBookings();
    } catch (err) {
      notify("Failed to report issue.", "error");
    }
  };

  return (
    <SharedLayout>
      <SectionBar
        left="MY BOOKINGS"
        right={`${bookings.length} TOTAL`}
      />

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 20px",
          fontFamily:
            "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              minHeight: "60vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <Loader size={40} style={{ color: T.C, animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK }}>LOADING BOOKINGS...</span>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : bookings.length === 0 ? (
          <div
            style={{
              border: `1px solid ${T.IK}20`,
              padding: "64px 32px",
              textAlign: "center",
              borderRadius: 4,
              background: T.CR,
            }}
          >
            <div
              style={{
                fontSize: 56,
                opacity: 0.15,
                marginBottom: 16,
              }}
            >
              📋
            </div>

            <p
              style={{
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: T.IK,
                margin: "0 0 8px",
              }}
            >
              NO BOOKINGS YET
            </p>
            <p
              style={{
                fontSize: 10,
                color: T.LIGHT_IK,
                margin: 0,
                fontFamily: "Georgia, serif",
                fontWeight: 400,
              }}
            >
              Start by booking a service from our providers
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {bookings.map((booking) => {
              const providerUserId =
              booking.provider?.user_id ?? null;

            const isCustomer =
              currentUser.id === booking.user_id;

           const isProviderView =
  currentUser.id === booking.provider_user_id;

              const statusColor =
                STATUS_COLORS[booking.status] || {
                  bg: T.LIGHT_IK,
                  border: T.LIGHT_IK,
                  text: "#fff",
                };

              return (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isCustomer={isCustomer}
                  isProviderView={isProviderView}
                  statusColor={statusColor}
                  onStatusUpdate={
                    handleStatusUpdate
                  }
                  onReview={openReview}
                  onOpenChat={handleOpenChat}
                  onFileDispute={fileDispute}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <ReviewModal
          booking={selectedBooking}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedBooking(null);
            fetchBookings();
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.newStatus ? `Mark as ${confirmModal.newStatus.toUpperCase()}?` : "Confirm Action"}
        message={`Are you sure you want to mark this booking as ${confirmModal.newStatus?.toUpperCase()}? This action cannot be undone.`}
        confirmText="CONFIRM"
        cancelText="CANCEL"
        isDanger={confirmModal.newStatus === "cancelled" || confirmModal.newStatus === "rejected"}
        onConfirm={confirmStatusUpdate}
        onCancel={() => setConfirmModal({ isOpen: false, bookingId: null, newStatus: null })}
      />

      {/* Dispute Modal */}
      <DisputeModal
        isOpen={disputeModal.isOpen}
        onSubmit={submitDispute}
        onCancel={() => setDisputeModal({ isOpen: false, bookingId: null })}
      />

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </SharedLayout>
  );
};

const BookingCard = ({
  booking,
  isCustomer,
  isProviderView,
  statusColor,
  onStatusUpdate,
  onOpenChat,
  onReview,
  onFileDispute,
}) => {
  const btnBase = {
    width: "100%",
    padding: "12px",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.1s",
    fontFamily: "inherit",
  };

  // Show chat button for active bookings
  const canChat =
    booking.status === "requested" ||
    booking.status === "accepted";

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${T.IK}20`,
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        borderRadius: 4,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}
    >
      {/* Left status strip */}
      <div
        style={{
          width: 5,
          background: statusColor.bg,
          flexShrink: 0,
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexWrap: "wrap",
          "@media (max-width: 768px)": { flexDirection: "column" },
        }}
      >
        {/* Info Panel */}
        <div
          style={{
            flex: "1 1 340px",
            padding: "24px 20px",
            borderRight: `1px solid ${T.IK}20`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.12em",
                color: T.LIGHT_IK,
              }}
            >
              ID #{booking.id}
            </span>

            <span
              style={{
                background: statusColor.bg,
                border: `1px solid ${statusColor.border}`,
                color: statusColor.text,
                padding: "6px 10px",
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderRadius: 2,
              }}
            >
              {booking.status}
            </span>

            <span
              style={{
                marginLeft: "auto",
                fontSize: 9,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: T.LIGHT_IK,
              }}
            >
              {isProviderView
                ? "SERVICE REQUEST"
                : "YOUR BOOKING"}
            </span>
          </div>

          {/* Date */}
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: T.IK,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Calendar size={14} style={{ color: T.LIGHT_IK, flexShrink: 0 }} />
            {new Date(
              booking.scheduled_at
            ).toLocaleString("en-PK", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>

          {/* Address */}
          <p
            style={{
              fontSize: 10,
              color: T.LIGHT_IK,
              margin: 0,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <MapPin size={13} style={{ color: T.LIGHT_IK, flexShrink: 0, marginTop: 2 }} />
            {booking.address}
          </p>

          {/* Description */}
          {booking.description && (
            <p
              style={{
                fontSize: 10,
                color: T.IK,
                background: T.CR + "80",
                padding: "12px 14px",
                borderLeft: `4px solid ${T.C}`,
                margin: 0,
                fontStyle: "italic",
                lineHeight: 1.5,
                borderRadius: "0 2px 2px 0",
              }}
            >
              "{booking.description}"
            </p>
          )}
        </div>

        {/* Actions Panel */}
        <div
          style={{
            minWidth: 240,
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 10,
            background: T.CR,
            flexShrink: 0,
          }}
        >
          {/* PROVIDER ACTIONS */}
          {isProviderView &&
            booking.status === "requested" && (
              <>
                <ActionBtn
                  text="ACCEPT JOB"
                  bg={T.IK}
                  color="#fff"
                  border={T.IK}
                  hoverBg={T.C}
                  icon={CheckCircle}
                  onClick={() =>
                    onStatusUpdate(
                      booking.id,
                      "accepted"
                    )
                  }
                />

                <ActionBtn
                  text="REJECT"
                  bg="transparent"
                  color="#ea5455"
                  border="#ea5455"
                  hoverBg="#ea5455"
                  hoverColor="#fff"
                  icon={AlertTriangle}
                  onClick={() =>
                    onStatusUpdate(
                      booking.id,
                      "rejected"
                    )
                  }
                />
              </>
            )}

          {isProviderView &&
            booking.status === "accepted" && (
              <ActionBtn
                text="MARK COMPLETE"
                bg="#28c76f"
                color="#fff"
                border="#28c76f"
                hoverBg="#1fa055"
                icon={CheckCircle}
                onClick={() =>
                  onStatusUpdate(
                    booking.id,
                    "completed"
                  )
                }
              />
            )}

          {/* CUSTOMER ACTIONS */}
          {isCustomer &&
            booking.status === "requested" && (
              <ActionBtn
                text="CANCEL REQUEST"
                bg="transparent"
                color="#ea5455"
                border="#ea5455"
                hoverBg="#ea5455"
                hoverColor="#fff"
                icon={X}
                onClick={() =>
                  onStatusUpdate(
                    booking.id,
                    "cancelled"
                  )
                }
              />
            )}

          {isCustomer &&
            booking.status === "accepted" && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 9,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: T.IK,
                  padding: "10px",
                  background: T.IK + "10",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Loader size={12} style={{ animation: "spin 1s linear infinite" }} />
                COMING SOON
              </div>
            )}

          {/* Chat button */}
          {canChat && (
            <button
              onClick={() =>
                onOpenChat(booking.id)
              }
              style={{
                ...btnBase,
                background: "transparent",
                border: `1px solid ${T.IK}`,
                color: T.IK,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                borderRadius: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  T.IK;

                e.currentTarget.style.color =
                  "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "transparent";

                e.currentTarget.style.color =
                  T.IK;
              }}
            >
              <MessageSquare size={12} /> CHAT
            </button>
          )}

          {/* Completed */}
          {isCustomer &&
  (booking.status === "completed" ||
    booking.status === "accepted") && (
    <>
      {booking.status === "completed" && (
        <div
          style={{
            textAlign: "center",
            fontSize: 9,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#28c76f",
            padding: "10px",
            background: "#28c76f10",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <CheckCircle size={12} /> COMPLETED
        </div>
      )}

      <ActionBtn
        text="LEAVE REVIEW"
        bg={T.C}
        color="#fff"
        border={T.C}
        hoverBg="#e04b2c"
        icon={null}
        onClick={() => onReview(booking)}
      />

      <ActionBtn
        text="REPORT ISSUE"
        bg="transparent"
        color="#ea5455"
        border="#ea5455"
        hoverBg="#ea5455"
        hoverColor="#fff"
        icon={AlertTriangle}
        onClick={() => onFileDispute(booking.id)}
      />
    </>
  )}

          {/* TERMINAL STATES */}
          {(booking.status === "cancelled" ||
            booking.status === "rejected") && (
            <div
              style={{
                textAlign: "center",
                fontSize: 9,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#ea5455",
                padding: "10px",
                background: "#ea545510",
                borderRadius: 2,
              }}
            >
              {booking.status === "cancelled"
                ? "CANCELLED"
                : "REJECTED"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionBtn = ({
  text,
  bg,
  color,
  border = bg,
  hoverBg,
  hoverColor,
  icon: Icon,
  onClick,
}) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      padding: "10px",
      fontSize: 9,
      fontWeight: 900,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      background: bg,
      color,
      border: `1px solid ${border}`,
      cursor: "pointer",
      transition: "all 0.15s",
      fontFamily: "inherit",
      borderRadius: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    }}
    onMouseEnter={(e) => {
      if (hoverBg)
        e.currentTarget.style.background =
          hoverBg;

      if (hoverColor)
        e.currentTarget.style.color =
          hoverColor;

      e.currentTarget.style.opacity = 0.9;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = bg;
      e.currentTarget.style.color = color;
      e.currentTarget.style.opacity = 1;
    }}
  >
    {Icon && <Icon size={12} />}
    {text}
  </button>
);

export default MyBookings;
