import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SharedLayout, { T, Ticker, Navbar, Footer, GridOverlay, GLOBAL_CSS } from "../components/layouts/Sharedlayout";

// ─── SHARED HELPERS ───────────────────────────────────────────────
const SectionBar = ({ left, right }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 48px", borderBottom: `1px solid ${T.IK}`,
    background: T.IK,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 6, height: 6, background: T.C, display: "inline-block", flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.CR }}>{left}</span>
    </div>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>{right}</span>
  </div>
);

const HoverBtn = ({ to, label, filled, style = {} }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "block", textAlign: "center", padding: "15px 32px",
        fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase",
        textDecoration: "none", cursor: "pointer", transition: "all 0.15s",
        background: filled ? (hov ? T.IK : T.C) : (hov ? T.C : "transparent"),
        color:       filled ? T.CR             : (hov ? T.CR : T.CR),
        border:      filled ? `2px solid ${T.C}` : `2px solid ${T.CR}`,
        ...style,
      }}>
      {label}
    </Link>
  );
};

// ─── HERO ─────────────────────────────────────────────────────────
const PLATFORM_STATS = [
  { val: "500+",   label: "Verified Providers", icon: "✦" },
  { val: "3,800+", label: "Completed Jobs",     icon: "✦" },
  { val: "5,000+", label: "Total Users",        icon: "✦" },
  { val: "4.9/5",  label: "Platform Rating",    icon: "★" },
];
const QUICK_CHIPS = ["Plumber", "Electrician", "Cleaner", "Tutor", "AC Repair", "Painter"];

