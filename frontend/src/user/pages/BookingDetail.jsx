import { useState, useEffect, useRef } from "react";
import Header from "../../common/components/Header";
import Footer from "../../common/components/Footer";
import { useTheme } from "../../hooks/useTheme";

// ─── MOCK DATA — replace with BookingDetail.json API response ─────────────────
const DATA = {
  booking: {
    id:                   12345,
    booking_ref:          "TK-202404-123456",
    status:               "accepted",   // requested | accepted | in_progress | completed | cancelled | disputed
    scheduled_at:         "2024-04-22T14:00:00Z",
    description:          "Kitchen sink pipe is leaking",
    special_instructions: "Please bring pipe sealant",
    quoted_price:         500.00,
    created_at:           "2024-04-21T10:30:00Z",
    accepted_at:          "2024-04-21T10:45:00Z",
  },
  status_timeline: [
    { status: "requested",  timestamp: "2024-04-21T10:30:00Z", note: "Booking created"    },
    { status: "accepted",   timestamp: "2024-04-21T10:45:00Z", note: "Provider accepted"  },
  ],
  provider: {
    id:          5,
    full_name:   "BILAL AHMED",
    phone:       "03001234568",
    avatar_url:  null,
    avg_rating:  4.8,
    total_jobs:  142,
    badge:       "TOP RATED",
  },
  address: {
    label:         "HOME",
    address_line1: "123 Main Street, Gulberg III",
    city:          "Lahore",
    lat:           31.5204,
    lng:           74.3587,
  },
  payment: {
    status:       "pending",   // pending | paid | refunded | held
    method:       null,        // JAZZCASH | EASYPAISA | BANK | CASH
    amount:       500.00,
    platform_fee: 50.00,
    total:        550.00,
  },
  chat_enabled:  true,
  chat_room_id:  5678,
};


// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function BookingDetailPage() {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const { booking, status_timeline, provider, address, payment, chat_enabled, chat_room_id } = DATA;

  // Simulate WebSocket status updates
  const [liveStatus, setLiveStatus]   = useState(booking.status);
  const [liveTimeline, setLiveTimeline] = useState(status_timeline);
  const [wsConnected, setWsConnected]  = useState(false);
  const [modal, setModal]              = useState(null);  // { action, message }
  const wsRef = useRef(null);

  // ─── STATUS CONFIG ────────────────────────────────────────────────────────────
  const STATUS_META = {
    requested:   { label: "REQUESTED",   sym: "◎", bg: IK,  fg: CR,  dot: "#888" },
    accepted:    { label: "ACCEPTED",    sym: "◆", bg: C,   fg: CR,  dot: C      },
    in_progress: { label: "IN PROGRESS", sym: "▶", bg: IK,  fg: C,   dot: C      },
    completed:   { label: "COMPLETED",   sym: "◉", bg: IK,  fg: CR,  dot: CR     },
    cancelled:   { label: "CANCELLED",   sym: "✕", bg: "#555", fg: CR, dot: "#555"},
    disputed:    { label: "DISPUTED",    sym: "⚑", bg: C,   fg: CR,  dot: C      },
  };

  const PAYMENT_META = {
    pending:  { label: "PENDING",  color: IK, op: 0.45 },
    paid:     { label: "PAID",     color: C,  op: 1    },
    refunded: { label: "REFUNDED", color: IK, op: 0.6  },
    held:     { label: "HELD",     color: C,  op: 1    },
  };

  // All possible timeline steps in order
  const TIMELINE_STEPS = ["requested", "accepted", "in_progress", "completed"];

  // Actions available per status
  const STATUS_ACTIONS = {
    requested:   ["CANCEL"],
    accepted:    ["CANCEL"],
    in_progress: ["DISPUTE", "MARK COMPLETE"],
    completed:   ["LEAVE REVIEW"],
    cancelled:   [],
    disputed:    [],
  };

  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-PK", {
      day: "2-digit", month: "short", year: "numeric",
    }).toUpperCase();

  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-PK", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    }).toUpperCase();

  const fmtDateTime = (iso) => `${fmtDate(iso)} · ${fmtTime(iso)}`;

  const fmtPKR = (n) =>
    `PKR ${Number(n).toLocaleString("en-PK", { minimumFractionDigits: 0 })}`;

  const initials = (name) =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  // ─── SHARED: SectionBar (identical to ProfilePage) ────────────────────────────
  const SectionBar = ({ n, title }) => (
    <div
      className="flex items-center justify-between px-6 py-2.5"
      style={{ background: IK }}
    >
      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
        {title}
      </span>
      <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>{n}</span>
    </div>
  );

  // ─── BOOKING STATUS TIMELINE ──────────────────────────────────────────────────
  const BookingStatusTimeline = ({ timeline, currentStatus }) => {
    const doneSet = new Set(timeline.map(t => t.status));
    const currentIdx = TIMELINE_STEPS.indexOf(currentStatus);
    const isCancelled = currentStatus === "cancelled";
    const isDisputed  = currentStatus === "disputed";

    return (
      <div className="border border-ink overflow-hidden">
        <SectionBar n="§ 001" title="BOOKING STATUS" />

        {/* Step track */}
        <div className="grid grid-cols-4 border-b border-ink" style={{ background: CR }}>
          {TIMELINE_STEPS.map((step, i) => {
            const done    = doneSet.has(step) || i <= currentIdx;
            const active  = step === currentStatus;
            const entry   = timeline.find(t => t.status === step);
            const meta    = STATUS_META[step] ?? STATUS_META.requested;
            const isLast  = i === TIMELINE_STEPS.length - 1;

            return (
              <div
                key={step}
                className={`relative flex flex-col px-4 py-5 ${!isLast ? "border-r border-ink" : ""}`}
                style={{ background: active ? IK : done ? "#ede8de" : CR }}
              >
                {/* Connector line */}
                {!isLast && (
                  <div
                    className="hidden md:block absolute right-0 top-1/2 w-px h-8 -translate-y-1/2 z-10"
                    style={{ background: IK }}
                  />
                )}

                {/* Step dot */}
                <div
                  className="w-3 h-3 mb-3 border border-ink"
                  style={{
                    background: active ? C : done ? C : CR,
                    opacity:    done  ? 1 : 0.25,
                  }}
                />

                {/* Step label */}
                <span
                  className="text-2xs font-black uppercase tracking-superwide mb-1"
                  style={{ color: active ? C : done ? IK : IK, opacity: active ? 1 : done ? 1 : 0.3 }}
                >
                  {STATUS_META[step]?.label ?? step}
                </span>

                {/* Timestamp */}
                {entry ? (
                  <span className="text-2xs font-black uppercase" style={{ color: active ? CR : IK, opacity: active ? 0.6 : 0.4 }}>
                    {fmtDate(entry.timestamp)}
                  </span>
                ) : (
                  <span className="text-2xs font-black uppercase" style={{ color: IK, opacity: 0.2 }}>
                    PENDING
                  </span>
                )}

                {/* Note */}
                {entry?.note && (
                  <span className="mt-1 text-2xs font-black uppercase" style={{ color: active ? CR : IK, opacity: 0.35 }}>
                    {entry.note}
                  </span>
                )}

                {/* Active pulse indicator */}
                {active && !isCancelled && !isDisputed && (
                  <span
                    className="mt-2 inline-flex items-center gap-1.5 text-2xs font-black uppercase tracking-wide"
                    style={{ color: C }}
                  >
                    <span className="w-1.5 h-1.5 inline-block" style={{ background: C, animation: "pulse 1.8s ease-in-out infinite" }} />
                    CURRENT
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Special states: cancelled / disputed */}
        {(isCancelled || isDisputed) && (
          <div
            className="flex items-center gap-4 px-6 py-4 border-t border-ink"
            style={{ background: isCancelled ? "#ede8de" : IK }}
          >
            <span className="text-sm font-black" style={{ color: C }}>
              {isCancelled ? "✕" : "⚑"}
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide" style={{ color: isCancelled ? IK : CR }}>
                BOOKING {isCancelled ? "CANCELLED" : "DISPUTED"}
              </p>
              <p className="text-2xs font-black uppercase tracking-wide mt-0.5" style={{ color: isCancelled ? IK : CR, opacity: 0.45 }}>
                {isCancelled ? "This booking has been cancelled." : "Under review by Taskit support team."}
              </p>
            </div>
          </div>
        )}

        {/* WebSocket live indicator */}
        <div
          className="flex items-center gap-2 px-6 py-2.5 border-t border-ink"
          style={{ background: "#ede8de" }}
        >
          <span className="w-1.5 h-1.5 inline-block" style={{ background: C, animation: "pulse 1.8s ease-in-out infinite" }} />
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.45 }}>
            LIVE — REAL-TIME UPDATES ACTIVE
          </span>
        </div>
      </div>
    );
  };

  // ─── JOB DETAILS CARD ────────────────────────────────────────────────────────
  const JobDetailsCard = ({ booking }) => (
    <div className="border border-ink overflow-hidden">
      <SectionBar n="§ 002" title="JOB DETAILS" />
      <div className="flex flex-col" style={{ background: CR }}>
        {[
          { label: "SERVICE",               val: "PLUMBING"                         },
          { label: "SCHEDULED",             val: fmtDateTime(booking.scheduled_at)  },
          { label: "BOOKING REF",           val: booking.booking_ref               },
          { label: "CREATED",               val: fmtDateTime(booking.created_at)    },
        ].map((row, i) => (
          <div
            key={row.label}
            className="grid grid-cols-5 items-center border-b border-ink last:border-b-0"
            style={{ background: i % 2 === 0 ? CR : "#ede8de" }}
          >
            <div className="col-span-2 px-6 py-3.5 border-r border-ink">
              <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.4 }}>
                {row.label}
              </span>
            </div>
            <div className="col-span-3 px-6 py-3.5">
              <span className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>
                {row.val}
              </span>
            </div>
          </div>
        ))}

        {/* Description */}
        <div className="px-6 py-5 border-t border-ink" style={{ background: "#ede8de" }}>
          <p className="text-2xs font-black uppercase tracking-superwide mb-2" style={{ color: IK, opacity: 0.4 }}>
            DESCRIPTION
          </p>
          <p className="text-xs font-black uppercase tracking-wide leading-relaxed" style={{ color: IK }}>
            {booking.description}
          </p>
        </div>

        {/* Special instructions */}
        {booking.special_instructions && (
          <div className="px-6 py-5 border-t border-ink" style={{ background: CR }}>
            <p className="text-2xs font-black uppercase tracking-superwide mb-2" style={{ color: C }}>
              ◆ SPECIAL INSTRUCTIONS
            </p>
            <p className="text-xs font-black uppercase tracking-wide leading-relaxed" style={{ color: IK, opacity: 0.7 }}>
              {booking.special_instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ─── ADDRESS CARD ─────────────────────────────────────────────────────────────
  const AddressCard = ({ address }) => (
    <div className="border border-ink overflow-hidden">
      <SectionBar n="§ 003" title="SERVICE ADDRESS" />

      {/* Map thumbnail — static map placeholder */}
      <div
        className="relative border-b border-ink overflow-hidden"
        style={{ height: 120, background: "#ede8de" }}
      >
        <div className="absolute inset-0 bg-grid-coral bg-grid opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center gap-3">
          <span className="text-2xl font-black" style={{ color: IK, opacity: 0.12 }}>◉</span>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.3 }}>
            MAP — {address.lat.toFixed(4)}, {address.lng.toFixed(4)}
          </span>
        </div>
        {/* Pin */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black" style={{ color: C }}>◆</span>
        </div>
      </div>

      {/* Address details */}
      <div style={{ background: CR }}>
        <div className="flex items-start gap-4 px-6 py-5">
          <div
            className="shrink-0 w-8 h-8 flex items-center justify-center border border-ink text-xs font-black"
            style={{ background: IK, color: C }}
          >
            {address.label?.[0] ?? "◆"}
          </div>
          <div>
            <p className="text-2xs font-black uppercase tracking-superwide mb-0.5" style={{ color: C }}>
              {address.label}
            </p>
            <p className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>
              {address.address_line1}
            </p>
            <p className="text-2xs font-black uppercase tracking-wide mt-0.5" style={{ color: IK, opacity: 0.45 }}>
              {address.city}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── PAYMENT CARD ─────────────────────────────────────────────────────────────
  const PaymentCard = ({ payment }) => {
    const pmeta = PAYMENT_META[payment.status] ?? PAYMENT_META.pending;

    return (
      <div className="border border-ink overflow-hidden">
        <SectionBar n="§ 004" title="PAYMENT" />
        <div className="flex flex-col" style={{ background: CR }}>

          {/* Rows */}
          {[
            { label: "SERVICE AMOUNT",  val: fmtPKR(payment.amount),       coral: false },
            { label: "PLATFORM FEE",    val: fmtPKR(payment.platform_fee), coral: false },
            { label: "PAYMENT METHOD",  val: payment.method ?? "NOT SET",  coral: false },
          ].map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-5 items-center border-b border-ink"
              style={{ background: i % 2 === 0 ? CR : "#ede8de" }}
            >
              <div className="col-span-3 px-6 py-3.5 border-r border-ink">
                <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.4 }}>
                  {row.label}
                </span>
              </div>
              <div className="col-span-2 px-6 py-3.5">
                <span className="text-xs font-black uppercase tracking-wide" style={{ color: row.coral ? C : IK }}>
                  {row.val}
                </span>
              </div>
            </div>
          ))}

          {/* Total row — always ink bg */}
          <div
            className="grid grid-cols-5 items-center border-b border-ink"
            style={{ background: IK }}
          >
            <div className="col-span-3 px-6 py-4 border-r" style={{ borderColor: C }}>
              <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: CR, opacity: 0.5 }}>
                TOTAL DUE
              </span>
            </div>
            <div className="col-span-2 px-6 py-4">
              <span className="text-base font-black leading-none" style={{ color: C, letterSpacing: "-0.02em" }}>
                {fmtPKR(payment.total)}
              </span>
            </div>
          </div>

          {/* Payment status */}
          <div className="flex items-center justify-between px-6 py-4" style={{ background: CR }}>
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.4 }}>
              STATUS
            </span>
            <span
              className="inline-flex items-center gap-2 border px-3 py-1 text-2xs font-black uppercase tracking-superwide"
              style={{ borderColor: pmeta.color, color: pmeta.color, opacity: pmeta.op }}
            >
              <span className="w-1.5 h-1.5 inline-block" style={{ background: pmeta.color }} />
              {pmeta.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ─── PROVIDER CARD ────────────────────────────────────────────────────────────
  const ProviderCard = ({ provider }) => (
    <div className="border border-ink overflow-hidden">
      <SectionBar n="§ 005" title="YOUR PROVIDER" />

      <div style={{ background: CR }}>
        {/* Avatar + name row */}
        <div className="flex items-center gap-5 px-6 py-6 border-b border-ink" style={{ background: "#ede8de" }}>
          {/* Avatar */}
          <div
            className="w-14 h-14 flex items-center justify-center border border-ink text-xl font-black shrink-0"
            style={{ background: IK, color: C }}
          >
            {provider.avatar_url
              ? <img src={provider.avatar_url} alt={provider.full_name} className="w-full h-full object-cover" />
              : initials(provider.full_name)
            }
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-black uppercase tracking-wide leading-tight" style={{ color: IK }}>
              {provider.full_name}
            </p>
            {provider.badge && (
              <span
                className="inline-block mt-1.5 border px-2 py-0.5 text-2xs font-black uppercase tracking-superwide"
                style={{ borderColor: C, color: C }}
              >
                {provider.badge}
              </span>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 border-b border-ink">
          <div className="px-6 py-4 border-r border-ink">
            <p className="text-2xs font-black uppercase tracking-superwide mb-1" style={{ color: IK, opacity: 0.4 }}>RATING</p>
            <p className="text-xl font-black leading-none" style={{ color: C, letterSpacing: "-0.02em" }}>
              ★ {provider.avg_rating.toFixed(1)}
            </p>
          </div>
          <div className="px-6 py-4">
            <p className="text-2xs font-black uppercase tracking-superwide mb-1" style={{ color: IK, opacity: 0.4 }}>JOBS DONE</p>
            <p className="text-xl font-black leading-none" style={{ color: IK, letterSpacing: "-0.02em" }}>
              {provider.total_jobs}
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.4 }}>
            PHONE
          </span>
          <span className="text-xs font-black uppercase tabular-nums" style={{ color: IK }}>
            {provider.phone}
          </span>
        </div>
      </div>
    </div>
  );

  // ─── CHAT PREVIEW CARD ────────────────────────────────────────────────────────
  const ChatPreviewCard = ({ enabled, roomId, providerName }) => {
    // Fake preview messages
    const PREVIEW = [
      { from: "PROVIDER", text: "I have accepted your booking. See you at 2 PM.", mine: false },
      { from: "YOU",      text: "Great, please bring pipe sealant.",               mine: true  },
      { from: "PROVIDER", text: "Got it, will bring everything needed.",           mine: false },
    ];

    return (
      <div className="border border-ink overflow-hidden">
        <SectionBar n="§ 006" title="MESSAGES" />

        {enabled ? (
          <>
            {/* Message preview */}
            <div className="flex flex-col gap-0" style={{ background: CR }}>
              {PREVIEW.map((msg, i) => (
                <div
                  key={i}
                  className="flex flex-col px-6 py-4 border-b border-ink last:border-b-0"
                  style={{ background: i % 2 === 0 ? CR : "#ede8de", alignItems: msg.mine ? "flex-end" : "flex-start" }}
                >
                  <span className="text-2xs font-black uppercase tracking-superwide mb-1" style={{ color: msg.mine ? C : IK, opacity: 0.5 }}>
                    {msg.from}
                  </span>
                  <span
                    className="text-xs font-black uppercase tracking-wide px-4 py-2.5 border border-ink max-w-xs"
                    style={{ background: msg.mine ? IK : CR, color: msg.mine ? CR : IK }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Open chat CTA */}
            <button
              className="w-full flex items-center justify-between px-6 py-4 border-t border-ink text-xs font-black uppercase tracking-wide transition-colors duration-100"
              style={{ background: IK, color: C }}
              onMouseEnter={e => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }}
              onMouseLeave={e => { e.currentTarget.style.background = IK; e.currentTarget.style.color = C; }}
            >
              <span>OPEN FULL CHAT WITH {providerName}</span>
              <span>→</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-6 gap-3" style={{ background: CR }}>
            <span className="text-3xl font-black" style={{ color: IK, opacity: 0.1 }}>◎</span>
            <p className="text-2xs font-black uppercase tracking-superwide text-center" style={{ color: IK, opacity: 0.3 }}>
              CHAT UNAVAILABLE FOR THIS BOOKING
            </p>
          </div>
        )}
      </div>
    );
  };

  // ─── ACTION BUTTONS ───────────────────────────────────────────────────────────
  const ACTION_CONFIG = {
    "CANCEL": {
      bg: CR, color: IK, hoverBg: IK, hoverColor: CR,
      border: IK, label: "CANCEL BOOKING",
      confirm: true, confirmMsg: "Are you sure you want to cancel this booking? This may incur a cancellation fee.",
    },
    "DISPUTE": {
      bg: CR, color: C, hoverBg: C, hoverColor: CR,
      border: C, label: "RAISE DISPUTE",
      confirm: true, confirmMsg: "Raising a dispute will notify Taskit support. Please describe the issue clearly.",
    },
    "MARK COMPLETE": {
      bg: C, color: CR, hoverBg: IK, hoverColor: CR,
      border: C, label: "MARK AS COMPLETE",
      confirm: false,
    },
    "PAY NOW": {
      bg: C, color: CR, hoverBg: IK, hoverColor: CR,
      border: C, label: "PAY NOW →",
      confirm: false,
    },
    "LEAVE REVIEW": {
      bg: IK, color: C, hoverBg: C, hoverColor: CR,
      border: IK, label: "LEAVE A REVIEW",
      confirm: false,
    },
  };

  // ─── CONFIRMATION MODAL ───────────────────────────────────────────────────────
  const ConfirmModal = ({ action, message, onConfirm, onCancel }) => (
    // Faux-viewport wrapper so the modal contributes layout height
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(26,26,26,0.75)" }}
    >
      <div className="w-full max-w-form border border-ink overflow-hidden mx-4" style={{ background: CR }}>
        <div
          className="flex items-center justify-between px-6 py-2.5"
          style={{ background: IK }}
        >
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
            CONFIRM ACTION
          </span>
          <button
            onClick={onCancel}
            className="text-2xs font-black uppercase tracking-wide transition-colors duration-100"
            style={{ color: CR, opacity: 0.4, background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = C; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = 0.4; e.currentTarget.style.color = CR; }}
          >
            ✕ CLOSE
          </button>
        </div>

        <div className="px-6 py-6 border-b border-ink">
          <p className="text-2xs font-black uppercase tracking-superwide mb-3" style={{ color: C }}>
            {action}
          </p>
          <p className="text-xs font-black uppercase tracking-wide leading-relaxed" style={{ color: IK, opacity: 0.7 }}>
            {message}
          </p>
        </div>

        <div className="grid grid-cols-2">
          <button
            className="py-4 text-xs font-black uppercase tracking-wide border-r border-ink transition-colors duration-100"
            style={{ background: CR, color: IK, cursor: "pointer", border: "none", borderRight: `1px solid ${IK}` }}
            onClick={onCancel}
            onMouseEnter={e => { e.currentTarget.style.background = "#ede8de"; }}
            onMouseLeave={e => { e.currentTarget.style.background = CR; }}
          >
            GO BACK
          </button>
          <button
            className="py-4 text-xs font-black uppercase tracking-wide transition-colors duration-100"
            style={{ background: C, color: CR, cursor: "pointer", border: "none" }}
            onClick={onConfirm}
            onMouseEnter={e => { e.currentTarget.style.background = IK; }}
            onMouseLeave={e => { e.currentTarget.style.background = C; }}
          >
            CONFIRM {action} →
          </button>
        </div>
      </div>
    </div>
  );

  // ── Fake WebSocket simulation ────────────────────────────────────────────────
  useEffect(() => {
    setWsConnected(true);
    // Simulate a status push after 6s (replace with real WS logic)
    const timer = setTimeout(() => {
      const next = { status: "in_progress", timestamp: new Date().toISOString(), note: "Provider on the way" };
      setLiveStatus("in_progress");
      setLiveTimeline(prev => [...prev, next]);
    }, 6000);
    return () => { clearTimeout(timer); setWsConnected(false); };
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleAction = (actionKey) => {
    const cfg = ACTION_CONFIG[actionKey];
    if (cfg?.confirm) {
      setModal({ action: actionKey, message: cfg.confirmMsg });
    } else {
      console.log("Action:", actionKey);
    }
  };

  const confirmAction = () => {
    console.log("Confirmed:", modal.action);
    setModal(null);
  };

  const availableActions = STATUS_ACTIONS[liveStatus] ?? [];
  const statusMeta       = STATUS_META[liveStatus] ?? STATUS_META.requested;

  return (
    <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
      {/* Grid overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <div className="flex items-center border-b border-ink px-6" style={{ background: CR }}>
          <span className="py-3 pr-5 border-r border-ink text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.35 }}>
            MY BOOKINGS
          </span>
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.35 }}>
            / {booking.booking_ref}
          </span>
          {/* WS indicator */}
          <div className="ml-auto flex items-center gap-2 py-3">
            <span
              className="w-1.5 h-1.5 inline-block"
              style={{ background: wsConnected ? C : IK, opacity: wsConnected ? 1 : 0.3, animation: wsConnected ? "pulse 1.8s ease-in-out infinite" : "none" }}
            />
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.35 }}>
              {wsConnected ? "LIVE" : "OFFLINE"}
            </span>
          </div>
        </div>

        {/* ── Booking header ─────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-12 border-b border-ink" style={{ background: CR }}>

          {/* Ref + meta */}
          <div className="lg:col-span-8 px-6 md:px-10 py-8 border-r border-ink">
            <div className="flex flex-wrap items-start gap-4 mb-4">
              {/* Status badge */}
              <div
                className="inline-flex items-center gap-2 border border-ink px-3 py-1.5"
                style={{ background: statusMeta.bg }}
              >
                <span className="text-sm font-black leading-none" style={{ color: statusMeta.fg, opacity: 0.8 }}>
                  {statusMeta.sym}
                </span>
                <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: statusMeta.fg }}>
                  {statusMeta.label}
                </span>
              </div>

              {/* Service type chip */}
              <div
                className="inline-flex items-center gap-2 border border-ink px-3 py-1.5"
                style={{ background: CR }}
              >
                <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.5 }}>
                  PLUMBING
                </span>
              </div>
            </div>

            {/* Booking ref */}
            <h1
              className="font-black uppercase leading-none mb-3"
              style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", letterSpacing: "-0.025em", color: IK }}
            >
              {booking.booking_ref}
            </h1>
            <p className="text-xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.45 }}>
              CREATED {fmtDateTime(booking.created_at)}
            </p>
          </div>

          {/* Quick stats */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1">
            <div className="px-6 py-6 border-r lg:border-r-0 border-b border-ink" style={{ background: "#ede8de" }}>
              <p className="text-2xs font-black uppercase tracking-superwide mb-1" style={{ color: IK, opacity: 0.4 }}>SCHEDULED</p>
              <p className="text-xs font-black uppercase leading-snug" style={{ color: IK }}>
                {fmtDate(booking.scheduled_at)}
              </p>
              <p className="text-xs font-black uppercase" style={{ color: C }}>{fmtTime(booking.scheduled_at)}</p>
            </div>
            <div className="px-6 py-6 border-b border-ink" style={{ background: CR }}>
              <p className="text-2xs font-black uppercase tracking-superwide mb-1" style={{ color: IK, opacity: 0.4 }}>TOTAL DUE</p>
              <p className="text-xl font-black leading-none" style={{ color: C, letterSpacing: "-0.02em" }}>
                {fmtPKR(payment.total)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex-1 px-6 md:px-10 py-8" style={{ background: CR }}>

          {/* Status timeline — full width */}
          <div className="mb-8">
            <BookingStatusTimeline timeline={liveTimeline} currentStatus={liveStatus} />
          </div>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-12 gap-8">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <JobDetailsCard booking={booking} />
              <AddressCard    address={address} />
              <PaymentCard    payment={payment} />
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <ProviderCard  provider={provider} />
              <ChatPreviewCard
                enabled={chat_enabled}
                roomId={chat_room_id}
                providerName={provider.full_name}
              />

              {/* ── ACTION BUTTONS ── */}
              {availableActions.length > 0 && (
                <div className="border border-ink overflow-hidden">
                  <SectionBar n="§ 007" title="ACTIONS" />
                  <div className="flex flex-col" style={{ background: CR }}>
                    {availableActions.map((actionKey, i) => {
                      const cfg = ACTION_CONFIG[actionKey] ?? {};
                      return (
                        <button
                          key={actionKey}
                          onClick={() => handleAction(actionKey)}
                          className="flex items-center justify-between px-6 py-5 border-b border-ink last:border-b-0 text-xs font-black uppercase tracking-wide transition-colors duration-100"
                          style={{
                            background: i % 2 === 0 ? CR : "#ede8de",
                            color: cfg.color ?? IK,
                            cursor: "pointer",
                            border: "none",
                            borderBottom: `1px solid ${IK}`,
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = cfg.hoverBg ?? IK;
                            e.currentTarget.style.color      = cfg.hoverColor ?? CR;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = i % 2 === 0 ? CR : "#ede8de";
                            e.currentTarget.style.color      = cfg.color ?? IK;
                          }}
                        >
                          <span>{cfg.label ?? actionKey}</span>
                          <span>→</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* ── Confirmation modal ─────────────────────────────────────────────── */}
      {modal && (
        <ConfirmModal
          action={modal.action}
          message={modal.message}
          onConfirm={confirmAction}
          onCancel={() => setModal(null)}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
      `}</style>
    </div>
  );
}