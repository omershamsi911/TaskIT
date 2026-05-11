import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";

// Custom hook for responsive breakpoints
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
};

const NotFound = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 900px)");
  const [glitchActive, setGlitchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Glitch effect on load
  useEffect(() => {
    setGlitchActive(true);
    const timer = setTimeout(() => setGlitchActive(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const quickLinks = [
    { to: "/", label: "Home", icon: "home" },
    { to: "/services", label: "Services", icon: "grid" },
    { to: "/help", label: "Help Center", icon: "help" },
    { to: "/contact", label: "Contact Us", icon: "mail" },
  ];

  const getIcon = (type) => {
    const icons = {
      home: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      grid: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
      help: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      mail: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      search: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
    };
    return icons[type];
  };

  return (
    <SharedLayout>
      <div
        style={{
          minHeight: "calc(100vh - 160px)",
          background: T.CR,
          color: T.IK,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? 16 : 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0H0v20' fill='none' stroke='%23ff4d2d' stroke-opacity='0.08' stroke-width='0.5'/%3E%3C/svg%3E\")",
            backgroundSize: "20px 20px",
            pointerEvents: "none",
          }}
        />

        {/* Ghost number with glitch effect */}
        <div
          style={{
            position: "absolute",
            fontSize: isMobile ? "140px" : isTablet ? "220px" : "clamp(180px, 30vw, 320px)",
            fontWeight: 900,
            color: T.IK,
            opacity: 0.04,
            letterSpacing: "-0.05em",
            userSelect: "none",
            pointerEvents: "none",
            transform: glitchActive ? "translateX(4px)" : "translateX(0)",
            transition: "transform 0.05s ease",
          }}
        >
          404
        </div>

        {/* Animated lines decoration */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: isMobile ? "-10%" : "5%",
            width: isMobile ? 80 : 120,
            height: 2,
            background: T.C,
            opacity: 0.3,
            transform: "rotate(-45deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: isMobile ? "-5%" : "8%",
            width: isMobile ? 60 : 100,
            height: 2,
            background: T.C,
            opacity: 0.3,
            transform: "rotate(45deg)",
          }}
        />

        <div
          style={{
            textAlign: "center",
            maxWidth: 600,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: isMobile ? 16 : 24,
            zIndex: 1,
            width: "100%",
          }}
        >
          {/* Error badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              border: `1px solid ${T.C}`,
              padding: "8px 16px",
              animation: "fadeSlideIn 0.5s ease forwards",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                background: T.C,
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: isMobile ? 9 : 10,
                fontWeight: 900,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: T.C,
              }}
            >
              Error 404 - Page Not Found
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: isMobile ? "2.2rem" : isTablet ? "3.5rem" : "clamp(2.8rem, 7vw, 5.5rem)",
              fontWeight: 900,
              textTransform: "uppercase",
              lineHeight: 0.9,
              margin: 0,
              letterSpacing: "-0.03em",
              animation: "fadeSlideIn 0.6s ease forwards",
              animationDelay: "0.1s",
              opacity: 0,
            }}
          >
            Lost in <br />
            <span style={{ color: T.C }}>The System</span>
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: isMobile ? 12 : 14,
              color: T.LIGHT_IK,
              lineHeight: 1.7,
              fontFamily: "Georgia, serif",
              margin: 0,
              maxWidth: 420,
              animation: "fadeSlideIn 0.6s ease forwards",
              animationDelay: "0.2s",
              opacity: 0,
            }}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been moved. 
            Try searching or use the quick links below.
          </p>

          {/* Search bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              width: "100%",
              maxWidth: 400,
              border: `2px solid ${T.IK}`,
              animation: "fadeSlideIn 0.6s ease forwards",
              animationDelay: "0.3s",
              opacity: 0,
            }}
          >
            <input
              type="text"
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: isMobile ? "12px 14px" : "14px 18px",
                fontSize: isMobile ? 11 : 12,
                fontWeight: 600,
                background: "transparent",
                border: "none",
                outline: "none",
                color: T.IK,
                fontFamily: "inherit",
              }}
            />
            <button
              style={{
                padding: isMobile ? "12px 14px" : "14px 18px",
                background: T.IK,
                border: "none",
                cursor: "pointer",
                color: T.CR,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getIcon("search")}
            </button>
          </div>

          {/* Primary buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
              animation: "fadeSlideIn 0.6s ease forwards",
              animationDelay: "0.4s",
              opacity: 0,
            }}
          >
            <Btn to="/" label="Back to Home" primary isMobile={isMobile} />
            <Btn to="/services" label="Browse Services" isMobile={isMobile} />
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              width: "100%",
              maxWidth: 400,
              animation: "fadeSlideIn 0.6s ease forwards",
              animationDelay: "0.5s",
              opacity: 0,
            }}
          >
            <div style={{ flex: 1, height: 1, background: T.IK, opacity: 0.2 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: T.LIGHT_IK, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Quick Links
            </span>
            <div style={{ flex: 1, height: 1, background: T.IK, opacity: 0.2 }} />
          </div>

          {/* Quick links grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              gap: isMobile ? 8 : 12,
              width: "100%",
              maxWidth: 500,
              animation: "fadeSlideIn 0.6s ease forwards",
              animationDelay: "0.6s",
              opacity: 0,
            }}
          >
            {quickLinks.map((link, idx) => (
              <QuickLinkCard key={idx} {...link} getIcon={getIcon} isMobile={isMobile} />
            ))}
          </div>

          {/* Support link */}
          <p
            style={{
              fontSize: isMobile ? 10 : 11,
              color: T.LIGHT_IK,
              marginTop: 8,
              animation: "fadeSlideIn 0.6s ease forwards",
              animationDelay: "0.7s",
              opacity: 0,
            }}
          >
            Still need help?{" "}
            <Link
              to="/contact"
              style={{
                color: T.C,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Contact Support
            </Link>
          </p>
        </div>

        {/* Keyframes */}
        <style>{`
          @keyframes fadeSlideIn {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    </SharedLayout>
  );
};

const Btn = ({ to, label, primary, isMobile }) => {
  const [h, setH] = useState(false);

  return (
    <Link
      to={to}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: isMobile ? "12px 20px" : "14px 26px",
        fontSize: isMobile ? 9 : 10,
        fontWeight: 900,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        textDecoration: "none",
        border: `2px solid ${primary ? T.C : T.IK}`,
        background: primary ? (h ? T.IK : T.C) : h ? T.IK : "transparent",
        color: primary ? T.CR : h ? T.CR : T.IK,
        transition: "all 0.2s ease",
        transform: h ? "translateY(-2px)" : "translateY(0)",
        display: "inline-block",
      }}
    >
      {label}
    </Link>
  );
};

const QuickLinkCard = ({ to, label, icon, getIcon, isMobile }) => {
  const [h, setH] = useState(false);

  return (
    <Link
      to={to}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: isMobile ? "14px 10px" : "16px 12px",
        border: `1px solid ${h ? T.C : T.IK}`,
        background: h ? `${T.IK}08` : "transparent",
        textDecoration: "none",
        color: h ? T.C : T.IK,
        transition: "all 0.2s ease",
        transform: h ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <span style={{ opacity: h ? 1 : 0.7, transition: "opacity 0.2s" }}>
        {getIcon(icon)}
      </span>
      <span
        style={{
          fontSize: isMobile ? 9 : 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
    </Link>
  );
};

export default NotFound;
