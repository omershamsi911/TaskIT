import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CORAL  = "#FF5733";
const CREAM  = "#F5F0E6";
const INK    = "#1A1A1A";
const BORDER = `1px solid ${INK}`;
const FONT   = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";

const CATEGORIES = [
  { label: "Plumbing",      sym: "◈", sub: "Leak fixes · Pipe fitting" },
  { label: "Electrician",   sym: "◆", sub: "Wiring · Panels · Sockets" },
  { label: "Cleaning",      sym: "○", sub: "Deep clean · Office · Home" },
  { label: "Tutoring",      sym: "△", sub: "Math · Science · Languages" },
  { label: "Carpentry",     sym: "■", sub: "Custom furniture · Repairs" },
  { label: "AC Repair",     sym: "◎", sub: "Service · Gas · Installation" },
  { label: "Painting",      sym: "◐", sub: "Interior · Exterior · Touch-up" },
  { label: "Moving",        sym: "▶", sub: "Packing · Loading · Delivery" },
  { label: "Gardening",     sym: "◇", sub: "Lawn · Pruning · Landscaping" },
  { label: "Security",      sym: "◉", sub: "CCTV · Alarms · Access ctrl" },
  { label: "IT Support",    sym: "▣", sub: "Network · Repair · Setup" },
  { label: "Photography",   sym: "▲", sub: "Events · Product · Portraits" },
];

const STATS = [
  { val: "12,400+", label: "Verified Providers" },
  { val: "38,900+", label: "Completed Jobs" },
  { val: "< 4 HRS", label: "Avg Response Time" },
  { val: "4.9 / 5",  label: "Platform Rating" },
];

// ─── GRID OVERLAY ────────────────────────────────────────────────────────────
const GridOverlay = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0"
    style={{
      backgroundImage: `
        linear-gradient(to right,  ${CORAL}09 1px, transparent 1px),
        linear-gradient(to bottom, ${CORAL}09 1px, transparent 1px)
      `,
      backgroundSize: "80px 80px",
    }}
  />
);

