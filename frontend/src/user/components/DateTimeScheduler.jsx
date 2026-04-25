import { useState, useMemo } from "react";
import { useTheme } from "../../hooks/useTheme";

// ─── CONSTANTS — same pattern as ProfilePage ──────────────────────────────────
const C  = "#FF5733";   // coral
const CR = "#F5F0E6";   // cream
const IK = "#1A1A1A";   // ink

// ─── SAMPLE DATA — replace with your API response ────────────────────────────
const DATA = {
  selected_date:   "2024-04-22",
  available_dates: ["2024-04-22", "2024-04-23", "2024-04-24", "2024-04-25", "2024-04-27", "2024-04-29"],
  time_slots: {
    morning:   ["09:00", "10:00", "11:00"],
    afternoon: ["14:00", "15:00", "16:00"],
    evening:   ["18:00", "19:00"],
  },
  booked_slots: ["2024-04-22T11:00:00Z", "2024-04-22T15:00:00Z"],
  selected_slot: "2024-04-22T14:00:00Z",
};


// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
/**
 * Props:
 *   availableDates  string[]
 *   timeSlots       { morning, afternoon, evening }
 *   bookedSlots     string[]
 *   selectedDate    string (controlled)
 *   selectedSlot    string (controlled)
 *   onDateSelect    (dateStr) => void
 *   onTimeSelect    (isoStr)  => void
 */
