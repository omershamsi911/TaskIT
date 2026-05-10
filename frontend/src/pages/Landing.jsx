import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SharedLayout, { T, Ticker, Navbar, Footer, GridOverlay, GLOBAL_CSS } from "../components/layouts/Sharedlayout";

// ─── SHARED HELPERS ───────────────────────────────────────────────
const SectionBar = ({ left, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", borderBottom: `1px solid ${T.IK}`, background: T.IK }}>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>{left}</span>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.CR }}>{right}</span>
  </div>
);

const HoverBtn = ({ to, label, filled, style = {} }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "block", textAlign: "center", padding: "16px 32px", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", cursor: "pointer", transition: "all 0.1s",
        background: filled ? (hov ? T.IK : T.C) : (hov ? T.CR : "transparent"),
        color:       filled ? T.CR             : (hov ? T.IK : T.CR),
        border:      filled ? `2px solid ${T.C}` : `2px solid ${T.CR}`,
        ...style }}>
      {label}
    </Link>
  );
};

// ─── HERO ─────────────────────────────────────────────────────────
const PLATFORM_STATS = [
  { val: "500+",   label: "Verified Providers" },
  { val: "3,800+", label: "Completed Jobs"     },
  { val: "5,000+", label: "Total Users"        },
  { val: "4.9/5",  label: "Platform Rating"    },
];
const QUICK_CHIPS = ["Plumber", "Electrician", "Cleaner", "Tutor", "AC Repair", "Painter"];