// ─── HERO ────────────────────────────────────────────────────────────────────
const Hero = () => {
  const [query, setQuery] = useState("");

  return (
    <section
      style={{ borderBottom: BORDER, fontFamily: FONT }}
      className="relative z-10 grid lg:grid-cols-12"
    >
      {/* Vertical section label */}
      <div className="hidden lg:flex lg:col-span-1 items-start justify-center border-r pt-10"
        style={{ borderColor: INK, writingMode: "vertical-rl" }}>
        <span className="text-xs font-black tracking-widest uppercase opacity-25 py-8">§ 001 — HERO</span>
      </div>

      {/* Main copy */}
      <div className="lg:col-span-7 px-6 md:px-12 py-14 md:py-20 border-r" style={{ borderColor: INK }}>
        {/* Tag */}
        <div className="mb-8 inline-flex items-center gap-3 border px-3 py-1.5" style={{ borderColor: CORAL }}>
          <span className="w-1.5 h-1.5 inline-block" style={{ background: CORAL }} />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: CORAL }}>
            DOMESTIC SERVICES PLATFORM — PAKISTAN
          </span>
        </div>

        {/* Giant headline */}
        <h1
          className="font-black uppercase leading-none"
          style={{
            fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)",
            letterSpacing: "-0.025em",
            lineHeight: 0.88,
          }}
        >
          EXPERTS
          <br />
          FOR HIRE.
          <br />
          <span style={{ color: CORAL }}>PHENOMENAL</span>
          <br />
          <span style={{
            WebkitTextStroke: `2px ${INK}`,
            color: "transparent",
            fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)",
          }}>
            RESULTS.
          </span>
        </h1>

        <p className="mt-8 max-w-lg text-sm leading-relaxed opacity-60"
          style={{ fontFamily: "Georgia, serif", fontWeight: 400, letterSpacing: 0 }}>
          Book verified plumbers, electricians, cleaners, tutors and more — across
          Pakistan's major cities. Transparent pricing. AI-matched providers.
          Escrow-protected payments.
        </p>

        {/* Search bar */}
        <div className="mt-10 flex border" style={{ border: `2px solid ${INK}` }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="WHAT SERVICE DO YOU NEED?"
            className="w-full px-4 py-4 text-xs font-black uppercase tracking-widest"
            style={{
              background: "transparent", outline: "none", border: "none",
              color: INK, fontFamily: FONT, letterSpacing: "0.1em",
            }}
          />
          <button
            className="px-7 py-4 font-black text-xs uppercase tracking-widest shrink-0 transition-all duration-100"
            style={{ background: CORAL, color: CREAM, border: "none", cursor: "pointer", letterSpacing: "0.1em", borderLeft: `2px solid ${INK}` }}
            onMouseEnter={e => { e.currentTarget.style.background = INK; }}
            onMouseLeave={e => { e.currentTarget.style.background = CORAL; }}
          >
            SEARCH →
          </button>
        </div>

        {/* Quick chips */}
        <div className="mt-5 flex flex-wrap gap-2">
          {["Plumber", "Electrician", "Cleaner", "Tutor", "AC Repair"].map(s => (
            <button key={s}
              className="px-3 py-1.5 text-xs font-black uppercase tracking-widest border transition-all duration-100"
              style={{ borderColor: INK, background: "transparent", color: INK, cursor: "pointer", fontFamily: FONT }}
              onClick={() => setQuery(s)}
              onMouseEnter={e => { e.currentTarget.style.background = CORAL; e.currentTarget.style.color = CREAM; e.currentTarget.style.borderColor = CORAL; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = INK; }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats column */}
      <div className="lg:col-span-4 flex flex-col border-t lg:border-t-0" style={{ borderColor: INK }}>
        {STATS.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col justify-center px-8 py-7 border-b" style={{ borderColor: INK }}>
            <div className="text-4xl md:text-5xl font-black leading-none"
              style={{ color: CORAL, letterSpacing: "-0.03em" }}>
              {s.val}
            </div>
            <div className="mt-1 text-xs font-black uppercase tracking-widest opacity-40">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
const CategoryGrid = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="services" className="relative z-10 border-b" style={{ borderColor: INK, fontFamily: FONT }}>
      {/* Section header */}
      <div className="flex items-center justify-between px-6 md:px-12 py-5 border-b" style={{ borderColor: INK }}>
        <span className="text-xs font-black uppercase tracking-widest opacity-40">§ 002 — CATEGORIES</span>
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: CORAL }}>
          {CATEGORIES.length} SERVICES AVAILABLE
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((cat, i) => {
          const isHov = hovered === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex flex-col justify-between p-6 md:p-8 border-r border-b cursor-pointer transition-all duration-100"
              style={{
                borderColor: INK,
                background: isHov ? INK : CREAM,
                borderRight: (i + 1) % 4 === 0 ? "none" : BORDER,
              }}
            >
              <span className="text-xs font-black opacity-20 mb-4" style={{ color: isHov ? CREAM : INK }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="text-3xl font-black mb-4 leading-none transition-colors"
                style={{ color: isHov ? CORAL : INK }}>
                {cat.sym}
              </div>
              <p className="text-sm font-black uppercase tracking-wide mb-1 transition-colors"
                style={{ color: isHov ? CREAM : INK }}>
                {cat.label}
              </p>
              <p className="text-xs opacity-50 leading-snug transition-colors"
                style={{ color: isHov ? CREAM : INK, fontFamily: "Georgia, serif", fontWeight: 400 }}>
                {cat.sub}
              </p>
              {isHov && (
                <span className="absolute bottom-5 right-5 text-sm font-black" style={{ color: CORAL }}>→</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ─── HOW IT WORKS ────────────────────────────────────────────────────────────
const HowItWorks = () => {
  const steps = [
    { n: "01", title: "SEARCH", body: "Enter what you need. Our AI engine surfaces every verified provider in your district — ranked by proximity, rating, and price fit." },
    { n: "02", title: "COMPARE", body: "Inspect profiles, certifications, job history, and transparent pricing. All data verified by our operations team." },
    { n: "03", title: "BOOK", body: "Confirm your slot in seconds. Receive provider contact, ETA, and a job reference number immediately." },
    { n: "04", title: "PAY SAFE", body: "Payment held in escrow until your job is complete. Release funds only when you're satisfied. Full dispute protection." },
  ];

  return (
    <section className="relative z-10 border-b" style={{ borderColor: INK, fontFamily: FONT }}>
      <div className="flex items-center justify-between px-6 md:px-12 py-5 border-b" style={{ borderColor: INK }}>
        <span className="text-xs font-black uppercase tracking-widest opacity-40">§ 003 — PROCESS</span>
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: CORAL }}>FOUR STEPS</span>
      </div>
      <div className="grid md:grid-cols-4">
        {steps.map((s, i) => (
          <div key={i} className="px-8 py-12 border-r last:border-r-0" style={{ borderColor: INK }}>
            <div className="text-6xl font-black mb-6 leading-none"
              style={{ color: CORAL, opacity: 0.18, letterSpacing: "-0.04em" }}>
              {s.n}
            </div>
            <h4 className="text-xl font-black uppercase tracking-wide mb-4">{s.title}</h4>
            <p className="text-xs leading-relaxed opacity-55"
              style={{ fontFamily: "Georgia, serif", fontWeight: 400, letterSpacing: 0 }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── MARQUEE TESTIMONIALS ─────────────────────────────────────────────────────
const Testimonials = () => {
  const reviews = [
    { quote: "Booked a plumber at midnight — arrived in 2 hours. Exceptional.", name: "Amna K.", city: "Karachi" },
    { quote: "The AI matched me with the perfect tutor for my daughter. 10/10.", name: "Bilal R.", city: "Lahore" },
    { quote: "Transparent pricing, no surprises. Will use Taskit for every job.", name: "Sara M.", city: "Islamabad" },
    { quote: "Escrow system gave me total confidence to pay online.", name: "Usman T.", city: "Karachi" },
    { quote: "Best platform for finding reliable home service professionals.", name: "Hira N.", city: "Lahore" },
  ];

  return (
    <section className="relative z-10 border-b overflow-hidden" style={{ borderColor: INK, fontFamily: FONT }}>
      <div className="flex items-center justify-between px-6 md:px-12 py-5 border-b" style={{ borderColor: INK }}>
        <span className="text-xs font-black uppercase tracking-widest opacity-40">§ 004 — REVIEWS</span>
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: CORAL }}>★ 4.9 / 5 PLATFORM RATING</span>
      </div>
      <div className="py-10 overflow-hidden">
        <div className="flex gap-0 whitespace-nowrap" style={{ animation: "ticker 35s linear infinite" }}>
          {[...reviews, ...reviews].map((r, i) => (
            <div key={i} className="inline-flex flex-col justify-between border mx-4 p-7 shrink-0"
              style={{ borderColor: INK, width: 300, verticalAlign: "top", whiteSpace: "normal" }}>
              <p className="text-sm leading-relaxed mb-6 opacity-70"
                style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
                "{r.quote}"
              </p>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">{r.name}</p>
                <p className="text-xs font-black uppercase tracking-widest opacity-40">{r.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CTA BAND ────────────────────────────────────────────────────────────────
const CTABand = () => (
  <section className="relative z-10 border-b" style={{ borderColor: INK, background: INK, fontFamily: FONT }}>
    <div className="grid lg:grid-cols-12 items-center">
      <div className="lg:col-span-8 px-6 md:px-12 py-14 border-r" style={{ borderColor: CORAL }}>
        <h2 className="font-black uppercase leading-none"
          style={{ fontSize: "clamp(2rem,5vw,4.5rem)", color: CREAM, letterSpacing: "-0.02em" }}>
          READY TO GET
          <br />
          <span style={{ color: CORAL }}>THINGS DONE?</span>
        </h2>
        <p className="mt-4 text-sm opacity-40" style={{ color: CREAM, fontFamily: "Georgia, serif", fontWeight: 400 }}>
          Find the right professional in minutes. No account needed to browse.
        </p>
      </div>
      <div className="lg:col-span-4 flex flex-col gap-3 px-8 py-12">
        <a href="/get-providers"
          className="block text-center px-8 py-4 font-black text-xs uppercase tracking-widest transition-all duration-100"
          style={{ background: CORAL, color: CREAM, textDecoration: "none", letterSpacing: "0.1em", border: `2px solid ${CORAL}` }}
          onMouseEnter={e => { e.currentTarget.style.background = CREAM; e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = CREAM; }}
          onMouseLeave={e => { e.currentTarget.style.background = CORAL; e.currentTarget.style.color = CREAM; e.currentTarget.style.borderColor = CORAL; }}
        >
          FIND A PROVIDER →
        </a>
        <a href="/signup"
          className="block text-center px-8 py-4 font-black text-xs uppercase tracking-widest transition-all duration-100"
          style={{ background: "transparent", color: CREAM, textDecoration: "none", letterSpacing: "0.1em", border: `2px solid ${CREAM}` }}
          onMouseEnter={e => { e.currentTarget.style.background = CREAM; e.currentTarget.style.color = INK; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = CREAM; }}
        >
          BECOME A PROVIDER →
        </a>
      </div>
    </div>
  </section>
);

// ─── PAGE ROOT ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen"
      style={{ background: CREAM, color: INK, fontFamily: FONT }}
    >
      <GridOverlay />
      <Header />
      <main>
        <Hero />
        <CategoryGrid />
        <HowItWorks />
        <Testimonials />
        <CTABand />
      </main>
      <Footer />
    </div>
  );
}