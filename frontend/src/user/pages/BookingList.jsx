import { useState, useEffect } from "react";
import Header from "../../common/components/Header";
import Footer from "../../common/components/Footer";
import { Link } from "react-router-dom";
import { fetchUserBookings } from "../../../handlers/bookings";
import { useTheme } from "../../hooks/useTheme";

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function BookingList() {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const [allBookings, setAllBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [isLoading, setIsLoading] = useState(true);

  // ─── STATUS CONFIG ────────────────────────────────────────────────────────────
  const STATUS_META = {
    requested:    { label: "REQUESTED",    bg: "#ede8de", fg: IK, border: IK, sym: "○" },
    accepted:     { label: "ACCEPTED",     bg: IK,        fg: CR, border: IK, sym: "◎" },
    in_progress:  { label: "IN PROGRESS",  bg: C,         fg: CR, border: C,  sym: "◆" },
    completed:    { label: "COMPLETED",    bg: IK,        fg: C,  border: IK, sym: "✓" },
    cancelled:    { label: "CANCELLED",    bg: CR,        fg: IK, border: IK, sym: "✗" },
    disputed:     { label: "DISPUTED",     bg: "#ede8de", fg: C,  border: C,  sym: "⚠" },
  };
  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  const fmtDateTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
      .toUpperCase().replace("AM", "AM").replace("PM", "PM");
  };

  const fmtPrice = (price) => `PKR ${Number(price || 0).toLocaleString("en-PK")}`;

  // ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

  const SectionBar = ({ n, title, count }) => (
    <div className="flex items-center justify-between px-6 py-2.5" style={{ background: IK }}>
      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>{title}</span>
      <div className="flex items-center gap-3">
        {count !== undefined && <span className="text-2xs font-black" style={{ color: CR }}>{count} BOOKINGS</span>}
        <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>{n}</span>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const m = STATUS_META[status] ?? STATUS_META.requested;
    return (
      <div className="inline-flex items-center gap-1.5 border px-3 py-1" style={{ borderColor: m.border, background: m.bg }}>
        <span className="text-xs font-black leading-none" style={{ color: m.fg }}>{m.sym}</span>
        <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: m.fg }}>{m.label}</span>
      </div>
    );
  };

  // ─── BOOKING CARD ─────────────────────────────────────────────────────────────
  const BookingCard = ({ booking, onNavigate }) => {
    const showReviewButton = booking.status === "completed" && !booking.reviewed;
    const price = booking.final_price ?? booking.quoted_price ?? 0;
    const providerName = booking.provider?.full_name || booking.provider_name || "PROVIDER";
    const providerAvatar = booking.provider?.avatar_url || booking.provider_avatar || null;
    const providerCategory = booking.provider?.category || booking.category || "SERVICE";
    const serviceName = booking.service?.title || booking.service_title || booking.service || "SERVICE";

    return (
      <div className="border border-ink overflow-hidden group cursor-pointer transition-all duration-150" style={{ background: CR }} onClick={() => onNavigate(booking.id)}>
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-ink" style={{ background: "#ede8de" }}>
          <div className="flex items-center gap-4">
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.5 }}>REF: {booking.booking_ref}</span>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.3 }}>#{booking.id}</span>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="flex items-center gap-4 px-5 py-5 md:w-1/3 border-r border-ink">
            <div className="w-14 h-14 border border-ink flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "#e8e2d6" }}>
              {providerAvatar ? (
                <img src={providerAvatar} alt={providerName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              ) : (
                <span className="text-2xl font-black" style={{ color: IK, opacity: 0.15 }}>{providerName.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.4 }}>{providerCategory}</span>
              <h3 className="text-sm font-black uppercase truncate" style={{ color: IK }}>{providerName}</h3>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:w-2/3">
            <div className="flex-1 px-5 py-5 border-r border-ink">
              <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: IK, opacity: 0.4 }}>SERVICE</span>
              <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: IK }}>{serviceName}</p>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-black uppercase tracking-wide" style={{ color: C }}>{fmtPrice(price)}</span>
              </div>
            </div>

            <div className="flex-1 px-5 py-5">
              <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: IK, opacity: 0.4 }}>SCHEDULED</span>
              <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: IK }}>{fmtDateTime(booking.scheduled_at)}</p>
              {booking.status === "completed" && booking.completed_at && (
                <span className="text-2xs font-black uppercase tracking-wide" style={{ color: C }}>✓ COMPLETED {fmtDateTime(booking.completed_at).split(",")[0]}</span>
              )}
              {booking.status === "cancelled" && booking.cancellation_reason && (
                <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.5 }}>REASON: {booking.cancellation_reason}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-ink" style={{ background: "#ede8de" }}>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.4 }}>BOOKED {fmtDateTime(booking.created_at)}</span>
          <div className="flex items-center gap-3">
            <span className="text-2xs font-black uppercase tracking-superwide transition-colors group-hover:translate-x-1 duration-200" style={{ color: C }}>VIEW DETAILS →</span>
            {showReviewButton && (
              <button className="border px-4 py-1.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
                style={{ borderColor: C, color: C, background: "transparent" }}
                onClick={(e) => { e.stopPropagation(); window.location.href = `/bookings/${booking.id}/review`; }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C; }}>★ WRITE REVIEW</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── EMPTY STATE ──────────────────────────────────────────────────────────────
  const EmptyState = ({ tab }) => {
    const messages = {
      active: { title: "NO ACTIVE BOOKINGS", desc: "You don't have any active bookings at the moment.", sym: "○" },
      completed: { title: "NO COMPLETED BOOKINGS", desc: "Your completed bookings will appear here.", sym: "✓" },
      cancelled: { title: "NO CANCELLED BOOKINGS", desc: "Cancelled bookings will appear here.", sym: "✗" },
    };
    const msg = messages[tab.toLowerCase()] || messages.active;

    return (
      <div className="border border-ink flex flex-col items-center justify-center py-20 px-6" style={{ background: CR }}>
        <span className="text-8xl font-black mb-6" style={{ color: IK, opacity: 0.08 }}>{msg.sym}</span>
        <h3 className="text-sm font-black uppercase tracking-superwide mb-2" style={{ color: IK }}>{msg.title}</h3>
        <p className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.4 }}>{msg.desc}</p>
        {tab === "active" && (
          <Link to="/discovery" className="mt-6 border border-ink px-6 py-3 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
            style={{ background: "transparent", color: C, borderColor: C }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C; }}>FIND SERVICES →</Link>
        )}
      </div>
    );
  };

  // ─── FETCH FROM API ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);
      try {
        const data = await fetchUserBookings();
        setAllBookings(data || []);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBookings();
  }, []);

  // ─── FILTER ──────────────────────────────────────────────────────────────────
  const activeJobs = allBookings.filter(b => ["requested", "accepted", "in_progress"].includes(b.status));
  const completedJobs = allBookings.filter(b => b.status === "completed");
  const cancelledJobs = allBookings.filter(b => b.status === "cancelled");

  const filterCounts = {
    active: activeJobs.length,
    completed: completedJobs.length,
    cancelled: cancelledJobs.length,
  };

  const TABS = [
    { key: "active", label: "ACTIVE", count: filterCounts.active },
    { key: "completed", label: "COMPLETED", count: filterCounts.completed },
    { key: "cancelled", label: "CANCELLED", count: filterCounts.cancelled },
  ];

  const getBookingsForTab = () => {
    switch (activeTab) {
      case "active": return activeJobs;
      case "completed": return completedJobs;
      case "cancelled": return cancelledJobs;
      default: return [];
    }
  };

  const handleNavigate = (bookingId) => {
    window.location.href = `/bookings/${bookingId}`;
  };

  const bookings = getBookingsForTab();
  const totalAll = filterCounts.active + filterCounts.completed + filterCounts.cancelled;

  // ─── LOADING STATE ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
        <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <span className="animate-spin text-4xl font-black" style={{ color: C }}>◎</span>
              <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>LOADING BOOKINGS...</span>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* Breadcrumb */}
        <div className="flex items-center border-b border-ink px-6" style={{ background: CR }}>
          <span className="py-3 pr-5 border-r border-ink text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.35 }}>ACCOUNT</span>
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.35 }}>/ MY BOOKINGS</span>
          <div className="ml-auto py-2">
            <div className="inline-flex items-center gap-2 border border-ink px-3 py-1.5" style={{ background: IK }}>
              <span className="text-sm font-black leading-none" style={{ color: C }}>◎</span>
              <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: CR }}>BOOKINGS</span>
            </div>
          </div>
        </div>

        {/* Page header */}
        <div className="border-b border-ink px-8 py-8" style={{ background: CR }}>
          <h1 className="font-black uppercase leading-none" style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)", letterSpacing: "-0.02em", color: IK }}>MY BOOKINGS</h1>
          <p className="text-2xs font-black uppercase tracking-superwide mt-3" style={{ color: IK, opacity: 0.4 }}>TRACK AND MANAGE ALL YOUR SERVICE BOOKINGS</p>
        </div>

        {/* Tab bar */}
        <div className="flex items-stretch border-b border-ink overflow-x-auto shrink-0" style={{ background: CR }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="px-7 py-3.5 text-2xs font-black uppercase tracking-superwide border-r border-ink whitespace-nowrap transition-colors duration-100"
                style={{ background: active ? IK : CR, color: active ? CR : IK }}>
                {tab.label}
                <span className="ml-2" style={{ color: active ? C : IK, opacity: active ? 1 : 0.4 }}>{tab.count}</span>
              </button>
            );
          })}
          <div className="ml-auto flex items-center px-6 border-l border-ink shrink-0">
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.3 }}>TOTAL {totalAll} BOOKINGS</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 md:px-10 py-8">
          <div className="border border-ink overflow-hidden">
            <SectionBar n={`§ ${TABS.findIndex(t => t.key === activeTab) + 1}`.padStart(5, "0")} title={`${activeTab.toUpperCase()} BOOKINGS`} count={bookings.length} />

            {bookings.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <div className="flex flex-col divide-y divide-ink">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onNavigate={handleNavigate} />
                ))}
              </div>
            )}
          </div>

          {/* Summary stats */}
          {bookings.length > 0 && (
            <div className="grid grid-cols-3 mt-6 border border-ink overflow-hidden">
              {[
                { label: "TOTAL BOOKINGS", val: totalAll },
                { label: "ACTIVE", val: filterCounts.active, coral: true },
                { label: "COMPLETED", val: filterCounts.completed },
              ].map((stat, i) => (
                <div key={stat.label} className="px-6 py-5 border-r border-ink last:border-r-0" style={{ background: i % 2 === 0 ? CR : "#ede8de" }}>
                  <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: IK, opacity: 0.4 }}>{stat.label}</span>
                  <span className="text-3xl font-black leading-none tabular-nums" style={{ color: stat.coral ? C : IK, letterSpacing: "-0.03em" }}>{stat.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}