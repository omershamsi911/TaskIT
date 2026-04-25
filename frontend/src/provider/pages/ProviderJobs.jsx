import { useState, useEffect, useCallback, useRef } from "react";
import Header from "../../common/components/Header";
import Footer from "../../common/components/Footer";
import { Link } from "react-router-dom";
import { fetchProviderBookings } from "../../../handlers/bookings";
import { useTheme } from "../../hooks/useTheme";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const C  = "#FF5733";
const CR = "#F5F0E6";
const IK = "#1A1A1A";

// Derived colors
const getAltBackground = () => {
  const r = parseInt(CR.slice(1,3), 16);
  const g = parseInt(CR.slice(3,5), 16);
  const b = parseInt(CR.slice(5,7), 16);
  return `rgb(${Math.max(0, r-12)}, ${Math.max(0, g-12)}, ${Math.max(0, b-12)})`;
};

const getLightInk = () => {
  const r = parseInt(IK.slice(1,3), 16);
  const g = parseInt(IK.slice(3,5), 16);
  const b = parseInt(IK.slice(5,7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.4)`;
};

const CR_ALT = getAltBackground();
const LIGHT_IK = getLightInk();

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const JOB_STATUS_META = {
  requested:   { label: "REQUESTED",   sym: "○", bg: CR_ALT, fg: IK,       border: IK },
  accepted:    { label: "ACCEPTED",    sym: "◎", bg: IK,     fg: CR,       border: IK },
  in_progress: { label: "IN PROGRESS", sym: "◆", bg: C,      fg: CR,       border: C  },
  completed:   { label: "COMPLETED",   sym: "✓", bg: IK,     fg: C,        border: IK },
  cancelled:   { label: "CANCELLED",   sym: "✗", bg: CR,     fg: LIGHT_IK, border: IK },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtPrice = (price) => {
  if (!price && price !== 0) return "PKR 0";
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
};

const formatDateTime = (isoString) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
  }).toUpperCase() + " · " + date.toLocaleTimeString("en-PK", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  }).toUpperCase();
};

const formatShortDate = (isoString) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const timeStr = date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
  
  if (diffDays === 0) return `TODAY, ${timeStr}`;
  if (diffDays === 1) return `YESTERDAY, ${timeStr}`;
  if (diffDays < 7) return `${diffDays} DAYS AGO`;
  
  return date.toLocaleDateString("en-PK", { day: "2-digit", month: "short" }).toUpperCase();
};

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

const SectionBar = ({ n, title, count }) => (
  <div className="flex items-center justify-between px-6 py-2.5" style={{ background: IK }}>
    <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>{title}</span>
    <div className="flex items-center gap-3">
      {count !== undefined && (
        <span className="text-2xs font-black" style={{ color: CR }}>{count} JOBS</span>
      )}
      <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>{n}</span>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const m = JOB_STATUS_META[status] ?? JOB_STATUS_META.requested;
  return (
    <div className="inline-flex items-center gap-1.5 border px-2.5 py-1" style={{ borderColor: m.border, background: m.bg }}>
      <span className="text-xs font-black leading-none" style={{ color: m.fg }}>{m.sym}</span>
      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: m.fg }}>{m.label}</span>
    </div>
  );
};

const RatingStars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className="text-xs font-black" style={{ color: star <= rating ? C : LIGHT_IK }}>
        {star <= rating ? "★" : "☆"}
      </span>
    ))}
  </div>
);

// ─── JOB CARD COMPONENTS ──────────────────────────────────────────────────────

const ActiveJobCard = ({ job }) => {
  const statusMeta = JOB_STATUS_META[job.status] ?? JOB_STATUS_META.requested;
  const canStart = job.status === "accepted";
  const isInProgress = job.status === "in_progress";
  
  // API field mapping
  const userName = job.user?.full_name || job.user_name || "CUSTOMER";
  const userAvatar = job.user?.avatar_url || job.user_avatar || null;
  const serviceTitle = job.service?.title || job.service_title || "SERVICE";
  const quotedPrice = job.quoted_price || 0;
  const addressShort = job.address?.address_line1 || job.address?.city || job.address_short || "—";
  const instructions = job.special_instructions || null;

  return (
    <div className="border overflow-hidden group transition-all duration-150" style={{ background: CR, borderColor: IK }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b" style={{ background: CR_ALT, borderColor: IK }}>
        <div className="flex items-center gap-4">
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>REF: {job.booking_ref}</span>
          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>#{job.id}</span>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row">
        <div className="flex items-center gap-4 px-5 py-5 md:w-2/5 border-r" style={{ borderColor: IK }}>
          <div className="w-12 h-12 border flex items-center justify-center shrink-0 overflow-hidden" style={{ borderColor: IK, background: "#e8e2d6" }}>
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <span className="text-xl font-black" style={{ color: IK, opacity: 0.2 }}>{userName.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <span className="text-2xs font-black uppercase tracking-superwide block mb-0.5" style={{ color: LIGHT_IK }}>CUSTOMER</span>
            <h3 className="text-sm font-black uppercase tracking-wide truncate mb-1" style={{ color: IK }}>{userName}</h3>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: C }}>{serviceTitle}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row">
          <div className="flex-1 px-5 py-5 border-r" style={{ borderColor: IK }}>
            <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>
              {isInProgress ? "STARTED" : "SCHEDULED"}
            </span>
            <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: IK }}>{formatDateTime(job.scheduled_at)}</p>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>📍 {addressShort}</span>
          </div>

          <div className="flex-1 px-5 py-5">
            <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>PRICE</span>
            <p className="text-lg font-black leading-none mb-2" style={{ color: C, letterSpacing: "-0.02em" }}>{fmtPrice(quotedPrice)}</p>
            {instructions && (
              <div className="flex items-start gap-1">
                <span className="text-2xs font-black shrink-0" style={{ color: C }}>📋</span>
                <span className="text-2xs font-black uppercase tracking-wide truncate" style={{ color: LIGHT_IK }}>{instructions}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-t" style={{ background: CR_ALT, borderColor: IK }}>
        <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
          {isInProgress ? "IN PROGRESS" : `ACCEPTED ${formatShortDate(job.scheduled_at)}`}
        </span>
        <div className="flex items-center gap-2">
          <Link to={`/provider/jobs/${job.id}`}
            className="text-2xs font-black uppercase tracking-superwide transition-colors group-hover:translate-x-1 duration-200 no-underline"
            style={{ color: C }}>
            VIEW DETAILS →
          </Link>
          {canStart && (
            <Link to={`/provider/jobs/${job.id}`}
              className="px-4 py-1.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
              style={{ background: C, color: CR }}
              onMouseEnter={(e) => { e.currentTarget.style.background = IK; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C; }}>
              START JOB
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const CompletedJobCard = ({ job }) => {
  const userName = job.user?.full_name || job.user_name || "CUSTOMER";
  const userAvatar = job.user?.avatar_url || job.user_avatar || null;
  const serviceTitle = job.service?.title || job.service_title || "SERVICE";
  const finalPrice = job.final_price || job.quoted_price || 0;
  const addressShort = job.address?.address_line1 || job.address?.city || job.address_short || "—";
  const rating = job.rating_received || (job.review?.rating) || null;

  return (
    <div className="border overflow-hidden group transition-all duration-150" style={{ background: CR, borderColor: IK }}>
      <div className="flex items-center justify-between px-5 py-2.5 border-b" style={{ background: CR_ALT, borderColor: IK }}>
        <div className="flex items-center gap-4">
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>REF: {job.booking_ref}</span>
          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>#{job.id}</span>
        </div>
        <StatusBadge status="completed" />
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="flex items-center gap-4 px-5 py-5 md:w-2/5 border-r" style={{ borderColor: IK }}>
          <div className="w-12 h-12 border flex items-center justify-center shrink-0 overflow-hidden" style={{ borderColor: IK, background: "#e8e2d6" }}>
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <span className="text-xl font-black" style={{ color: IK, opacity: 0.2 }}>{userName.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <span className="text-2xs font-black uppercase tracking-superwide block mb-0.5" style={{ color: LIGHT_IK }}>CUSTOMER</span>
            <h3 className="text-sm font-black uppercase tracking-wide truncate mb-1" style={{ color: IK }}>{userName}</h3>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>{serviceTitle}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row">
          <div className="flex-1 px-5 py-5 border-r" style={{ borderColor: IK }}>
            <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>COMPLETED</span>
            <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: IK }}>{formatShortDate(job.completed_at)}</p>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>📍 {addressShort}</span>
          </div>

          <div className="flex-1 px-5 py-5">
            <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>EARNED</span>
            <p className="text-lg font-black leading-none mb-2" style={{ color: C, letterSpacing: "-0.02em" }}>{fmtPrice(finalPrice)}</p>
            {rating ? (
              <div className="flex items-center gap-2">
                <RatingStars rating={rating} />
                <span className="text-2xs font-black uppercase" style={{ color: LIGHT_IK }}>{rating}/5</span>
              </div>
            ) : (
              <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>NO RATING YET</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t" style={{ background: CR_ALT, borderColor: IK }}>
        <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>JOB COMPLETED</span>
        <Link to={`/provider/jobs/${job.id}`}
          className="text-2xs font-black uppercase tracking-superwide transition-colors group-hover:translate-x-1 duration-200 no-underline"
          style={{ color: C }}>
          VIEW DETAILS →
        </Link>
      </div>
    </div>
  );
};

const CancelledJobCard = ({ job }) => {
  const userName = job.user?.full_name || job.user_name || "CUSTOMER";
  const serviceTitle = job.service?.title || job.service_title || "SERVICE";
  const quotedPrice = job.quoted_price || 0;
  const reasonLabel = (job.cancellation_reason || "CANCELLED").toUpperCase().replace(/_/g, " ");

  return (
    <div className="border overflow-hidden opacity-70 transition-all duration-150" style={{ background: CR, borderColor: IK }}>
      <div className="flex items-center justify-between px-5 py-2.5 border-b" style={{ background: CR_ALT, borderColor: IK }}>
        <div className="flex items-center gap-4">
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>REF: {job.booking_ref}</span>
        </div>
        <StatusBadge status="cancelled" />
      </div>

      <div className="flex items-center gap-4 px-5 py-5">
        <div className="w-10 h-10 border flex items-center justify-center shrink-0" style={{ borderColor: IK, background: "#e8e2d6" }}>
          <span className="text-lg font-black" style={{ color: IK, opacity: 0.2 }}>{userName.charAt(0)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-black uppercase tracking-wide mb-0.5" style={{ color: IK }}>{userName}</h3>
          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>{serviceTitle} · {fmtPrice(quotedPrice)}</span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xs font-black uppercase block" style={{ color: LIGHT_IK }}>{formatShortDate(job.cancelled_at || job.updated_at)}</span>
          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: C }}>{reasonLabel}</span>
        </div>
      </div>
    </div>
  );
};

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
const EmptyState = ({ tab }) => {
  const config = {
    active: { sym: "◆", title: "NO ACTIVE JOBS", desc: "Accept incoming requests to start working.", link: "/provider/requests", linkText: "VIEW REQUESTS →" },
    completed: { sym: "✓", title: "NO COMPLETED JOBS", desc: "Your completed jobs will appear here.", link: null, linkText: null },
    cancelled: { sym: "✗", title: "NO CANCELLED JOBS", desc: "Cancelled jobs will appear here.", link: null, linkText: null },
  };
  const c = config[tab] || config.active;
  
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6" style={{ background: CR }}>
      <span className="text-8xl font-black mb-6" style={{ color: IK, opacity: 0.06 }}>{c.sym}</span>
      <h3 className="text-sm font-black uppercase tracking-superwide mb-2" style={{ color: IK }}>{c.title}</h3>
      <p className="text-2xs font-black uppercase tracking-wide mb-6" style={{ color: LIGHT_IK }}>{c.desc}</p>
      {c.link && (
        <Link to={c.link} className="border px-6 py-3 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
          style={{ background: "transparent", borderColor: C, color: C }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C; }}>
          {c.linkText}
        </Link>
      )}
    </div>
  );
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ProviderJobs() {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const [allBookings, setAllBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ─── FETCH FROM API ──────────────────────────────────────────────────────────
  const loadBookings = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await fetchProviderBookings();
      setAllBookings(data || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ─── FILTER BOOKINGS BY STATUS ──────────────────────────────────────────────
  const activeJobs = allBookings.filter(b => ["accepted", "in_progress"].includes(b.status));
  const completedJobs = allBookings.filter(b => b.status === "completed");
  const cancelledJobs = allBookings.filter(b => b.status === "cancelled");

  const filterTabs = {
    active: activeJobs.length,
    completed: completedJobs.length,
    cancelled: cancelledJobs.length,
  };

  const TABS = [
    { key: "active", label: "ACTIVE", count: filterTabs.active },
    { key: "completed", label: "COMPLETED", count: filterTabs.completed },
    { key: "cancelled", label: "CANCELLED", count: filterTabs.cancelled },
  ];

  const getJobsForTab = () => {
    switch (activeTab) {
      case "active":
        return [...activeJobs].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
      case "completed":
        return [...completedJobs].sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
      case "cancelled":
        return [...cancelledJobs].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      default:
        return [];
    }
  };

  const handleRefresh = useCallback(() => {
    loadBookings();
  }, []);

  const jobs = getJobsForTab();
  const totalAllJobs = filterTabs.active + filterTabs.completed + filterTabs.cancelled;

  // ─── LOADING STATE ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
        <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <span className="animate-spin text-4xl font-black" style={{ color: C }}>◎</span>
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
        <div className="flex items-center border-b px-6" style={{ background: CR, borderColor: IK }}>
          <span className="py-3 pr-5 border-r text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK, borderColor: IK }}>PROVIDER</span>
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>/ DASHBOARD</span>
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>/ MY JOBS</span>
          <div className="ml-auto py-2">
            <div className="inline-flex items-center gap-2 border px-3 py-1.5" style={{ background: IK, borderColor: IK }}>
              <span className="text-sm font-black leading-none" style={{ color: C }}>◆</span>
              <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: CR }}>JOBS</span>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="border-b px-6 md:px-10 py-8" style={{ background: CR, borderColor: IK }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-black uppercase leading-none mb-2" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", letterSpacing: "-0.02em", color: IK }}>MY JOBS</h1>
              <p className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>MANAGE ALL YOUR ACTIVE, COMPLETED & CANCELLED JOBS</p>
            </div>
            <button onClick={handleRefresh} disabled={isRefreshing}
              className="border px-4 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 disabled:opacity-50"
              style={{ background: "transparent", borderColor: IK, color: IK }}
              onMouseEnter={(e) => { if (!isRefreshing) { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}}
              onMouseLeave={(e) => { if (!isRefreshing) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}}>
              <span className={isRefreshing ? "inline-block animate-spin" : ""}>{isRefreshing ? "◎" : "↻"}</span>
              <span className="ml-2 hidden sm:inline">{isRefreshing ? "REFRESHING..." : "REFRESH"}</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-stretch border-b overflow-x-auto shrink-0" style={{ background: CR, borderColor: IK }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="px-7 py-3.5 text-2xs font-black uppercase tracking-superwide border-r whitespace-nowrap transition-colors duration-100"
                style={{ background: active ? IK : CR, color: active ? CR : IK, borderColor: IK }}>
                {tab.label}
                <span className="ml-2" style={{ color: active ? C : LIGHT_IK }}>{tab.count}</span>
              </button>
            );
          })}
          <div className="ml-auto flex items-center px-6 border-l shrink-0" style={{ borderColor: IK }}>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>TOTAL {totalAllJobs} JOBS</span>
          </div>
        </div>

        {/* Refresh indicator */}
        {isRefreshing && (
          <div className="flex items-center justify-center gap-2 py-3 border-b" style={{ background: CR_ALT, borderColor: IK }}>
            <span className="animate-spin text-sm font-black" style={{ color: C }}>◎</span>
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>REFRESHING...</span>
          </div>
        )}

        {/* Jobs List */}
        <div className="flex-1 px-6 md:px-10 py-8">
          <div className="border overflow-hidden" style={{ borderColor: IK }}>
            <SectionBar
              n={`§ ${TABS.findIndex(t => t.key === activeTab) + 1}`.padStart(5, "0")}
              title={`${activeTab.toUpperCase()} JOBS`}
              count={jobs.length}
            />
            {jobs.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <div className="flex flex-col divide-y" style={{ borderColor: IK }}>
                {jobs.map((job) => {
                  if (activeTab === "completed") return <CompletedJobCard key={job.id} job={job} />;
                  if (activeTab === "cancelled") return <CancelledJobCard key={job.id} job={job} />;
                  return <ActiveJobCard key={job.id} job={job} />;
                })}
              </div>
            )}
          </div>

          {/* Quick Stats Footer */}
          {jobs.length > 0 && (
            <div className="grid grid-cols-3 mt-6 border overflow-hidden" style={{ borderColor: IK }}>
              <div className="px-6 py-4 border-r" style={{ background: CR, borderColor: IK }}>
                <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>ACTIVE</span>
                <span className="text-2xl font-black leading-none" style={{ color: IK }}>{filterTabs.active}</span>
              </div>
              <div className="px-6 py-4 border-r" style={{ background: CR_ALT, borderColor: IK }}>
                <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>COMPLETED</span>
                <span className="text-2xl font-black leading-none" style={{ color: C }}>{filterTabs.completed}</span>
              </div>
              <div className="px-6 py-4" style={{ background: CR }}>
                <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>CANCELLED</span>
                <span className="text-2xl font-black leading-none" style={{ color: LIGHT_IK }}>{filterTabs.cancelled}</span>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}