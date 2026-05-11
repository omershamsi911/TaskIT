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

// Animated counter hook
const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, start, hasStarted]);

  return [count, () => setHasStarted(true)];
};

const SectionBar = ({ n, title, isMobile }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
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

const HowItWorks = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 900px)");
  const [activeStep, setActiveStep] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [taskCount, startTaskCount] = useCountUp(50000, 2000);
  const [providerCount, startProviderCount] = useCountUp(5000, 2000);
  const [cityCount, startCityCount] = useCountUp(25, 1500);
  const [ratingCount, startRatingCount] = useCountUp(49, 1500);

  useEffect(() => {
    const timer = setTimeout(() => {
      startTaskCount();
      startProviderCount();
      startCityCount();
      startRatingCount();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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
      describe: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      ),
      ai: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
          <path d="M12 2a10 10 0 0 1 10 10"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      compare: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      book: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      track: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      review: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      check: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
      shield: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      arrowUp: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"/>
          <polyline points="5 12 12 5 19 12"/>
        </svg>
      ),
      play: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      ),
    };
    return icons[type];
  };

  const steps = [
    { 
      step: "01", 
      title: "Describe your task", 
      desc: "Tell us what you need - plumbing, cleaning, tutoring, or any service. Add photos, address, and preferred time.",
      icon: "describe",
      detail: "Our smart form auto-suggests categories and helps you specify requirements clearly.",
    },
    { 
      step: "02", 
      title: "AI instant matching", 
      desc: "Our algorithm scans verified providers, availability, ratings, and price. You get 2-4 top matches in under 30 seconds.",
      icon: "ai",
      detail: "Machine learning optimizes matches based on 50+ factors including past satisfaction.",
    },
    { 
      step: "03", 
      title: "Compare & chat", 
      desc: "View provider profiles, certifications, and past reviews. Chat directly to confirm details or ask questions.",
      icon: "compare",
      detail: "Real-time messaging with read receipts and automatic translation support.",
    },
    { 
      step: "04", 
      title: "Book & pay securely", 
      desc: "Pay via card, bank transfer, or wallet. Funds are held in escrow - only released when you approve the job.",
      icon: "book",
      detail: "PCI-compliant payments with fraud protection and instant refund capability.",
    },
    { 
      step: "05", 
      title: "Job tracking", 
      desc: "Get real-time status: provider ETA, start/finish notifications, and in-app completion checklist.",
      icon: "track",
      detail: "Live GPS tracking, photo updates, and milestone notifications throughout.",
    },
    { 
      step: "06", 
      title: "Review & release", 
      desc: "Inspect the work, confirm satisfaction, and release payment. Both parties leave reviews to strengthen trust.",
      icon: "review",
      detail: "Detailed rating system covering quality, punctuality, communication, and value.",
    },
  ];

  const features = [
    { label: "Background-checked professionals", icon: "shield" },
    { label: "Transparent pricing (no hidden fees)", icon: "check" },
    { label: "24/7 customer support", icon: "check" },
    { label: "Free rework guarantee", icon: "check" },
    { label: "Provider insurance for damages", icon: "shield" },
    { label: "Secure escrow payments", icon: "shield" },
  ];

  const stats = [
    { value: `${taskCount.toLocaleString()}+`, label: "Tasks Completed" },
    { value: `${providerCount.toLocaleString()}+`, label: "Verified Providers" },
    { value: `${cityCount}+`, label: "Cities Covered" },
    { value: `${(ratingCount / 10).toFixed(1)}`, label: "Average Rating" },
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
              How Taskit Works
            </h1>
            <p
              style={{
                fontSize: isMobile ? 9 : 10,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginTop: 8,
                color: T.LIGHT_IK,
              }}
            >
              From request to completion - fully digital, fully transparent
            </p>
          </div>

          {/* Gradient divider */}
          <div style={{ height: 6, background: `linear-gradient(to bottom, rgba(255,77,45,0.08), transparent)` }} />

          {/* Stats Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              borderBottom: `1px solid ${T.IK}`,
            }}
          >
            {stats.map((stat, idx) => (
              <div
                key={idx}
                style={{
                  padding: isMobile ? "16px" : "20px 24px",
                  borderRight: (!isMobile || idx % 2 === 0) && idx < stats.length - 1 ? `1px solid ${T.IK}` : "none",
                  borderBottom: isMobile && idx < 2 ? `1px solid ${T.IK}` : "none",
                  textAlign: "center",
                  animation: `fadeSlideIn 0.5s ease forwards`,
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0,
                }}
              >
                <p
                  style={{
                    fontSize: isMobile ? "1.5rem" : "2rem",
                    fontWeight: 900,
                    color: T.C,
                    margin: 0,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: isMobile ? 9 : 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: T.LIGHT_IK,
                    marginTop: 4,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div style={{ padding: isMobile ? "24px 16px" : "32px 40px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              {/* Video CTA */}
              

              {/* Steps Section */}
              <div style={{ border: `1px solid ${T.IK}`, marginBottom: 32 }}>
                <SectionBar n="01" title="The Process" isMobile={isMobile} />
                
                <div style={{ padding: isMobile ? 16 : 0 }}>
                  {steps.map((s, idx) => (
                    <div
                      key={s.step}
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "flex-start" : "stretch",
                        borderBottom: idx < steps.length - 1 ? `1px solid ${T.IK}` : "none",
                        cursor: "pointer",
                        background: activeStep === s.step ? `${T.C}08` : "transparent",
                        transition: "background 0.2s ease",
                      }}
                      onClick={() => setActiveStep(activeStep === s.step ? null : s.step)}
                      onMouseEnter={() => !isMobile && setActiveStep(s.step)}
                      onMouseLeave={() => !isMobile && setActiveStep(null)}
                    >
                      {/* Step Number */}
                      <div
                        style={{
                          width: isMobile ? "100%" : 100,
                          padding: isMobile ? "16px 0" : 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRight: isMobile ? "none" : `1px solid ${T.IK}`,
                          borderBottom: isMobile ? `1px solid ${T.IK}20` : "none",
                        }}
                      >
                        <span
                          style={{
                            fontSize: isMobile ? "2rem" : "2.5rem",
                            fontWeight: 900,
                            color: activeStep === s.step ? T.C : T.IK,
                            opacity: activeStep === s.step ? 1 : 0.15,
                            transition: "all 0.2s ease",
                          }}
                        >
                          {s.step}
                        </span>
                      </div>

                      {/* Content */}
                      <div
                        style={{
                          flex: 1,
                          padding: isMobile ? "16px 0" : 24,
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "flex-start" : "center",
                          gap: isMobile ? 12 : 20,
                        }}
                      >
                        <div
                          style={{
                            color: activeStep === s.step ? T.C : T.IK,
                            opacity: activeStep === s.step ? 1 : 0.6,
                            transition: "all 0.2s ease",
                          }}
                        >
                          {getIcon(s.icon)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontSize: isMobile ? 13 : 14,
                              fontWeight: 900,
                              textTransform: "uppercase",
                              marginBottom: 6,
                              color: activeStep === s.step ? T.C : T.IK,
                              transition: "color 0.2s ease",
                            }}
                          >
                            {s.title}
                          </h3>
                          <p style={{ fontSize: isMobile ? 11 : 12, lineHeight: 1.7, color: T.LIGHT_IK, margin: 0 }}>
                            {s.desc}
                          </p>
                          {activeStep === s.step && (
                            <p
                              style={{
                                fontSize: isMobile ? 10 : 11,
                                lineHeight: 1.6,
                                color: T.C,
                                marginTop: 8,
                                paddingTop: 8,
                                borderTop: `1px solid ${T.C}30`,
                                animation: "fadeIn 0.3s ease",
                              }}
                            >
                              {s.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Features */}
              <div style={{ border: `1px solid ${T.IK}`, marginBottom: 32 }}>
                <SectionBar n="02" title="Why users trust Taskit" isMobile={isMobile} />
                <div
                  style={{
                    padding: isMobile ? 20 : 28,
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                    gap: isMobile ? 12 : 16,
                  }}
                >
                  {features.map((feat, i) => (
                    <FeatureItem key={i} {...feat} getIcon={getIcon} isMobile={isMobile} />
                  ))}
                </div>
              </div>

              {/* For Providers */}
              <div style={{ border: `1px solid ${T.IK}`, marginBottom: 32 }}>
                <SectionBar n="03" title="For service providers" isMobile={isMobile} />
                <div style={{ padding: isMobile ? 20 : 28 }}>
                  <p style={{ fontSize: isMobile ? 13 : 14, fontWeight: 900, textTransform: "uppercase", marginBottom: 12 }}>
                    Join the network & grow your business
                  </p>
                  <p style={{ fontSize: isMobile ? 11 : 12, lineHeight: 1.8, color: T.LIGHT_IK, marginBottom: 20 }}>
                    Create a provider profile, set your rates, and get matched with nearby customers.
                    We handle payment collection, scheduling tools, and dispute resolution. No upfront fees -
                    only a success commission when you complete a job.
                  </p>
                  
                  {/* Provider benefits */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                      gap: 12,
                      marginBottom: 24,
                    }}
                  >
                    {[
                      { stat: "0%", label: "Upfront Fees" },
                      { stat: "15%", label: "Success Commission" },
                      { stat: "24hr", label: "Payout Time" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: isMobile ? 16 : 20,
                          border: `1px solid ${T.IK}`,
                          textAlign: "center",
                        }}
                      >
                        <p style={{ fontSize: isMobile ? "1.3rem" : "1.5rem", fontWeight: 900, color: T.C, margin: 0 }}>
                          {item.stat}
                        </p>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: T.LIGHT_IK, marginTop: 4 }}>
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/register?type=provider"
                    style={{
                      display: "inline-block",
                      padding: isMobile ? "14px 24px" : "16px 32px",
                      fontSize: isMobile ? 10 : 11,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      background: T.C,
                      color: T.CR,
                      textDecoration: "none",
                    }}
                  >
                    Become a provider →
                  </Link>
                </div>
              </div>

              {/* CTA Section */}
              <div
                style={{
                  border: `2px solid ${T.IK}`,
                  padding: isMobile ? 28 : 40,
                  textAlign: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: isMobile ? "1.3rem" : "1.6rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Ready to get things done?
                </h2>
                <p style={{ fontSize: isMobile ? 12 : 13, color: T.LIGHT_IK, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
                  Find a trusted professional in your city today. First task is on us!
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                  <Link
                    to="/services"
                    style={{
                      padding: isMobile ? "14px 24px" : "16px 32px",
                      fontSize: isMobile ? 10 : 11,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      border: `2px solid ${T.C}`,
                      color: T.C,
                      textDecoration: "none",
                      background: "transparent",
                    }}
                  >
                    Search services
                  </Link>
                  <Link
                    to="/register"
                    style={{
                      padding: isMobile ? "14px 24px" : "16px 32px",
                      fontSize: isMobile ? 10 : 11,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      background: T.IK,
                      color: T.CR,
                      textDecoration: "none",
                    }}
                  >
                    Create account
                  </Link>
                </div>
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
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    </SharedLayout>
  );
};

const FeatureItem = ({ label, icon, getIcon, isMobile }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: isMobile ? "12px 14px" : "14px 16px",
        border: `1px solid ${hovered ? T.C : T.IK}`,
        background: hovered ? `${T.C}08` : "transparent",
        transition: "all 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ color: T.C, opacity: hovered ? 1 : 0.7, transition: "opacity 0.2s" }}>
        {getIcon(icon)}
      </span>
      <span
        style={{
          fontSize: isMobile ? 10 : 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default HowItWorks;
