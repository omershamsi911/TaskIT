import { useState, useEffect } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CORAL  = "#FF5733";
const CREAM  = "#F5F0E6";
const INK    = "#1A1A1A";
const BORDER = `1px solid ${INK}`;
const FONT   = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";

const NAV_LINKS = ["Services", "Providers", "Pricing", "About"];

// ─── LIVE CLOCK ──────────────────────────────────────────────────────────────
const LiveClock = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-PK", {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          hour12: false, timeZone: "Asia/Karachi",
        }) + " PKT"
      );
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-black text-xs tracking-widest uppercase tabular-nums" style={{ color: CORAL }}>
      {time}
    </span>
  );
};

// ─── MARQUEE TICKER ──────────────────────────────────────────────────────────
const Ticker = () => {
  const items = [
    "VERIFIED PROVIDERS", "FAST BOOKING", "TRANSPARENT PRICING",
    "ZERO HIDDEN FEES", "AVAILABLE NOW", "KARACHI · LAHORE · ISLAMABAD",
    "AI-POWERED MATCHING", "ESCROW PROTECTION",
  ];
  return (
    <div style={{ background: INK, borderBottom: BORDER, overflow: "hidden" }}>
      <div className="flex whitespace-nowrap" style={{ animation: "ticker 28s linear infinite" }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="px-8 py-2 text-xs font-black tracking-widest uppercase"
            style={{ color: CREAM }}>
            {item}
            <span className="mx-5" style={{ color: CORAL }}>//</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform:translateX(0) } to { transform:translateX(-50%) } }`}</style>
    </div>
  );
};

// ─── NAV LINK ────────────────────────────────────────────────────────────────
const NavLink = ({ label }) => (
  <a href={`#${label.toLowerCase()}`}
    className="flex items-center px-5 text-xs font-black uppercase tracking-widest transition-all duration-100 border-r"
    style={{ borderColor: INK, textDecoration: "none", color: INK, fontFamily: FONT }}
    onMouseEnter={e => { e.currentTarget.style.background = CORAL; e.currentTarget.style.color = CREAM; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = INK; }}
  >
    {label}
  </a>
);

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: CREAM,
        borderBottom: BORDER,
        boxShadow: scrolled ? `0 2px 0 ${INK}` : "none",
        fontFamily: FONT,
      }}
    >
      {/* Main nav row */}
      <div className="flex items-stretch" style={{ minHeight: 56 }}>
        {/* Wordmark */}
        <div className="flex items-center px-6 border-r shrink-0" style={{ borderColor: INK }}>
          <span className="font-black text-base uppercase tracking-widest" style={{ color: CORAL, letterSpacing: "0.18em" }}>
            TASKIT
          </span>
          <span className="ml-2 text-xs font-black uppercase tracking-widest opacity-30 hidden sm:block">
            [STUDIO]
          </span>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-stretch border-r" style={{ borderColor: INK }}>
          {NAV_LINKS.map((lbl) => (
            <NavLink key={lbl} label={lbl} />
          ))}
        </nav>

        {/* Live clock */}
        <div className="hidden lg:flex items-center px-6 border-r" style={{ borderColor: INK }}>
          <LiveClock />
        </div>

        {/* Status pill */}
        <div className="hidden md:flex items-center px-5 border-r gap-2" style={{ borderColor: INK }}>
          <span className="w-2 h-2 inline-block" style={{ background: CORAL, animation: "pulse 1.8s infinite" }} />
          <span className="text-xs font-black uppercase tracking-widest opacity-50">LIVE</span>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
        </div>

        {/* Auth links */}
        <div className="ml-auto flex items-stretch">
          <a href="/login" className="hidden sm:flex items-center px-6 border-l text-xs font-black uppercase tracking-widest transition-all duration-100"
            style={{ borderColor: INK, textDecoration: "none", color: INK }}
            onMouseEnter={e => { e.currentTarget.style.background = INK; e.currentTarget.style.color = CREAM; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = INK; }}
          >
            Login
          </a>
          <a href="/signup" className="flex items-center px-6 border-l text-xs font-black uppercase tracking-widest transition-all duration-100"
            style={{ borderColor: INK, background: CORAL, color: CREAM, textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.background = INK; }}
            onMouseLeave={e => { e.currentTarget.style.background = CORAL; }}
          >
            Sign Up
          </a>

          {/* Hamburger */}
          <button
            className="md:hidden flex items-center justify-center px-5 border-l"
            style={{ borderColor: INK, background: "transparent", cursor: "pointer" }}
            onClick={() => setMenuOpen(m => !m)}
          >
            <span className="font-black text-lg">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: INK }}>
          {NAV_LINKS.map((lbl) => (
            <a key={lbl} href={`#${lbl.toLowerCase()}`}
              className="flex items-center px-6 py-4 border-b text-xs font-black uppercase tracking-widest"
              style={{ borderColor: INK, textDecoration: "none", color: INK }}
            >
              {lbl}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

// ─── HEADER (Ticker + Navbar) ─────────────────────────────────────────────────
const Header = () => (
  <>
    <Ticker />
    <Navbar />
  </>
);

export default Header;