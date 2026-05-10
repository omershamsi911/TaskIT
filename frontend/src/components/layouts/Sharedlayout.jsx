/**
 * SharedLayout.jsx
 * ─────────────────────────────────────────────────────────────────
 * Provides the common Navbar (with role-aware avatar dropdown),
 * the horizontal ticker, GridOverlay, and Footer that wrap every page.
 *
 * Usage:
 *   import SharedLayout from "../layouts/SharedLayout";
 *   const MyPage = () => <SharedLayout><YourContent /></SharedLayout>;
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
export const T = {
  C:        "#FF5733",
  CR:       "#F5F0E6",
  CR_ALT:   "#FFFFFF",
  IK:       "#1A1A1A",
  LIGHT_IK: "#6B6B6B",
};

// ─── GLOBAL CSS (animations, responsive breakpoints) ──────────────
export const GLOBAL_CSS = `
  @keyframes ticker  { from { transform:translateX(0) } to { transform:translateX(-50%) } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
  .tk-ticker  { animation: ticker 28s linear infinite; }
  *{box-sizing:border-box;}
  @media(max-width:600px){
    .tk-desktop{display:none!important;}
    .tk-hamburger{display:flex!important;}
  }
  @media(min-width:601px){
    .tk-hamburger{display:none!important;}
    .tk-mobile-menu{display:none!important;}
  }
  @media(max-width:1100px){.tk-footer-wrap{grid-template-columns:1fr 1fr!important;}}
  @media(max-width:600px){.tk-footer-wrap{grid-template-columns:1fr!important;}}
`;

// ─── TICKER ───────────────────────────────────────────────────────
export const Ticker = () => {
  const items = [
    "VERIFIED PROVIDERS","FAST BOOKING","TRANSPARENT PRICING",
    "ZERO HIDDEN FEES","AVAILABLE NOW","KARACHI · LAHORE · ISLAMABAD",
    "BACKGROUND CHECKED","INSTANT CONFIRMATION",
  ];
  return (
    <div style={{ background: T.IK, overflow: "hidden" }}>
      <div className="tk-ticker" style={{ display: "flex", whiteSpace: "nowrap" }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ padding: "8px 32px", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.CR, flexShrink: 0 }}>
            {item}<span style={{ margin: "0 20px", color: T.C }}>//</span>
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── LIVE CLOCK ───────────────────────────────────────────────────
const LiveClock = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () => setTime(new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Karachi" }) + " PKT");
    fmt(); const id = setInterval(fmt, 1000); return () => clearInterval(id);
  }, []);
  return <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", fontVariantNumeric: "tabular-nums", color: T.C }}>{time}</span>;
};

// ─── NAV LINKS ────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Services", path: "/services" },
  { label: "Pricing",  path: "/pricing"  },
  { label: "About",    path: "/about"    },
];

const NavLink = ({ label, path }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link to={path}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", padding: "0 20px", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", borderRight: `1px solid ${T.IK}`, background: hov ? T.C : "transparent", color: hov ? T.CR : T.IK, transition: "all 0.1s" }}>
      {label}
    </Link>
  );
};

const AuthLink = ({ to, label, filled }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", padding: "0 24px", borderLeft: `1px solid ${T.IK}`, textDecoration: "none", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", transition: "all 0.1s",
        background: filled ? (hov ? T.IK : T.C) : (hov ? T.IK : "transparent"),
        color:      filled ? T.CR             : (hov ? T.CR : T.IK) }}>
      {label}
    </Link>
  );
};

// ─── AVATAR DROPDOWN ──────────────────────────────────────────────
const AvatarDropdown = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const navigate = useNavigate();

  const isProvider = user?.role === "provider" || user?.role === "both";

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = (user?.full_name || user?.name || "U").charAt(0).toUpperCase();

  const menuItems = [
    { label: "My Profile",  path: "/profile" },
    { label: "My Bookings", path: "/my-bookings" },
    ...(isProvider ? [{ label: "Provider Dashboard", path: "/provider-dashboard" }] : []),
  ];

  return (
    <div ref={ref} style={{ position: "relative", display: "flex", alignItems: "stretch" }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderLeft: `1px solid ${T.IK}`, background: open ? T.C : "transparent", color: open ? T.CR : T.IK, cursor: "pointer", border: "none", borderLeft: `1px solid ${T.IK}`, transition: "all 0.1s", fontFamily: "inherit" }}>
        {/* Circle avatar */}
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: open ? T.CR : T.IK, color: open ? T.IK : T.CR, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0, transition: "all 0.1s" }}>
          {initial}
        </div>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", display: "none" }} className="tk-desktop-inline">
          {user?.full_name?.split(" ")[0] || "Account"}
        </span>
        <span style={{ fontSize: 10, fontWeight: 900 }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position: "absolute", top: "100%", right: 0, minWidth: 220, background: T.CR, border: `1px solid ${T.IK}`, borderTop: `2px solid ${T.C}`, zIndex: 100, boxShadow: "4px 4px 0 #1a1a1a" }}>
          {/* User info header */}
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.IK}`, background: T.IK }}>
            <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.CR }}>{user?.full_name || "User"}</div>
            <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C, marginTop: 2 }}>{user?.role?.toUpperCase() || "CUSTOMER"}</div>
          </div>

          {/* Menu items */}
          {menuItems.map((item, i) => (
            <DropdownItem key={i} label={item.label} onClick={() => { navigate(item.path); setOpen(false); }} />
          ))}

          {/* Divider + Logout */}
          <div style={{ borderTop: `1px solid ${T.IK}` }}>
            <DropdownItem label="Logout" onClick={onLogout} danger />
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ label, onClick, danger }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", width: "100%", padding: "12px 18px", fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", background: hov ? (danger ? "#ea5455" : T.C) : "transparent", color: hov ? T.CR : (danger ? "#ea5455" : T.IK), border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.1s", fontFamily: "inherit" }}>
      {label}
    </button>
  );
};

// ─── NAVBAR ───────────────────────────────────────────────────────
export const Navbar = () => {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const navigate = useNavigate();

  // Read auth state
  const token    = typeof localStorage !== "undefined" && localStorage.getItem("access_token");
  const userStr  = typeof localStorage !== "undefined" && localStorage.getItem("user");
  const user     = userStr ? (() => { try { return JSON.parse(userStr); } catch { return null; } })() : null;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: T.CR, borderBottom: `1px solid ${T.IK}`, boxShadow: scrolled ? `0 2px 0 ${T.IK}` : "none" }}>
      <div style={{ display: "flex", alignItems: "stretch", minHeight: 56 }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", padding: "0 24px", borderRight: `1px solid ${T.IK}`, textDecoration: "none", flexShrink: 0 }}>
          <span style={{ fontWeight: 900, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>TASKIT</span>
        </Link>

        {/* Nav links */}
        <nav className="tk-desktop" style={{ display: "flex", alignItems: "stretch", borderRight: `1px solid ${T.IK}` }}>
          {NAV_LINKS.map(l => <NavLink key={l.label} {...l} />)}
        </nav>

        {/* Clock */}
        <div className="tk-desktop" style={{ display: "flex", alignItems: "center", padding: "0 24px", borderRight: `1px solid ${T.IK}` }}>
          <LiveClock />
        </div>

        {/* Live dot */}
        <div className="tk-desktop" style={{ display: "flex", alignItems: "center", padding: "0 20px", borderRight: `1px solid ${T.IK}`, gap: 8 }}>
          <span style={{ width: 8, height: 8, background: T.C, animation: "pulse 1.8s infinite", display: "inline-block" }} />
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.LIGHT_IK }}>LIVE</span>
        </div>

        {/* Auth area */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "stretch" }}>
          {token && user ? (
            <AvatarDropdown user={user} onLogout={handleLogout} />
          ) : (
            <>
              <AuthLink to="/login"    label="LOGIN"   filled={false} />
              <AuthLink to="/register" label="SIGN UP" filled={true}  />
            </>
          )}

          {/* Hamburger */}
          <button className="tk-hamburger" onClick={() => setMobileOpen(m => !m)}
            style={{ display: "none", alignItems: "center", justifyContent: "center", padding: "0 20px", borderLeft: `1px solid ${T.IK}`, background: "transparent", cursor: "pointer", color: T.IK, fontSize: 18, fontWeight: 900, border: "none" }}>
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="tk-mobile-menu" style={{ borderTop: `1px solid ${T.IK}` }}>
          {NAV_LINKS.map(l => (
            <Link key={l.label} to={l.path} onClick={() => setMobileOpen(false)}
              style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${T.IK}`, textDecoration: "none", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.IK }}>
              {l.label}
            </Link>
          ))}
          {token && user ? (
            <>
              <Link to="/profile"   onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${T.IK}`, textDecoration: "none", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.IK }}>My Profile</Link>
              <Link to="/my-bookings" onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${T.IK}`, textDecoration: "none", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.IK }}>My Bookings</Link>
              {(user?.role === "provider" || user?.role === "both") && (
                <Link to="/provider-dashboard" onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${T.IK}`, textDecoration: "none", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.IK }}>Provider Dashboard</Link>
              )}
              <button onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("user"); window.location.href = "/login"; }}
                style={{ display: "flex", alignItems: "center", padding: "16px 24px", width: "100%", borderBottom: `1px solid ${T.IK}`, textDecoration: "none", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ea5455", background: "transparent", border: "none", borderBottom: `1px solid ${T.IK}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${T.IK}`, textDecoration: "none", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.IK }}>Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${T.IK}`, textDecoration: "none", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

// ─── FOOTER ───────────────────────────────────────────────────────
const FOOTER_COLS = [
  { heading: "Platform", links: [{ label: "How it Works", path: "/how-it-works" }, { label: "Browse Services", path: "/services" }, { label: "For Providers", path: "/register" }] },
  { heading: "Company",  links: [{ label: "About Us", path: "/about" }, { label: "Contact", path: "/contact" }] },
  { heading: "Legal",    links: [{ label: "Privacy Policy", path: "/privacy" }, { label: "Terms of Service", path: "/terms" }] },
  { heading: "Support",  links: [{ label: "Help Centre", path: "/help" }, { label: "My Bookings", path: "/my-bookings" }] },
];

const FLink = ({ label, path }) => {
  const [h, setH] = useState(false);
  return (
    <li style={{ listStyle: "none" }}>
      <Link to={path}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", color: h ? T.C : T.LIGHT_IK, transition: "color 0.1s" }}>
        {label}
      </Link>
    </li>
  );
};

const SocialBtn = ({ label, last }) => {
  const [h, setH] = useState(false);
  return (
    <button
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ flex: 1, padding: "10px 0", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", background: h ? T.C : "transparent", color: h ? T.CR : T.IK, border: "none", borderRight: last ? "none" : `1px solid ${T.IK}`, cursor: "pointer", transition: "all 0.1s" }}>
      {label}
    </button>
  );
};

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [subH,  setSubH]  = useState(false);
  return (
    <footer style={{ borderTop: `1px solid ${T.IK}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "260px repeat(4,1fr) 260px", borderBottom: `1px solid ${T.IK}` }} className="tk-footer-wrap">
        {/* Brand */}
        <div style={{ padding: "40px", borderRight: `1px solid ${T.IK}`, borderBottom: `1px solid ${T.IK}` }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={{ fontWeight: 900, fontSize: 22, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C, marginBottom: 4 }}>TASKIT</div>
          </Link>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.LIGHT_IK, marginBottom: 24 }}>[PLATFORM]</div>
          <p style={{ fontSize: 11, lineHeight: 1.7, color: T.LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400 }}>Pakistan's home service marketplace. Connecting skilled professionals with people who need them.</p>
          <div style={{ display: "flex", marginTop: 32, border: `1px solid ${T.IK}` }}>
            {["TW", "IN", "FB", "YT"].map((s, i) => <SocialBtn key={i} label={s} last={i === 3} />)}
          </div>
        </div>
        {/* Link cols */}
        {FOOTER_COLS.map((col, ci) => (
          <div key={ci} style={{ padding: "40px 32px", borderRight: `1px solid ${T.IK}`, borderBottom: `1px solid ${T.IK}` }}>
            <h5 style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C, margin: "0 0 24px" }}>{col.heading}</h5>
            <ul style={{ padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {col.links.map((l, li) => <FLink key={li} {...l} />)}
            </ul>
          </div>
        ))}
        {/* Newsletter */}
        <div style={{ padding: "40px 32px", borderBottom: `1px solid ${T.IK}` }}>
          <h5 style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C, margin: "0 0 8px" }}>NEWSLETTER</h5>
          <p style={{ fontSize: 11, lineHeight: 1.7, color: T.LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400, marginBottom: 20 }}>Platform updates, city launches, and new service categories.</p>
          <div style={{ display: "flex", border: `1px solid ${T.IK}` }}>
            <input type="email" placeholder="YOUR@EMAIL.COM" value={email} onChange={e => setEmail(e.target.value)}
              style={{ flex: 1, padding: "12px", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", border: "none", outline: "none", color: T.IK }} />
            <button
              onMouseEnter={() => setSubH(true)} onMouseLeave={() => setSubH(false)}
              style={{ padding: "12px 16px", fontSize: 12, fontWeight: 900, background: subH ? T.IK : T.C, color: T.CR, border: "none", borderLeft: `1px solid ${T.IK}`, cursor: "pointer", transition: "all 0.1s" }}>→</button>
          </div>
        </div>
      </div>
      {/* Bottom strip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: T.LIGHT_IK }}>© {new Date().getFullYear()} TASKIT PLATFORM — ALL RIGHTS RESERVED</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Cookies"].map((l, i) => <FLink key={i} label={l} path={`/${l.toLowerCase()}`} />)}
        </div>
      </div>
    </footer>
  );
};

// ─── GRID OVERLAY ─────────────────────────────────────────────────
export const GridOverlay = () => (
  <div style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 0, opacity: 0.035, backgroundImage: `linear-gradient(${T.IK} 1px, transparent 1px), linear-gradient(90deg, ${T.IK} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
);

// ─── SHARED LAYOUT WRAPPER ────────────────────────────────────────
const SharedLayout = ({ children }) => (
  <div style={{ position: "relative", minHeight: "100vh", background: T.CR, color: T.IK, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
    <style>{GLOBAL_CSS}</style>
    <GridOverlay />
    <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Ticker />
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  </div>
);

export default SharedLayout;