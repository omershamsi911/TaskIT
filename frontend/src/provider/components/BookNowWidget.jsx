import { useState } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const C  = "#FF5733"; // coral
const CR = "#F5F0E6"; // cream
const IK = "#1A1A1A"; // ink

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "14:00", "15:00", "16:00", "17:00",
];

const SERVICES = [
  { label: "BASIC INSPECTION",  price: 1500 },
  { label: "STANDARD SERVICE",  price: 3500 },
  { label: "FULL REPAIR",       price: 6000 },
  { label: "EMERGENCY CALL",    price: 9000 },
];

// ── helper — get next 7 days ──────────────────────────────────────────────────
const getWeekDays = () => {
  const days = [];
  const LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key:   d.toISOString().slice(0, 10),
      day:   LABELS[d.getDay()],
      date:  d.getDate(),
      today: i === 0,
    });
  }
  return days;
};

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
const SLabel = ({ n, title }) => (
  <div
    className="flex items-center justify-between px-4 py-2 border-b border-ink"
    style={{ background: IK }}
  >
    <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
      {title}
    </span>
    <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>{n}</span>
  </div>
);

// ─── BOOK NOW WIDGET ──────────────────────────────────────────────────────────
export default function BookNowWidget({ provider = {} }) {
  const {
    name      = "PROVIDER",
    priceFrom = 1500,
    available = true,
  } = provider;

  const DAYS = getWeekDays();

  const [selectedDay,     setSelectedDay]     = useState(DAYS[0].key);
  const [selectedTime,    setSelectedTime]    = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [note,            setNote]            = useState("");
  const [booked,          setBooked]          = useState(false);

  const servicePrice = SERVICES.find((s) => s.label === selectedService)?.price ?? priceFrom;
  const platformFee  = Math.round(servicePrice * 0.05);
  const total        = servicePrice + platformFee;

  const canBook = selectedDay && selectedTime && selectedService;

  const handleBook = () => {
    if (!canBook) return;
    setBooked(true);
  };

  // ── Confirmation screen ───────────────────────────────────────────────────
  if (booked) {
    return (
      <div
        className="border border-ink font-sans flex flex-col"
        style={{ background: CR }}
      >
        <div className="px-4 py-3 border-b border-ink" style={{ background: IK }}>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
            § BOOKING CONFIRMED
          </span>
        </div>
        <div className="flex flex-col items-center py-10 px-6 gap-4 text-center">
          <span className="text-5xl font-black" style={{ color: C }}>◆</span>
          <p className="text-sm font-black uppercase tracking-wide" style={{ color: IK }}>
            BOOKING CONFIRMED
          </p>
          <p className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.45 }}>
            {name} · {selectedDay} · {selectedTime}
          </p>
          <p className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.45 }}>
            {selectedService}
          </p>
          <div className="w-full border-t border-ink mt-2 pt-4 flex justify-between">
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.5 }}>TOTAL PAID</span>
            <span className="text-xs font-black uppercase" style={{ color: C }}>PKR {total.toLocaleString()}</span>
          </div>
          <button
            onClick={() => { setBooked(false); setSelectedTime(null); setSelectedService(null); setNote(""); }}
            className="w-full mt-2 py-3 font-black text-2xs uppercase tracking-superwide border border-ink transition-colors duration-100"
            style={{ background: CR, color: IK }}
            onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; }}
          >
            BOOK AGAIN ↺
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="border border-ink font-sans flex flex-col"
      style={{ background: CR }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink" style={{ background: IK }}>
        <div>
          <p className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>§ BOOK NOW</p>
          <p className="text-2xs font-black uppercase tracking-wide mt-0.5" style={{ color: CR, opacity: 0.4 }}>{name}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 inline-block shrink-0"
            style={{ background: available ? C : "rgba(245,240,230,0.25)", animation: available ? "pulse 1.8s infinite" : "none" }}
          />
          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: available ? C : "rgba(245,240,230,0.3)" }}>
            {available ? "AVAILABLE" : "BUSY"}
          </span>
        </div>
      </div>

      {/* ── 01 · Date ──────────────────────────────────────────────────── */}
      <SLabel n="01" title="§ Select Date" />
      <div className="flex border-b border-ink overflow-x-auto">
        {DAYS.map(({ key, day, date, today }) => {
          const active = selectedDay === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              className="flex-1 flex flex-col items-center py-3 border-r border-ink last:border-r-0 shrink-0 transition-colors duration-100"
              style={{
                background: active ? C      : CR,
                color:      active ? CR     : IK,
                minWidth: 42,
              }}
            >
              <span className="text-2xs font-black uppercase tracking-wide" style={{ opacity: active ? 0.85 : 0.4 }}>
                {day}
              </span>
              <span className="text-sm font-black leading-tight mt-0.5">{date}</span>
              {today && (
                <span className="w-1 h-1 mt-1 rounded-none" style={{ background: active ? CR : C }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── 02 · Time ──────────────────────────────────────────────────── */}
      <SLabel n="02" title="§ Select Time" />
      <div className="grid grid-cols-3 border-b border-ink">
        {TIME_SLOTS.map((slot) => {
          const active = selectedTime === slot;
          // simulate some unavailable slots
          const unavailable = ["12:00", "15:00"].includes(slot);
          return (
            <button
              key={slot}
              onClick={() => !unavailable && setSelectedTime(slot)}
              disabled={unavailable}
              className="py-2.5 border-r border-b border-ink text-2xs font-black uppercase tracking-wide transition-colors duration-100"
              style={{
                background: unavailable ? "rgba(26,26,26,0.04)" : active ? C    : CR,
                color:      unavailable ? "rgba(26,26,26,0.2)"  : active ? CR   : IK,
                cursor:     unavailable ? "not-allowed"          : "pointer",
                textDecoration: unavailable ? "line-through" : "none",
              }}
            >
              {slot}
            </button>
          );
        })}
      </div>

      {/* ── 03 · Service ───────────────────────────────────────────────── */}
      <SLabel n="03" title="§ Service Type" />
      <div className="flex flex-col border-b border-ink">
        {SERVICES.map(({ label, price }) => {
          const active = selectedService === label;
          return (
            <button
              key={label}
              onClick={() => setSelectedService(label)}
              className="flex items-center justify-between px-4 py-3 border-b border-ink last:border-b-0 transition-colors duration-100"
              style={{ background: active ? IK : CR }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 border shrink-0"
                  style={{
                    borderColor: active ? C   : IK,
                    background:  active ? C   : "transparent",
                  }}
                />
                <span
                  className="text-2xs font-black uppercase tracking-wide text-left"
                  style={{ color: active ? CR : IK }}
                >
                  {label}
                </span>
              </div>
              <span className="text-2xs font-black" style={{ color: C }}>
                PKR {price.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 04 · Note ──────────────────────────────────────────────────── */}
      <SLabel n="04" title="§ Note (Optional)" />
      <div className="border-b border-ink">
        <textarea
          rows={3}
          placeholder="DESCRIBE YOUR ISSUE OR SPECIAL INSTRUCTIONS…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-4 py-3 bg-transparent text-2xs font-black uppercase tracking-wide outline-none resize-none placeholder:opacity-20"
          style={{ color: IK }}
        />
      </div>

      {/* ── Price summary ───────────────────────────────────────────────── */}
      <div className="flex flex-col border-b border-ink">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink">
          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.5 }}>
            SERVICE FEE
          </span>
          <span className="text-2xs font-black" style={{ color: IK }}>
            PKR {selectedService ? servicePrice.toLocaleString() : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink">
          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.5 }}>
            PLATFORM FEE (5%)
          </span>
          <span className="text-2xs font-black" style={{ color: IK }}>
            PKR {selectedService ? platformFee.toLocaleString() : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>TOTAL</span>
          <span className="text-sm font-black" style={{ color: C }}>
            PKR {selectedService ? total.toLocaleString() : "—"}
          </span>
        </div>
      </div>

      {/* ── Escrow note ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2.5 px-4 py-3 border-b border-ink">
        <span className="text-xs shrink-0 mt-0.5" style={{ color: C }}>◆</span>
        <p className="text-2xs font-black uppercase tracking-wide leading-relaxed" style={{ color: IK, opacity: 0.45 }}>
          PAYMENT HELD IN ESCROW — RELEASED ONLY AFTER JOB COMPLETION
        </p>
      </div>

      {/* ── Book CTA ────────────────────────────────────────────────────── */}
      <div className="p-4">
        <button
          onClick={handleBook}
          disabled={!canBook}
          className="w-full py-4 font-black text-xs uppercase tracking-superwide transition-colors duration-100"
          style={{
            background: canBook ? C                        : "rgba(26,26,26,0.08)",
            color:      canBook ? CR                       : "rgba(26,26,26,0.25)",
            cursor:     canBook ? "pointer"                : "not-allowed",
          }}
          onMouseEnter={(e) => { if (canBook) e.currentTarget.style.background = IK; }}
          onMouseLeave={(e) => { if (canBook) e.currentTarget.style.background = C;  }}
        >
          {canBook ? "CONFIRM BOOKING →" : "SELECT DATE · TIME · SERVICE"}
        </button>
      </div>
    </div>
  );
}