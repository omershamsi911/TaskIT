// help.jsx
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
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const RocketIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const WrenchIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ScaleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </svg>
);

const MessageIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
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

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22,4 12,14.01 9,11.01" />
  </svg>
);

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect width="15" height="14" x="1" y="5" rx="2" ry="2" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </svg>
);

const Help = () => {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 900px)");

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories = [
    { name: "Getting Started", icon: <RocketIcon />, count: 8, color: T.C, description: "Account setup, first booking" },
    { name: "Payments & Billing", icon: <CreditCardIcon />, count: 6, color: "#4ade80", description: "Payment methods, invoices" },
    { name: "Provider Help", icon: <WrenchIcon />, count: 10, color: "#facc15", description: "Join as provider, earnings" },
    { name: "Account & Security", icon: <ShieldIcon />, count: 7, color: "#60a5fa", description: "Password, privacy settings" },
    { name: "Disputes & Refunds", icon: <ScaleIcon />, count: 5, color: "#f87171", description: "Cancellations, refund policy" },
    { name: "Tech Support", icon: <PhoneIcon />, count: 9, color: "#a78bfa", description: "App issues, troubleshooting" },
  ];

  const faqs = [
    { id: 1, q: "How do I create an account?", a: "Click 'Register' on the top right, enter your phone number or email, verify OTP, and complete your profile in 2 minutes.", category: "Getting Started" },
    { id: 2, q: "What payment methods are accepted?", a: "Credit/debit cards, EasyPaisa, JazzCash, and bank transfers. All payments are held in escrow until job completion.", category: "Payments & Billing" },
    { id: 3, q: "How are providers verified?", a: "We run CNIC checks, criminal record verification, skill tests, and in-person interviews. Only 1 in 5 applicants pass.", category: "Provider Help" },
    { id: 4, q: "Can I cancel a booking?", a: "Yes, free cancellation up to 2 hours before the job. After that, a 50% fee may apply. Go to 'My Bookings' → Cancel.", category: "Disputes & Refunds" },
    { id: 5, q: "What if the provider doesn't show up?", a: "Report it within 1 hour. We'll refund you fully and find a replacement provider immediately.", category: "Disputes & Refunds" },
    { id: 6, q: "How do I become a provider?", a: "Apply through the 'Become a Provider' link. Submit your CNIC, skills, and a short video introduction. Our team reviews within 48h.", category: "Provider Help" },
    { id: 7, q: "Is there a fee for using Taskit?", a: "For customers: no platform fee. For providers: 12% success fee per completed job. No hidden charges.", category: "Payments & Billing" },
    { id: 8, q: "How do I reset my password?", a: "On login page, click 'Forgot password', enter your email, and follow the link sent to you. Valid for 15 minutes.", category: "Account & Security" },
  ];

  const popularTopics = ["Account Setup", "Payment Failed", "Cancel Booking", "Report Provider", "Refund Status"];

  const quickHelp = [
    { icon: <BookIcon />, title: "User Guides", desc: "Step-by-step tutorials" },
    { icon: <VideoIcon />, title: "Video Tutorials", desc: "Watch and learn" },
    { icon: <HeadphonesIcon />, title: "Live Support", desc: "Talk to our team" },
  ];

  const stats = [
    { value: "98%", label: "Issues Resolved" },
    { value: "<2min", label: "Avg Response" },
    { value: "24/7", label: "Support Hours" },
    { value: "4.9", label: "Support Rating" },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.q.toLowerCase().includes(search.toLowerCase()) || faq.a.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id) => setOpenFaq(openFaq === id ? null : id);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <SharedLayout>
      <div className="min-h-screen font-sans" style={{ background: T.CR, color: T.IK }}>
        {/* Hero section with search */}
        <div className="relative overflow-hidden border-b" style={{ borderColor: T.IK }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ background: `${T.C}10` }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ background: `${T.C}08` }} />
          
          <div 
            className="relative z-10 mx-auto"
            style={{ 
              padding: isMobile ? "40px 20px 48px" : isTablet ? "48px 32px 56px" : "64px 48px 72px",
              maxWidth: "1200px"
            }}
          >
            <div 
              className="inline-block mb-6 font-black uppercase tracking-wider border-l-4"
              style={{ 
                borderLeftColor: T.C,
                padding: isMobile ? "4px 12px" : "6px 16px",
                fontSize: isMobile ? "10px" : "11px"
              }}
            >
              HELP CENTER
            </div>
            
            <h1 
              className="font-black uppercase leading-none tracking-tight"
              style={{ fontSize: isMobile ? "36px" : isTablet ? "48px" : "72px" }}
            >
              How can we<br />
              <span style={{ color: T.C }}>help you today?</span>
            </h1>
            
            <p 
              className="mt-4 max-w-xl"
              style={{ 
                color: T.LIGHT_IK, 
                fontSize: isMobile ? "14px" : "16px",
                lineHeight: 1.6
              }}
            >
              Search our knowledge base or browse categories below. Our support team is available 24/7 to assist you.
            </p>
            
            {/* Search box */}
            <div className="mt-8" style={{ maxWidth: isMobile ? "100%" : "600px" }}>
              <div 
                className="flex border-2 overflow-hidden"
                style={{ borderColor: T.IK }}
              >
                <div 
                  className="flex items-center justify-center"
                  style={{ 
                    padding: isMobile ? "12px" : "16px",
                    color: T.LIGHT_IK
                  }}
                >
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isMobile ? "Search help articles..." : "Search for 'payment', 'cancel', 'verification'..."}
                  className="flex-1 bg-transparent outline-none font-mono"
                  style={{ 
                    color: T.IK,
                    fontSize: isMobile ? "14px" : "15px",
                    padding: isMobile ? "12px 0" : "16px 0"
                  }}
                />
                <button 
                  className="font-black uppercase transition-opacity hover:opacity-80"
                  style={{ 
                    background: T.C, 
                    color: T.CR,
                    padding: isMobile ? "12px 20px" : "16px 32px",
                    fontSize: isMobile ? "12px" : "13px"
                  }}
                >
                  {isMobile ? "GO" : "SEARCH"}
                </button>
              </div>
              <div 
                className="mt-3 text-right font-mono"
                style={{ fontSize: "11px", color: T.LIGHT_IK }}
              >
                {filteredFaqs.length} results found
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div 
          className="border-b"
          style={{ borderColor: T.IK, background: T.CR_ALT }}
        >
          <div 
            className="mx-auto grid"
            style={{ 
              maxWidth: "1200px",
              padding: isMobile ? "16px 20px" : "20px 48px",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              gap: isMobile ? "16px" : "24px"
            }}
          >
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className="text-center"
                style={{ 
                  padding: isMobile ? "8px" : "12px",
                  borderLeft: i > 0 && !isMobile ? `1px solid ${T.IK}20` : "none",
                  borderTop: isMobile && i >= 2 ? `1px solid ${T.IK}20` : "none"
                }}
              >
                <div 
                  className="font-black"
                  style={{ fontSize: isMobile ? "24px" : "32px", color: T.C }}
                >
                  {stat.value}
                </div>
                <div 
                  className="font-mono uppercase"
                  style={{ fontSize: "10px", color: T.LIGHT_IK, marginTop: "4px" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick help options */}
        <div 
          className="mx-auto"
          style={{ 
            maxWidth: "1200px",
            padding: isMobile ? "32px 20px" : isTablet ? "40px 32px" : "48px"
          }}
        >
          <div 
            className="grid gap-4"
            style={{ gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)" }}
          >
            {quickHelp.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border cursor-pointer transition-all hover:border-current"
                style={{ 
                  borderColor: `${T.IK}30`,
                  padding: isMobile ? "16px" : "20px",
                  background: T.CR
                }}
              >
                <div 
                  className="flex items-center justify-center rounded-full"
                  style={{ 
                    width: "48px", 
                    height: "48px", 
                    background: `${T.C}15`,
                    color: T.C
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="font-black uppercase" style={{ fontSize: "14px" }}>{item.title}</div>
                  <div className="font-mono" style={{ fontSize: "12px", color: T.LIGHT_IK }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories grid */}
        <div 
          className="mx-auto"
          style={{ 
            maxWidth: "1200px",
            padding: isMobile ? "0 20px 40px" : isTablet ? "0 32px 48px" : "0 48px 56px"
          }}
        >
          <div 
            className="flex justify-between items-end border-b pb-4 mb-8"
            style={{ borderColor: `${T.IK}30` }}
          >
            <h2 
              className="font-black uppercase"
              style={{ fontSize: isMobile ? "20px" : "28px" }}
            >
              Browse by topic
            </h2>
            <span className="font-mono" style={{ fontSize: "11px", color: T.LIGHT_IK }}>
              {categories.length} categories
            </span>
          </div>
          
          <div 
            className="grid gap-4"
            style={{ 
              gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)"
            }}
          >
            {categories.map((cat, i) => (
              <div
                key={i}
                onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                className="group border cursor-pointer transition-all"
                style={{ 
                  borderColor: activeCategory === cat.name ? cat.color : `${T.IK}30`,
                  background: activeCategory === cat.name ? `${cat.color}10` : T.CR,
                  padding: isMobile ? "20px" : "24px",
                  borderLeftWidth: "4px",
                  borderLeftColor: cat.color
                }}
              >
                <div className="flex items-start justify-between">
                  <div 
                    className="transition-transform group-hover:scale-110"
                    style={{ color: cat.color }}
                  >
                    {cat.icon}
                  </div>
                  <div 
                    className="flex items-center gap-1 font-mono"
                    style={{ fontSize: "11px", color: T.LIGHT_IK }}
                  >
                    <CheckCircleIcon />
                    {cat.count} articles
                  </div>
                </div>
                <div 
                  className="font-black uppercase mt-4"
                  style={{ fontSize: "15px" }}
                >
                  {cat.name}
                </div>
                <div 
                  className="font-mono mt-1"
                  style={{ fontSize: "12px", color: T.LIGHT_IK }}
                >
                  {cat.description}
                </div>
              </div>
            ))}
          </div>
          
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="mt-4 font-mono underline"
              style={{ fontSize: "12px", color: T.C }}
            >
              Clear filter: {activeCategory}
            </button>
          )}
        </div>

        {/* FAQ accordion section */}
        <div 
          className="border-t"
          style={{ borderColor: T.IK, background: T.CR_ALT }}
        >
          <div 
            className="mx-auto"
            style={{ 
              maxWidth: "900px",
              padding: isMobile ? "40px 20px" : isTablet ? "48px 32px" : "64px 48px"
            }}
          >
            <div className="text-center mb-10">
              <span 
                className="inline-block font-mono uppercase"
                style={{ 
                  background: T.C, 
                  color: T.CR,
                  padding: "6px 16px",
                  fontSize: "11px"
                }}
              >
                MOST ASKED
              </span>
              <h2 
                className="font-black uppercase mt-4"
                style={{ fontSize: isMobile ? "28px" : isTablet ? "36px" : "44px" }}
              >
                Frequently asked questions
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredFaqs.map((faq) => (
                <div 
                  key={faq.id} 
                  className="border overflow-hidden"
                  style={{ 
                    borderColor: openFaq === faq.id ? T.C : `${T.IK}40`,
                    background: T.CR
                  }}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex justify-between items-center text-left font-black uppercase tracking-wide transition-colors"
                    style={{ 
                      padding: isMobile ? "16px" : "20px 24px",
                      background: openFaq === faq.id ? T.IK : "transparent", 
                      color: openFaq === faq.id ? T.CR : T.IK,
                      fontSize: isMobile ? "13px" : "14px"
                    }}
                  >
                    <span style={{ paddingRight: "16px" }}>{faq.q}</span>
                    <ChevronIcon isOpen={openFaq === faq.id} />
                  </button>
                  <div
                    style={{
                      maxHeight: openFaq === faq.id ? "300px" : "0",
                      overflow: "hidden",
                      transition: "max-height 0.3s ease"
                    }}
                  >
                    <div 
                      className="border-t leading-relaxed"
                      style={{ 
                        borderColor: `${T.IK}20`,
                        padding: isMobile ? "16px" : "20px 24px",
                        fontSize: isMobile ? "13px" : "14px",
                        color: T.LIGHT_IK
                      }}
                    >
                      {faq.a}
                      <div 
                        className="mt-3 pt-3 border-t flex items-center gap-2"
                        style={{ borderColor: `${T.IK}15` }}
                      >
                        <span className="font-mono" style={{ fontSize: "10px", color: `${T.IK}60` }}>
                          Category:
                        </span>
                        <span 
                          className="font-mono uppercase"
                          style={{ fontSize: "10px", color: T.C }}
                        >
                          {faq.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredFaqs.length === 0 && (
                <div 
                  className="text-center border"
                  style={{ 
                    padding: "48px 24px",
                    borderColor: `${T.IK}20`,
                    color: T.LIGHT_IK
                  }}
                >
                  <div style={{ fontSize: "14px" }}>No results found for your search.</div>
                  <div className="font-mono mt-2" style={{ fontSize: "12px" }}>
                    Try different keywords or{" "}
                    <Link to="/contact" style={{ color: T.C, textDecoration: "underline" }}>
                      contact support
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular topics + Quick contact strip */}
        <div 
          className="border-y"
          style={{ borderColor: T.IK, background: T.CR }}
        >
          <div 
            className="mx-auto"
            style={{ 
              maxWidth: "1200px",
              padding: isMobile ? "32px 20px" : "40px 48px"
            }}
          >
            <div 
              className="grid gap-8 items-center"
              style={{ gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}
            >
              <div>
                <div 
                  className="font-black uppercase tracking-wider mb-4"
                  style={{ fontSize: "11px", color: T.C }}
                >
                  POPULAR NOW
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTopics.map((topic, i) => (
                    <span 
                      key={i} 
                      className="font-black uppercase border cursor-pointer transition-all hover:bg-current"
                      style={{ 
                        borderColor: `${T.IK}40`,
                        padding: isMobile ? "8px 12px" : "10px 16px",
                        fontSize: "11px"
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: isMobile ? "left" : "right" }}>
                <div className="font-mono" style={{ fontSize: "12px", color: T.LIGHT_IK }}>
                  STILL STUCK?
                </div>
                <Link 
                  to="/contact" 
                  className="inline-block mt-3 font-black uppercase border-4 transition-all hover:opacity-80"
                  style={{ 
                    borderColor: T.C,
                    padding: isMobile ? "12px 24px" : "14px 32px",
                    fontSize: isMobile ? "12px" : "13px"
                  }}
                >
                  CONTACT SUPPORT
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Live chat banner */}
        <div 
          className="mx-auto"
          style={{ 
            maxWidth: "900px",
            padding: isMobile ? "40px 20px" : "64px 48px"
          }}
        >
          <div 
            className="text-center border-4"
            style={{ 
              borderColor: T.IK, 
              background: T.IK, 
              color: T.CR,
              padding: isMobile ? "32px 20px" : "48px 40px"
            }}
          >
            <div 
              className="inline-flex items-center justify-center rounded-full mb-4"
              style={{ 
                width: "64px", 
                height: "64px", 
                background: `${T.CR}20`
              }}
            >
              <MessageIcon />
            </div>
            <h3 
              className="font-black uppercase"
              style={{ fontSize: isMobile ? "20px" : "28px" }}
            >
              Live chat available 24/7
            </h3>
            <p 
              className="mt-2"
              style={{ fontSize: isMobile ? "13px" : "15px", opacity: 0.9 }}
            >
              Average wait time: under 60 seconds. Real humans, not bots.
            </p>
            <button 
              className="mt-6 font-black uppercase border-2 border-current transition-all hover:bg-white hover:text-black"
              style={{ padding: isMobile ? "12px 32px" : "14px 40px", fontSize: "13px" }}
            >
              START CHAT NOW
            </button>
          </div>
        </div>

        {/* Emergency support strip */}
        <div style={{ background: T.C, color: T.CR }}>
          <div 
            className="mx-auto flex items-center justify-between"
            style={{ 
              maxWidth: "1200px",
              padding: isMobile ? "16px 20px" : "20px 48px",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "12px" : "0",
              textAlign: isMobile ? "center" : "left"
            }}
          >
            <div>
              <span className="font-black uppercase" style={{ fontSize: "13px" }}>
                Emergency Support:
              </span>
              <span className="font-mono ml-2" style={{ fontSize: "13px" }}>
                0800-TASKIT (827548)
              </span>
            </div>
            <div className="font-mono" style={{ fontSize: "11px", opacity: 0.8 }}>
              Available 24/7 for urgent issues
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

export default Help;