const Hero = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const go = () => { navigate(query.trim() ? `/services?search=${encodeURIComponent(query.trim())}` : "/services"); };
  const [searchHov, setSearchHov] = useState(false);

  return (
    <section style={{ display: "grid", gridTemplateColumns: "56px 1fr 280px", borderBottom: `1px solid ${T.IK}` }}
      className="tk-hero-grid">
      {/* Vert spacer */}
      <div style={{ borderRight: `1px solid ${T.IK}` }} className="tk-vert" />

      {/* Copy */}
      <div style={{ padding: "56px 48px", borderRight: `1px solid ${T.IK}` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, border: `1px solid ${T.C}`, padding: "6px 12px", marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, background: T.C, display: "inline-block" }} />
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>DOMESTIC SERVICES PLATFORM — PAKISTAN</span>
        </div>
        <h1 style={{ fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.025em", margin: 0, fontSize: "clamp(2.8rem,7.5vw,5.5rem)" }}>
          EXPERTS<br />FOR HIRE.<br />
          <span style={{ color: T.C }}>PHENOMENAL</span><br />
          <span style={{ WebkitTextStroke: `2px ${T.IK}`, color: "transparent" }}>RESULTS.</span>
        </h1>
        <p style={{ marginTop: 32, maxWidth: 480, fontSize: 13, lineHeight: 1.7, color: T.LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400 }}>
          Book verified plumbers, electricians, cleaners, tutors and more — across Pakistan's major cities. Transparent pricing. Background-checked professionals. Instant confirmation.
        </p>
        {/* Search */}
        <div style={{ marginTop: 40, display: "flex", border: `2px solid ${T.IK}` }}>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && go()}
            placeholder="WHAT SERVICE DO YOU NEED?"
            style={{ flex: 1, padding: "16px", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", background: "transparent", border: "none", outline: "none", color: T.IK }} />
          <button onClick={go} onMouseEnter={() => setSearchHov(true)} onMouseLeave={() => setSearchHov(false)}
            style={{ padding: "16px 28px", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", background: searchHov ? T.IK : T.C, color: T.CR, border: "none", borderLeft: `2px solid ${T.IK}`, cursor: "pointer", transition: "all 0.1s", flexShrink: 0 }}>
            SEARCH →
          </button>
        </div>
        {/* Chips */}
        <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {QUICK_CHIPS.map(s => {
            const [h, setH] = useState(false);
            return (
              <button key={s} onClick={() => navigate(`/services?search=${s}`)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                style={{ border: `1px solid ${T.IK}`, padding: "6px 12px", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", background: h ? T.C : "transparent", color: h ? T.CR : T.IK, cursor: "pointer", transition: "all 0.1s" }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", flexDirection: "column" }} className="tk-stats">
        {PLATFORM_STATS.map((s, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "28px 32px", borderBottom: i < 3 ? `1px solid ${T.IK}` : "none", background: i % 2 === 0 ? T.CR : T.CR_ALT }}>
            <div style={{ fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em", color: T.C }}>{s.val}</div>
            <div style={{ marginTop: 4, fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.LIGHT_IK }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── CATEGORY GRID ────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Plumbing",    desc: "Leak fixes · Pipe fitting"   },
  { name: "Electrician", desc: "Wiring · Panels · Sockets"   },
  { name: "Cleaning",    desc: "Deep clean · Office · Home"  },
  { name: "Tutoring",    desc: "Math · Science · Languages"  },
  { name: "Carpentry",   desc: "Custom furniture · Repairs"  },
  { name: "AC Repair",   desc: "Service · Gas · Install"     },
  { name: "Painting",    desc: "Interior · Exterior"         },
  { name: "Moving",      desc: "Packing · Loading"           },
  { name: "Gardening",   desc: "Lawn · Pruning · Landscape"  },
  { name: "Security",    desc: "CCTV · Alarms · Access"      },
  { name: "IT Support",  desc: "Network · Repair · Setup"    },
  { name: "Photography", desc: "Events · Product · Portraits"},
];

const CategoryGrid = () => {
  const [hovered, setHovered] = useState(null);
  return (
    <section style={{ borderBottom: `1px solid ${T.IK}` }}>
      <SectionBar left="CATEGORIES" right={`${CATEGORIES.length} SERVICES AVAILABLE`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }} className="tk-cat">
        {CATEGORIES.map((cat, i) => {
          const isHov    = hovered === i;
          const col      = 4;
          const isLastRow = i >= CATEGORIES.length - col;
          const isLastCol = (i + 1) % col === 0;
          return (
            <Link key={i} to="/services"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "32px", borderRight: `1px solid ${T.IK}`, borderBottom: isLastRow ? "none" : `1px solid ${T.IK}`, background: isHov ? T.IK : (i % 2 === 0 ? T.CR : T.CR_ALT), cursor: "pointer", transition: "background 0.1s", textDecoration: "none" }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: isHov ? T.CR : T.LIGHT_IK, marginBottom: 16 }}>{String(i + 1).padStart(2, "0")}</span>
              <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 16, color: isHov ? T.C : T.IK }}>◆</div>
              <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: isHov ? T.CR : T.IK, margin: "0 0 4px" }}>{cat.name}</p>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: isHov ? T.CR : T.LIGHT_IK, margin: 0, lineHeight: 1.5 }}>{cat.desc}</p>
              {isHov && <span style={{ position: "absolute", bottom: 20, right: 20, fontSize: 14, fontWeight: 900, color: T.C }}>→</span>}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

// ─── HOW IT WORKS ─────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "SEARCH",   body: "Enter what you need. Every verified provider in your area — ranked by proximity, rating, and price." },
  { n: "02", title: "COMPARE",  body: "Inspect profiles, certifications, job history, and transparent pricing. All data verified by our team." },
  { n: "03", title: "BOOK",     body: "Confirm your slot in seconds. Get provider contact, ETA, and a job reference number immediately." },
  { n: "04", title: "PAY SAFE", body: "Payment held securely until your job is complete. Release funds only when you're satisfied." },
];

const HowItWorks = () => (
  <section style={{ borderBottom: `1px solid ${T.IK}` }}>
    <SectionBar left="PROCESS" right="FOUR STEPS" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }} className="tk-steps">
      {STEPS.map((s, i) => (
        <div key={i} style={{ padding: "48px 32px", borderRight: i < 3 ? `1px solid ${T.IK}` : "none", background: i % 2 === 0 ? T.CR : T.CR_ALT }}>
          <div style={{ fontSize: 64, fontWeight: 900, marginBottom: 24, lineHeight: 1, letterSpacing: "-0.04em", color: T.C, opacity: 0.18 }}>{s.n}</div>
          <h4 style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>{s.title}</h4>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.7, color: T.LIGHT_IK, margin: 0 }}>{s.body}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── TESTIMONIALS ─────────────────────────────────────────────────
const REVIEWS = [
  { quote: "Booked a plumber at midnight — arrived in 2 hours. Exceptional.", name: "Amna K.",  city: "Karachi"   },
  { quote: "AI matched me with the perfect tutor for my daughter. 10/10.",    name: "Bilal R.", city: "Lahore"    },
  { quote: "Transparent pricing, no surprises. Will use Taskit for every job.",name: "Sara M.", city: "Islamabad" },
  { quote: "Secure payment gave me total confidence to pay online.",           name: "Usman T.", city: "Karachi"  },
  { quote: "Best platform for finding reliable home service professionals.",   name: "Hira N.",  city: "Lahore"   },
];

const REVIEWS_CSS = `@keyframes ticker38 { from { transform:translateX(0) } to { transform:translateX(-50%) } } .tk-reviews { animation: ticker38 38s linear infinite; }`;

const Testimonials = () => (
  <section style={{ borderBottom: `1px solid ${T.IK}`, overflow: "hidden" }}>
    <style>{REVIEWS_CSS}</style>
    <SectionBar left="REVIEWS" right="★ 4.9 / 5 PLATFORM RATING" />
    <div style={{ padding: "40px 0", background: T.CR, overflow: "hidden" }}>
      <div className="tk-reviews" style={{ display: "flex", gap: 0, whiteSpace: "nowrap" }}>
        {[...REVIEWS, ...REVIEWS].map((r, i) => (
          <div key={i} style={{ display: "inline-flex", flexDirection: "column", justifyContent: "space-between", border: `1px solid ${T.IK}`, margin: "0 16px", padding: 28, flexShrink: 0, width: 300, whiteSpace: "normal", background: i % 2 === 0 ? T.CR : T.CR_ALT }}>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: T.LIGHT_IK, fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 400, marginBottom: 24 }}>"{r.quote}"</p>
            <div>
              <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>{r.name}</p>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: T.LIGHT_IK, margin: 0 }}>{r.city}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── CTA BAND ─────────────────────────────────────────────────────
const CTABand = () => (
  <section style={{ borderBottom: `1px solid ${T.IK}`, background: T.IK }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", alignItems: "center" }} className="tk-cta">
      <div style={{ padding: "56px 48px", borderRight: `1px solid ${T.C}` }}>
        <h2 style={{ fontWeight: 900, textTransform: "uppercase", lineHeight: 1, letterSpacing: "-0.02em", color: T.CR, margin: "0 0 16px", fontSize: "clamp(2rem,5vw,4rem)" }}>
          READY TO GET<br /><span style={{ color: T.C }}>THINGS DONE?</span>
        </h2>
        <p style={{ fontSize: 13, color: T.LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>
          Find the right professional in minutes. No account needed to browse.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 32px" }}>
        <HoverBtn to="/services"  label="FIND A PROVIDER →"   filled={true}  />
        <HoverBtn to="/register"  label="BECOME A PROVIDER →" filled={false} />
      </div>
    </div>
  </section>
);

// ─── EXTRA RESPONSIVE CSS ─────────────────────────────────────────
const LANDING_CSS = `
  @media(max-width:900px){
    .tk-hero-grid{grid-template-columns:1fr!important;}
    .tk-vert{display:none!important;}
    .tk-stats{flex-direction:row!important;flex-wrap:wrap;}
    .tk-stats>div{flex:1 1 50%!important;}
    .tk-cat{grid-template-columns:repeat(2,1fr)!important;}
    .tk-steps{grid-template-columns:repeat(2,1fr)!important;}
    .tk-steps>div{border-bottom:1px solid #1A1A1A!important;}
    .tk-cta{grid-template-columns:1fr!important;}
    .tk-cta>div:first-child{border-right:none!important;border-bottom:1px solid #FF5733!important;}
  }
  @media(max-width:600px){
    .tk-cat{grid-template-columns:1fr!important;}
  }
`;

// ─── ROOT ─────────────────────────────────────────────────────────
const Landing = () => (
  <SharedLayout>
    <style>{LANDING_CSS}</style>
    <Hero />
    <CategoryGrid />
    <HowItWorks />
    <Testimonials />
    <CTABand />
  </SharedLayout>
);

export default Landing;