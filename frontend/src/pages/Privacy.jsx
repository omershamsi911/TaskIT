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

const SectionBar = ({ n, title, isMobile }) => (
  <div
    className="flex items-center justify-between"
    style={{ 
      background: T.IK,
      padding: isMobile ? "10px 16px" : "10px 24px",
    }}
  >
    <span 
      style={{ 
        fontSize: isMobile ? 9 : 10,
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        color: T.C,
      }}
    >
      {title}
    </span>
    <span 
      style={{ 
        fontSize: isMobile ? 9 : 10,
        fontWeight: 900,
        color: T.CR,
        opacity: 0.35,
      }}
    >
      {n}
    </span>
  </div>
);

const Privacy = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 900px)");
  const [activeSection, setActiveSection] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getIcon = (type) => {
    const icons = {
      collect: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      ),
      use: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
      share: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      ),
      rights: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      ),
      security: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
      download: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      ),
      print: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
      ),
      email: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      arrowUp: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"/>
          <polyline points="5 12 12 5 19 12"/>
        </svg>
      ),
    };
    return icons[type];
  };

  const sections = [
    {
      id: "01",
      title: "Information We Collect",
      icon: "collect",
      keyPoints: ["Name & Contact", "Location Data", "Payment Info", "Usage History"],
      content: (
        <>
          <p style={{ fontSize: isMobile ? 11 : 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Personal data you provide directly
          </p>
          <p style={{ fontSize: isMobile ? 11 : 12, lineHeight: 1.8, color: T.LIGHT_IK }}>
            When you register, post a task, or contact a provider, we collect your name, email, phone number, location, and payment details.
            Service history, ratings, and communications are also stored to improve matching and trust.
          </p>
        </>
      ),
    },
    {
      id: "02",
      title: "How We Use Your Data",
      icon: "use",
      keyPoints: ["Service Matching", "Payment Processing", "Fraud Prevention", "Platform Improvement"],
      content: (
        <>
          <p style={{ fontSize: isMobile ? 11 : 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Matching, payments, and safety
          </p>
          <p style={{ fontSize: isMobile ? 11 : 12, lineHeight: 1.8, color: T.LIGHT_IK }}>
            We use your information to connect you with providers, process payments, verify identities, prevent fraud, and send essential updates.
            Aggregated usage data helps us improve AI matching and platform performance.
          </p>
        </>
      ),
    },
    {
      id: "03",
      title: "Sharing & Disclosure",
      icon: "share",
      keyPoints: ["Service Providers Only", "No Data Sales", "Trusted Partners", "Legal Compliance"],
      content: (
        <>
          <p style={{ fontSize: isMobile ? 11 : 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Limited to service delivery
          </p>
          <p style={{ fontSize: isMobile ? 11 : 12, lineHeight: 1.8, color: T.LIGHT_IK }}>
            Your data is shared with providers only to fulfill your request (name, location, job details). We never sell personal data.
            Trusted partners assist with payments, cloud hosting, and analytics under strict confidentiality.
          </p>
        </>
      ),
    },
    {
      id: "04",
      title: "Your Rights",
      icon: "rights",
      keyPoints: ["Data Access", "Correction Rights", "Deletion Requests", "Data Export"],
      content: (
        <>
          <p style={{ fontSize: isMobile ? 11 : 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Access, correction, deletion
          </p>
          <p style={{ fontSize: isMobile ? 11 : 12, lineHeight: 1.8, color: T.LIGHT_IK }}>
            You can review, update, or delete your account data anytime via settings. For data export or deletion requests, contact support.
            We retain transaction records as required by Pakistani law.
          </p>
        </>
      ),
    },
    {
      id: "05",
      title: "Security & Cookies",
      icon: "security",
      keyPoints: ["End-to-End Encryption", "Secure Storage", "Essential Cookies Only", "No Ad Tracking"],
      content: (
        <>
          <p style={{ fontSize: isMobile ? 11 : 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Encryption + essential cookies
          </p>
          <p style={{ fontSize: isMobile ? 11 : 12, lineHeight: 1.8, color: T.LIGHT_IK }}>
            All data encrypted in transit and at rest. Cookies are used for authentication and session management only - no tracking or advertising cookies.
            You may disable cookies but some features may break.
          </p>
        </>
      ),
    },
  ];

  const docInfo = [
    { label: "Effective", value: "May 1, 2026" },
    { label: "Last Updated", value: "May 10, 2026" },
    { label: "Version", value: "2.1" },
    { label: "Jurisdiction", value: "Pakistan" },
  ];

  return (
    <SharedLayout>
      <div
        className="min-h-screen relative"
        style={{ 
          background: T.CR, 
          color: T.IK,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0H0v20' fill='none' stroke='%23ff4d2d' stroke-opacity='0.08' stroke-width='0.5'/%3E%3C/svg%3E\")",
            backgroundSize: "20px 20px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Header */}
          <div 
            style={{ 
              borderBottom: `1px solid ${T.IK}`,
              padding: isMobile ? "20px 16px" : "24px 40px",
            }}
          >
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: 16 }}>
              <div>
                <h1
                  style={{
                    fontSize: isMobile ? "1.8rem" : isTablet ? "2.2rem" : "clamp(2rem, 3vw, 3rem)",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  Privacy Policy
                </h1>
                <p style={{ fontSize: isMobile ? 9 : 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 8, color: T.LIGHT_IK }}>
                  Your data, your control - transparency first
                </p>
              </div>
            </div>
          </div>

          {/* Document Info Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              borderBottom: `1px solid ${T.IK}`,
            }}
          >
            {docInfo.map((info, idx) => (
              <div
                key={idx}
                style={{
                  padding: isMobile ? "12px 16px" : "14px 24px",
                  borderRight: idx < docInfo.length - 1 ? `1px solid ${T.IK}` : "none",
                  borderBottom: isMobile && idx < 2 ? `1px solid ${T.IK}` : "none",
                }}
              >
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, marginBottom: 4 }}>
                  {info.label}
                </p>
                <p style={{ fontSize: isMobile ? 11 : 12, fontWeight: 900 }}>
                  {info.value}
                </p>
              </div>
            ))}
          </div>

          {/* Gradient divider */}
          <div style={{ height: 6, background: `linear-gradient(to bottom, rgba(255,77,45,0.08), transparent)` }} />

          {/* Quick Navigation */}
          {!isMobile && (
            <div style={{ padding: "16px 40px", borderBottom: `1px solid ${T.IK}`, overflowX: "auto" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "nowrap" }}>
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSection(activeSection === sec.id ? null : sec.id);
                      document.getElementById(`section-${sec.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    style={{
                      padding: "8px 16px",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      border: `1px solid ${activeSection === sec.id ? T.C : T.IK}`,
                      background: activeSection === sec.id ? T.C : "transparent",
                      color: activeSection === sec.id ? T.CR : T.IK,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {sec.id}. {sec.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div style={{ padding: isMobile ? "24px 16px" : "32px 40px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              {/* Intro */}
              <div
                style={{
                  padding: isMobile ? 20 : 28,
                  border: `1px solid ${T.IK}`,
                  marginBottom: 24,
                  background: `${T.IK}05`,
                }}
              >
                <p style={{ fontSize: isMobile ? 12 : 14, lineHeight: 1.8, color: T.LIGHT_IK }}>
                  At <strong style={{ color: T.IK }}>Taskit</strong>, we are committed to protecting your privacy and ensuring transparency in how we handle your personal information. This policy explains what data we collect, how we use it, and your rights regarding your information.
                </p>
              </div>

              {/* Sections */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    id={`section-${sec.id}`}
                    style={{
                      border: `1px solid ${activeSection === sec.id ? T.C : T.IK}`,
                      transition: "border-color 0.3s ease",
                      animation: `fadeSlideIn 0.5s ease forwards`,
                      animationDelay: `${idx * 0.1}s`,
                      opacity: 0,
                    }}
                  >
                    <SectionBar n={sec.id} title={sec.title} isMobile={isMobile} />
                    
                    {/* Icon and Key Points Row */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        gap: isMobile ? 16 : 24,
                        padding: isMobile ? 16 : 24,
                        borderBottom: `1px solid ${T.IK}20`,
                        background: `${T.IK}03`,
                      }}
                    >
                      <div style={{ color: T.C, opacity: 0.8 }}>
                        {getIcon(sec.icon)}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, flex: 1 }}>
                        {sec.keyPoints.map((point, i) => (
                          <span
                            key={i}
                            style={{
                              padding: "6px 12px",
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              border: `1px solid ${T.C}40`,
                              color: T.C,
                            }}
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: isMobile ? 16 : 24 }}>
                      {sec.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Rights Summary */}
              <div
                style={{
                  marginTop: 32,
                  border: `2px solid ${T.C}`,
                  padding: isMobile ? 20 : 28,
                }}
              >
                <h3 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 900, textTransform: "uppercase", marginBottom: 16, color: T.C }}>
                  Your Data Rights at a Glance
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                    gap: 16,
                  }}
                >
                  {[
                    { right: "Access", desc: "Request a copy of all data we hold about you" },
                    { right: "Rectification", desc: "Correct any inaccurate personal information" },
                    { right: "Erasure", desc: "Request deletion of your personal data" },
                    { right: "Portability", desc: "Export your data in a machine-readable format" },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <span style={{ width: 8, height: 8, background: T.C, marginTop: 6, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 900, marginBottom: 4 }}>{item.right}</p>
                        <p style={{ fontSize: 11, color: T.LIGHT_IK }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact for privacy questions */}
              <div
                style={{
                  marginTop: 24,
                  border: `1px solid ${T.IK}`,
                  padding: isMobile ? 24 : 32,
                  textAlign: "center",
                }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, border: `1px solid ${T.C}`, marginBottom: 16, color: T.C }}>
                  {getIcon("email")}
                </div>
                <p style={{ fontSize: isMobile ? 13 : 14, fontWeight: 900, textTransform: "uppercase", marginBottom: 8 }}>
                  Questions about your data?
                </p>
                <p style={{ fontSize: isMobile ? 11 : 12, color: T.LIGHT_IK, marginBottom: 16 }}>
                  Reach our Data Protection Officer for any privacy-related inquiries
                </p>
                <a
                  href="mailto:privacy@taskit.pk"
                  style={{
                    display: "inline-block",
                    padding: "12px 24px",
                    fontSize: 11,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    background: T.C,
                    color: T.CR,
                    textDecoration: "none",
                  }}
                >
                  privacy@taskit.pk
                </a>
              </div>

              {/* Related Links */}
              <div
                style={{
                  marginTop: 24,
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                  gap: 12,
                }}
              >
                <Link
                  to="/terms"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: isMobile ? "14px 16px" : "16px 20px",
                    border: `1px solid ${T.IK}`,
                    textDecoration: "none",
                    color: T.IK,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Terms of Service
                  </span>
                  <span style={{ fontSize: 16 }}>→</span>
                </Link>
                <Link
                  to="/help"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: isMobile ? "14px 16px" : "16px 20px",
                    border: `1px solid ${T.IK}`,
                    textDecoration: "none",
                    color: T.IK,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Help Center
                  </span>
                  <span style={{ fontSize: 16 }}>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to top button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            style={{
              position: "fixed",
              bottom: isMobile ? 20 : 32,
              right: isMobile ? 20 : 32,
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: T.IK,
              color: T.CR,
              border: "none",
              cursor: "pointer",
              zIndex: 100,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {getIcon("arrowUp")}
          </button>
        )}

        {/* Keyframes */}
        <style>{`
          @keyframes fadeSlideIn {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </SharedLayout>
  );
};

export default Privacy;
