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

const SectionBar = ({ left, right }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 48px",
      background: T.IK,
    }}
  >
    <span
      style={{
        fontSize: 10,
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
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: T.CR,
      }}
    >
      {right}
    </span>
  </div>
);

const MyBookings = () => {
  const reduxUser = useSelector((state) => state.auth?.user);

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

  const handleStatusUpdate = async (
    bookingId,
    newStatus
  ) => {
    const confirmed = window.confirm(
      `Confirm mark as "${newStatus.toUpperCase()}"?`
    );

    if (!confirmed) return;

    try {
      await updateBookingStatus(
        bookingId,
        newStatus
      );

      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to update booking status.");
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
      alert(
        "Could not open chat. " +
          (err.response?.data?.detail || "")
      );
    }
  };

  const fileDispute = async (bookingId) => {
    const reason = prompt("Describe the issue:");

    if (!reason) return;

    try {
      await api.post("/admin/disputes", {
        booking_id: bookingId,
        reason,
      });

      alert(
        "Dispute filed. Admin will reach out shortly."
      );
    } catch (err) {
      console.error(err);
      alert("Failed to file dispute.");
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
          maxWidth: 1000,
          margin: "0 auto",
          padding: "40px 32px",
          fontFamily:
            "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              fontSize: 14,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: T.LIGHT_IK,
            }}
          >
            LOADING BOOKINGS...
          </div>
        ) : bookings.length === 0 ? (
          <div
            style={{
              border: `1px dashed ${T.IK}`,
              padding: "64px 32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: T.IK,
                opacity: 0.08,
                marginBottom: 16,
              }}
            >
              ◈
            </div>

            <p
              style={{
                fontSize: 11,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: T.LIGHT_IK,
              }}
            >
              NO BOOKINGS FOUND.
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
              const isCustomer =
                currentUser.id === booking.user_id;

              const isProviderView =
                currentUser.id === booking.provider_id;

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
        border: `1px solid ${T.IK}`,
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      {/* Left status strip */}
      <div
        style={{
          width: 6,
          background: statusColor.bg,
          flexShrink: 0,
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {/* Info Panel */}
        <div
          style={{
            flex: "1 1 320px",
            padding: 24,
            borderRight: `1px solid ${T.IK}`,
            display: "flex",
            flexDirection: "column",
            gap: 10,
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
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.15em",
                color: T.LIGHT_IK,
              }}
            >
              #{booking.id}
            </span>

            <span
              style={{
                background: statusColor.bg,
                border: `1px solid ${statusColor.border}`,
                color: statusColor.text,
                padding: "4px 10px",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {booking.status}
            </span>

            <span
              style={{
                marginLeft: "auto",
                fontSize: 10,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
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
              fontSize: 12,
              fontWeight: 700,
              color: T.IK,
              margin: 0,
            }}
          >
            📅{" "}
            {new Date(
              booking.scheduled_at
            ).toLocaleString("en-PK", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>

          {/* Address */}
          <p
            style={{
              fontSize: 11,
              color: T.LIGHT_IK,
              margin: 0,
            }}
          >
            📍 {booking.address}
          </p>

          {/* Description */}
          {booking.description && (
            <p
              style={{
                fontSize: 12,
                color: T.IK,
                background: T.CR,
                padding: 12,
                borderLeft: `4px solid ${T.C}`,
                margin: 0,
                fontStyle: "italic",
              }}
            >
              "{booking.description}"
            </p>
          )}
        </div>

        {/* Actions Panel */}
        <div
          style={{
            width: 220,
            padding: 24,
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
                  fontSize: 10,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: T.IK,
                }}
              >
                PROVIDER IS ON THE WAY
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
              💬 Chat
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
            fontSize: 10,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#28c76f",
          }}
        >
          ✓ COMPLETED
        </div>
      )}

      <ActionBtn
        text="LEAVE REVIEW"
        bg={T.C}
        color="#fff"
        border={T.C}
        hoverBg="#e04b2c"
        onClick={() => onReview(booking)}
      />

      <ActionBtn
        text="REPORT ISSUE"
        bg="transparent"
        color="#ea5455"
        border="#ea5455"
        hoverBg="#ea5455"
        hoverColor="#fff"
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
                fontSize: 10,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#ea5455",
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
  onClick,
}) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      padding: "12px",
      fontSize: 10,
      fontWeight: 900,
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      background: bg,
      color,
      border: `1px solid ${border}`,
      cursor: "pointer",
      transition: "all 0.1s",
      fontFamily: "inherit",
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
    {text}
  </button>
);

export default MyBookings;