export default function DateTimeScheduler({
  availableDates = DATA.available_dates,
  timeSlots      = DATA.time_slots,
  bookedSlots    = DATA.booked_slots,
  selectedDate:  propDate,
  selectedSlot:  propSlot,
  onDateSelect,
  onTimeSelect,
}) {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();


  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  const toISO     = (d)   => d.toISOString().split("T")[0];
  const parseDate = (str) => new Date(str + "T00:00:00");

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const DAYS   = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const MONTHS = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];

  const fmt12 = (t) => {
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2,"0")} ${h >= 12 ? "PM" : "AM"}`;
  };

  const isBooked = (date, time, bookedSlots) => {
    const [h, m] = time.split(":").map(Number);
    const dt = new Date(date + "T00:00:00");
    dt.setHours(h, m, 0, 0);
    return bookedSlots.some(b => {
      const bd = new Date(b); bd.setSeconds(0, 0);
      dt.setSeconds(0, 0);
      return bd.getTime() === dt.getTime();
    });
  };

  // ─── SHARED SMALL COMPONENTS (same style as ProfilePage) ─────────────────────

  // Dark ink bar that titles every section block — mirrors ProfilePage SectionBar
  const SectionBar = ({ n, title, right }) => (
    <div
      className="flex items-center justify-between px-6 py-2.5"
      style={{ background: IK }}
    >
      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
        {title}
      </span>
      <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>
        {right || n}
      </span>
    </div>
  );

  // Quick-filter chip
  const QuickChip = ({ label, active, disabled, onClick }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 text-2xs font-black uppercase tracking-widest border transition-colors duration-100 cursor-pointer"
      style={{
        borderColor: active ? C   : disabled ? IK      : IK,
        background:  active ? C   : CR,
        color:       active ? CR  : disabled ? IK      : IK,
        opacity:     disabled     ? 0.25     : 1,
        cursor:      disabled     ? "not-allowed" : "pointer",
      }}
      onMouseEnter={e => { if (!disabled && !active) { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; e.currentTarget.style.borderColor = C; }}}
      onMouseLeave={e => { if (!disabled && !active) { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; e.currentTarget.style.borderColor = IK; }}}
    >
      {label}
    </button>
  );

  // ─── MINI CALENDAR ────────────────────────────────────────────────────────────
  const MiniCalendar = ({ year, month, availableDates, selectedDate, onDateSelect, onMonthChange }) => {
    const firstDay   = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;  // Monday-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const availSet    = new Set(availableDates);

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div className="border border-ink overflow-hidden">

        {/* Month navigation */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b border-ink"
          style={{ background: CR }}
        >
          <button
            onClick={() => onMonthChange(-1)}
            className="w-8 h-8 flex items-center justify-center border border-ink text-xs font-black transition-colors duration-100"
            style={{ background: CR, color: IK }}
            onMouseEnter={e => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; e.currentTarget.style.borderColor = C; }}
            onMouseLeave={e => { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; e.currentTarget.style.borderColor = IK; }}
          >
            ‹
          </button>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: IK }}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={() => onMonthChange(1)}
            className="w-8 h-8 flex items-center justify-center border border-ink text-xs font-black transition-colors duration-100"
            style={{ background: CR, color: IK }}
            onMouseEnter={e => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; e.currentTarget.style.borderColor = C; }}
            onMouseLeave={e => { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; e.currentTarget.style.borderColor = IK; }}
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-ink" style={{ background: "#ede8de" }}>
          {DAYS.map(d => (
            <div
              key={d}
              className="py-2 text-center text-2xs font-black uppercase tracking-widest"
              style={{ color: IK, opacity: 0.35 }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return (
              <div
                key={`e-${i}`}
                className="aspect-square border-r border-b border-ink"
                style={{ background: CR }}
              />
            );

            const dateStr  = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const dateObj  = parseDate(dateStr);
            const isPast   = dateObj < today;
            const isAvail  = availSet.has(dateStr);
            const isSel    = selectedDate === dateStr;
            const isToday  = toISO(today) === dateStr;
            const off      = isPast || !isAvail;

            return (
              <button
                key={dateStr}
                onClick={() => !off && onDateSelect(dateStr)}
                disabled={off}
                className="relative aspect-square flex flex-col items-center justify-center border-r border-b border-ink text-xs font-black transition-colors duration-100"
                style={{
                  background: isSel ? C  : off ? CR : CR,
                  color:       isSel ? CR : off ? IK : IK,
                  opacity:     off   ? 0.22 : 1,
                  cursor:      off   ? "not-allowed" : "pointer",
                }}
                onMouseEnter={e => { if (!off && !isSel) { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }}}
                onMouseLeave={e => { if (!off && !isSel) { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; }}}
              >
                {day}
                {/* Today dot */}
                {isToday && (
                  <span
                    className="absolute bottom-1 w-1 h-1"
                    style={{ background: isSel ? CR : C }}
                  />
                )}
                {/* Available dot */}
                {isAvail && !isSel && !isPast && (
                  <span
                    className="absolute top-1 right-1 w-1 h-1"
                    style={{ background: C, opacity: 0.55 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── TIME SLOT BUTTON ─────────────────────────────────────────────────────────
  const TimeSlotBtn = ({ time, booked, selected, onClick }) => (
    <button
      onClick={onClick}
      disabled={booked}
      className="py-3 px-2 text-2xs font-black uppercase tracking-widest border transition-colors duration-100"
      style={{
        background:  selected ? C  : CR,
        color:       selected ? CR : booked ? IK : IK,
        borderColor: selected ? C  : IK,
        opacity:     booked ? 0.22 : 1,
        cursor:      booked ? "not-allowed" : "pointer",
        textDecoration: booked ? "line-through" : "none",
      }}
      onMouseEnter={e => { if (!booked && !selected) { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; e.currentTarget.style.borderColor = C; }}}
      onMouseLeave={e => { if (!booked && !selected) { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; e.currentTarget.style.borderColor = IK; }}}
    >
      {fmt12(time)}
    </button>
  );

  // ─── TIME GROUP (morning / afternoon / evening) ───────────────────────────────
  const TimeGroup = ({ label, icon, slots, selectedDate, selectedSlot, bookedSlots, onTimeSelect }) => {
    if (!slots?.length) return null;

    const toKey = (time) => {
      const [h, m] = time.split(":").map(Number);
      const d = new Date(selectedDate + "T00:00:00");
      d.setHours(h, m, 0, 0);
      return d.toISOString().replace(".000Z", "Z");
    };

    const openCount = slots.filter(t => !isBooked(selectedDate, t, bookedSlots)).length;

    return (
      <div className="border-b border-ink last:border-b-0">

        {/* Group header */}
        <div
          className="flex items-center gap-3 px-6 py-3 border-b border-ink"
          style={{ background: "#ede8de" }}
        >
          <span className="text-sm font-black leading-none" style={{ color: IK }}>{icon}</span>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.5 }}>
            {label}
          </span>
          <span className="ml-auto text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
            {openCount} OPEN
          </span>
        </div>

        {/* Slot grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-5" style={{ background: CR }}>
          {slots.map(time => (
            <TimeSlotBtn
              key={time}
              time={time}
              booked={isBooked(selectedDate, time, bookedSlots)}
              selected={selectedSlot === toKey(time)}
              onClick={() => onTimeSelect(toKey(time))}
            />
          ))}
        </div>
      </div>
    );
  };

  // ─── SUMMARY BAR ─────────────────────────────────────────────────────────────
  const SummaryBar = ({ selectedDate, selectedSlot }) => {
    if (!selectedDate && !selectedSlot) return null;

    const dateLabel = selectedDate
      ? parseDate(selectedDate).toLocaleDateString("en-GB", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        }).toUpperCase()
      : "—";

    const timeLabel = selectedSlot
      ? new Date(selectedSlot).toLocaleTimeString("en-PK", {
          hour: "2-digit", minute: "2-digit", hour12: true,
        }).toUpperCase()
      : "—";

    const ready = selectedDate && selectedSlot;

    return (
      <div className="border border-ink overflow-hidden">
        <SectionBar n={ready ? "READY" : "INCOMPLETE"} title="BOOKING SUMMARY" />
        <div className="grid sm:grid-cols-2" style={{ background: IK }}>
          <div className="px-6 py-5 border-r border-b sm:border-b-0" style={{ borderColor: C }}>
            <p className="text-2xs font-black uppercase tracking-superwide mb-1.5" style={{ color: CR, opacity: 0.35 }}>
              DATE
            </p>
            <p className="text-xs font-black uppercase tracking-wide" style={{ color: CR }}>
              {dateLabel}
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="text-2xs font-black uppercase tracking-superwide mb-1.5" style={{ color: CR, opacity: 0.35 }}>
              TIME
            </p>
            <p className="text-xs font-black uppercase tracking-wide" style={{ color: selectedSlot ? C : CR }}>
              {timeLabel}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const [intDate, setIntDate]   = useState(DATA.selected_date);
  const [intSlot, setIntSlot]   = useState(DATA.selected_slot);
  const [calYear, setCalYear]   = useState(() => parseInt(DATA.selected_date.split("-")[0]));
  const [calMonth, setCalMonth] = useState(() => parseInt(DATA.selected_date.split("-")[1]) - 1);

  const selectedDate = propDate !== undefined ? propDate : intDate;
  const selectedSlot = propSlot !== undefined ? propSlot : intSlot;

  const handleDateSelect = (d) => {
    if (onDateSelect) onDateSelect(d); else setIntDate(d);
    if (onTimeSelect) onTimeSelect(null); else setIntSlot(null);
  };

  const handleTimeSelect = (s) => {
    if (onTimeSelect) onTimeSelect(s); else setIntSlot(s);
  };

  const handleMonthChange = (dir) => {
    let m = calMonth + dir, y = calYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setCalMonth(m); setCalYear(y);
  };

  const endOfWeek = useMemo(() => {
    const d = new Date(today); d.setDate(d.getDate() + (7 - d.getDay())); return d;
  }, []);

  const availSet = new Set(availableDates);

  const QUICK_FILTERS = [
    { label: "Today",     date: toISO(today),    avail: availSet.has(toISO(today))    },
    { label: "Tomorrow",  date: toISO(tomorrow), avail: availSet.has(toISO(tomorrow)) },
    {
      label: "This Week", date: null,
      avail: availableDates.some(d => { const dt = parseDate(d); return dt >= today && dt <= endOfWeek; }),
      action: () => {
        const first = availableDates.find(d => { const dt = parseDate(d); return dt >= today && dt <= endOfWeek; });
        if (first) handleDateSelect(first);
      },
    },
  ];

  const TIME_GROUPS = [
    { key: "morning",   label: "Morning",   icon: "○", slots: timeSlots.morning   },
    { key: "afternoon", label: "Afternoon", icon: "◐", slots: timeSlots.afternoon },
    { key: "evening",   label: "Evening",   icon: "●", slots: timeSlots.evening   },
  ];

  return (
    <div className="font-sans" style={{ background: CR, color: IK }}>

      {/* ── Page header ── */}
      <div
        className="flex items-center justify-between px-6 py-5 border-b border-ink"
        style={{ background: CR }}
      >
        <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.4 }}>
          § SCHEDULE — DATE &amp; TIME
        </span>
        <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
          SELECT A SLOT
        </span>
      </div>

      {/* ── Quick filters ── */}
      <div
        className="flex items-center gap-3 px-6 py-5 border-b border-ink flex-wrap"
        style={{ background: CR }}
      >
        <span className="text-2xs font-black uppercase tracking-superwide shrink-0 mr-2" style={{ color: IK, opacity: 0.3 }}>
          QUICK SELECT
        </span>
        {QUICK_FILTERS.map(qf => (
          <QuickChip
            key={qf.label}
            label={qf.label}
            disabled={!qf.avail}
            active={qf.date ? selectedDate === qf.date : false}
            onClick={() => {
              if (!qf.avail) return;
              if (qf.action) { qf.action(); return; }
              handleDateSelect(qf.date);
            }}
          />
        ))}
      </div>

      {/* ── Main split grid ── */}
      <div className="grid lg:grid-cols-2 border-b border-ink">

        {/* ── LEFT — Calendar ── */}
        <div className="border-r border-ink" style={{ background: CR }}>
          <div
            className="flex items-center justify-between px-6 py-2.5 border-b border-ink"
            style={{ background: IK }}
          >
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
              § 01 — PICK A DATE
            </span>
            <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>
              {availableDates.length} DATES OPEN
            </span>
          </div>

          <div className="p-6">
            <MiniCalendar
              year={calYear}
              month={calMonth}
              availableDates={availableDates}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
            />

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 mt-5">
              {[
                { sym: "■", col: C,   label: "Selected"    },
                { sym: "■", col: IK,  label: "Unavailable", op: 0.2 },
                { sym: "◆", col: C,   label: "Available",   op: 0.55 },
              ].map(({ sym, col, label, op }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs font-black" style={{ color: col, opacity: op ?? 1 }}>{sym}</span>
                  <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.4 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT — Time slots ── */}
        <div style={{ background: CR }}>
          <div
            className="flex items-center justify-between px-6 py-2.5 border-b border-ink"
            style={{ background: IK }}
          >
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
              § 02 — PICK A TIME
            </span>
            <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>
              {selectedDate
                ? parseDate(selectedDate)
                    .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                    .toUpperCase()
                : "NO DATE SELECTED"
              }
            </span>
          </div>

          {selectedDate ? (
            <div>
              {TIME_GROUPS.map(g => (
                <TimeGroup
                  key={g.key}
                  label={g.label}
                  icon={g.icon}
                  slots={g.slots}
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  bookedSlots={bookedSlots}
                  onTimeSelect={handleTimeSelect}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 gap-3">
              <span className="text-5xl font-black" style={{ color: IK, opacity: 0.08 }}>◷</span>
              <p className="text-2xs font-black uppercase tracking-superwide text-center" style={{ color: IK, opacity: 0.3 }}>
                SELECT A DATE FIRST
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary + confirm ── */}
      <div className="p-6 flex flex-col gap-4" style={{ background: CR }}>
        <SummaryBar selectedDate={selectedDate} selectedSlot={selectedSlot} />

        {selectedDate && selectedSlot && (
          <button
            className="w-full py-4 font-black text-xs uppercase tracking-ultrawide border-2 transition-colors duration-100"
            style={{ background: C, color: CR, borderColor: C }}
            onMouseEnter={e => { e.currentTarget.style.background = IK; e.currentTarget.style.borderColor = IK; }}
            onMouseLeave={e => { e.currentTarget.style.background = C;  e.currentTarget.style.borderColor = C;  }}
          >
            CONFIRM BOOKING →
          </button>
        )}
      </div>

    </div>
  );
}