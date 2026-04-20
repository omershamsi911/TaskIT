import { useState } from "react";
import Header from "../../common/components/Header";
import Footer from "../../common/components/Footer";
import BookNowWidget from "../components/BookNowWidget";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const C  = "#FF5733";
const CR = "#F5F0E6";
const IK = "#1A1A1A";

// ─── MOCK PROVIDER ────────────────────────────────────────────────────────────
const PROVIDER = {
  index:       "05",
  name:        "BILAL HUSSAIN",
  category:    "AC REPAIR",
  rating:      4.8,
  reviews:     256,
  location:    "Lahore",
  priceFrom:   3500,
  verified:    true,
  available:   true,
  experience:  "8 YEARS",
  jobs:        312,
  responseMin: 22,
  about:
    "Certified HVAC technician specialising in residential and commercial AC systems. " +
    "Trained by Dawlance and Gree. Available across DHA, Gulberg, and Model Town. " +
    "All work guaranteed for 30 days.",
  skills:  ["SPLIT AC", "CASSETTE AC", "DUCT CLEANING", "GAS RECHARGE", "INVERTER UNITS", "COMPRESSOR REPAIR"],
  services: [
    { label: "BASIC INSPECTION",   duration: "30 MIN",  price: 1500  },
    { label: "STANDARD SERVICE",   duration: "1–2 HRS", price: 3500  },
    { label: "FULL REPAIR",        duration: "3–5 HRS", price: 6000  },
    { label: "EMERGENCY CALLOUT",  duration: "ASAP",    price: 9000  },
  ],
  reviews_list: [
    { name: "AMNA K.",   city: "Lahore",    rating: 5, date: "APR 2025", body: "Arrived on time, diagnosed the issue in minutes. Excellent work." },
    { name: "TARIQ M.",  city: "Lahore",    rating: 5, date: "MAR 2025", body: "Charged the gas and cleaned all filters. AC is better than new." },
    { name: "SANA R.",   city: "Islamabad", rating: 4, date: "FEB 2025", body: "Professional and clean. Took slightly longer than estimated." },
    { name: "USMAN B.",  city: "Lahore",    rating: 5, date: "JAN 2025", body: "Best technician I have ever hired. Highly recommended." },
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const Stars = ({ n, size = "text-sm" }) => {
  const full  = Math.floor(n);
  const empty = 5 - full;
  return (
    <span className={`${size} tracking-wider leading-none`} style={{ color: C }}>
      {"★".repeat(full)}
      <span style={{ opacity: 0.2 }}>{"☆".repeat(empty)}</span>
    </span>
  );
};

const SectionBar = ({ n, title }) => (
  <div className="flex items-center justify-between border-b border-t border-ink px-6 py-2.5" style={{ background: IK }}>
    <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>{title}</span>
    <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>{n}</span>
  </div>
);

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const p = PROVIDER;
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const TABS = ["OVERVIEW", "SERVICES", "REVIEWS"];

  return (
    <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>

      {/* Grid overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <div className="flex items-center border-b border-ink px-6" style={{ background: CR }}>
          <a
            href="/discovery"
            className="flex items-center gap-2 py-3 pr-5 border-r border-ink text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
            style={{ color: IK, textDecoration: "none" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = IK; }}
          >
            ← PROVIDERS
          </a>
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.35 }}>
            {p.category}
          </span>
          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.35 }}>/ {p.name}</span>
          <div className="ml-auto flex items-center gap-1.5 py-3">
            <span
              className="w-1.5 h-1.5 inline-block shrink-0"
              style={{ background: p.available ? C : "rgba(26,26,26,0.2)", animation: p.available ? "pulse 1.8s infinite" : "none" }}
            />
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: p.available ? C : "rgba(26,26,26,0.3)" }}>
              {p.available ? "AVAILABLE NOW" : "CURRENTLY BUSY"}
            </span>
          </div>
        </div>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div className="border-b border-ink" style={{ background: CR }}>
          <div className="grid lg:grid-cols-12">

            {/* Photo placeholder */}
            <div
              className="lg:col-span-3 border-r border-ink flex flex-col items-center justify-center relative overflow-hidden"
              style={{ minHeight: 260, background: "#e8e2d6" }}
            >
              {/* Grid cross */}
              <span className="text-9xl font-black select-none" style={{ color: IK, opacity: 0.05 }}>◈</span>
              {/* Index tag */}
              <span className="absolute top-4 left-4 text-2xs font-black" style={{ color: IK, opacity: 0.25 }}>
                [{p.index}]
              </span>
              {/* Category ribbon */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-ink px-4 py-2" style={{ background: CR }}>
                <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
                  {p.category}
                </span>
              </div>
            </div>

            {/* Name + core info */}
            <div className="lg:col-span-6 px-8 py-8 border-r border-ink flex flex-col justify-between gap-6">
              <div>
                {/* Verified pill */}
                {p.verified && (
                  <div className="inline-flex items-center gap-2 border border-ink px-3 py-1 mb-4">
                    <span style={{ color: C }}>✓</span>
                    <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
                      VERIFIED PROVIDER
                    </span>
                  </div>
                )}

                <h1
                  className="font-black uppercase leading-none mb-4"
                  style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", letterSpacing: "-0.02em", color: IK }}
                >
                  {p.name}
                </h1>

                {/* Rating row */}
                <div className="flex items-center gap-3 mb-5">
                  <Stars n={p.rating} size="text-base" />
                  <span className="text-xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.5 }}>
                    {p.rating.toFixed(1)} · {p.reviews} REVIEWS
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {p.skills.map((sk) => (
                    <span
                      key={sk}
                      className="border text-2xs font-black uppercase tracking-wide px-2 py-1"
                      style={{ borderColor: IK, color: IK }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location + experience */}
              <div className="flex gap-0 border-t border-ink pt-5">
                {[
                  { label: "LOCATION",   val: `⌖ ${p.location}`    },
                  { label: "EXPERIENCE", val: p.experience          },
                  { label: "JOBS DONE",  val: `${p.jobs}+`         },
                ].map((item, i) => (
                  <div key={i} className={`flex-1 ${i < 2 ? "border-r border-ink pr-5 mr-5" : ""}`}>
                    <p className="text-2xs font-black uppercase tracking-wide mb-0.5" style={{ color: IK, opacity: 0.4 }}>
                      {item.label}
                    </p>
                    <p className="text-sm font-black uppercase tracking-wide" style={{ color: IK }}>
                      {item.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats column */}
            <div className="lg:col-span-3 flex flex-col">
              {[
                { label: "RATING",        val: `${p.rating.toFixed(1)} / 5`, coral: true  },
                { label: "JOBS COMPLETE", val: `${p.jobs}+`,                 coral: false },
                { label: "AVG. RESPONSE", val: `${p.responseMin} MIN`,       coral: false },
                { label: "REPEAT CLIENTS",val: "74%",                        coral: true  },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col justify-center px-6 py-5 border-b border-ink last:border-b-0"
                  style={{ background: i % 2 === 0 ? "#ede8de" : CR }}
                >
                  <div
                    className="text-3xl font-black leading-none mb-1"
                    style={{ color: s.coral ? C : IK, letterSpacing: "-0.03em" }}
                  >
                    {s.val}
                  </div>
                  <div className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK, opacity: 0.4 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab bar ────────────────────────────────────────────────────── */}
        <div className="flex items-stretch border-b border-ink" style={{ background: CR }}>
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-8 py-3.5 text-2xs font-black uppercase tracking-superwide border-r border-ink transition-colors duration-100"
                style={{
                  background: active ? IK : CR,
                  color:      active ? CR : IK,
                }}
              >
                {tab}
              </button>
            );
          })}
          {/* Right spacer with price */}
          <div className="ml-auto flex items-center px-6 gap-2 border-l border-ink">
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.4 }}>STARTS FROM</span>
            <span className="text-sm font-black" style={{ color: C }}>PKR {p.priceFrom.toLocaleString()}</span>
          </div>
        </div>

        {/* ── Body: content + sticky widget ──────────────────────────────── */}
        <div className="flex flex-1 items-start">

          {/* ── Left: tab content ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0 border-r border-ink">

            {/* ── OVERVIEW ─────────────────────────────────────────────── */}
            {activeTab === "OVERVIEW" && (
              <>
                {/* About */}
                <SectionBar n="§ 001" title="ABOUT THIS PROVIDER" />
                <div className="px-8 py-8 border-b border-ink">
                  <p
                    className="text-sm leading-relaxed max-w-2xl"
                    style={{ fontFamily: "Georgia, serif", color: IK, opacity: 0.7, fontWeight: 400 }}
                  >
                    {p.about}
                  </p>
                </div>

                {/* Skills grid */}
                <SectionBar n="§ 002" title="SPECIALISATIONS" />
                <div className="grid grid-cols-2 md:grid-cols-3 border-b border-ink">
                  {p.skills.map((sk, i) => (
                    <div
                      key={sk}
                      className="flex items-center gap-3 px-6 py-4 border-r border-b border-ink"
                      style={{ background: i % 2 === 0 ? CR : "#ede8de" }}
                    >
                      <span style={{ color: C }}>◆</span>
                      <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>
                        {sk}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quick policy row */}
                <SectionBar n="§ 003" title="PROVIDER POLICIES" />
                <div className="grid md:grid-cols-3 border-b border-ink">
                  {[
                    { icon: "◈", label: "30-DAY GUARANTEE",    sub: "All work guaranteed for 30 days after job completion." },
                    { icon: "◆", label: "ESCROW PROTECTION",   sub: "Payment released only after you confirm satisfaction."  },
                    { icon: "○", label: "CANCELLATION POLICY", sub: "Free cancellation up to 2 hours before scheduled time." },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="px-6 py-6 border-r border-ink last:border-r-0"
                      style={{ background: i === 1 ? "#ede8de" : CR }}
                    >
                      <span className="text-2xl font-black block mb-3" style={{ color: C }}>{item.icon}</span>
                      <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: IK }}>{item.label}</p>
                      <p
                        className="text-2xs leading-relaxed"
                        style={{ fontFamily: "Georgia, serif", color: IK, opacity: 0.55, fontWeight: 400 }}
                      >
                        {item.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── SERVICES ─────────────────────────────────────────────── */}
            {activeTab === "SERVICES" && (
              <>
                <SectionBar n="§ 001" title="SERVICE PACKAGES" />
                <div className="flex flex-col">
                  {p.services.map((svc, i) => (
                    <div
                      key={svc.label}
                      className="grid md:grid-cols-12 items-center border-b border-ink last:border-b-0 transition-colors duration-100"
                      style={{ background: i % 2 === 0 ? CR : "#ede8de" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = IK; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? CR : "#ede8de"; }}
                    >
                      {/* Index */}
                      <div className="md:col-span-1 hidden md:flex items-center justify-center border-r border-ink self-stretch">
                        <span className="text-2xs font-black" style={{ color: IK, opacity: 0.2 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      {/* Label */}
                      <div className="md:col-span-6 px-6 py-5 border-r border-ink">
                        <p className="text-sm font-black uppercase tracking-wide" style={{ color: IK }}>{svc.label}</p>
                        <p className="text-2xs font-black uppercase tracking-wide mt-1" style={{ color: IK, opacity: 0.4 }}>
                          EST. DURATION: {svc.duration}
                        </p>
                      </div>
                      {/* Price */}
                      <div className="md:col-span-3 px-6 py-5 border-r border-ink">
                        <p className="text-2xs font-black uppercase tracking-wide mb-0.5" style={{ color: IK, opacity: 0.4 }}>PRICE</p>
                        <p className="text-lg font-black" style={{ color: C }}>PKR {svc.price.toLocaleString()}</p>
                      </div>
                      {/* CTA */}
                      <div className="md:col-span-2 px-6 py-5">
                        <button
                          className="w-full py-2 text-2xs font-black uppercase tracking-superwide border border-ink transition-colors duration-100"
                          style={{ background: CR, color: IK }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; e.currentTarget.style.borderColor = C; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; e.currentTarget.style.borderColor = IK; }}
                        >
                          SELECT →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── REVIEWS ──────────────────────────────────────────────── */}
            {activeTab === "REVIEWS" && (
              <>
                {/* Summary */}
                <SectionBar n="§ 001" title="RATING SUMMARY" />
                <div className="flex items-center gap-0 border-b border-ink">
                  <div className="flex flex-col items-center justify-center px-10 py-8 border-r border-ink">
                    <span className="text-6xl font-black leading-none mb-1" style={{ color: C, letterSpacing: "-0.04em" }}>
                      {p.rating.toFixed(1)}
                    </span>
                    <Stars n={p.rating} size="text-lg" />
                    <span className="text-2xs font-black uppercase tracking-wide mt-2" style={{ color: IK, opacity: 0.4 }}>
                      {p.reviews} REVIEWS
                    </span>
                  </div>
                  {/* Bar chart */}
                  <div className="flex-1 px-8 py-6 flex flex-col gap-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct = star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 6 : star === 2 ? 3 : 1;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-2xs font-black w-4 text-right" style={{ color: IK, opacity: 0.4 }}>{star}</span>
                          <span style={{ color: C, fontSize: "0.6rem" }}>★</span>
                          <div className="flex-1 border border-ink h-3 relative overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{ width: `${pct}%`, background: C }}
                            />
                          </div>
                          <span className="text-2xs font-black w-8 tabular-nums" style={{ color: IK, opacity: 0.4 }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Individual reviews */}
                <SectionBar n="§ 002" title="CLIENT REVIEWS" />
                <div className="flex flex-col">
                  {p.reviews_list.map((rv, i) => (
                    <div
                      key={i}
                      className="px-8 py-7 border-b border-ink last:border-b-0"
                      style={{ background: i % 2 === 0 ? CR : "#ede8de" }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>{rv.name}</p>
                          <p className="text-2xs font-black uppercase tracking-wide mt-0.5" style={{ color: IK, opacity: 0.4 }}>
                            ⌖ {rv.city} · {rv.date}
                          </p>
                        </div>
                        <Stars n={rv.rating} size="text-xs" />
                      </div>
                      {/* Body */}
                      <p
                        className="text-sm leading-relaxed"
                        style={{ fontFamily: "Georgia, serif", color: IK, opacity: 0.65, fontWeight: 400 }}
                      >
                        "{rv.body}"
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Right: sticky BookNowWidget ──────────────────────────── */}
          <aside
            className="hidden xl:block shrink-0 border-l border-ink"
            style={{ width: 340, position: "sticky", top: 0, maxHeight: "100vh", overflowY: "auto" }}
          >
            <BookNowWidget provider={{ name: p.name, priceFrom: p.priceFrom, available: p.available }} />
          </aside>
        </div>

        {/* ── Mobile: Book Now bar ────────────────────────────────────────── */}
        <div
          className="xl:hidden sticky bottom-0 z-30 flex items-center justify-between border-t border-ink px-6 py-3"
          style={{ background: CR }}
        >
          <div>
            <p className="text-2xs font-black uppercase tracking-wide" style={{ color: IK, opacity: 0.4 }}>STARTS FROM</p>
            <p className="text-sm font-black" style={{ color: C }}>PKR {p.priceFrom.toLocaleString()}</p>
          </div>
          <button
            className="px-8 py-3 font-black text-2xs uppercase tracking-superwide transition-colors duration-100"
            style={{ background: C, color: CR }}
            onMouseEnter={(e) => { e.currentTarget.style.background = IK; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C; }}
          >
            BOOK NOW →
          </button>
        </div>

        <Footer />
      </div>
    </div>
  );
}