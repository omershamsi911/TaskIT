/**
 * AdminDashboard.jsx
 * 
 * Flicker Fixes Applied:
 * - Replaced custom useToast/Toast with existing useNotify context (stable reference)
 * - Fixed useMediaQuery to eliminate dependency loop
 * - Removed all showToast prop drilling; each view calls useNotify directly
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useNotify } from "../context/NotificationContext";

// ─── Design tokens ──────────────────────────────────────────────────────
const T = {
  C:        "#FF5733",
  CR:       "#F5F0E6",
  IK:       "#1A1A1A",
  LIGHT_IK: "#6B6B6B",
  GREEN:    "#28c76f",
  RED:      "#ea5455",
  BLUE:     "#4A90E2",
  GOLD:     "#F5A623",
};

// ─── Tiny helpers ───────────────────────────────────────────────────────
const fmt  = (n) => Number(n || 0).toLocaleString("en-PK");
const fmtM = (n) => `Rs. ${fmt(n)}`;

// ─── API calls ──────────────────────────────────────────────────────────
const adminApi = {
  stats:        ()             => api.get("/admin/stats").then(r => r.data),
  bookings:     (p = 0)        => api.get(`/admin/bookings?skip=${p * 20}&limit=20`).then(r => r.data),
  disputes:     ()             => api.get("/admin/disputes").then(r => r.data),
  users:        (p = 0)        => api.get(`/admin/users?skip=${p * 20}&limit=20`).then(r => r.data),
  transactions: (p = 0)        => api.get(`/admin/transactions?skip=${p * 20}&limit=20`).then(r => r.data),
  sendAdminMsg: (disputeId, msg) => api.post(`/admin/disputes/${disputeId}/messages`, { content: msg }).then(r => r.data),
  getMessages:  (disputeId)    => api.get(`/admin/disputes/${disputeId}/messages`).then(r => r.data),
  resolveDispute:(disputeId, resolution) => api.patch(`/admin/disputes/${disputeId}/resolve`, { resolution }).then(r => r.data),
  openDispute:  (bookingId, reason) => api.post("/admin/disputes", { booking_id: bookingId, reason }).then(r => r.data),
  updateBookingStatus: (id, status) => api.patch(`/admin/bookings/${id}/status?status=${status}`).then(r => r.data),
};

// ─── Fixed media query hook ─────────────────────────────────────────────
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (event) => setMatches(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
};

// ─── Shared sub-components ──────────────────────────────────────────────
const Bar = ({ pct, color = T.C, height = 28 }) => (
  <div style={{ background: `${T.IK}10`, height, flex: 1, position: "relative", overflow: "hidden", borderRadius: 2 }}>
    <div style={{
      position: "absolute", left: 0, top: 0, bottom: 0,
      width: `${Math.min(pct, 100)}%`,
      background: color, transition: "width 0.6s ease", borderRadius: 2,
    }} />
  </div>
);

const KPI = ({ label, value, sub, color = T.C, icon }) => (
  <div style={{ background: "#fff", border: `1px solid ${T.IK}`, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>{label}</span>
      <span style={{ fontSize: 18, opacity: 0.15 }}>{icon}</span>
    </div>
    <span style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
    {sub && <span style={{ fontSize: 10, fontWeight: 700, color: T.LIGHT_IK }}>{sub}</span>}
  </div>
);

const SectionBar = ({ left, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 24px", background: T.IK }}>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>{left}</span>
    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f5f0e6", opacity: 0.5 }}>{right}</span>
  </div>
);

const Badge = ({ status }) => {
  const map = {
    requested:  { bg: "#4A90E210", border: "#4A90E2", color: "#4A90E2", label: "REQUESTED" },
    accepted:   { bg: "#28c76f10", border: T.GREEN,   color: T.GREEN,   label: "ACCEPTED"  },
    completed:  { bg: "#28c76f20", border: T.GREEN,   color: T.GREEN,   label: "COMPLETED" },
    cancelled:  { bg: "#ea545510", border: T.RED,     color: T.RED,     label: "CANCELLED" },
    rejected:   { bg: "#ea545510", border: T.RED,     color: T.RED,     label: "REJECTED"  },
    open:       { bg: "#F5A62310", border: T.GOLD,    color: T.GOLD,    label: "OPEN"      },
    resolved:   { bg: "#28c76f10", border: T.GREEN,   color: T.GREEN,   label: "RESOLVED"  },
    credit:     { bg: "#28c76f10", border: T.GREEN,   color: T.GREEN,   label: "CREDIT"    },
    debit:      { bg: "#ea545510", border: T.RED,     color: T.RED,     label: "DEBIT"     },
    topup:      { bg: "#4A90E210", border: T.BLUE,    color: T.BLUE,    label: "TOP-UP"    },
    customer:   { bg: "#4A90E210", border: T.BLUE,    color: T.BLUE,    label: "CUSTOMER"  },
    provider:   { bg: "#F5A62310", border: T.GOLD,    color: T.GOLD,    label: "PROVIDER"  },
  };
  const s = map[status] || { bg: "#6b6b6b10", border: T.LIGHT_IK, color: T.LIGHT_IK, label: (status || "?").toUpperCase() };
  return (
    <span style={{ padding: "3px 8px", fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {s.label}
    </span>
  );
};

const NavItem = ({ icon, label, active, onClick, badge, collapsed }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12,
      padding: collapsed ? "12px 0" : "12px 20px",
      justifyContent: collapsed ? "center" : "flex-start",
      background: active ? T.C : "transparent",
      color: active ? "#fff" : T.LIGHT_IK, border: "none", cursor: "pointer",
      fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em",
      fontFamily: "inherit", transition: "all 0.15s", position: "relative",
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = `${T.C}20`; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
  >
    <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</span>
    {!collapsed && label}
    {badge > 0 && (
      <span style={{
        marginLeft: collapsed ? 0 : "auto",
        position: collapsed ? "absolute" : "relative",
        top: collapsed ? 6 : "auto",
        right: collapsed ? 6 : "auto",
        minWidth: 18, height: 18,
        background: active ? "#fff" : T.C,
        color: active ? T.C : "#fff",
        borderRadius: "50%", fontSize: 9, fontWeight: 900,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
      }}>
        {badge}
      </span>
    )}
  </button>
);

const Loader = () => (
  <div style={{ padding: "80px 0", textAlign: "center", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>
    LOADING...
  </div>
);

const Empty = ({ msg }) => (
  <div style={{ padding: "64px 32px", textAlign: "center" }}>
    <div style={{ fontSize: 40, fontWeight: 900, color: T.IK, opacity: 0.06, marginBottom: 12 }}>◈</div>
    <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, margin: 0 }}>{msg}</p>
  </div>
);

const PageBtn = ({ label, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "7px 16px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
      background: disabled ? "transparent" : T.IK,
      color: disabled ? T.LIGHT_IK : "#fff",
      border: `1px solid ${disabled ? T.LIGHT_IK : T.IK}`,
      cursor: disabled ? "default" : "pointer",
      fontFamily: "inherit", opacity: disabled ? 0.4 : 1,
      transition: "all 0.15s",
    }}
  >
    {label}
  </button>
);

// ─── VIEWS ──────────────────────────────────────────────────────────────

const OverviewView = ({ stats, loading }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (loading) return <Loader />;
  if (!stats) return <Empty msg="No stats available." />;

  const bookingStatuses = [
    { label: "Completed", val: stats.bookings_by_status?.completed || 0, color: T.GREEN },
    { label: "Accepted",  val: stats.bookings_by_status?.accepted  || 0, color: T.BLUE  },
    { label: "Requested", val: stats.bookings_by_status?.requested || 0, color: T.GOLD  },
    { label: "Cancelled", val: stats.bookings_by_status?.cancelled || 0, color: T.RED   },
    { label: "Rejected",  val: stats.bookings_by_status?.rejected  || 0, color: "#aaa"  },
  ];
  const maxBooking = Math.max(...bookingStatuses.map(b => b.val), 1);

  return (
    <div style={{ padding: isMobile ? 16 : 32, display: "flex", flexDirection: "column", gap: isMobile ? 20 : 32 }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        <KPI label="Total Users"      value={fmt(stats.total_users)}         icon="👤" color={T.IK}   sub={`${fmt(stats.active_providers)} providers`} />
        <KPI label="Total Bookings"   value={fmt(stats.total_bookings)}       icon="📋" color={T.C}   sub={`${fmt(stats.bookings_by_status?.completed)} completed`} />
        <KPI label="Total Revenue"    value={fmtM(stats.total_revenue)}       icon="💰" color={T.GREEN} sub="platform earnings" />
        <KPI label="Wallet Deposits"  value={fmtM(stats.total_wallet_topups)} icon="🏦" color={T.BLUE}  sub="all-time top-ups" />
        <KPI label="Open Disputes"    value={fmt(stats.open_disputes)}        icon="⚠️" color={T.GOLD}  sub="needs attention" />
        <KPI label="Active Providers" value={fmt(stats.active_providers)}     icon="🔧" color={T.IK}  />
      </div>

      <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
        <SectionBar left="BOOKINGS BY STATUS" right="DISTRIBUTION" />
        <div style={{ padding: isMobile ? "16px 20px" : "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          {bookingStatuses.map(bs => (
            <div key={bs.label} style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 16 }}>
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, width: isMobile ? 70 : 80, flexShrink: 0 }}>
                {bs.label}
              </span>
              <Bar pct={(bs.val / maxBooking) * 100} color={bs.color} />
              <span style={{ fontSize: 13, fontWeight: 900, color: bs.color, width: 50, textAlign: "right", flexShrink: 0 }}>
                {fmt(bs.val)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {stats.recent_bookings?.length > 0 && (
        <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
          <SectionBar left="RECENT BOOKINGS" right="LAST 5" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: `${T.IK}08` }}>
                  {["ID", "Customer", "Service", "Date", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, borderBottom: `1px solid ${T.IK}20` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent_bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: `1px solid ${T.IK}10` }}>
                    <td style={{ padding: "10px 16px", color: T.LIGHT_IK, fontSize: 10 }}>#{b.id}</td>
                    <td style={{ padding: "10px 16px", fontWeight: 700 }}>{b.customer_name || "—"}</td>
                    <td style={{ padding: "10px 16px", color: T.LIGHT_IK }}>{b.service_title || "—"}</td>
                    <td style={{ padding: "10px 16px", color: T.LIGHT_IK }}>{b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "10px 16px" }}><Badge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const BookingsView = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const notify = useNotify();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBookings(await adminApi.bookings(page));
    } catch (e) {
      console.error(e);
      // notify("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  }, [page, notify]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (id, status) => {
    try {
      await adminApi.updateBookingStatus(id, status);
      notify(`Booking #${id} status updated to ${status}`, "success");
      load();
    } catch (e) {
      notify("Failed: " + (e.response?.data?.detail || e.message), "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ padding: isMobile ? 16 : 32 }}>
      <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
        <SectionBar left="ALL BOOKINGS" right={`PAGE ${page + 1}`} />
        {bookings.length === 0 ? (
          <Empty msg="No bookings found." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 800 }}>
              <thead>
                <tr style={{ background: `${T.IK}08` }}>
                  {["ID", "Customer", "Provider", "Service", "Address", "Scheduled", "Amount", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, borderBottom: `1px solid ${T.IK}20`, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr
                    key={b.id}
                    style={{ borderBottom: `1px solid ${T.IK}08`, transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = `${T.IK}04`}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "10px 16px", color: T.LIGHT_IK, fontSize: 10 }}>#{b.id}</td>
                    <td style={{ padding: "10px 16px", fontWeight: 700, whiteSpace: "nowrap" }}>{b.customer_name || `User #${b.user_id}`}</td>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>{b.provider_name || `Prov #${b.provider_id}`}</td>
                    <td style={{ padding: "10px 16px" }}>{b.service_title || "—"}</td>
                    <td style={{ padding: "10px 16px", color: T.LIGHT_IK, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {b.address}
                    </td>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                      {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : "—"}
                    </td>
                    <td style={{ padding: "10px 16px", fontWeight: 900, color: T.C, whiteSpace: "nowrap" }}>
                      Rs. {fmt(b.service_price)}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <Badge status={b.status} />
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <select
                        defaultValue=""
                        onChange={e => {
                          if (e.target.value) changeStatus(b.id, e.target.value);
                          e.target.value = "";
                        }}
                        style={{ fontSize: 9, fontWeight: 700, padding: "4px 8px", border: `1px solid ${T.IK}`, background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        <option value="" disabled>SET STATUS</option>
                        {["requested", "accepted", "completed", "cancelled", "rejected"].map(s => (
                          <option key={s} value={s}>{s.toUpperCase()}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 24px", borderTop: `1px solid ${T.IK}10` }}>
          <PageBtn label="← PREV" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} />
          <PageBtn label="NEXT →" disabled={bookings.length < 20} onClick={() => setPage(p => p + 1)} />
        </div>
      </div>
    </div>
  );
};

const UsersView = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const notify = useNotify();

  useEffect(() => {
    setLoading(true);
    adminApi
      .users(page)
      .then(setUsers)
      .catch((e) => {
        console.error(e);
        notify("Failed to load users", "error");
      })
      .finally(() => setLoading(false));
  }, [page, notify]);

  const filtered = users.filter(
    u =>
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  if (loading) return <Loader />;

  return (
    <div style={{ padding: isMobile ? 16 : 32 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <input
            placeholder="SEARCH BY NAME / EMAIL / PHONE..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "12px 16px 12px 44px", fontSize: 10,
              fontWeight: 700, letterSpacing: "0.1em", border: `1px solid ${T.IK}`,
              background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
          <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: T.LIGHT_IK }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>
      <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
        <SectionBar left="ALL USERS" right={`${filtered.length} SHOWN`} />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 700 }}>
            <thead>
              <tr style={{ background: `${T.IK}08` }}>
                {["ID", "Name", "Email", "Phone", "Role", "Wallet Balance", "Joined"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, borderBottom: `1px solid ${T.IK}20`, whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr
                  key={u.id}
                  style={{ borderBottom: `1px solid ${T.IK}08`, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = `${T.IK}04`}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "10px 16px", color: T.LIGHT_IK, fontSize: 10 }}>#{u.id}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 700 }}>{u.full_name}</td>
                  <td style={{ padding: "10px 16px", color: T.LIGHT_IK }}>{u.email || "—"}</td>
                  <td style={{ padding: "10px 16px" }}>{u.phone}</td>
                  <td style={{ padding: "10px 16px" }}><Badge status={u.role} /></td>
                  <td style={{ padding: "10px 16px", fontWeight: 900, color: T.GREEN }}>Rs. {fmt(u.wallet_balance)}</td>
                  <td style={{ padding: "10px 16px", color: T.LIGHT_IK }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 24px", borderTop: `1px solid ${T.IK}10` }}>
          <PageBtn label="← PREV" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} />
          <PageBtn label="NEXT →" disabled={users.length < 20} onClick={() => setPage(p => p + 1)} />
        </div>
      </div>
    </div>
  );
};

const TransactionsView = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const notify = useNotify();

  useEffect(() => {
    setLoading(true);
    adminApi
      .transactions(page)
      .then(setTxns)
      .catch((e) => {
        console.error(e);
        notify("Failed to load transactions", "error");
      })
      .finally(() => setLoading(false));
  }, [page, notify]);

  if (loading) return <Loader />;

  const totals = txns.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + Number(t.amount);
    return acc;
  }, {});

  return (
    <div style={{ padding: isMobile ? 16 : 32, display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
        <KPI label="Credits (this page)" value={fmtM(totals.credit)} icon="↑" color={T.GREEN} />
        <KPI label="Debits (this page)"  value={fmtM(totals.debit)}  icon="↓" color={T.RED}   />
        <KPI label="Top-ups (this page)" value={fmtM(totals.topup)}  icon="+" color={T.BLUE}  />
      </div>

      <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
        <SectionBar left="WALLET TRANSACTIONS" right={`PAGE ${page + 1}`} />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 800 }}>
            <thead>
              <tr style={{ background: `${T.IK}08` }}>
                {["ID", "User", "Type", "Amount", "Balance After", "Booking", "Note", "Date"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, borderBottom: `1px solid ${T.IK}20`, whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr
                  key={t.id}
                  style={{ borderBottom: `1px solid ${T.IK}08`, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = `${T.IK}04`}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "10px 16px", color: T.LIGHT_IK, fontSize: 10 }}>#{t.id}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 700 }}>{t.user_name || `#${t.user_id}`}</td>
                  <td style={{ padding: "10px 16px" }}><Badge status={t.type} /></td>
                  <td style={{ padding: "10px 16px", fontWeight: 900, color: t.type === "debit" ? T.RED : T.GREEN }}>
                    {t.type === "debit" ? "-" : "+"}Rs. {fmt(t.amount)}
                  </td>
                  <td style={{ padding: "10px 16px" }}>Rs. {fmt(t.balance_after)}</td>
                  <td style={{ padding: "10px 16px", color: T.LIGHT_IK }}>{t.booking_id ? `#${t.booking_id}` : "—"}</td>
                  <td style={{ padding: "10px 16px", color: T.LIGHT_IK, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.note || "—"}
                  </td>
                  <td style={{ padding: "10px 16px", color: T.LIGHT_IK, whiteSpace: "nowrap" }}>
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 24px", borderTop: `1px solid ${T.IK}10` }}>
          <PageBtn label="← PREV" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} />
          <PageBtn label="NEXT →" disabled={txns.length < 20} onClick={() => setPage(p => p + 1)} />
        </div>
      </div>
    </div>
  );
};

const DisputeThread = ({ dispute, onClose, onResolve }) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [resText, setResText] = useState("");
  const [resolving, setResolving] = useState(false);
  const notify = useNotify();

  const loadMsgs = useCallback(async () => {
    try {
      setMsgs(await adminApi.getMessages(dispute.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dispute.id]);

  useEffect(() => {
    loadMsgs();
  }, [loadMsgs]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await adminApi.sendAdminMsg(dispute.id, text.trim());
      setText("");
      notify("Message sent", "success");
      await loadMsgs();
    } catch (e) {
      notify("Send failed: " + (e.response?.data?.detail || e.message), "error");
    } finally {
      setSending(false);
    }
  };

  const resolve = async () => {
    if (!resText.trim()) {
      notify("Please enter a resolution note", "error");
      return;
    }
    setResolving(true);
    try {
      await adminApi.resolveDispute(dispute.id, resText.trim());
      notify("Dispute resolved successfully", "success");
      onResolve();
    } catch (e) {
      notify("Resolve failed: " + (e.response?.data?.detail || e.message), "error");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000, background: "rgba(26,26,26,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.CR, border: `1px solid ${T.IK}`, width: "100%", maxWidth: 620,
          maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "fadeIn 0.2s ease",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: isMobile ? "12px 16px" : "14px 24px", background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>
            DISPUTE #{dispute.id} — BOOKING #{dispute.booking_id}
          </span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#f5f0e6", cursor: "pointer", fontSize: 16, padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "12px 24px", background: `${T.GOLD}10`, borderBottom: `1px solid ${T.GOLD}30`, flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.GOLD }}>REASON: </span>
          <span style={{ fontSize: 11, color: T.IK }}>{dispute.reason || "No reason specified."}</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <Loader />
          ) : msgs.length === 0 ? (
            <div style={{ textAlign: "center", color: T.LIGHT_IK, fontSize: 11, fontWeight: 700, padding: 32 }}>
              No messages yet. Start the conversation below.
            </div>
          ) : (
            msgs.map((m, i) => {
              const isAdmin = m.sender_role === "admin";
              return (
                <div key={i} style={{ display: "flex", flexDirection: isAdmin ? "row-reverse" : "row", gap: 8 }}>
                  <div style={{ maxWidth: "75%" }}>
                    <div style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, marginBottom: 4, textAlign: isAdmin ? "right" : "left" }}>
                      {isAdmin ? "ADMIN" : (m.sender_name || `USER #${m.sender_id}`)} · {new Date(m.created_at).toLocaleTimeString()}
                    </div>
                    <div style={{ padding: "10px 14px", background: isAdmin ? T.IK : "#fff", color: isAdmin ? "#fff" : T.IK, fontSize: 12, lineHeight: 1.5, border: `1px solid ${T.IK}20` }}>
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {dispute.status !== "resolved" && (
          <>
            <div style={{ padding: isMobile ? "10px 16px" : "12px 24px", borderTop: `1px solid ${T.IK}20`, display: "flex", gap: 10, flexShrink: 0 }}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="TYPE A MESSAGE AS ADMIN..."
                style={{ flex: 1, padding: "10px 14px", fontSize: 11, border: `1px solid ${T.IK}`, background: "#fff", outline: "none", fontFamily: "inherit" }}
              />
              <button
                onClick={send}
                disabled={sending || !text.trim()}
                style={{ padding: "10px 20px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: sending || !text.trim() ? T.LIGHT_IK : T.C, color: "#fff", border: "none", cursor: sending || !text.trim() ? "not-allowed" : "pointer", flexShrink: 0, fontFamily: "inherit" }}
              >
                {sending ? "..." : "SEND →"}
              </button>
            </div>

            <div style={{ padding: isMobile ? "10px 16px" : "12px 24px", borderTop: `1px solid ${T.IK}20`, background: `${T.GREEN}08`, flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.GREEN, marginBottom: 8 }}>
                MARK AS RESOLVED
              </div>
              <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
                <input
                  value={resText}
                  onChange={e => setResText(e.target.value)}
                  placeholder="Enter resolution note..."
                  style={{ flex: 1, padding: "9px 12px", fontSize: 11, border: `1px solid ${T.GREEN}40`, background: "#fff", outline: "none", fontFamily: "inherit" }}
                />
                <button
                  onClick={resolve}
                  disabled={resolving}
                  style={{ padding: "9px 18px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: T.GREEN, color: "#fff", border: "none", cursor: resolving ? "not-allowed" : "pointer", flexShrink: 0, fontFamily: "inherit" }}
                >
                  {resolving ? "..." : "RESOLVE ✓"}
                </button>
              </div>
            </div>
          </>
        )}

        {dispute.status === "resolved" && dispute.resolution && (
          <div style={{ padding: "12px 24px", borderTop: `1px solid ${T.GREEN}30`, background: `${T.GREEN}10`, flexShrink: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", color: T.GREEN }}>RESOLUTION: </span>
            <span style={{ fontSize: 11, color: T.IK }}>{dispute.resolution}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const DisputesView = ({ refreshStats }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const notify = useNotify();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDisputes(await adminApi.disputes());
    } catch (e) {
      console.error(e);
      notify("Failed to load disputes", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = disputes.filter(d => filter === "all" || d.status === filter);

  if (loading) return <Loader />;

  return (
    <div style={{ padding: isMobile ? 16 : 32 }}>
      <div style={{ display: "flex", gap: 0, marginBottom: 20, border: `1px solid ${T.IK}`, width: "fit-content" }}>
        {["all", "open", "resolved"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: isMobile ? "10px 16px" : "8px 20px",
              fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em",
              background: filter === f ? T.C : "transparent",
              color: filter === f ? "#fff" : T.IK,
              border: "none",
              borderRight: f !== "resolved" ? `1px solid ${T.IK}` : "none",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
        <SectionBar left="DISPUTES & COMPLAINTS" right={`${filtered.length} FOUND`} />
        {filtered.length === 0 ? (
          <Empty msg="No disputes found." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map(d => (
              <div
                key={d.id}
                style={{
                  padding: isMobile ? "12px 16px" : "16px 24px",
                  borderBottom: `1px solid ${T.IK}10`,
                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${T.IK}04`}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 10, fontWeight: 900, color: T.LIGHT_IK, width: 50 }}>#{d.id}</span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.IK, marginBottom: 4 }}>{d.reason || "Dispute"}</div>
                  <div style={{ fontSize: 9, color: T.LIGHT_IK }}>
                    Booking #{d.booking_id} · Reported by {d.reporter_name || `#${d.reporter_id}`} · {new Date(d.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge status={d.status} />
                <button
                  onClick={() => setSelected(d)}
                  style={{
                    padding: "8px 16px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                    background: d.status === "open" ? T.C : T.IK, color: "#fff", border: "none", cursor: "pointer",
                    flexShrink: 0, fontFamily: "inherit", transition: "transform 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  {d.status === "open" ? "HANDLE →" : "VIEW →"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <DisputeThread
          dispute={selected}
          onClose={() => setSelected(null)}
          onResolve={() => {
            setSelected(null);
            load();
            refreshStats();
          }}
        />
      )}
    </div>
  );
};

// ─── MAIN ADMIN DASHBOARD ──────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const [view, setView] = useState("overview");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [sideOpen, setSideOpen] = useState(!isTablet);
  const notify = useNotify();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const u = userStr
      ? (() => {
          try {
            return JSON.parse(userStr);
          } catch {
            return null;
          }
        })()
      : null;
    if (!u) {
      navigate("/login");
      return;
    }
    if (u.email !== "admin@admin.com") {
      navigate("/services");
    }
  }, [navigate]);

  useEffect(() => {
    setSideOpen(!isTablet);
  }, [isTablet]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      setStats(await adminApi.stats());
    } catch (e) {
      console.error(e);
      notify("Failed to load stats", "error");
    } finally {
      setStatsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const openDisputeCount = stats?.open_disputes || 0;

  const navItems = [
    { id: "overview", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>, label: "Overview" },
    { id: "bookings", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>, label: "Bookings" },
    { id: "users", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, label: "Users" },
    { id: "transactions", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>, label: "Transactions" },
    { id: "disputes", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>, label: "Disputes", badge: openDisputeCount },
  ];

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    // notify("Logged out successfully", "success");
    setTimeout(() => navigate("/login"), 500);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.CR, display: "flex", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", position: "relative" }}>
      {/* Grid overlay */}
      <div style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 0, opacity: 0.025, backgroundImage: `linear-gradient(${T.IK} 1px, transparent 1px), linear-gradient(90deg, ${T.IK} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

      {/* Mobile overlay */}
      {isMobile && sideOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 15 }} onClick={() => setSideOpen(false)} />
      )}

      {/* Sidebar */}
      <div style={{
        position: isMobile ? "fixed" : "relative",
        left: isMobile && !sideOpen ? -240 : 0,
        top: 0, bottom: 0, zIndex: 20,
        width: sideOpen ? 220 : 56,
        background: T.CR, borderRight: `1px solid ${T.IK}`, flexShrink: 0,
        display: "flex", flexDirection: "column", transition: "all 0.2s ease", overflow: "hidden",
      }}>
        <div style={{ padding: sideOpen ? "24px 20px 20px" : "24px 16px 20px", borderBottom: `1px solid ${T.IK}`, flexShrink: 0 }}>
          {sideOpen ? (
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: T.IK, lineHeight: 0.9 }}>
                TASK<span style={{ color: T.C }}>IT</span>
              </div>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: T.C, marginTop: 4 }}>
                ADMIN PANEL
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 16, fontWeight: 900, color: T.C, textAlign: "center" }}>T</div>
          )}
        </div>

        <button
          onClick={() => setSideOpen(o => !o)}
          style={{ padding: "10px", fontSize: 10, background: "transparent", border: "none", borderBottom: `1px solid ${T.IK}`, cursor: "pointer", color: T.LIGHT_IK, fontFamily: "inherit", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          {sideOpen ? (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg> COLLAPSE</>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          )}
        </button>

        <nav style={{ flex: 1, paddingTop: 8 }}>
          {navItems.map(n => (
            <NavItem
              key={n.id}
              icon={n.icon}
              label={n.label}
              active={view === n.id}
              onClick={() => {
                setView(n.id);
                if (isMobile) setSideOpen(false);
              }}
              badge={n.badge}
              collapsed={!sideOpen}
            />
          ))}
        </nav>

        <div style={{ borderTop: `1px solid ${T.IK}`, flexShrink: 0 }}>
          <NavItem
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
            label="Main App"
            onClick={() => navigate("/services")}
            collapsed={!sideOpen}
          />
          <NavItem
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>}
            label="Logout"
            onClick={logout}
            collapsed={!sideOpen}
          />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", position: "relative", zIndex: 1 }}>
        <div style={{ padding: isMobile ? "12px 16px" : "14px 32px", borderBottom: `1px solid ${T.IK}`, background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button onClick={() => setSideOpen(true)} style={{ background: "transparent", border: "none", color: T.CR, cursor: "pointer", padding: 4, display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>
              {navItems.find(n => n.id === view)?.label?.toUpperCase() || "ADMIN"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {openDisputeCount > 0 && !isMobile && (
              <button
                onClick={() => setView("disputes")}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: `${T.GOLD}20`, border: `1px solid ${T.GOLD}`, color: T.GOLD, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit" }}
              >
                {openDisputeCount} OPEN DISPUTE{openDisputeCount > 1 ? "S" : ""}
              </button>
            )}
            <span style={{ fontSize: 9, fontWeight: 700, color: "#f5f0e660" }}>admin@admin.com</span>
          </div>
        </div>

        {view === "overview"     && <OverviewView stats={stats} loading={statsLoading} />}
        {view === "bookings"     && <BookingsView />}
        {view === "users"        && <UsersView />}
        {view === "transactions" && <TransactionsView />}
        {view === "disputes"     && <DisputesView refreshStats={loadStats} />}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;