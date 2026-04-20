import { useState, useMemo } from "react";
import Header from "../../../src/common/components/Header";
import Footer from "../../../src/common/components/Footer";
import FilterSidebar from "../components/FilterSidebar";
import ProviderCard from "../components/ProviderCard";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const ALL_PROVIDERS = [
  { index: "01", name: "HASSAN RAZA",    category: "PLUMBING",    rating: 4.9, reviews: 312, location: "Karachi",   priceFrom: 1500, verified: true,  available: true  },
  { index: "02", name: "ZARA KHALID",    category: "ELECTRICIAN", rating: 4.7, reviews: 189, location: "Lahore",    priceFrom: 2000, verified: true,  available: true  },
  { index: "03", name: "USMAN SHEIKH",   category: "CLEANING",    rating: 4.6, reviews:  97, location: "Islamabad", priceFrom: 1200, verified: false, available: true  },
  { index: "04", name: "FATIMA NAWAZ",   category: "TUTORING",    rating: 5.0, reviews: 441, location: "Karachi",   priceFrom:  800, verified: true,  available: false },
  { index: "05", name: "BILAL HUSSAIN",  category: "AC REPAIR",   rating: 4.8, reviews: 256, location: "Lahore",    priceFrom: 3500, verified: true,  available: true  },
  { index: "06", name: "SARA IQBAL",     category: "CARPENTRY",   rating: 4.5, reviews:  73, location: "Karachi",   priceFrom: 4000, verified: true,  available: true  },
  { index: "07", name: "AHMED MIRZA",    category: "PAINTING",    rating: 4.3, reviews:  51, location: "Islamabad", priceFrom: 2200, verified: false, available: true  },
  { index: "08", name: "NADIA QURESHI",  category: "GARDENING",   rating: 4.9, reviews: 167, location: "Karachi",   priceFrom: 1000, verified: true,  available: true  },
  { index: "09", name: "TARIQ KHAN",     category: "MOVING",      rating: 4.4, reviews:  88, location: "Lahore",    priceFrom: 5000, verified: true,  available: false },
  { index: "10", name: "AISHA BUTT",     category: "TUTORING",    rating: 4.8, reviews: 203, location: "Islamabad", priceFrom:  900, verified: true,  available: true  },
  { index: "11", name: "KAMRAN ALI",     category: "IT SUPPORT",  rating: 4.6, reviews: 134, location: "Karachi",   priceFrom: 2800, verified: true,  available: true  },
  { index: "12", name: "MEHWISH SULTAN", category: "CLEANING",    rating: 4.2, reviews:  42, location: "Lahore",    priceFrom: 1100, verified: false, available: true  },
];
 
const SORT_OPTIONS = [
  { label: "RELEVANCE", key: "relevance" },
  { label: "TOP RATED", key: "rating"    },
  { label: "PRICE ↑",  key: "priceAsc"  },
  { label: "PRICE ↓",  key: "priceDesc" },
  { label: "REVIEWS",  key: "reviews"   },
];
 
const CITIES = ["ALL CITIES", "Karachi", "Lahore", "Islamabad"];
const PAGES  = [1, 2, 3, 4, 5];
 
