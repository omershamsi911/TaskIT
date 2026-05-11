// terms.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";

// Custom hook for responsive design
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
};

// SVG Icons
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ScaleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const PrintIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect width="12" height="8" x="6" y="14" />
  </svg>
);

const ChevronIcon = ({ isOpen }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ 
      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
      transition: "transform 0.3s ease" 
    }}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const SectionBar = ({ n, title, isOpen }) => (
  <div
    className="flex items-center justify-between transition-colors"
    style={{ 
      background: isOpen ? T.C : T.IK,
      padding: "12px 20px"
    }}
  >
    <span 
      className="font-black uppercase tracking-wider"
      style={{ fontSize: "11px", color: isOpen ? T.CR : T.C }}
    >
      {title}
    </span>
    <span 
      className="font-black font-mono"
      style={{ fontSize: "12px", color: T.CR, opacity: 0.5 }}
    >
      {n}
    </span>
  </div>
);

const Terms = () => {
  const [openSection, setOpenSection] = useState("01");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 900px)");

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const clauses = [
    {
      id: "01",
      title: "Acceptance of Terms",
      icon: <DocumentIcon />,
      text: "By using Taskit, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.",
      highlights: [
        "Binding agreement upon first use",
        "Includes Privacy Policy acceptance",
        "Must be 18+ to use services"
      ]
    },
    {
      id: "02",
      title: "User Accounts",
      icon: <ShieldIcon />,
      text: "You must provide accurate information and are responsible for all activity under your account. One person may hold only one active account. Accounts cannot be transferred.",
      highlights: [
        "One account per person",
        "Accurate information required",
        "Non-transferable accounts"
      ]
    },
    {
      id: "03",
      title: "Service Listings & Bookings",
      icon: <DocumentIcon />,
      text: "Providers are independent contractors, not employees of Taskit. We facilitate connections but are not responsible for the quality of work. Users agree to communicate and resolve disputes directly or via our support team.",
      highlights: [
        "Providers are independent contractors",
        "Taskit facilitates connections only",
        "Dispute resolution available"
      ]
    },
    {
      id: "04",
      title: "Payments & Fees",
      icon: <DocumentIcon />,
      text: "All payments are processed securely. Taskit holds funds in escrow until job completion. Service fees (10-15% per transaction) are shown before booking. Refunds are issued according to our cancellation policy.",
      highlights: [
        "Secure payment processing",
        "Escrow protection for all transactions",
        "Transparent fee structure (10-15%)"
      ]
    },
    {
      id: "05",
      title: "Prohibited Conduct",
      icon: <AlertIcon />,
      text: "No harassment, fraud, illegal services, off-platform payments, or fake reviews. Violations result in immediate suspension and forfeiture of any pending payouts.",
      highlights: [
        "Zero tolerance for harassment",
        "No off-platform payments",
        "Immediate suspension for violations"
      ],
      isWarning: true
    },
    {
      id: "06",
      title: "Limitation of Liability",
      icon: <ScaleIcon />,
      text: "Taskit is not liable for indirect damages, loss of profits, or injuries arising from services. Maximum liability is the amount paid for the specific booking.",
      highlights: [
        "Limited to booking amount",
        "No indirect damage liability",
        "Users assume service risks"
      ]
    },
    {
      id: "07",
      title: "Changes to Terms",
      icon: <DocumentIcon />,
      text: "We may update these terms with 14 days notice via email or in-app notification. Continued use after changes constitutes acceptance.",
      highlights: [
        "14 days advance notice",
        "Email & in-app notifications",
        "Continued use = acceptance"
      ]
    },
  ];

  const keyPoints = [
    { label: "Effective Date", value: "January 1, 2026" },
    { label: "Last Updated", value: "April 15, 2026" },
    { label: "Version", value: "3.2" },
    { label: "Jurisdiction", value: "Pakistan" },
  ];

  const toggleSection = (id) => setOpenSection(openSection === id ? null : id);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <SharedLayout>
      <div
        className="min-h-screen font-sans relative"
        style={{ background: T.CR, color: T.IK }}
      >
        {/* Grid overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0H0v20' fill='none' stroke='%23${T.C.replace('#', '')}' stroke-opacity='0.06' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <div 
            className="border-b"
            style={{ borderColor: T.IK }}
          >
            <div 
              className="mx-auto"
              style={{ 
                maxWidth: "1000px",
                padding: isMobile ? "32px 20px" : isTablet ? "40px 32px" : "48px"
              }}
            >
              <div 
                className="inline-block mb-4 font-black uppercase tracking-wider border-l-4"
                style={{ 
                  borderLeftColor: T.C,
                  padding: "4px 12px",
                  fontSize: "10px"
                }}
              >
                LEGAL
              </div>
              
              <h1
                className="font-black uppercase leading-none tracking-tight"
                style={{ fontSize: isMobile ? "32px" : isTablet ? "44px" : "56px" }}
              >
                Terms of Service
              </h1>
              
              <p 
                className="mt-3"
                style={{ 
                  fontSize: isMobile ? "13px" : "15px",
                  color: T.LIGHT_IK,
                  maxWidth: "600px"
                }}
              >
                Please read these terms carefully before using Taskit. By accessing or using our platform, you agree to be bound by these terms.
              </p>

              {/* Key points strip */}
              <div 
                className="mt-6 flex flex-wrap gap-4"
                style={{ 
                  borderTop: `1px solid ${T.IK}20`,
                  paddingTop: "16px"
                }}
              >
                {keyPoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-mono" style={{ fontSize: "10px", color: T.LIGHT_IK }}>
                      {point.label}:
                    </span>
                    <span className="font-black uppercase" style={{ fontSize: "11px", color: T.C }}>
                      {point.value}
                    </span>
                  </div>
                ))}
              </div>

              
            </div>
          </div>

          {/* Gradient divider */}
          <div 
            className="h-1"
            style={{ background: `linear-gradient(to right, ${T.C}, ${T.C}40, transparent)` }}
          />

          {/* Table of contents - sticky on desktop */}
          <div 
            className="border-b"
            style={{ borderColor: `${T.IK}20`, background: T.CR_ALT }}
          >
            <div 
              className="mx-auto"
              style={{ 
                maxWidth: "1000px",
                padding: isMobile ? "16px 20px" : "20px 48px"
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="font-black uppercase" style={{ fontSize: "11px" }}>
                  Quick Navigation
                </span>
                <span className="font-mono" style={{ fontSize: "10px", color: T.LIGHT_IK }}>
                  ({clauses.length} sections)
                </span>
              </div>
              <div 
                className="flex flex-wrap gap-2"
              >
                {clauses.map((clause) => (
                  <button
                    key={clause.id}
                    onClick={() => setOpenSection(clause.id)}
                    className="font-mono uppercase transition-all"
                    style={{
                      padding: "6px 12px",
                      fontSize: "10px",
                      background: openSection === clause.id ? T.IK : "transparent",
                      color: openSection === clause.id ? T.CR : T.LIGHT_IK,
                      border: `1px solid ${openSection === clause.id ? T.IK : `${T.IK}30`}`
                    }}
                  >
                    {clause.id}. {clause.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div 
            className="flex-1"
            style={{ padding: isMobile ? "32px 20px" : isTablet ? "40px 32px" : "48px" }}
          >
            <div 
              className="mx-auto"
              style={{ maxWidth: "800px" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {clauses.map((clause) => (
                  <div 
                    key={clause.id} 
                    className="border overflow-hidden transition-all"
                    style={{ 
                      borderColor: openSection === clause.id ? (clause.isWarning ? "#f87171" : T.C) : `${T.IK}40`,
                      borderWidth: openSection === clause.id ? "2px" : "1px"
                    }}
                  >
                    <button
                      onClick={() => toggleSection(clause.id)}
                      className="w-full"
                    >
                      <SectionBar n={clause.id} title={clause.title} isOpen={openSection === clause.id} />
                    </button>
                    
                    <div
                      style={{
                        maxHeight: openSection === clause.id ? "500px" : "0",
                        overflow: "hidden",
                        transition: "max-height 0.4s ease"
                      }}
                    >
                      <div 
                        style={{ 
                          padding: isMobile ? "20px" : "24px",
                          background: clause.isWarning ? "#fef2f2" : T.CR
                        }}
                      >
                        {clause.isWarning && (
                          <div 
                            className="flex items-center gap-2 mb-4 font-black uppercase"
                            style={{ fontSize: "11px", color: "#dc2626" }}
                          >
                            <AlertIcon />
                            Important Warning
                          </div>
                        )}
                        
                        <p 
                          className="leading-relaxed"
                          style={{ 
                            fontSize: isMobile ? "13px" : "14px",
                            color: T.LIGHT_IK
                          }}
                        >
                          {clause.text}
                        </p>
                        
                        {clause.highlights && (
                          <div 
                            className="mt-4 pt-4 border-t"
                            style={{ borderColor: `${T.IK}15` }}
                          >
                            <div 
                              className="font-black uppercase mb-3"
                              style={{ fontSize: "10px", color: T.C }}
                            >
                              Key Points
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {clause.highlights.map((highlight, i) => (
                                <div 
                                  key={i}
                                  className="flex items-center gap-3"
                                >
                                  <div 
                                    className="flex items-center justify-center flex-shrink-0"
                                    style={{ 
                                      width: "20px", 
                                      height: "20px", 
                                      background: clause.isWarning ? "#fecaca" : `${T.C}20`,
                                      color: clause.isWarning ? "#dc2626" : T.C
                                    }}
                                  >
                                    <CheckIcon />
                                  </div>
                                  <span 
                                    className="font-mono"
                                    style={{ fontSize: "12px", color: T.LIGHT_IK }}
                                  >
                                    {highlight}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Governing law section */}
              <div 
                className="mt-8 border-4 text-center"
                style={{ 
                  borderColor: T.IK,
                  padding: isMobile ? "32px 20px" : "40px"
                }}
              >
                <div 
                  className="inline-flex items-center justify-center mb-4"
                  style={{ color: T.C }}
                >
                  <ScaleIcon />
                </div>
                <h3 
                  className="font-black uppercase"
                  style={{ fontSize: isMobile ? "18px" : "22px" }}
                >
                  Governing Law: Pakistan
                </h3>
                <p 
                  className="mt-3 mx-auto"
                  style={{ 
                    fontSize: isMobile ? "13px" : "14px",
                    color: T.LIGHT_IK,
                    maxWidth: "500px"
                  }}
                >
                  These terms are governed by the laws of the Islamic Republic of Pakistan. Disputes shall be resolved through binding arbitration in Karachi.
                </p>
                
                {/* Acceptance checkbox */}
                <div 
                  className="mt-6 pt-6 border-t"
                  style={{ borderColor: `${T.IK}20` }}
                >
                  <label 
                    className="flex items-center justify-center gap-3 cursor-pointer"
                    style={{ 
                      padding: "12px 20px",
                      background: acceptedTerms ? `${T.C}10` : "transparent"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div 
                      className="flex items-center justify-center flex-shrink-0 border-2 transition-all"
                      style={{ 
                        width: "24px", 
                        height: "24px",
                        borderColor: acceptedTerms ? T.C : T.IK,
                        background: acceptedTerms ? T.C : "transparent",
                        color: acceptedTerms ? T.CR : "transparent"
                      }}
                    >
                      <CheckIcon />
                    </div>
                    <span 
                      className="font-mono"
                      style={{ fontSize: "13px", color: T.LIGHT_IK }}
                    >
                      I have read and agree to the Terms of Service
                    </span>
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    to="/register"
                    className="inline-block font-black uppercase tracking-wide transition-all"
                    style={{ 
                      background: acceptedTerms ? T.C : `${T.IK}30`,
                      color: acceptedTerms ? T.CR : T.LIGHT_IK,
                      padding: isMobile ? "14px 28px" : "16px 40px",
                      fontSize: "13px",
                      pointerEvents: acceptedTerms ? "auto" : "none"
                    }}
                  >
                    Accept & Continue
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-block font-black uppercase tracking-wide border-2 transition-all hover:bg-black hover:text-white"
                    style={{ 
                      borderColor: T.IK,
                      padding: isMobile ? "12px 24px" : "14px 36px",
                      fontSize: "13px"
                    }}
                  >
                    Questions?
                  </Link>
                </div>
              </div>

              {/* Related links */}
              <div 
                className="mt-8 grid gap-4"
                style={{ gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)" }}
              >
                <Link
                  to="/privacy"
                  className="flex items-center justify-between border transition-all hover:border-current"
                  style={{ 
                    borderColor: `${T.IK}30`,
                    padding: "20px"
                  }}
                >
                  <div>
                    <div className="font-black uppercase" style={{ fontSize: "13px" }}>
                      Privacy Policy
                    </div>
                    <div className="font-mono mt-1" style={{ fontSize: "11px", color: T.LIGHT_IK }}>
                      How we handle your data
                    </div>
                  </div>
                  <ChevronIcon />
                </Link>
                <Link
                  to="/help"
                  className="flex items-center justify-between border transition-all hover:border-current"
                  style={{ 
                    borderColor: `${T.IK}30`,
                    padding: "20px"
                  }}
                >
                  <div>
                    <div className="font-black uppercase" style={{ fontSize: "13px" }}>
                      Help Center
                    </div>
                    <div className="font-mono mt-1" style={{ fontSize: "11px", color: T.LIGHT_IK }}>
                      FAQs and support
                    </div>
                  </div>
                  <ChevronIcon />
                </Link>
              </div>
            </div>
          </div>

          {/* Footer strip */}
          <div 
            className="border-t"
            style={{ borderColor: T.IK, background: T.IK, color: T.CR }}
          >
            <div 
              className="mx-auto flex items-center justify-between"
              style={{ 
                maxWidth: "1000px",
                padding: isMobile ? "16px 20px" : "20px 48px",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "8px" : "0",
                textAlign: isMobile ? "center" : "left"
              }}
            >
              <div className="font-mono" style={{ fontSize: "11px", opacity: 0.7 }}>
                Taskit Technologies Pvt. Ltd. All rights reserved.
              </div>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="font-mono underline" style={{ fontSize: "11px" }}>
                  Privacy
                </Link>
                <Link to="/cookies" className="font-mono underline" style={{ fontSize: "11px" }}>
                  Cookies
                </Link>
                <Link to="/contact" className="font-mono underline" style={{ fontSize: "11px" }}>
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to top button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center border-2 transition-all hover:scale-110"
            style={{
              width: "48px",
              height: "48px",
              background: T.IK,
              color: T.CR,
              borderColor: T.IK
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
        )}
      </div>
    </SharedLayout>
  );
};

export default Terms;
