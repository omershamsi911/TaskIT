import { useState, useEffect } from "react";
import Header from "../../common/components/Header";
import Footer from "../../common/components/Footer";
import { Link } from "react-router-dom";
import { fetchProviderBookings} from "../../../handlers/bookings";
import { fetchWalletTransactions } from "../../../handlers/payments";
import { toggleProviderStatus } from "../../../handlers/providers";
import { useTheme } from "../../hooks/useTheme";

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ProviderDashboard() {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const [provider, setProvider] = useState({ full_name: "PROVIDER", avg_rating: 0, total_reviews: 0, availability_status: "offline" });
  const [stats, setStats] = useState({
    today: { pending_requests: 0, active_jobs: 0, completed_today: 0, earnings_today: 0 },
    weekly: { completed_jobs: 0, earnings: 0 },
    monthly: { completed_jobs: 0, earnings: 0 },
    all_time: { total_completed_jobs: 0, total_earnings: 0, response_rate: 0, avg_response_minutes: 0 },
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [earningsChart, setEarningsChart] = useState({ labels: ["MON","TUE","WED","THU","FRI","SAT","SUN"], data: [0,0,0,0,0,0,0] });
  const [availabilityStatus, setAvailabilityStatus] = useState("offline");
  const [selectedPeriod, setSelectedPeriod] = useState("WEEK");
  const [isLoading, setIsLoading] = useState(true);

  // ─── STATUS CONFIG ────────────────────────────────────────────────────────────
  const JOB_STATUS_META = {
    requested:   { label: "REQUESTED",   color: LIGHT_IK, bg: CR_ALT },
    accepted:    { label: "ACCEPTED",    color: CR,       bg: IK },
    in_progress: { label: "IN PROGRESS", color: CR,       bg: C },
    completed:   { label: "COMPLETED",   color: C,        bg: IK },
    cancelled:   { label: "CANCELLED",   color: IK,       bg: CR_ALT },
  };

  const AVAILABILITY_META = {
    available: { label: "AVAILABLE", sym: "●", color: "#22C55E" },
    busy:      { label: "BUSY",      sym: "◆", color: "#EAB308" },
    offline:   { label: "OFFLINE",   sym: "○", color: LIGHT_IK },
  };

  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  const fmtPrice = (price) => `PKR ${Number(price || 0).toLocaleString("en-PK")}`;

  const fmtShortPrice = (price) => {
    if (price >= 100000) return `PKR ${(price / 100000).toFixed(1)}L`;
    if (price >= 1000) return `PKR ${(price / 1000).toFixed(0)}K`;
    return `PKR ${price}`;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const timeStr = date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
    if (isToday) return `TODAY, ${timeStr}`;
    if (isTomorrow) return `TOMORROW, ${timeStr}`;
    return date.toLocaleDateString("en-PK", { day: "2-digit", month: "short" }).toUpperCase() + `, ${timeStr}`;
  };

  const formatDistance = (km) => {
    if (!km) return "—";
    if (km < 1) return `${(km * 1000).toFixed(0)}M`;
    return `${km.toFixed(1)} KM`;
  };

  // ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
  const SectionBar = ({ n, title, action }) => (
    <div className="flex items-center justify-between px-6 py-2.5" style={{ background: IK }}>
      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>{title}</span>
      <div className="flex items-center gap-3">
        {action && (
          <Link to={action.link} className="text-2xs font-black uppercase tracking-superwide transition-colors" style={{ color: CR }}
            onMouseEnter={e => { e.currentTarget.style.color = C; }}
            onMouseLeave={e => { e.currentTarget.style.color = CR; }}>
            {action.label} →
          </Link>
        )}
        <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>{n}</span>
      </div>
    </div>
  );

  const StatCard = ({ label, value, accent = false, onClick }) => (
    <button onClick={onClick}
      className="flex flex-col justify-center px-6 py-5 border-r last:border-r-0 text-left w-full transition-colors duration-100"
      style={{ background: CR, borderColor: IK }}
      onMouseEnter={e => { e.currentTarget.style.background = CR_ALT; }}
      onMouseLeave={e => { e.currentTarget.style.background = CR; }}>
      <span className="text-2xl md:text-3xl font-black leading-none mb-1 tabular-nums"
        style={{ color: accent ? C : IK, letterSpacing: "-0.03em" }}>{value}</span>
      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>{label}</span>
    </button>
  );

  const RequestMiniCard = ({ request }) => (
    <Link to={`/provider/requests/${request.id}`}
      className="flex items-center justify-between py-4 px-5 border-b last:border-b-0 transition-colors duration-100"
      style={{ background: CR, borderColor: IK }}
      onMouseEnter={e => { e.currentTarget.style.background = CR_ALT; }}
      onMouseLeave={e => { e.currentTarget.style.background = CR; }}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 border flex items-center justify-center shrink-0" style={{ borderColor: IK, background: "#e8e2d6" }}>
          <span className="text-sm font-black" style={{ color: IK, opacity: 0.3 }}>
            {(request.user_name || request.user?.full_name || "?").charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-black uppercase tracking-wide truncate" style={{ color: IK }}>
              {request.user_name || request.user?.full_name || "CUSTOMER"}
            </span>
            <span className="text-2xs font-black shrink-0" style={{ color: C }}>
              {fmtPrice(request.quoted_price)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
              {request.service_title || request.service || "SERVICE"}
            </span>
            {request.distance_km && (
              <span className="text-2xs font-black uppercase" style={{ color: LIGHT_IK }}>· {formatDistance(request.distance_km)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        <span className="text-2xs font-black uppercase tracking-wide block" style={{ color: LIGHT_IK }}>
          {formatDateTime(request.scheduled_at)}
        </span>
      </div>
    </Link>
  );

  const ActiveJobCard = ({ job }) => {
    const statusMeta = JOB_STATUS_META[job.status] ?? JOB_STATUS_META.requested;
    return (
      <Link to={`/provider/jobs/${job.id}`}
        className="flex items-center justify-between py-4 px-5 border-b last:border-b-0 transition-colors duration-100"
        style={{ background: CR, borderColor: IK }}
        onMouseEnter={e => { e.currentTarget.style.background = CR_ALT; }}
        onMouseLeave={e => { e.currentTarget.style.background = CR; }}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 border flex items-center justify-center shrink-0" style={{ borderColor: IK, background: "#e8e2d6" }}>
            <span className="text-sm font-black" style={{ color: IK, opacity: 0.3 }}>
              {(job.user_name || job.user?.full_name || "?").charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-black uppercase tracking-wide truncate" style={{ color: IK }}>
                {job.user_name || job.user?.full_name || "CUSTOMER"}
              </span>
              <span className="text-2xs font-black uppercase tracking-wide px-1.5 py-0.5 border"
                style={{ borderColor: statusMeta.color, color: statusMeta.color, background: statusMeta.bg }}>
                {statusMeta.label}
              </span>
            </div>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
              {job.service_title || job.service || "SERVICE"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-2xs font-black uppercase tracking-wide hidden sm:block" style={{ color: LIGHT_IK }}>
            {formatDateTime(job.scheduled_at)}
          </span>
          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>{job.booking_ref}</span>
          <span className="text-sm font-black" style={{ color: C }}>→</span>
        </div>
      </Link>
    );
  };

  const EarningsChart = ({ data }) => {
    const maxValue = Math.max(...data.data, 1);
    return (
      <div className="p-6" style={{ background: CR }}>
        <div className="flex items-end gap-3 h-48">
          {data.labels.map((label, index) => {
            const value = data.data[index];
            const heightPercent = (value / maxValue) * 100;
            const isHighest = value === maxValue && value > 0;
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-2 h-full">
                <div className="w-full flex-1 flex flex-col justify-end">
                  <div className="w-full transition-all duration-500 relative group"
                    style={{ height: `${heightPercent}%`, background: isHighest ? C : IK, minHeight: value > 0 ? "4px" : "0px" }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                      style={{ background: IK, color: CR, padding: "4px 8px", fontSize: "10px", fontWeight: 900 }}>
                      {fmtShortPrice(value)}
                    </div>
                  </div>
                </div>
                <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>{label}</span>
                <span className="text-2xs font-black tabular-nums" style={{ color: isHighest ? C : LIGHT_IK }}>{fmtShortPrice(value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const AvailabilityToggle = ({ status, onToggle }) => {
    const isAvailable = status === "available";
    const meta = AVAILABILITY_META[status] ?? AVAILABILITY_META.offline;
    return (
      <button onClick={onToggle}
        className="flex items-center gap-3 border px-4 py-2 transition-colors duration-100"
        style={{ background: isAvailable ? "rgba(34,197,94,0.1)" : CR_ALT, borderColor: meta.color }}
        onMouseEnter={e => { e.currentTarget.style.background = isAvailable ? "rgba(34,197,94,0.2)" : CR; }}
        onMouseLeave={e => { e.currentTarget.style.background = isAvailable ? "rgba(34,197,94,0.1)" : CR_ALT; }}>
        <span className="text-sm animate-pulse" style={{ color: meta.color }}>{meta.sym}</span>
        <span className="text-2xs font-black uppercase tracking-superwide hidden sm:block" style={{ color: IK }}>{meta.label}</span>
        <div className="w-9 h-5 rounded-full relative transition-colors duration-200" style={{ background: isAvailable ? "#22C55E" : LIGHT_IK }}>
          <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow"
            style={{ left: isAvailable ? "calc(100% - 18px)" : "2px" }} />
        </div>
      </button>
    );
  };

  // Fetch all data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [bookings, requests, walletTxns] = await Promise.all([
          fetchProviderBookings().catch(() => []),
          fetchWalletTransactions().catch(() => []),
        ]);

        // Active jobs = accepted + in_progress
        const active = (bookings || []).filter(b => ["accepted", "in_progress"].includes(b.status));
        // Completed today
        const today = new Date().toDateString();
        const completedToday = (bookings || []).filter(b => b.status === "completed" && new Date(b.completed_at).toDateString() === today);
        // Completed this week
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
        const completedWeek = (bookings || []).filter(b => b.status === "completed" && new Date(b.completed_at) >= weekAgo);
        // Completed this month
        const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
        const completedMonth = (bookings || []).filter(b => b.status === "completed" && new Date(b.completed_at) >= monthAgo);

        setActiveJobs(active.slice(0, 5));
        setRecentRequests((requests || []).slice(0, 3));
        
        setStats({
          today: {
            pending_requests: (requests || []).length,
            active_jobs: active.length,
            completed_today: completedToday.length,
            earnings_today: completedToday.reduce((sum, b) => sum + (Number(b.final_price) || Number(b.quoted_price) || 0), 0),
          },
          weekly: {
            completed_jobs: completedWeek.length,
            earnings: completedWeek.reduce((sum, b) => sum + (Number(b.final_price) || Number(b.quoted_price) || 0), 0),
          },
          monthly: {
            completed_jobs: completedMonth.length,
            earnings: completedMonth.reduce((sum, b) => sum + (Number(b.final_price) || Number(b.quoted_price) || 0), 0),
          },
          all_time: {
            total_completed_jobs: (bookings || []).filter(b => b.status === "completed").length,
            total_earnings: (bookings || []).filter(b => b.status === "completed").reduce((sum, b) => sum + (Number(b.final_price) || Number(b.quoted_price) || 0), 0),
            response_rate: 98.5,
            avg_response_minutes: 12,
          },
        });

        // Last 7 days chart
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const dayStr = d.toLocaleDateString("en-PK", { weekday: "short" }).toUpperCase().slice(0, 3);
          const dayEarnings = (bookings || [])
            .filter(b => b.status === "completed" && new Date(b.completed_at).toDateString() === d.toDateString())
            .reduce((sum, b) => sum + (Number(b.final_price) || Number(b.quoted_price) || 0), 0);
          last7Days.push({ label: dayStr, value: dayEarnings });
        }
        setEarningsChart({
          labels: last7Days.map(d => d.label),
          data: last7Days.map(d => d.value),
        });

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleAvailability = async () => {
    const nextStatus = availabilityStatus === "available" ? "offline" : "available";
    try {
      await toggleProviderStatus(nextStatus);
      setAvailabilityStatus(nextStatus);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

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
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>/ DASHBOARD</span>
          <div className="ml-auto py-2 flex items-center gap-3">
            <AvailabilityToggle status={availabilityStatus} onToggle={handleToggleAvailability} />
          </div>
        </div>

        {/* Welcome Header */}
        <div className="border-b px-6 md:px-10 py-8" style={{ background: CR, borderColor: IK }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 border flex items-center justify-center shrink-0 overflow-hidden"
                style={{ borderColor: IK, background: "#e8e2d6" }}>
                <span className="text-4xl font-black" style={{ color: C }}>◆</span>
              </div>
              <div>
                <h1 className="font-black uppercase leading-none mb-1"
                  style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", letterSpacing: "-0.02em", color: IK }}>
                  {provider.full_name}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-2xs font-black uppercase px-2 py-0.5 border" style={{ borderColor: C, color: C }}>◆ PROVIDER</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/provider/requests"
                className="border px-5 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
                style={{ background: "transparent", borderColor: IK, color: IK }}
                onMouseEnter={e => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>
                VIEW REQUESTS →
              </Link>
              <Link to="/provider/profile/edit"
                className="px-5 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
                style={{ background: C, color: CR }}
                onMouseEnter={e => { e.currentTarget.style.background = IK; }}
                onMouseLeave={e => { e.currentTarget.style.background = C; }}>
                EDIT PROFILE
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b" style={{ borderColor: IK }}>
          <StatCard label="TODAY'S EARNINGS" value={fmtPrice(stats.today.earnings_today)} accent />
          <StatCard label="PENDING REQUESTS" value={stats.today.pending_requests} />
          <StatCard label="ACTIVE JOBS" value={stats.today.active_jobs} accent />
          <StatCard label="COMPLETED TODAY" value={stats.today.completed_today} />
        </div>

        {/* Earnings Chart */}
        <div className="border-b" style={{ borderColor: IK }}>
          <div className="flex items-center justify-between px-6 py-2.5 border-b" style={{ background: IK, borderColor: IK }}>
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>EARNINGS OVERVIEW</span>
            <div className="flex items-center gap-1">
              {["WEEK", "MONTH", "YEAR"].map((period) => (
                <button key={period} onClick={() => setSelectedPeriod(period)}
                  className="px-3 py-1 text-2xs font-black uppercase tracking-superwide transition-colors"
                  style={{ background: selectedPeriod === period ? C : "transparent", color: CR, opacity: selectedPeriod === period ? 1 : 0.5 }}>
                  {period}
                </button>
              ))}
            </div>
          </div>
          <EarningsChart data={earningsChart} />
          <div className="grid grid-cols-3 border-t" style={{ borderColor: IK }}>
            <div className="px-6 py-4 border-r" style={{ borderColor: IK, background: CR }}>
              <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>THIS WEEK</span>
              <span className="text-lg font-black leading-none" style={{ color: C, letterSpacing: "-0.02em" }}>{fmtShortPrice(stats.weekly.earnings)}</span>
            </div>
            <div className="px-6 py-4 border-r" style={{ borderColor: IK, background: CR_ALT }}>
              <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>JOBS DONE</span>
              <span className="text-lg font-black leading-none" style={{ color: IK }}>{stats.weekly.completed_jobs}</span>
            </div>
            <div className="px-6 py-4" style={{ background: CR }}>
              <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>AVG / DAY</span>
              <span className="text-lg font-black leading-none" style={{ color: IK }}>{fmtShortPrice(Math.round(stats.weekly.earnings / 7))}</span>
            </div>
          </div>
        </div>

        {/* Two Column: Requests + Active Jobs */}
        <div className="grid lg:grid-cols-2 border-b" style={{ borderColor: IK }}>
          <div className="border-r" style={{ borderColor: IK }}>
            <SectionBar n="§ 001" title="RECENT REQUESTS" action={{ label: "VIEW ALL", link: "/provider/requests" }} />
            <div className="flex flex-col">
              {recentRequests.length > 0 ? (
                recentRequests.map((req) => <RequestMiniCard key={req.id} request={req} />)
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <span className="text-6xl font-black mb-4" style={{ color: IK, opacity: 0.06 }}>○</span>
                  <span className="text-xs font-black uppercase tracking-superwide" style={{ color: IK }}>NO PENDING REQUESTS</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <SectionBar n="§ 002" title="ACTIVE JOBS" action={{ label: "VIEW ALL", link: "/provider/jobs" }} />
            <div className="flex flex-col">
              {activeJobs.length > 0 ? (
                activeJobs.map((job) => <ActiveJobCard key={job.id} job={job} />)
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <span className="text-6xl font-black mb-4" style={{ color: IK, opacity: 0.06 }}>◆</span>
                  <span className="text-xs font-black uppercase tracking-superwide" style={{ color: IK }}>NO ACTIVE JOBS</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Bottom */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b" style={{ borderColor: IK }}>
          <div className="px-6 py-5 border-r" style={{ background: CR, borderColor: IK }}>
            <span className="text-2xs font-black uppercase tracking-superwide block mb-2" style={{ color: LIGHT_IK }}>RESPONSE RATE</span>
            <span className="text-2xl font-black leading-none" style={{ color: C }}>{stats.all_time.response_rate}%</span>
          </div>
          <div className="px-6 py-5 border-r" style={{ background: CR_ALT, borderColor: IK }}>
            <span className="text-2xs font-black uppercase tracking-superwide block mb-2" style={{ color: LIGHT_IK }}>AVG RESPONSE TIME</span>
            <span className="text-2xl font-black leading-none" style={{ color: IK }}>{stats.all_time.avg_response_minutes} MIN</span>
          </div>
          <div className="px-6 py-5 border-r" style={{ background: CR, borderColor: IK }}>
            <span className="text-2xs font-black uppercase tracking-superwide block mb-2" style={{ color: LIGHT_IK }}>MONTHLY EARNINGS</span>
            <span className="text-2xl font-black leading-none" style={{ color: C }}>{fmtShortPrice(stats.monthly.earnings)}</span>
          </div>
          <div className="px-6 py-5" style={{ background: CR_ALT }}>
            <span className="text-2xs font-black uppercase tracking-superwide block mb-2" style={{ color: LIGHT_IK }}>TOTAL COMPLETED</span>
            <span className="text-2xl font-black leading-none" style={{ color: IK }}>{stats.all_time.total_completed_jobs}</span>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}