// ─── DISCOVERY PAGE ───────────────────────────────────────────────────────────
export default function DiscoveryPage() {
  const [query,       setQuery]       = useState("");
  const [sortKey,     setSortKey]     = useState("relevance");
  const [city,        setCity]        = useState("ALL CITIES");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode,    setViewMode]    = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
 
  const displayed = useMemo(() => {
    let list = ALL_PROVIDERS.filter((p) =>
      query.trim() === "" ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.location.toLowerCase().includes(query.toLowerCase())
    );
    if (city !== "ALL CITIES") list = list.filter((p) => p.location === city);
    switch (sortKey) {
      case "rating":    list = [...list].sort((a, b) => b.rating    - a.rating);    break;
      case "priceAsc":  list = [...list].sort((a, b) => a.priceFrom - b.priceFrom); break;
      case "priceDesc": list = [...list].sort((a, b) => b.priceFrom - a.priceFrom); break;
      case "reviews":   list = [...list].sort((a, b) => b.reviews   - a.reviews);   break;
      default: break;
    }
    return list;
  }, [query, sortKey, city]);
 
  return (
    <div
      className="min-h-screen font-sans relative"
      style={{ background: "#F5F0E6", color: "#1A1A1A" }}
    >
      {/* Grid overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />
 
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
 
        {/* ── Search bar ───────────────────────────────────────────────── */}
        <div className="border-b border-ink" style={{ background: "#F5F0E6" }}>
          <div className="flex items-stretch">
 
            {/* Vertical label */}
            <div className="hidden lg:flex items-center px-5 border-r border-ink writing-vertical-rl shrink-0">
              <span
                className="text-2xs font-black tracking-superwide uppercase py-6"
                style={{ color: "#1A1A1A", opacity: 0.25 }}
              >
                § DISCOVERY
              </span>
            </div>
 
            {/* Input */}
            <div className="flex flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
                placeholder="SEARCH PROVIDERS, SERVICES, CITIES…"
                className="flex-1 px-6 py-4 bg-transparent text-xs font-black uppercase tracking-ultrawide outline-none"
                style={{ color: "#1A1A1A" }}
              />
              <button
                className="px-8 py-4 font-black text-2xs uppercase tracking-superwide border-l border-ink transition-colors duration-100 hover:bg-ink"
                style={{ background: "#FF5733", color: "#F5F0E6" }}
              >
                SEARCH →
              </button>
            </div>
 
            {/* Result count */}
            <div className="hidden md:flex flex-col items-center justify-center px-6 border-l border-ink shrink-0">
              <span className="text-3xl font-black tabular-nums leading-none" style={{ color: "#FF5733" }}>
                {displayed.length}
              </span>
              <span className="text-2xs font-black uppercase tracking-wide" style={{ color: "#1A1A1A", opacity: 0.4 }}>
                RESULTS
              </span>
            </div>
 
            {/* Mobile filter toggle */}
            <button
              className="lg:hidden flex items-center gap-2 px-5 border-l border-ink"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <span className="text-2xs font-black uppercase tracking-wide" style={{ color: "#1A1A1A" }}>FILTER</span>
              <span className="text-sm font-black" style={{ color: "#1A1A1A" }}>{sidebarOpen ? "✕" : "⊟"}</span>
            </button>
          </div>
        </div>
 
        {/* ── City + Sort bar ───────────────────────────────────────────── */}
        <div className="flex items-stretch border-b border-ink overflow-x-auto shrink-0" style={{ background: "#F5F0E6" }}>
 
          {/* City tabs */}
          <div className="flex items-stretch border-r border-ink shrink-0">
            {CITIES.map((c) => {
              const active = city === c;
              return (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className="px-4 py-2.5 text-2xs font-black uppercase tracking-wide border-r border-ink last:border-r-0 whitespace-nowrap transition-colors duration-100"
                  style={{
                    background: active ? "#1A1A1A" : "#F5F0E6",
                    color:      active ? "#F5F0E6" : "#1A1A1A",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
 
          {/* Sort label */}
          <div className="hidden sm:flex items-center px-5 border-r border-ink shrink-0">
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: "#1A1A1A", opacity: 0.4 }}>
              SORT
            </span>
          </div>
 
          {/* Sort options */}
          {SORT_OPTIONS.map(({ label, key }) => {
            const active = sortKey === key;
            return (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                className="px-4 py-2.5 text-2xs font-black uppercase tracking-wide border-r border-ink whitespace-nowrap shrink-0 transition-colors duration-100"
                style={{
                  background: active ? "#FF5733" : "#F5F0E6",
                  color:      active ? "#F5F0E6" : "#1A1A1A",
                }}
              >
                {label}
              </button>
            );
          })}
 
          {/* View toggle */}
          <div className="ml-auto flex items-stretch border-l border-ink shrink-0">
            {[{ mode: "grid", icon: "⊞" }, { mode: "list", icon: "☰" }].map(({ mode, icon }) => {
              const active = viewMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="px-4 py-2.5 text-xs font-black border-r border-ink last:border-r-0 transition-colors duration-100"
                  style={{
                    background: active ? "#1A1A1A" : "#F5F0E6",
                    color:      active ? "#F5F0E6" : "#1A1A1A",
                  }}
                >
                  {icon}
                </button>
              );
            })}
          </div>
        </div>
 
        {/* ── Body: sidebar + content ───────────────────────────────────── */}
        <div className="flex flex-1">
 
          {/* Sidebar */}
          <aside
            className={`shrink-0 border-r border-ink overflow-y-auto
              ${sidebarOpen ? "block" : "hidden"} lg:block
              w-full lg:w-56 xl:w-64
              ${sidebarOpen ? "absolute inset-0 z-40 lg:relative lg:z-auto" : ""}
            `}
            style={{ background: "#F5F0E6" }}
          >
            <FilterSidebar />
          </aside>
 
          {/* ── Main content ─────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 flex flex-col">
 
            {/* Section header */}
            <div
              className="flex items-center justify-between px-6 py-3 border-b border-ink shrink-0"
              style={{ background: "#F5F0E6" }}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: "#1A1A1A", opacity: 0.4 }}>
                  § 001 — PROVIDERS
                </span>
                <span className="text-2xs font-black uppercase tracking-wide" style={{ color: "#FF5733" }}>
                  {displayed.length} FOUND
                </span>
              </div>
              <span className="text-2xs font-black uppercase tracking-wide tabular-nums" style={{ color: "#FF5733" }}>
                1–{Math.min(12, displayed.length)} OF {displayed.length}
              </span>
            </div>
 
            {/* ── Card grid ────────────────────────────────────────────── */}
            {displayed.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <span className="text-7xl font-black mb-4" style={{ color: "#1A1A1A", opacity: 0.08 }}>◈</span>
                <p className="text-xs font-black uppercase tracking-superwide" style={{ color: "#1A1A1A", opacity: 0.35 }}>
                  NO PROVIDERS FOUND
                </p>
                <p className="text-2xs font-black uppercase tracking-wide mt-1" style={{ color: "#1A1A1A", opacity: 0.2 }}>
                  TRY ADJUSTING YOUR FILTERS
                </p>
              </div>
            ) : viewMode === "grid" ? (
              /* ── GRID MODE ─── padded container with gaps between cards ── */
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 border-b border-ink">
                {displayed.map((provider) => (
                  <ProviderCard key={provider.index} provider={provider} />
                ))}
              </div>
            ) : (
              /* ── LIST MODE ─────────────────────────────────────────────── */
              <div className="flex flex-col border-b border-ink">
                {displayed.map((provider) => (
                  <div
                    key={provider.index}
                    className="flex items-center border-b border-ink transition-colors duration-100 cursor-pointer group last:border-b-0"
                    style={{ background: "#F5F0E6" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1A1A1A")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#F5F0E6")}
                  >
                    {/* Index */}
                    <span
                      className="w-12 shrink-0 flex items-center justify-center border-r border-ink py-4 text-2xs font-black"
                      style={{ color: "#1A1A1A", opacity: 0.25 }}
                    >
                      {provider.index}
                    </span>
 
                    {/* Avatar placeholder */}
                    <div
                      className="w-12 h-12 border-r border-ink flex items-center justify-center shrink-0"
                      style={{ background: "#e8e2d6" }}
                    >
                      <span className="text-xl" style={{ color: "#1A1A1A", opacity: 0.1 }}>◈</span>
                    </div>
 
                    {/* Info */}
                    <div className="flex-1 flex items-center gap-6 px-5 py-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-wide truncate group-hover:text-cream" style={{ color: "#1A1A1A" }}>
                          {provider.name}
                        </p>
                        <p className="text-2xs font-black uppercase tracking-wide" style={{ color: "#FF5733" }}>
                          {provider.category}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                        <span className="text-xs" style={{ color: "#FF5733" }}>{"★".repeat(Math.floor(provider.rating))}</span>
                        <span className="text-2xs font-black group-hover:text-cream" style={{ color: "#1A1A1A", opacity: 0.45 }}>
                          {provider.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="hidden md:block text-2xs font-black uppercase tracking-wide group-hover:text-cream" style={{ color: "#1A1A1A", opacity: 0.4 }}>
                        ⌖ {provider.location}
                      </span>
                    </div>
 
                    {/* Verified */}
                    <div className="hidden sm:flex items-center px-4 border-l border-ink self-stretch">
                      {provider.verified ? (
                        <span className="border text-2xs font-black uppercase tracking-wide px-1.5 py-0.5" style={{ borderColor: "#FF5733", color: "#FF5733" }}>
                          ✓ VER.
                        </span>
                      ) : (
                        <span className="border text-2xs font-black uppercase tracking-wide px-1.5 py-0.5" style={{ borderColor: "rgba(26,26,26,0.2)", color: "rgba(26,26,26,0.2)" }}>—</span>
                      )}
                    </div>
 
                    {/* Price */}
                    <div className="flex flex-col items-end justify-center px-4 border-l border-ink self-stretch shrink-0">
                      <span className="text-2xs font-black uppercase group-hover:text-cream" style={{ color: "#1A1A1A", opacity: 0.4 }}>FROM</span>
                      <span className="text-xs font-black uppercase" style={{ color: "#FF5733" }}>
                        {provider.priceFrom.toLocaleString()}
                      </span>
                    </div>
 
                    {/* Arrow */}
                    <div className="hidden md:flex items-center self-stretch border-l border-ink px-4">
                      <span className="text-xs group-hover:text-cream" style={{ color: "#1A1A1A" }}>→</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
 
            {/* ── Pagination ─────────────────────────────────────────────── */}
            <div className="flex items-stretch border-t border-ink mt-auto shrink-0" style={{ background: "#F5F0E6" }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-6 py-3.5 border-r border-ink text-2xs font-black uppercase tracking-superwide transition-colors duration-100 hover:bg-ink hover:text-cream"
                style={{ color: "#1A1A1A" }}
              >
                ← PREV
              </button>
              {PAGES.map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="px-5 py-3.5 border-r border-ink text-2xs font-black uppercase tracking-wide transition-colors duration-100"
                  style={{
                    background: currentPage === p ? "#FF5733" : "#F5F0E6",
                    color:      currentPage === p ? "#F5F0E6" : "#1A1A1A",
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(PAGES.length, p + 1))}
                className="px-6 py-3.5 border-r border-ink text-2xs font-black uppercase tracking-superwide transition-colors duration-100 hover:bg-ink hover:text-cream"
                style={{ color: "#1A1A1A" }}
              >
                NEXT →
              </button>
              <div className="ml-auto hidden sm:flex items-center px-6 border-l border-ink">
                <span className="text-2xs font-black uppercase tracking-wide tabular-nums" style={{ color: "#1A1A1A", opacity: 0.4 }}>
                  PAGE {currentPage} OF {PAGES.length}
                </span>
              </div>
            </div>
 
          </main>
        </div>
 
        <Footer />
      </div>
    </div>
  );
}