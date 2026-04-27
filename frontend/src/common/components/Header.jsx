import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "../../../handlers/users";
import { fetchChatRooms } from "../../../handlers/chat";
import { useTheme } from "../../hooks/useTheme";
import { setTheme } from "../../store/ThemeSlice";

const NAV_LINKS = [
  { label: "Services", path: "/discovery" },
  { label: "Providers", path: "/discovery" },
  { label: "Pricing", path: "/#pricing" },
  { label: "About", path: "/#about" },
];

// ─── LIVE CLOCK ──────────────────────────────────────────────────────────────
const LiveClock = () => {
  const { C } = useTheme();
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
    <span className="font-black text-2xs tracking-superwide uppercase tabular-nums" style={{ color: C }}>
      {time}
    </span>
  );
};

// ─── MARQUEE TICKER ──────────────────────────────────────────────────────────
const Ticker = () => {
  const { C, CR, IK } = useTheme();
  const items = [
    "VERIFIED PROVIDERS", "FAST BOOKING", "TRANSPARENT PRICING",
    "ZERO HIDDEN FEES", "AVAILABLE NOW", "KARACHI · LAHORE · ISLAMABAD",
    "AI-POWERED MATCHING", "ESCROW PROTECTION",
  ];
  return (
    <div style={{ background: IK, borderBottom: `1px solid ${IK}`, overflow: "hidden" }}>
      <div className="flex whitespace-nowrap" style={{ animation: "ticker 28s linear infinite" }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="px-8 py-2 text-2xs font-black tracking-superwide uppercase" style={{ color: CR }}>
            {item}
            <span className="mx-5" style={{ color: C }}>//</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform:translateX(0) } to { transform:translateX(-50%) } }`}</style>
    </div>
  );
};

// ─── USER MENU ───────────────────────────────────────────────────────────────
const UserMenu = () => {
  const { C, CR, IK, LIGHT_IK, mode } = useTheme();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [unreadChats, setUnreadChats] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const isDark = mode === "dark";

  useEffect(() => {
    if (!token) return;
    const loadUserData = async () => {
      try {
        const userData = await fetchUserProfile();
        setUser(userData);
        setWalletBalance(userData.wallet_balance || 0);
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
    };
    const loadChatData = async () => {
      try {
        const rooms = await fetchChatRooms();
        setUnreadChats(rooms?.length || 0);
      } catch (err) {}
    };
    loadUserData();
    loadChatData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    navigate("/");
  };

  const toggleTheme = () => {
    if (isDark) {
      dispatch(setTheme({ C: "#FF5733", CR: "#F5F0E6", IK: "#1A1A1A", mode: "light" }));
    } else {
      dispatch(setTheme({ C: "#E040FB", CR: "#1E1E1E", IK: "#FFFFFF", mode: "dark" }));
    }
  };

  const getProfileRoute = () => {
    if (user?.role === "provider") return "/provider/profile";
    if (user?.role === "customer") return "/profile";
    if (user?.role === "both") return "/profile"; // or decide logic
    return "/profile";
  };

  if (!token || !user) {
    return (
      <>
        <Link to="/signin"
          className="hidden sm:flex items-center px-6 border-l text-2xs font-black uppercase tracking-superwide transition-all duration-100 no-underline"
          style={{ borderColor: IK, color: IK }}
          onMouseEnter={e => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>LOGIN</Link>
        <Link to="/signup"
          className="flex items-center px-6 border-l text-2xs font-black uppercase tracking-superwide transition-all duration-100 no-underline"
          style={{ borderColor: IK, background: C, color: CR }}
          onMouseEnter={e => { e.currentTarget.style.background = IK; }}
          onMouseLeave={e => { e.currentTarget.style.background = C; }}>SIGN UP</Link>
      </>
    );
  }

  return (
    <>
      {user?.role === "provider" && (
        <div className="hidden lg:flex items-center px-4 border-l gap-2" style={{ borderColor: IK }}>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
            PKR
          </span>
          <span className="text-2xs font-black uppercase tracking-superwide tabular-nums" style={{ color: C }}>
            {walletBalance.toLocaleString()}
          </span>
        </div>
      )}

      <Link to="/chat"
        className="hidden md:flex items-center px-4 border-l text-2xs font-black uppercase tracking-superwide transition-all duration-100 no-underline relative"
        style={{ borderColor: IK, color: IK }}
        onMouseEnter={e => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>💬
        {unreadChats > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center text-2xs font-black" style={{ background: C, color: CR, fontSize: "8px" }}>{unreadChats}</span>
        )}
      </Link>

      <div className="relative flex items-stretch">
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-5 border-l text-2xs font-black uppercase tracking-superwide transition-all duration-100"
          style={{ borderColor: IK, background: "transparent", color: IK, cursor: "pointer", border: "none", borderLeft: `1px solid ${IK}` }}
          onMouseEnter={e => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>
          <div className="w-6 h-6 flex items-center justify-center text-2xs font-black" style={{ background: C, color: CR }}>{user.full_name?.charAt(0) || "?"}</div>
          <span className="hidden sm:inline">{user.full_name?.split(" ")[0] || "USER"}</span>
          <span className="text-2xs">{menuOpen ? "▲" : "▼"}</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full border shadow-lg z-50 min-w-[180px]" style={{ background: CR, borderColor: IK }} onClick={() => setMenuOpen(false)}>
            <Link to="/profile"
              className="flex items-center px-5 py-3 border-b text-2xs font-black uppercase tracking-superwide no-underline transition-colors duration-100"
              style={{ borderColor: IK, color: IK }}
              onMouseEnter={e => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>◎ MY PROFILE</Link>
            <Link to="/bookings"
              className="flex items-center px-5 py-3 border-b text-2xs font-black uppercase tracking-superwide no-underline transition-colors duration-100"
              style={{ borderColor: IK, color: IK }}
              onMouseEnter={e => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>◆ MY BOOKINGS</Link>
            <Link to="/wallet"
              className="flex items-center px-5 py-3 border-b text-2xs font-black uppercase tracking-superwide no-underline transition-colors duration-100"
              style={{ borderColor: IK, color: IK }}
              onMouseEnter={e => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>◈ WALLET</Link>
            {user?.role === "provider" && (
              <Link to="/provider/dashboard"
                className="flex items-center px-5 py-3 border-b text-2xs font-black uppercase tracking-superwide no-underline transition-colors duration-100"
                style={{ borderColor: IK, color: IK }}
                onMouseEnter={e => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>⚙ DASHBOARD</Link>
            )}
            {/* Theme Toggle */}
            <button onClick={toggleTheme}
              className="w-full flex items-center justify-between px-5 py-3 border-b text-2xs font-black uppercase tracking-superwide text-left transition-colors duration-100"
              style={{ background: "transparent", color: IK, cursor: "pointer", border: "none", borderBottom: `1px solid ${IK}` }}
              onMouseEnter={e => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>
              <span>{isDark ? "◑ LIGHT MODE" : "◐ DARK MODE"}</span>
              <span className="text-xs">{isDark ? "☀" : "☾"}</span>
            </button>
            <button onClick={handleLogout}
              className="w-full flex items-center px-5 py-3 text-2xs font-black uppercase tracking-superwide text-left transition-colors duration-100"
              style={{ background: "transparent", color: C, cursor: "pointer", border: "none" }}
              onMouseEnter={e => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C; }}>✕ LOGOUT</button>
          </div>
        )}
      </div>

      <Link to="/profile"
        className="sm:hidden flex items-center px-4 border-l text-2xs font-black uppercase tracking-superwide no-underline"
        style={{ borderColor: IK, color: IK }}>{user.full_name?.charAt(0) || "?"}</Link>
    </>
  );
};

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { C, CR, IK, LIGHT_IK, CR_ALT, mode } = useTheme();
  const dispatch = useDispatch();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isDark = mode === "dark";

  const NavLink = ({ label, path }) => (
    <Link to={path}
      className="flex items-center px-5 text-2xs font-black uppercase tracking-superwide transition-all duration-100 border-r no-underline"
      style={{ borderColor: IK, color: IK }}
      onMouseEnter={e => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>{label}</Link>
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      dispatch(setTheme({ C: "#FF5733", CR: "#F5F0E6", IK: "#1A1A1A", mode: "light" }));
    } else {
      dispatch(setTheme({ C: "#E040FB", CR: "#1E1E1E", IK: "#FFFFFF", mode: "dark" }));
    }
  };

  return (
    <header className="sticky top-0 z-50" style={{ background: CR, borderBottom: `1px solid ${IK}`, boxShadow: scrolled ? `0 2px 0 ${IK}` : "none" }}>
      <div className="flex items-stretch" style={{ minHeight: 56 }}>
        <Link to="/" className="flex items-center px-6 border-r shrink-0 no-underline" style={{ borderColor: IK }}>
          <span className="font-black text-base uppercase tracking-superwide" style={{ color: C }}>TASKIT</span>
        </Link>

        <nav className="hidden md:flex items-stretch border-r" style={{ borderColor: IK }}>
          {NAV_LINKS.map((link) => (<NavLink key={link.label} label={link.label} path={link.path} />))}
        </nav>

        <div className="hidden lg:flex items-center px-6 border-r" style={{ borderColor: IK }}><LiveClock /></div>

        <div className="hidden md:flex items-center px-5 border-r gap-2" style={{ borderColor: IK }}>
          <span className="w-2 h-2 inline-block" style={{ background: C, animation: "pulse 1.8s infinite" }} />
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>LIVE</span>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
        </div>

        {/* Quick Theme Toggle Button */}
        <button onClick={toggleTheme}
          className="hidden md:flex items-center px-4 border-r text-sm transition-colors duration-100"
          style={{ borderColor: IK, background: "transparent", color: IK, cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}
          title={isDark ? "Switch to Light" : "Switch to Dark"}>
          {isDark ? "☀ Light Mode" : "☾ Dark Mode"}
        </button>

        <div className="ml-auto flex items-stretch">
          <UserMenu />
          <button className="md:hidden flex items-center justify-center px-5 border-l"
            style={{ borderColor: IK, background: "transparent", cursor: "pointer", color: IK }}
            onClick={() => setMenuOpen(m => !m)}>
            <span className="font-black text-lg">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: IK }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.path}
              className="flex items-center px-6 py-4 border-b text-2xs font-black uppercase tracking-superwide no-underline"
              style={{ borderColor: IK, color: IK }}
              onClick={() => setMenuOpen(false)}>{link.label}</Link>
          ))}
          <button onClick={() => { toggleTheme(); setMenuOpen(false); }}
            className="w-full flex items-center px-6 py-4 text-2xs font-black uppercase tracking-superwide text-left"
            style={{ borderColor: IK, color: IK, background: "transparent", cursor: "pointer", border: "none" }}>
            {isDark ? "☀ LIGHT MODE" : "☾ DARK MODE"}
          </button>
        </div>
      )}
    </header>
  );
};

const Header = () => (
  <>
    <Ticker />
    <Navbar />
  </>
);

export default Header;