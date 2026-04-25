import { useState, useEffect, useCallback, useRef } from "react";
import Header from "../../common/components/Header";
import Footer from "../../common/components/Footer";
import { Link } from "react-router-dom";
import { fetchProviderBookings, updateBookingStatus } from "../../../handlers/bookings";
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtPrice = (price) => {
  if (!price && price !== 0) return "PKR 0";
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
};

const formatDateTime = (isoString) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  const timeStr = date.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase();
  
  if (isToday) return `TODAY, ${timeStr}`;
  if (isTomorrow) return `TOMORROW, ${timeStr}`;
  
  return date.toLocaleDateString("en-PK", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).toUpperCase() + `, ${timeStr}`;
};

const formatDistance = (km) => {
  if (!km && km !== 0) return "—";
  if (km < 1) return `${(km * 1000).toFixed(0)}M AWAY`;
  return `${km.toFixed(1)} KM AWAY`;
};

const truncateText = (text, maxLength = 100) => {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

const SectionBar = ({ n, title, count }) => (
  <div
    className="flex items-center justify-between px-6 py-2.5"
    style={{ background: IK }}
  >
    <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
      {title}
    </span>
    <div className="flex items-center gap-3">
      {count !== undefined && (
        <span className="text-2xs font-black" style={{ color: CR }}>
          {count} REQUESTS
        </span>
      )}
      <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>{n}</span>
    </div>
  </div>
);

// ─── CONFIRMATION MODAL ───────────────────────────────────────────────────────
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDestructive = false, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(26, 26, 26, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="max-w-md w-full border shadow-lg"
        style={{ background: CR, borderColor: IK }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ background: IK, borderColor: IK }}
        >
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: isDestructive ? C : CR }}>
            {title}
          </span>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-sm font-black transition-colors disabled:opacity-50"
            style={{ color: CR }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.color = C; }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.color = CR; }}
          >
            ✕
          </button>
        </div>

        <div className="p-6" style={{ background: CR }}>
          <p className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>
            {message}
          </p>
        </div>

        <div
          className="flex items-center gap-3 px-5 py-4 border-t"
          style={{ background: CR_ALT, borderColor: IK }}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors disabled:opacity-50"
            style={{ background: "transparent", borderColor: IK, color: IK }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = CR; }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = "transparent"; }}
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: isDestructive ? C : IK, color: CR }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = isDestructive ? "#cc4422" : C; }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = isDestructive ? C : IK; }}
          >
            {isLoading ? (
              <>
                <span className="animate-spin text-sm">◎</span>
                PROCESSING...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── REQUEST CARD COMPONENT ───────────────────────────────────────────────────
const RequestCard = ({ request, onAccept, onDecline, isProcessing }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerColor, setTimerColor] = useState(C);
  const [isExpired, setIsExpired] = useState(false);

  // Extract fields with API fallbacks
  const userName = request.user?.full_name || request.user_name || "CUSTOMER";
  const userAvatar = request.user?.avatar_url || null;
  const serviceTitle = request.service?.title || request.service_title || "SERVICE";
  const servicePrice = request.service?.base_price || request.quoted_price || 0;
  const addressCity = request.address?.city || "Lahore";
  const addressLabel = request.address?.label || "HOME";
  const addressDistance = request.address?.distance_km || request.distance_km || 0;
  const instructions = request.special_instructions || null;

  // Calculate expiry timer
  useEffect(() => {
    const calculateExpiry = () => {
      const created = new Date(request.created_at);
      const expiryTime = new Date(created.getTime() + 60 * 60 * 1000);
      const now = new Date();
      const diffMs = expiryTime - now;

      if (diffMs <= 0) {
        setTimeRemaining("EXPIRED");
        setTimerColor(C);
        setIsExpired(true);
        return;
      }

      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeRemaining(`${totalMinutes}:${seconds.toString().padStart(2, "0")}`);
      setIsExpired(false);

      if (totalMinutes > 30) setTimerColor("#22C55E");
      else if (totalMinutes > 10) setTimerColor("#EAB308");
      else setTimerColor(C);
    };

    calculateExpiry();
    const interval = setInterval(calculateExpiry, 1000);
    return () => clearInterval(interval);
  }, [request.created_at]);

  const handleAccept = () => {
    if (!isProcessing && !isExpired) onAccept(request.id);
  };

  const handleDecline = () => {
    if (!isProcessing && !isExpired) onDecline(request.id);
  };

  return (
    <div
      className="border overflow-hidden transition-all duration-300"
      style={{ background: CR, borderColor: IK, opacity: isExpired ? 0.5 : 1 }}
    >
      {/* Top Row: User Info + Expiry Timer */}
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: CR_ALT, borderColor: IK }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 border flex items-center justify-center shrink-0 overflow-hidden" style={{ borderColor: IK, background: "#e8e2d6" }}>
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <span className="text-xl font-black" style={{ color: IK, opacity: 0.2 }}>{userName.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black uppercase tracking-wide truncate" style={{ color: IK }}>{userName}</span>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>{addressCity} · {addressLabel}</span>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 ml-4">
          <span className="text-2xs font-black uppercase tracking-superwide mb-0.5" style={{ color: LIGHT_IK }}>
            {isExpired ? "STATUS" : "EXPIRES IN"}
          </span>
          <div className="flex items-center gap-1.5">
            {!isExpired && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: timerColor }} />}
            <span className="text-sm font-black tabular-nums leading-none" style={{ color: timerColor }}>{timeRemaining}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: C }}>SERVICE REQUESTED</span>
            <h3 className="text-sm font-black uppercase tracking-wide" style={{ color: IK }}>{serviceTitle}</h3>
          </div>
          <span className="text-lg font-black leading-none shrink-0 ml-4" style={{ color: C, letterSpacing: "-0.02em" }}>{fmtPrice(servicePrice)}</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-black" style={{ color: LIGHT_IK }}>📅</span>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>{formatDateTime(request.scheduled_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xs font-black" style={{ color: LIGHT_IK }}>📍</span>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>{formatDistance(addressDistance)}</span>
          </div>
        </div>

        {request.description && (
          <div className="relative">
            <div className="border-l-2 pl-3 py-1" style={{ borderColor: C }}>
              <p className="text-2xs font-black uppercase tracking-wide leading-relaxed" style={{ color: IK }}>{truncateText(request.description)}</p>
            </div>
            {instructions && (
              <div className="absolute -top-1 -right-1" title={instructions}>
                <span className="text-base font-black cursor-help" style={{ color: C }}>📋</span>
              </div>
            )}
          </div>
        )}

        {instructions && (
          <div className="border p-3 flex items-start gap-2" style={{ borderColor: C, background: "rgba(255,87,51,0.03)" }}>
            <span className="text-sm font-black shrink-0" style={{ color: C }}>📋</span>
            <p className="text-2xs font-black uppercase tracking-wide leading-relaxed" style={{ color: IK }}>{instructions}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t" style={{ background: CR_ALT, borderColor: IK }}>
        <div className="flex items-center gap-3">
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>{request.booking_ref}</span>
          {isExpired && (
            <span className="text-2xs font-black uppercase tracking-wide px-2 py-0.5 border" style={{ borderColor: C, color: C }}>EXPIRED</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDecline} disabled={isProcessing || isExpired}
            className="border px-4 py-2 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "transparent", borderColor: C, color: C }}
            onMouseEnter={(e) => { if (!isProcessing && !isExpired) { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }}}
            onMouseLeave={(e) => { if (!isProcessing && !isExpired) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C; }}}
          >
            DECLINE
          </button>
          <button onClick={handleAccept} disabled={isProcessing || isExpired}
            className="px-5 py-2 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: isExpired ? LIGHT_IK : C, color: CR }}
            onMouseEnter={(e) => { if (!isProcessing && !isExpired) { e.currentTarget.style.background = IK; }}}
            onMouseLeave={(e) => { if (!isProcessing && !isExpired) { e.currentTarget.style.background = C; }}}
          >
            {isExpired ? "EXPIRED" : "ACCEPT"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
const EmptyState = ({ filter }) => {
  const configs = {
    all: { sym: "○", title: "NO PENDING REQUESTS", desc: "New job requests will appear here as customers book your services." },
    today: { sym: "○", title: "NO REQUESTS FOR TODAY", desc: "You don't have any requests scheduled for today." },
    tomorrow: { sym: "○", title: "NO REQUESTS FOR TOMORROW", desc: "You don't have any requests scheduled for tomorrow." },
    week: { sym: "○", title: "NO REQUESTS THIS WEEK", desc: "You don't have any requests scheduled for this week." },
  };
  const config = configs[filter] || configs.all;

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6" style={{ background: CR }}>
      <span className="text-9xl font-black mb-6" style={{ color: IK, opacity: 0.05 }}>{config.sym}</span>
      <h3 className="text-sm font-black uppercase tracking-superwide mb-3" style={{ color: IK }}>{config.title}</h3>
      <p className="text-2xs font-black uppercase tracking-wide mb-8 max-w-md text-center" style={{ color: LIGHT_IK }}>{config.desc}</p>
      <Link to="/provider/dashboard"
        className="border px-6 py-3 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
        style={{ background: "transparent", borderColor: IK, color: IK }}
        onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>
        GO TO DASHBOARD →
      </Link>
    </div>
  );
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ProviderRequests() {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const [requests, setRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [processingId, setProcessingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  
  const intervalRef = useRef(null);

  const FILTERS = [
    { key: "all", label: "ALL" },
    { key: "today", label: "TODAY" },
    { key: "tomorrow", label: "TOMORROW" },
    { key: "week", label: "THIS WEEK" },
  ];

  // ─── FETCH FROM API ──────────────────────────────────────────────────────────
  const loadRequests = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await fetchProviderBookings(); // Returns all bookings
      // Filter only "requested" status for this page
      const onlyRequests = (data || []).filter(b => b.status === "requested");
      setRequests(onlyRequests);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadRequests();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (isAutoRefresh) {
      intervalRef.current = setInterval(() => loadRequests(true), 30000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAutoRefresh]);

  // ─── FILTER LOGIC ───────────────────────────────────────────────────────────
  const getFilteredRequests = useCallback(() => {
    const now = new Date();
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const tomorrowStart = new Date(now); tomorrowStart.setDate(tomorrowStart.getDate() + 1); tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrowStart); tomorrowEnd.setHours(23, 59, 59, 999);
    const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7); weekEnd.setHours(23, 59, 59, 999);

    // Remove expired requests only
    const active = requests.filter((r) => {
      const created = new Date(r.created_at);
      const expiry = new Date(created.getTime() + 60 * 60 * 1000);
      return expiry > now;
    });

    switch (activeFilter) {
      case "today":
        return active.filter((r) => new Date(r.scheduled_at) <= todayEnd);
      case "tomorrow":
        return active.filter((r) => {
          const d = new Date(r.scheduled_at);
          return d >= tomorrowStart && d <= tomorrowEnd;
        });
      case "week":
        return active.filter((r) => new Date(r.scheduled_at) <= weekEnd);
      default:
        return active;
    }
  }, [requests, activeFilter]);

  // ─── ACTIONS ─────────────────────────────────────────────────────────────────
  const handleAcceptClick = (requestId) => {
    setSelectedRequestId(requestId);
    setConfirmAction("accept");
    setShowConfirmModal(true);
  };

  const handleDeclineClick = (requestId) => {
    setSelectedRequestId(requestId);
    setConfirmAction("decline");
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    setProcessingId(selectedRequestId);
    setShowConfirmModal(false);

    try {
      if (confirmAction === "accept") {
        await updateBookingStatus(selectedRequestId, "accepted");
      } else {
        await updateBookingStatus(selectedRequestId, "cancelled");
      }
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequestId));
    } catch (err) {
      console.error("Failed to update booking:", err);
    } finally {
      setProcessingId(null);
      setSelectedRequestId(null);
      setConfirmAction(null);
    }
  };

  const handleCloseModal = () => {
    if (!processingId) {
      setShowConfirmModal(false);
      setSelectedRequestId(null);
      setConfirmAction(null);
    }
  };

  // ─── COMPUTED ────────────────────────────────────────────────────────────────
  const filteredRequests = getFilteredRequests();
  const selectedRequest = requests.find((r) => r.id === selectedRequestId);
  const totalActiveRequests = requests.filter((r) => {
    if (r.status && r.status !== "requested") return false;
    const created = new Date(r.created_at);
    const expiry = new Date(created.getTime() + 60 * 60 * 1000);
    return expiry > new Date();
  }).length;

  const filterCounts = {
    all: totalActiveRequests,
    today: requests.filter((r) => {
      if (r.status && r.status !== "requested") return false;
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
      const created = new Date(r.created_at);
      return new Date(r.scheduled_at) <= todayEnd && new Date(created.getTime() + 60 * 60 * 1000) > new Date();
    }).length,
    tomorrow: requests.filter((r) => {
      if (r.status && r.status !== "requested") return false;
      const tStart = new Date(); tStart.setDate(tStart.getDate() + 1); tStart.setHours(0, 0, 0, 0);
      const tEnd = new Date(tStart); tEnd.setHours(23, 59, 59, 999);
      const d = new Date(r.scheduled_at);
      const created = new Date(r.created_at);
      return d >= tStart && d <= tEnd && new Date(created.getTime() + 60 * 60 * 1000) > new Date();
    }).length,
    week: requests.filter((r) => {
      if (r.status && r.status !== "requested") return false;
      const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7); weekEnd.setHours(23, 59, 59, 999);
      const created = new Date(r.created_at);
      return new Date(r.scheduled_at) <= weekEnd && new Date(created.getTime() + 60 * 60 * 1000) > new Date();
    }).length,
  };

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
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>/ JOB REQUESTS</span>
          <div className="ml-auto py-2 flex items-center gap-3">
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>AUTO-REFRESH</span>
            <button onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className="relative w-9 h-5 rounded-full transition-colors duration-200"
              style={{ background: isAutoRefresh ? "#22C55E" : LIGHT_IK }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow"
                style={{ left: isAutoRefresh ? "calc(100% - 18px)" : "2px" }} />
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="border-b px-6 md:px-10 py-8" style={{ background: CR, borderColor: IK }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="font-black uppercase leading-none" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", letterSpacing: "-0.02em", color: IK }}>JOB REQUESTS</h1>
                {totalActiveRequests > 0 && (
                  <span className="px-3 py-1 text-xs font-black" style={{ background: C, color: CR }}>{totalActiveRequests}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>REVIEW AND ACCEPT INCOMING JOB REQUESTS</p>
                <span className="text-2xs font-black uppercase" style={{ color: LIGHT_IK }}>
                  · UPDATED {lastRefreshed.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase()}
                </span>
              </div>
            </div>
            <button onClick={() => loadRequests()} disabled={isRefreshing}
              className="border px-5 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 disabled:opacity-50 shrink-0"
              style={{ background: "transparent", borderColor: IK, color: IK }}
              onMouseEnter={(e) => { if (!isRefreshing) { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}}
              onMouseLeave={(e) => { if (!isRefreshing) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}}>
              <span className={isRefreshing ? "inline-block animate-spin mr-2" : "mr-2"}>{isRefreshing ? "◎" : "↻"}</span>
              {isRefreshing ? "REFRESHING..." : "REFRESH"}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-stretch border-b overflow-x-auto shrink-0" style={{ background: CR, borderColor: IK }}>
          {FILTERS.map((filter) => {
            const active = activeFilter === filter.key;
            const count = filterCounts[filter.key];
            return (
              <button key={filter.key} onClick={() => setActiveFilter(filter.key)}
                className="px-7 py-3.5 text-2xs font-black uppercase tracking-superwide border-r whitespace-nowrap transition-colors duration-100"
                style={{ background: active ? IK : CR, color: active ? CR : IK, borderColor: IK }}>
                {filter.label}
                <span className="ml-2" style={{ color: active ? C : LIGHT_IK }}>{count}</span>
                {count > 0 && active && <span className="ml-1 w-1.5 h-1.5 inline-block rounded-full" style={{ background: C }} />}
              </button>
            );
          })}
          <div className="ml-auto flex items-center px-6 border-l shrink-0" style={{ borderColor: IK }}>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>{filteredRequests.length} SHOWING</span>
          </div>
        </div>

        {/* Refresh Indicator */}
        {isRefreshing && (
          <div className="flex items-center justify-center gap-2 py-3 border-b" style={{ background: CR_ALT, borderColor: IK }}>
            <span className="animate-spin text-sm font-black" style={{ color: C }}>◎</span>
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>CHECKING FOR NEW REQUESTS...</span>
          </div>
        )}

        {/* Requests List */}
        <div className="flex-1 px-6 md:px-10 py-8">
          <div className="border overflow-hidden" style={{ borderColor: IK }}>
            <SectionBar
              n={`§ ${FILTERS.findIndex(f => f.key === activeFilter) + 1}`.padStart(5, "0")}
              title={`${activeFilter.toUpperCase()} REQUESTS`}
              count={filteredRequests.length}
            />
            {filteredRequests.length === 0 ? (
              <EmptyState filter={activeFilter} />
            ) : (
              <div className="flex flex-col divide-y" style={{ borderColor: IK }}>
                {filteredRequests.map((request) => (
                  <RequestCard key={request.id} request={request}
                    onAccept={handleAcceptClick} onDecline={handleDeclineClick}
                    isProcessing={processingId === request.id} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {filteredRequests.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 mt-6 border overflow-hidden" style={{ borderColor: IK }}>
              <div className="px-6 py-4 border-r" style={{ background: CR, borderColor: IK }}>
                <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>ACTIVE REQUESTS</span>
                <span className="text-2xl font-black leading-none" style={{ color: C }}>{totalActiveRequests}</span>
              </div>
              <div className="px-6 py-4 border-r" style={{ background: CR_ALT, borderColor: IK }}>
                <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>TODAY</span>
                <span className="text-2xl font-black leading-none" style={{ color: IK }}>{filterCounts.today}</span>
              </div>
              <div className="px-6 py-4 border-r" style={{ background: CR, borderColor: IK }}>
                <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>TOMORROW</span>
                <span className="text-2xl font-black leading-none" style={{ color: IK }}>{filterCounts.tomorrow}</span>
              </div>
              <div className="px-6 py-4" style={{ background: CR_ALT }}>
                <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>THIS WEEK</span>
                <span className="text-2xl font-black leading-none" style={{ color: IK }}>{filterCounts.week}</span>
              </div>
            </div>
          )}
        </div>

        {/* Processing Overlay */}
        {processingId && (
          <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(26, 26, 26, 0.5)" }}>
            <div className="border px-8 py-6 flex flex-col items-center gap-3" style={{ background: CR, borderColor: IK }}>
              <span className="animate-spin text-2xl font-black" style={{ color: C }}>◎</span>
              <span className="text-xs font-black uppercase tracking-superwide" style={{ color: IK }}>
                {confirmAction === "accept" ? "ACCEPTING REQUEST..." : "DECLINING REQUEST..."}
              </span>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmModal} onClose={handleCloseModal} onConfirm={handleConfirmAction}
          title={confirmAction === "accept" ? "ACCEPT REQUEST" : "DECLINE REQUEST"}
          message={
            confirmAction === "accept"
              ? `Are you sure you want to accept this request from ${selectedRequest?.user?.full_name || selectedRequest?.user_name || "customer"}?`
              : `Are you sure you want to decline this request? This action cannot be undone.`
          }
          confirmText={confirmAction === "accept" ? "YES, ACCEPT" : "YES, DECLINE"}
          isDestructive={confirmAction === "decline"}
          isLoading={!!processingId}
        />

        <Footer />
      </div>
    </div>
  );
}