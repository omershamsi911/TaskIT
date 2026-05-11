/**
 * AdminDashboard.jsx
 *
 * Place this file at:  src/pages/AdminDashboard.jsx
 *
 * Wire it up in your router (e.g. App.jsx):
 *
 *   import AdminDashboard from "./pages/AdminDashboard";
 *   <Route path="/admin" element={<AdminDashboard />} />
 *
 * In your Login.jsx onSubmit, after resolving the user, add:
 *
 *   if (userData.email === "admin@admin.com") {
 *     navigate("/admin");
 *   } else {
 *     navigate("/services");
 *   }
 *
 * The dashboard calls a set of admin API endpoints described in the
 * companion file  admin_router.py  (see AdminRouter.py output).
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useNotify } from "../context/NotificationContext";

// ─── Design tokens (match rest of app) ───────────────────────────
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

// ─── Tiny helpers ─────────────────────────────────────────────────
const fmt  = (n) => Number(n || 0).toLocaleString("en-PK");
const fmtM = (n) => `Rs. ${fmt(n)}`;

// ─── API calls ────────────────────────────────────────────────────
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

// ─── Sub-components ────────────────────────────────────────────────

/** Tiny bar used in charts */
const Bar = ({ pct, color = T.C, height = 28 }) => (
  <div style={{ background: `${T.IK}10`, height, flex: 1, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min(pct, 100)}%`, background: color, transition: "width 0.6s ease" }} />
  </div>
);

/** Stat card */
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

/** Section header bar */
const SectionBar = ({ left, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 24px", background: T.IK, marginBottom: 0 }}>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>{left}</span>
    <span style={{ fontSize: 9,  fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f5f0e6", opacity: 0.5 }}>{right}</span>
  </div>
);

/** Status badge */
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
  };
  const s = map[status] || { bg: "#6b6b6b10", border: T.LIGHT_IK, color: T.LIGHT_IK, label: (status || "?").toUpperCase() };
  return (
    <span style={{ padding: "3px 8px", fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {s.label}
    </span>
  );
};

/** Sidebar nav item */
const NavItem = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12,
      padding: "12px 20px", background: active ? T.C : "transparent",
      color: active ? "#fff" : T.LIGHT_IK, border: "none", cursor: "pointer",
      fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em",
      fontFamily: "inherit", transition: "all 0.1s", position: "relative",
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = `${T.C}20`; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
  >
    <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{icon}</span>
    {label}
    {badge > 0 && (
      <span style={{ marginLeft: "auto", minWidth: 18, height: 18, background: active ? "#fff" : T.C, color: active ? T.C : "#fff", borderRadius: "50%", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
        {badge}
      </span>
    )}
  </button>
);

// ─── VIEWS ────────────────────────────────────────────────────────

/** Overview / Stats view */
const OverviewView = ({ stats, loading }) => {
  if (loading) return <Loader />;
  if (!stats)  return <Empty msg="No stats available." />;

  const bookingStatuses = [
    { label: "Completed", val: stats.bookings_by_status?.completed || 0, color: T.GREEN },
    { label: "Accepted",  val: stats.bookings_by_status?.accepted  || 0, color: T.BLUE  },
    { label: "Requested", val: stats.bookings_by_status?.requested || 0, color: T.GOLD  },
    { label: "Cancelled", val: stats.bookings_by_status?.cancelled || 0, color: T.RED   },
    { label: "Rejected",  val: stats.bookings_by_status?.rejected  || 0, color: "#aaa"  },
  ];
  const maxBooking = Math.max(...bookingStatuses.map(b => b.val), 1);

  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 32 }}>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        <KPI label="Total Users"         value={fmt(stats.total_users)}         icon="👤" color={T.IK}   sub={`${fmt(stats.active_providers)} providers`} />
        <KPI label="Total Bookings"      value={fmt(stats.total_bookings)}       icon="📋" color={T.C}   sub={`${fmt(stats.bookings_by_status?.completed)} completed`} />
        <KPI label="Total Revenue"       value={fmtM(stats.total_revenue)}       icon="💰" color={T.GREEN} sub="platform earnings" />
        <KPI label="Wallet Deposits"     value={fmtM(stats.total_wallet_topups)} icon="🏦" color={T.BLUE}  sub="all-time top-ups" />
        <KPI label="Open Disputes"       value={fmt(stats.open_disputes)}        icon="⚠️" color={T.GOLD}  sub="needs attention" />
        <KPI label="Active Providers"    value={fmt(stats.active_providers)}     icon="🔧" color={T.IK}  />
      </div>

      {/* Booking status breakdown */}
      <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
        <SectionBar left="BOOKINGS BY STATUS" right="DISTRIBUTION" />
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          {bookingStatuses.map(bs => (
            <div key={bs.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, width: 80, flexShrink: 0 }}>{bs.label}</span>
              <Bar pct={(bs.val / maxBooking) * 100} color={bs.color} />
              <span style={{ fontSize: 13, fontWeight: 900, color: bs.color, width: 50, textAlign: "right", flexShrink: 0 }}>{fmt(bs.val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent 5 bookings quick view */}
      {stats.recent_bookings?.length > 0 && (
        <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
          <SectionBar left="RECENT BOOKINGS" right="LAST 5" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: `${T.IK}08` }}>
                  {["ID", "Customer", "Service", "Date", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, borderBottom: `1px solid ${T.IK}20` }}>{h}</th>
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

/** Bookings management view */
const BookingsView = () => {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(0);
  const notify = useNotify();

  const load = useCallback(async () => {
    setLoading(true);
    try { setBookings(await adminApi.bookings(page)); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, status) => {
    try {
      await adminApi.updateBookingStatus(id, status);
      load();
    } catch(e) { notify("Failed: " + (e.response?.data?.detail || e.message), "error"); }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
        <SectionBar left={`ALL BOOKINGS`} right={`PAGE ${page + 1}`} />
        {bookings.length === 0 ? <Empty msg="No bookings found." /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: `${T.IK}08` }}>
                  {["ID","Customer","Provider","Service","Address","Scheduled","Amount","Status","Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, borderBottom: `1px solid ${T.IK}20`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: `1px solid ${T.IK}08` }}
                    onMouseEnter={e => e.currentTarget.style.background = `${T.IK}04`}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "10px 16px", color: T.LIGHT_IK, fontSize: 10 }}>#{b.id}</td>
                    <td style={{ padding: "10px 16px", fontWeight: 700, whiteSpace: "nowrap" }}>{b.customer_name || `User #${b.user_id}`}</td>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>{b.provider_name || `Prov #${b.provider_id}`}</td>
                    <td style={{ padding: "10px 16px" }}>{b.service_title || "—"}</td>
                    <td style={{ padding: "10px 16px", color: T.LIGHT_IK, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.address}</td>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>{b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : "—"}</td>
                    <td style={{ padding: "10px 16px", fontWeight: 900, color: T.C, whiteSpace: "nowrap" }}>Rs. {fmt(b.service_price)}</td>
                    <td style={{ padding: "10px 16px" }}><Badge status={b.status} /></td>
                    <td style={{ padding: "10px 16px" }}>
                      <select
                        defaultValue=""
                        onChange={e => { if (e.target.value) changeStatus(b.id, e.target.value); e.target.value = ""; }}
                        style={{ fontSize: 9, fontWeight: 700, padding: "4px 8px", border: `1px solid ${T.IK}`, background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        <option value="" disabled>SET STATUS</option>
                        {["requested","accepted","completed","cancelled","rejected"].map(s => (
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
        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 24px", borderTop: `1px solid ${T.IK}10` }}>
          <PageBtn label="← PREV" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} />
          <PageBtn label="NEXT →" disabled={bookings.length < 20} onClick={() => setPage(p => p + 1)} />
        </div>
      </div>
    </div>
  );
};

/** Users view */
const UsersView = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(0);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    setLoading(true);
    adminApi.users(page)
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  if (loading) return <Loader />;

  return (
    <div style={{ padding: 32 }}>
      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="SEARCH BY NAME / EMAIL / PHONE..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 16px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", border: `1px solid ${T.IK}`, background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        />
      </div>
      <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
        <SectionBar left="ALL USERS" right={`${filtered.length} SHOWN`} />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: `${T.IK}08` }}>
                {["ID","Name","Email","Phone","Role","Wallet Balance","Joined"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, borderBottom: `1px solid ${T.IK}20`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${T.IK}08` }}
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

/** Transactions view */
const TransactionsView = () => {
  const [txns,    setTxns]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(0);

  useEffect(() => {
    setLoading(true);
    adminApi.transactions(page)
      .then(setTxns)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Loader />;

  const totals = txns.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + Number(t.amount);
    return acc;
  }, {});

  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <KPI label="Credits (this page)"  value={fmtM(totals.credit)} icon="↑" color={T.GREEN} />
        <KPI label="Debits (this page)"   value={fmtM(totals.debit)}  icon="↓" color={T.RED}   />
        <KPI label="Top-ups (this page)"  value={fmtM(totals.topup)}  icon="+" color={T.BLUE}  />
      </div>

      <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
        <SectionBar left="WALLET TRANSACTIONS" right={`PAGE ${page + 1}`} />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: `${T.IK}08` }}>
                {["ID","User","Type","Amount","Balance After","Booking","Note","Date"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, borderBottom: `1px solid ${T.IK}20`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${T.IK}08` }}
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
                  <td style={{ padding: "10px 16px", color: T.LIGHT_IK, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.note || "—"}</td>
                  <td style={{ padding: "10px 16px", color: T.LIGHT_IK, whiteSpace: "nowrap" }}>{new Date(t.created_at).toLocaleString()}</td>
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

/** Dispute thread sub-panel */
const DisputeThread = ({ dispute, onClose, onResolve }) => {
  const [msgs,     setMsgs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState("");
  const [sending,  setSending]  = useState(false);
  const [resText,  setResText]  = useState("");
  const [resolving,setResolving]= useState(false);

  const loadMsgs = useCallback(async () => {
    try { setMsgs(await adminApi.getMessages(dispute.id)); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [dispute.id]);

  useEffect(() => { loadMsgs(); }, [loadMsgs]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await adminApi.sendAdminMsg(dispute.id, text.trim());
      setText("");
      await loadMsgs();
    } catch(e) { notify("Send failed: " + (e.response?.data?.detail || e.message), "error"); }
    finally { setSending(false); }
  };

  const resolve = async () => {
    if (!resText.trim()) { notify("Please enter a resolution note.", "error"); return; }
    setResolving(true);
    try {
      await adminApi.resolveDispute(dispute.id, resText.trim());
      onResolve();
    } catch(e) { notify("Resolve failed: " + (e.response?.data?.detail || e.message), "error"); }
    finally { setResolving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(26,26,26,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: T.CR, border: `1px solid ${T.IK}`, width: "100%", maxWidth: 620, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "14px 24px", background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>
            DISPUTE #{dispute.id} — BOOKING #{dispute.booking_id}
          </span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#f5f0e6", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {/* Reason */}
        <div style={{ padding: "12px 24px", background: `${T.GOLD}10`, borderBottom: `1px solid ${T.GOLD}30`, flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.GOLD }}>REASON: </span>
          <span style={{ fontSize: 11, color: T.IK }}>{dispute.reason || "No reason specified."}</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: "center", color: T.LIGHT_IK, fontSize: 11, fontWeight: 700, padding: 32 }}>LOADING MESSAGES...</div>
          ) : msgs.length === 0 ? (
            <div style={{ textAlign: "center", color: T.LIGHT_IK, fontSize: 11, fontWeight: 700, padding: 32 }}>No messages yet. Start the conversation below.</div>
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

        {/* Send message */}
        {dispute.status !== "resolved" && (
          <>
            <div style={{ padding: "12px 24px", borderTop: `1px solid ${T.IK}20`, display: "flex", gap: 10, flexShrink: 0 }}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="TYPE A MESSAGE AS ADMIN..."
                style={{ flex: 1, padding: "10px 14px", fontSize: 11, border: `1px solid ${T.IK}`, background: "#fff", outline: "none", fontFamily: "inherit" }}
              />
              <button
                onClick={send} disabled={sending || !text.trim()}
                style={{ padding: "10px 20px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: sending ? T.LIGHT_IK : T.C, color: "#fff", border: "none", cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}
              >
                {sending ? "..." : "SEND →"}
              </button>
            </div>

            {/* Resolve panel */}
            <div style={{ padding: "12px 24px", borderTop: `1px solid ${T.IK}20`, background: `${T.GREEN}08`, flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.GREEN, marginBottom: 8 }}>MARK AS RESOLVED</div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={resText}
                  onChange={e => setResText(e.target.value)}
                  placeholder="Enter resolution note..."
                  style={{ flex: 1, padding: "9px 12px", fontSize: 11, border: `1px solid ${T.GREEN}40`, background: "#fff", outline: "none", fontFamily: "inherit" }}
                />
                <button
                  onClick={resolve} disabled={resolving}
                  style={{ padding: "9px 18px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: T.GREEN, color: "#fff", border: "none", cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}
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

/** Disputes view */
const DisputesView = ({ refreshStats }) => {
  const [disputes, setDisputes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try { setDisputes(await adminApi.disputes()); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = disputes.filter(d => filter === "all" || d.status === filter);

  if (loading) return <Loader />;

  return (
    <div style={{ padding: 32 }}>
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, border: `1px solid ${T.IK}`, width: "fit-content" }}>
        {["all","open","resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 20px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", background: filter === f ? T.C : "transparent", color: filter === f ? "#fff" : T.IK, border: "none", borderRight: f !== "resolved" ? `1px solid ${T.IK}` : "none", cursor: "pointer", fontFamily: "inherit" }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
        <SectionBar left="DISPUTES & COMPLAINTS" right={`${filtered.length} FOUND`} />
        {filtered.length === 0 ? <Empty msg="No disputes found." /> : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map(d => (
              <div key={d.id}
                style={{ padding: "16px 24px", borderBottom: `1px solid ${T.IK}10`, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
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
                  style={{ padding: "8px 16px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: d.status === "open" ? T.C : T.IK, color: "#fff", border: "none", cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}
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
          onResolve={() => { setSelected(null); load(); refreshStats(); }}
        />
      )}
    </div>
  );
};

// ─── Shared tiny components ────────────────────────────────────────
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
  <button onClick={onClick} disabled={disabled}
    style={{ padding: "7px 16px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: disabled ? "transparent" : T.IK, color: disabled ? T.LIGHT_IK : "#fff", border: `1px solid ${disabled ? T.LIGHT_IK : T.IK}`, cursor: disabled ? "default" : "pointer", fontFamily: "inherit", opacity: disabled ? 0.4 : 1 }}
  >
    {label}
  </button>
);

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [view,    setView]    = useState("overview");
  const [stats,   setStats]   = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [sideOpen, setSideOpen] = useState(true);

  // Auth guard
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const u = userStr ? (() => { try { return JSON.parse(userStr); } catch { return null; } })() : null;
    if (!u) { navigate("/login"); return; }
    if (u.email !== "admin@admin.com") { navigate("/services"); }
  }, [navigate]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try { setStats(await adminApi.stats()); }
    catch(e) { console.error(e); }
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const openDisputeCount = stats?.open_disputes || 0;

  const navItems = [
    { id: "overview",     icon: "◉", label: "Overview"     },
    { id: "bookings",     icon: "📋", label: "Bookings"     },
    { id: "users",        icon: "👤", label: "Users"        },
    { id: "transactions", icon: "💰", label: "Transactions" },
    { id: "disputes",     icon: "⚠️", label: "Disputes",    badge: openDisputeCount },
  ];

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: T.CR, display: "flex", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", position: "relative" }}>

      {/* Subtle grid */}
      <div style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 0, opacity: 0.025, backgroundImage: `linear-gradient(${T.IK} 1px, transparent 1px), linear-gradient(90deg, ${T.IK} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

      {/* Sidebar */}
      <div style={{ position: "relative", zIndex: 10, width: sideOpen ? 220 : 52, background: T.CR, borderRight: `1px solid ${T.IK}`, flexShrink: 0, display: "flex", flexDirection: "column", transition: "width 0.15s ease", overflow: "hidden" }}>
        {/* Logo */}
        <div style={{ padding: sideOpen ? "24px 20px 20px" : "24px 14px 20px", borderBottom: `1px solid ${T.IK}`, flexShrink: 0 }}>
          {sideOpen ? (
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: T.IK, lineHeight: 0.9 }}>
                TASK<span style={{ color: T.C }}>IT</span>
              </div>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: T.C, marginTop: 4 }}>ADMIN PANEL</div>
            </div>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 900, color: T.C, textAlign: "center" }}>T</div>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSideOpen(o => !o)}
          style={{ padding: "10px", fontSize: 10, background: "transparent", border: "none", borderBottom: `1px solid ${T.IK}`, cursor: "pointer", color: T.LIGHT_IK, fontFamily: "inherit", flexShrink: 0 }}
        >
          {sideOpen ? "◀ COLLAPSE" : "▶"}
        </button>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: 8 }}>
          {navItems.map(n => (
            <NavItem
              key={n.id}
              icon={n.icon}
              label={sideOpen ? n.label : ""}
              active={view === n.id}
              onClick={() => setView(n.id)}
              badge={n.badge}
            />
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ borderTop: `1px solid ${T.IK}`, flexShrink: 0 }}>
          <NavItem icon="🏠" label={sideOpen ? "Main App" : ""} onClick={() => navigate("/services")} />
          <NavItem icon="↩" label={sideOpen ? "Logout" : ""} onClick={logout} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", position: "relative", zIndex: 1 }}>
        {/* Top bar */}
        <div style={{ padding: "14px 32px", borderBottom: `1px solid ${T.IK}`, background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>
              {navItems.find(n => n.id === view)?.label?.toUpperCase() || "ADMIN"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {openDisputeCount > 0 && (
              <button onClick={() => setView("disputes")}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: `${T.GOLD}20`, border: `1px solid ${T.GOLD}`, color: T.GOLD, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit" }}>
                ⚠️ {openDisputeCount} OPEN DISPUTE{openDisputeCount > 1 ? "S" : ""}
              </button>
            )}
            <span style={{ fontSize: 9, fontWeight: 700, color: "#f5f0e660" }}>admin@admin.com</span>
          </div>
        </div>

        {/* View content */}
        {view === "overview"     && <OverviewView stats={stats} loading={statsLoading} />}
        {view === "bookings"     && <BookingsView />}
        {view === "users"        && <UsersView />}
        {view === "transactions" && <TransactionsView />}
        {view === "disputes"     && <DisputesView refreshStats={loadStats} />}
      </div>
    </div>
  );
};

export default AdminDashboard;