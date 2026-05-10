import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const T = {
  C: "#FF5733", CR: "#F5F0E6", IK: "#1A1A1A", LIGHT_IK: "#6B6B6B",
};

const NAV_LINKS = [
  { label: "Services",  path: "/services" },
  { label: "Pricing",   path: "/pricing" },
  { label: "About",     path: "/about"   },
];

// ─── LIVE CLOCK ───────────────────────────────────────────────────────────────
const LiveClock = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () =>
      setTime(
        new Date().toLocaleTimeString("en-PK", {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          hour12: false, timeZone: "Asia/Karachi",
        }) + " PKT"
      );
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", fontVariantNumeric: "tabular-nums", color: T.C }}>
      {time}
    </span>
  );
};

// ─── NAV LINK ─────────────────────────────────────────────────────────────────
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

// ─── AUTH BUTTON ─────────────────────────────────────────────────────────────
const AuthBtn = ({ to, label, filled }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", padding: "0 24px", borderLeft: `1px solid ${T.IK}`, textDecoration: "none", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", transition: "all 0.1s",
        background: filled ? (hov ? T.IK : T.C) : (hov ? T.IK : "transparent"),
        color:       filled ? T.CR             : (hov ? T.CR : T.IK),
      }}>
      {label}
    </Link>
  );
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const token = typeof localStorage !== "undefined" && localStorage.getItem("access_token");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @media(max-width:768px){
          .tk-nav-links { display: none !important; }
          .tk-nav-clock  { display: none !important; }
          .tk-nav-live   { display: none !important; }
          .tk-hamburger  { display: flex !important; }
        }
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 50, background: T.CR, borderBottom: `1px solid ${T.IK}`, boxShadow: scrolled ? `0 2px 0 ${T.IK}` : "none", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "stretch", minHeight: 56 }}>

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", padding: "0 24px", borderRight: `1px solid ${T.IK}`, textDecoration: "none", flexShrink: 0 }}>
            <span style={{ fontWeight: 900, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>TASKIT</span>
          </Link>

          {/* Nav links */}
          <nav className="tk-nav-links" style={{ display: "flex", alignItems: "stretch", borderRight: `1px solid ${T.IK}` }}>
            {NAV_LINKS.map(l => <NavLink key={l.label} {...l} />)}
          </nav>

          {/* Clock */}
          <div className="tk-nav-clock" style={{ display: "flex", alignItems: "center", padding: "0 24px", borderRight: `1px solid ${T.IK}` }}>
            <LiveClock />
          </div>

          {/* Live dot */}
          <div className="tk-nav-live" style={{ display: "flex", alignItems: "center", padding: "0 20px", borderRight: `1px solid ${T.IK}`, gap: 8 }}>
            <span style={{ width: 8, height: 8, background: T.C, animation: "pulse 1.8s infinite", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.LIGHT_IK }}>LIVE</span>
          </div>

          {/* Auth / account */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "stretch" }}>
            {token ? (
              <AuthBtn to="/profile" label="MY ACCOUNT" filled={false} />
            ) : (
              <>
                <AuthBtn to="/login"    label="LOGIN"   filled={false} />
                <AuthBtn to="/register" label="SIGN UP" filled={true}  />
              </>
            )}

            {/* Hamburger */}
            <button
              className="tk-hamburger"
              onClick={() => setMobileOpen(m => !m)}
              style={{ display: "none", alignItems: "center", justifyContent: "center", padding: "0 20px", borderLeft: `1px solid ${T.IK}`, background: "transparent", cursor: "pointer", color: T.IK, fontSize: 18, fontWeight: 900, border: "none", borderLeft: `1px solid ${T.IK}` }}>
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div style={{ borderTop: `1px solid ${T.IK}` }}>
            {NAV_LINKS.map(l => (
              <Link key={l.label} to={l.path} onClick={() => setMobileOpen(false)}
                style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${T.IK}`, textDecoration: "none", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.IK }}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;