const Hero = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const go = () => { navigate(query.trim() ? `/services?search=${encodeURIComponent(query.trim())}` : "/services"); };
  const [searchHov, setSearchHov] = useState(false);

  return (
    <section style={{ display: "grid", gridTemplateColumns: "56px 1fr 300px", borderBottom: `1px solid ${T.IK}` }}
      className="tk-hero-grid">
      {/* Left rule */}
      <div style={{ borderRight: `1px solid ${T.IK}`, position: "relative" }} className="tk-vert">
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-90deg)", whiteSpace: "nowrap", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: T.C }}>
          TASKIT PLATFORM
        </div>
      </div>

      {/* Main copy */}
      <div style={{ padding: "64px 52px", borderRight: `1px solid ${T.IK}` }}>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, border: `1px solid ${T.C}`, padding: "6px 14px", marginBottom: 36, background: "rgba(255,87,51,0.06)" }}>
          <span style={{ width: 6, height: 6, background: T.C, borderRadius: "50%", display: "inline-block", animation: "pulse 1.8s infinite" }} />
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: T.C }}>DOMESTIC SERVICES PLATFORM — PAKISTAN</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.03em", margin: "0 0 28px", fontSize: "clamp(2.6rem,6.5vw,5rem)" }}>
          EXPERTS<br />FOR HIRE.<br />
          <span style={{ color: T.C }}>PHENOMENAL</span><br />
          <span style={{ WebkitTextStroke: `2px ${T.IK}`, color: "transparent", letterSpacing: "-0.02em" }}>RESULTS.</span>
        </h1>

        {/* Divider line */}
        <div style={{ width: 48, height: 3, background: T.C, marginBottom: 24 }} />

        <p style={{ maxWidth: 500, fontSize: 13, lineHeight: 1.8, color: T.LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400, margin: "0 0 40px" }}>
          Book verified plumbers, electricians, cleaners, tutors and more — across Pakistan's major cities. Transparent pricing. Background-checked professionals. Instant confirmation.
        </p>

        {/* Search bar */}
        <div style={{ display: "flex", border: `2px solid ${T.IK}`, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", padding: "0 14px", borderRight: `1px solid ${T.IK}`, color: T.LIGHT_IK }}>
            <span style={{ fontSize: 14 }}>⌕</span>
          </div>
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && go()}
            placeholder="WHAT SERVICE DO YOU NEED?"
            style={{ flex: 1, padding: "15px 16px", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", background: "transparent", border: "none", outline: "none", color: T.IK }}
          />
          <button
            onClick={go}
            onMouseEnter={() => setSearchHov(true)} onMouseLeave={() => setSearchHov(false)}
            style={{ padding: "15px 28px", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", background: searchHov ? T.IK : T.C, color: T.CR, border: "none", borderLeft: `2px solid ${T.IK}`, cursor: "pointer", transition: "all 0.15s", flexShrink: 0, whiteSpace: "nowrap" }}>
            SEARCH →
          </button>
        </div>

        {/* Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.LIGHT_IK, marginRight: 4 }}>POPULAR:</span>
          {QUICK_CHIPS.map(s => {
            const [h, setH] = useState(false);
            return (
              <button key={s} onClick={() => navigate(`/services?search=${s}`)}
                onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                style={{ border: `1px solid ${h ? T.C : T.IK}`, padding: "5px 12px", fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", background: h ? T.C : "transparent", color: h ? T.CR : T.IK, cursor: "pointer", transition: "all 0.15s" }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats panel */}
      <div style={{ display: "flex", flexDirection: "column" }} className="tk-stats">
        {PLATFORM_STATS.map((s, i) => (
          <div key={i} style={{
            flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "32px 28px", borderBottom: i < 3 ? `1px solid ${T.IK}` : "none",
            background: i % 2 === 0 ? T.CR : T.CR_ALT,
            position: "relative", overflow: "hidden",
          }}>
            {/* Background number watermark */}
            <div style={{ position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)", fontSize: 72, fontWeight: 900, color: T.IK, opacity: 0.04, lineHeight: 1, pointerEvents: "none" }}>{i + 1}</div>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: T.C, marginBottom: 8 }}>{s.icon} STAT 0{i + 1}</div>
            <div style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", color: T.IK, marginBottom: 6 }}>{s.val}</div>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.LIGHT_IK }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── TRUST BAR ────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: "✓", label: "Background Checked" },
  { icon: "⚡", label: "Fast Response" },
  { icon: "🔒", label: "Secure Payments" },
  { icon: "★", label: "4.9/5 Rated" },
  { icon: "📍", label: "Karachi · Lahore · Islamabad" },
];

const TrustBar = () => (
  <div style={{ borderBottom: `1px solid ${T.IK}`, background: T.C, overflow: "hidden" }}>
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {TRUST_ITEMS.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 28px", borderRight: `1px solid rgba(255,255,255,0.2)`, flex: "1 1 auto", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: T.CR }}>{item.icon}</span>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: T.CR, whiteSpace: "nowrap" }}>{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── CATEGORY GRID ────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Plumbing",    desc: "Leak fixes · Pipe fitting",    icon: "🔧" },
  { name: "Electrician", desc: "Wiring · Panels · Sockets",    icon: "⚡" },
  { name: "Cleaning",    desc: "Deep clean · Office · Home",   icon: "✨" },
  { name: "Tutoring",    desc: "Math · Science · Languages",   icon: "📚" },
  { name: "Carpentry",   desc: "Custom furniture · Repairs",   icon: "🪚" },
  { name: "AC Repair",   desc: "Service · Gas · Install",      icon: "❄️" },
  { name: "Painting",    desc: "Interior · Exterior",          icon: "🖌️" },
  { name: "Moving",      desc: "Packing · Loading",            icon: "📦" },
  { name: "Gardening",   desc: "Lawn · Pruning · Landscape",   icon: "🌿" },
  { name: "Security",    desc: "CCTV · Alarms · Access",       icon: "🔐" },
  { name: "IT Support",  desc: "Network · Repair · Setup",     icon: "💻" },
  { name: "Photography", desc: "Events · Product · Portraits", icon: "📷" },
];

const CategoryGrid = () => {
  const [hovered, setHovered] = useState(null);
  return (
    <section style={{ borderBottom: `1px solid ${T.IK}` }}>
      <SectionBar left="BROWSE CATEGORIES" right={`${CATEGORIES.length} SERVICE TYPES`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }} className="tk-cat">
        {CATEGORIES.map((cat, i) => {
          const isHov = hovered === i;
          const col = 4;
          const isLastRow = i >= CATEGORIES.length - col;
          return (
            <Link key={i} to="/services"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex", flexDirection: "column", padding: "28px 32px",
                borderRight: (i + 1) % col !== 0 ? `1px solid ${T.IK}` : "none",
                borderBottom: !isLastRow ? `1px solid ${T.IK}` : "none",
                background: isHov ? T.IK : (i % 2 === 0 ? T.CR : T.CR_ALT),
                cursor: "pointer", transition: "background 0.15s", textDecoration: "none",
                position: "relative", overflow: "hidden",
              }}>
              {/* Number */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: isHov ? T.C : T.LIGHT_IK }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 22, lineHeight: 1, transition: "transform 0.15s", transform: isHov ? "scale(1.15)" : "scale(1)" }}>{cat.icon}</span>
              </div>
              {/* Name */}
              <p style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: isHov ? T.CR : T.IK, margin: "0 0 6px" }}>{cat.name}</p>
              {/* Desc */}
              <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: isHov ? "#aaa" : T.LIGHT_IK, margin: 0, lineHeight: 1.6 }}>{cat.desc}</p>
              {/* Arrow */}
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, opacity: isHov ? 1 : 0, transition: "opacity 0.15s" }}>
                <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>BROWSE →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

// ─── HOW IT WORKS ─────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "SEARCH",   body: "Enter what you need. Every verified provider in your area — ranked by proximity, rating, and price.", icon: "⌕" },
  { n: "02", title: "COMPARE",  body: "Inspect profiles, certifications, job history, and transparent pricing. All data verified by our team.", icon: "⊞" },
  { n: "03", title: "BOOK",     body: "Confirm your slot in seconds. Get provider contact, ETA, and a job reference number immediately.", icon: "◉" },
  { n: "04", title: "PAY SAFE", body: "Payment held securely until your job is complete. Release funds only when you're satisfied.", icon: "⊕" },
];

const HowItWorks = () => (
  <section style={{ borderBottom: `1px solid ${T.IK}` }}>
    <SectionBar left="HOW IT WORKS" right="FOUR SIMPLE STEPS" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }} className="tk-steps">
      {STEPS.map((s, i) => (
        <div key={i} style={{ padding: "52px 36px", borderRight: i < 3 ? `1px solid ${T.IK}` : "none", background: i % 2 === 0 ? T.CR : T.CR_ALT, position: "relative" }}>
          {/* Step connector line */}
          {i < 3 && (
            <div style={{ position: "absolute", top: 52, right: -1, width: 1, height: 24, background: T.C, zIndex: 1 }} className="tk-desktop-step-line" />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ width: 36, height: 36, background: T.C, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: T.CR }}>{s.n}</span>
            </div>
            <div style={{ flex: 1, height: 1, background: T.IK, opacity: 0.12 }} />
          </div>
          <h4 style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px", color: T.IK }}>{s.title}</h4>
          <p style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.05em", lineHeight: 1.8, color: T.LIGHT_IK, margin: 0 }}>{s.body}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── FEATURED SECTION ─────────────────────────────────────────────
const WHY_ITEMS = [
  { title: "VERIFIED PROS", body: "Every provider is background-checked, interviewed, and skill-tested before joining the platform.", accent: true },
  { title: "PRICE TRANSPARENCY", body: "No surprise charges. Prices are shown upfront before you confirm any booking." },
  { title: "REAL-TIME TRACKING", body: "Track your provider's arrival with live ETA updates sent directly to your phone." },
  { title: "SECURE ESCROW", body: "We hold your payment until the job is done. You approve the release — no one else." },
  { title: "INSTANT SUPPORT", body: "Our team is available 7 days a week to resolve any issue within the same day." },
  { title: "RATED & REVIEWED", body: "Authentic reviews from verified customers. Every rating is from a completed, real job." },
];

const WhyUs = () => {
  const [hovered, setHovered] = useState(null);
  return (
    <section style={{ borderBottom: `1px solid ${T.IK}` }}>
      <SectionBar left="WHY TASKIT" right="BUILT FOR TRUST" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }} className="tk-why">
        {WHY_ITEMS.map((item, i) => {
          const isHov = hovered === i;
          const isLastRow = i >= WHY_ITEMS.length - 3;
          return (
            <div key={i}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{
                padding: "40px 36px", cursor: "default",
                borderRight: (i + 1) % 3 !== 0 ? `1px solid ${T.IK}` : "none",
                borderBottom: !isLastRow ? `1px solid ${T.IK}` : "none",
                background: isHov ? T.IK : (i % 2 === 0 ? T.CR : T.CR_ALT),
                transition: "background 0.15s",
              }}>
              <div style={{ width: 4, height: 24, background: T.C, marginBottom: 20 }} />
              <h4 style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px", color: isHov ? T.CR : T.IK }}>{item.title}</h4>
              <p style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.04em", lineHeight: 1.8, color: isHov ? "#aaa" : T.LIGHT_IK, margin: 0 }}>{item.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ─── TESTIMONIALS ─────────────────────────────────────────────────
const REVIEWS = [
  { quote: "Booked a plumber at midnight — arrived in 2 hours. Exceptional.", name: "Amna K.",  city: "Karachi",   rating: 5 },
  { quote: "AI matched me with the perfect tutor for my daughter. 10/10.",    name: "Bilal R.", city: "Lahore",    rating: 5 },
  { quote: "Transparent pricing, no surprises. Will use Taskit for every job.", name: "Sara M.", city: "Islamabad", rating: 5 },
  { quote: "Secure payment gave me total confidence to pay online.",           name: "Usman T.", city: "Karachi",   rating: 5 },
  { quote: "Best platform for finding reliable home service professionals.",   name: "Hira N.",  city: "Lahore",    rating: 5 },
];

const REVIEWS_CSS = `@keyframes ticker38 { from { transform:translateX(0) } to { transform:translateX(-50%) } } .tk-reviews { animation: ticker38 40s linear infinite; } .tk-reviews:hover { animation-play-state: paused; }`;

const Testimonials = () => (
  <section style={{ borderBottom: `1px solid ${T.IK}`, overflow: "hidden" }}>
    <style>{REVIEWS_CSS}</style>
    <SectionBar left="CLIENT REVIEWS" right="★★★★★ 4.9 / 5 PLATFORM RATING" />
    <div style={{ padding: "48px 0", background: T.CR, overflow: "hidden" }}>
      <div className="tk-reviews" style={{ display: "flex", gap: 0, whiteSpace: "nowrap" }}>
        {[...REVIEWS, ...REVIEWS].map((r, i) => (
          <div key={i} style={{
            display: "inline-flex", flexDirection: "column", justifyContent: "space-between",
            border: `1px solid ${T.IK}`, margin: "0 16px", padding: "28px 28px 24px",
            flexShrink: 0, width: 300, whiteSpace: "normal",
            background: i % 2 === 0 ? T.CR : T.CR_ALT,
          }}>
            {/* Stars */}
            <div style={{ marginBottom: 16, fontSize: 11, color: T.C, letterSpacing: 2 }}>{"★".repeat(r.rating)}</div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: T.LIGHT_IK, fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 400, marginBottom: 24, flex: 1 }}>"{r.quote}"</p>
            <div style={{ borderTop: `1px solid ${T.IK}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px", color: T.IK }}>{r.name}</p>
                <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: T.LIGHT_IK, margin: 0 }}>{r.city}</p>
              </div>
              <div style={{ width: 32, height: 32, background: T.C, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12, color: T.CR, fontWeight: 900 }}>✓</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── CITIES BAND ──────────────────────────────────────────────────
const CITIES = [
  { name: "Karachi",   providers: "180+", status: "LIVE" },
  { name: "Lahore",    providers: "140+", status: "LIVE" },
  { name: "Islamabad", providers: "90+",  status: "LIVE" },
  { name: "Rawalpindi", providers: "60+", status: "LIVE" },
  { name: "Faisalabad", providers: "30+", status: "COMING SOON" },
];

const CitiesBand = () => {
  const [hov, setHov] = useState(null);
  return (
    <section style={{ borderBottom: `1px solid ${T.IK}` }}>
      <SectionBar left="SERVICE AREAS" right="EXPANDING ACROSS PAKISTAN" />
      <div style={{ display: "flex" }} className="tk-cities">
        {CITIES.map((c, i) => (
          <div key={i}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{
              flex: 1, padding: "36px 28px", borderRight: i < CITIES.length - 1 ? `1px solid ${T.IK}` : "none",
              background: hov === i ? T.IK : (i % 2 === 0 ? T.CR : T.CR_ALT),
              transition: "background 0.15s", cursor: "default",
            }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: c.status === "LIVE" ? T.C : T.LIGHT_IK, marginBottom: 12 }}>
              {c.status === "LIVE" ? "● LIVE" : "○ SOON"}
            </div>
            <div style={{ fontSize: "clamp(1.2rem,2vw,1.6rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: hov === i ? T.CR : T.IK, marginBottom: 6 }}>{c.name}</div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: hov === i ? T.C : T.LIGHT_IK }}>{c.providers} providers</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── CTA BAND ─────────────────────────────────────────────────────
const CTABand = () => {
  const [emailHov, setEmailHov] = useState(false);
  const [provHov, setProvHov] = useState(false);
  return (
    <section style={{ borderBottom: `1px solid ${T.IK}`, background: T.IK }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", alignItems: "stretch" }} className="tk-cta">
        <div style={{ padding: "64px 52px", borderRight: `1px solid rgba(255,255,255,0.1)` }}>
          <div style={{ width: 32, height: 3, background: T.C, marginBottom: 28 }} />
          <h2 style={{ fontWeight: 900, textTransform: "uppercase", lineHeight: 0.92, letterSpacing: "-0.025em", color: T.CR, margin: "0 0 20px", fontSize: "clamp(2rem,5vw,3.8rem)" }}>
            READY TO GET<br /><span style={{ color: T.C }}>THINGS DONE?</span>
          </h2>
          <p style={{ fontSize: 13, color: T.LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400, margin: "0 0 36px", maxWidth: 420, lineHeight: 1.8 }}>
            Find the right professional in minutes. No account needed to browse. Thousands of verified providers standing by.
          </p>
          {/* Mini stats */}
          <div style={{ display: "flex", gap: 32 }}>
            {[["500+", "Providers"], ["4.9★", "Rating"], ["24hr", "Support"]].map(([val, lbl], i) => (
              <div key={i}>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: T.C, letterSpacing: "-0.03em" }}>{val}</div>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.LIGHT_IK, marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
          <Link to="/services"
            onMouseEnter={() => setEmailHov(true)} onMouseLeave={() => setEmailHov(false)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "32px 36px", textDecoration: "none", background: emailHov ? T.C : "transparent", color: emailHov ? T.CR : T.CR, borderBottom: `1px solid rgba(255,255,255,0.1)`, transition: "background 0.15s" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>FIND A PROVIDER</div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6 }}>Browse all services</div>
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: T.C }}>→</span>
          </Link>
          <Link to="/register"
            onMouseEnter={() => setProvHov(true)} onMouseLeave={() => setProvHov(false)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "32px 36px", textDecoration: "none", background: provHov ? T.C : "transparent", color: T.CR, transition: "background 0.15s" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>BECOME A PROVIDER</div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6 }}>Earn on your terms</div>
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: T.C }}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

// ─── RESPONSIVE CSS ───────────────────────────────────────────────
const LANDING_CSS = `
  @media(max-width:1100px){
    .tk-hero-grid{grid-template-columns:1fr 260px!important;}
    .tk-vert{display:none!important;}
    .tk-why{grid-template-columns:repeat(2,1fr)!important;}
  }
  @media(max-width:900px){
    .tk-hero-grid{grid-template-columns:1fr!important;}
    .tk-vert{display:none!important;}
    .tk-stats{flex-direction:row!important;flex-wrap:wrap;}
    .tk-stats>div{flex:1 1 50%!important;border-bottom:1px solid #1A1A1A!important;}
    .tk-cat{grid-template-columns:repeat(2,1fr)!important;}
    .tk-steps{grid-template-columns:repeat(2,1fr)!important;}
    .tk-steps>div{border-bottom:1px solid #1A1A1A!important;}
    .tk-why{grid-template-columns:1fr!important;}
    .tk-why>div{border-right:none!important;border-bottom:1px solid #1A1A1A!important;}
    .tk-cities{flex-wrap:wrap!important;}
    .tk-cities>div{flex:1 1 50%!important;border-bottom:1px solid #1A1A1A!important;}
    .tk-cta{grid-template-columns:1fr!important;}
    .tk-cta>div:first-child{border-right:none!important;border-bottom:1px solid rgba(255,255,255,0.1)!important;}
  }
  @media(max-width:600px){
    .tk-cat{grid-template-columns:1fr!important;}
    .tk-steps{grid-template-columns:1fr!important;}
    .tk-cities>div{flex:1 1 100%!important;}
    .tk-stats>div{flex:1 1 100%!important;}
    .tk-hero-grid>div:first-child{padding:36px 24px!important;}
  }
`;

// ─── ROOT ─────────────────────────────────────────────────────────
const Landing = () => (
  <SharedLayout>
    <style>{LANDING_CSS}</style>
    <Hero />
    <TrustBar />
    <CategoryGrid />
    <HowItWorks />
    <WhyUs />
    <Testimonials />
    <CitiesBand />
    <CTABand />
  </SharedLayout>
);

export default Landing;