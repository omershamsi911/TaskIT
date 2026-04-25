import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { fetchPublicStats } from "../../../handlers/users";
import { fetchCategories } from "../../../handlers/categories";
import { useTheme } from "../../hooks/useTheme";

// ─── PAGE ROOT ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const [categories, setCategories] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── GRID OVERLAY ────────────────────────────────────────────────────────────
  const GridOverlay = () => (
    <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />
  );

  // ─── HERO ────────────────────────────────────────────────────────────────────
  const Hero = ({ stats, categories }) => {
    const [query, setQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredCategories, setFilteredCategories] = useState([]);

    const PLATFORM_STATS = stats?.total_users ? [
      { val: `${(stats.total_providers).toLocaleString()}+`, label: "Verified Providers" },
      { val: `${(stats.completed_bookings).toLocaleString()}+`, label: "Completed Jobs" },
      { val: `${(stats.total_users).toLocaleString()}+`, label: "Total Users" },
      { val: "4.9 / 5",  label: "Platform Rating" },
    ] : [
      { val: "12,400+", label: "Verified Providers" },
      { val: "38,900+", label: "Completed Jobs" },
      { val: "55,000+", label: "Total Users" },
      { val: "4.9 / 5",  label: "Platform Rating" },
    ];

    const handleSearchChange = (e) => {
      const value = e.target.value;
      setQuery(value);
      
      if (value.trim().length > 0 && categories?.length) {
        const filtered = categories.filter(cat =>
          cat.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCategories(filtered);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    };

    const handleSelectCategory = (cat) => {
      setQuery(cat.name);
      setShowSuggestions(false);
      // Navigate to discovery with category
      window.location.href = `/discovery?category=${cat.slug}`;
    };

    const handleSearchSubmit = () => {
      if (query.trim()) {
        window.location.href = `/discovery?search=${encodeURIComponent(query.trim())}`;
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    const QUICK_CHIPS = categories?.slice(0, 5)?.map(c => c.name) || 
      ["Plumber", "Electrician", "Cleaner", "Tutor", "AC Repair"];

    return (
      <section className="relative z-10 grid lg:grid-cols-12 border-b" style={{ borderColor: IK }}>
        {/* Vertical section label */}
        <div className="hidden lg:flex lg:col-span-1 items-start justify-center border-r pt-10" style={{ borderColor: IK }}>
          <span className="text-xs font-black tracking-widest uppercase py-8" style={{ color: LIGHT_IK, writingMode: "vertical-rl" }}>
            § 001 — HERO
          </span>
        </div>

        {/* Main copy */}
        <div className="lg:col-span-7 px-6 md:px-12 py-14 md:py-20 border-r" style={{ borderColor: IK }}>
          {/* Tag */}
          <div className="mb-8 inline-flex items-center gap-3 border px-3 py-1.5" style={{ borderColor: C }}>
            <span className="w-1.5 h-1.5 inline-block" style={{ background: C }} />
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
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
            <span style={{ color: C }}>PHENOMENAL</span>
            <br />
            <span style={{
              WebkitTextStroke: `2px ${IK}`,
              color: "transparent",
              fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)",
            }}>
              RESULTS.
            </span>
          </h1>

          <p className="mt-8 max-w-lg text-sm leading-relaxed" style={{ color: LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Book verified plumbers, electricians, cleaners, tutors and more — across
            Pakistan's major cities. Transparent pricing. AI-matched providers.
            Escrow-protected payments.
          </p>

          {/* Search bar */}
          <div className="mt-10 relative">
            <div className="flex border-2" style={{ borderColor: IK }}>
              <input
                type="text"
                value={query}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => query.trim() && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="WHAT SERVICE DO YOU NEED?"
                className="w-full px-4 py-4 text-2xs font-black uppercase tracking-superwide bg-transparent outline-none"
                style={{ color: IK }}
              />
              <button
                onClick={handleSearchSubmit}
                className="px-7 py-4 font-black text-2xs uppercase tracking-superwide shrink-0 transition-all duration-100 border-l-2"
                style={{ background: C, color: CR, borderColor: IK }}
                onMouseEnter={e => { e.currentTarget.style.background = IK; }}
                onMouseLeave={e => { e.currentTarget.style.background = C; }}
              >
                SEARCH →
              </button>
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && filteredCategories.length > 0 && (
              <div 
                className="absolute left-0 right-0 border-2 border-t-0 z-20 max-h-60 overflow-y-auto"
                style={{ borderColor: IK, background: CR, top: "100%" }}
              >
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    onMouseDown={() => handleSelectCategory(cat)}
                    className="w-full flex items-center justify-between px-4 py-3 border-b last:border-b-0 text-left transition-colors duration-100"
                    style={{ borderColor: IK }}
                    onMouseEnter={e => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}
                  >
                    <span className="text-2xs font-black uppercase tracking-superwide">
                      {cat.name}
                    </span>
                    <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
                      {cat.subcategories?.length || 0} services
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {showSuggestions && query.trim() && filteredCategories.length === 0 && (
              <div 
                className="absolute left-0 right-0 border-2 border-t-0 z-20 px-4 py-6 text-center"
                style={{ borderColor: IK, background: CR, top: "100%" }}
              >
                <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
                  NO CATEGORIES FOUND — PRESS ENTER TO SEARCH FOR "{query.trim()}"
                </span>
              </div>
            )}
          </div>

          {/* Quick chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {QUICK_CHIPS.map(s => (
              <button key={s}
                onClick={() => {
                  setQuery(s);
                  const cat = categories?.find(c => c.name.toLowerCase() === s.toLowerCase());
                  if (cat) {
                    window.location.href = `/discovery?category=${cat.slug}`;
                  }
                }}
                className="border px-3 py-1.5 text-2xs font-black uppercase tracking-superwide transition-all duration-100"
                style={{ borderColor: IK, background: "transparent", color: IK }}
                onMouseEnter={e => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; e.currentTarget.style.borderColor = C; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; e.currentTarget.style.borderColor = IK; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Stats column */}
        <div className="lg:col-span-4 flex flex-col border-t lg:border-t-0" style={{ borderColor: IK }}>
          {PLATFORM_STATS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col justify-center px-8 py-7 border-b" style={{ borderColor: IK, background: i % 2 === 0 ? CR : CR_ALT }}>
              <div className="text-4xl md:text-5xl font-black leading-none" style={{ color: C, letterSpacing: "-0.03em" }}>
                {s.val}
              </div>
              <div className="mt-1 text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // ─── Add DEFAULT_CATEGORIES fallback ────────────────────────────────────────
  const DEFAULT_CATEGORIES = [
    { name: "Plumbing",      icon_url: null, description: "Leak fixes · Pipe fitting" },
    { name: "Electrician",   icon_url: null, description: "Wiring · Panels · Sockets" },
    { name: "Cleaning",      icon_url: null, description: "Deep clean · Office · Home" },
    { name: "Tutoring",      icon_url: null, description: "Math · Science · Languages" },
    { name: "Carpentry",     icon_url: null, description: "Custom furniture · Repairs" },
    { name: "AC Repair",     icon_url: null, description: "Service · Gas · Installation" },
    { name: "Painting",      icon_url: null, description: "Interior · Exterior · Touch-up" },
    { name: "Moving",        icon_url: null, description: "Packing · Loading · Delivery" },
    { name: "Gardening",     icon_url: null, description: "Lawn · Pruning · Landscaping" },
    { name: "Security",      icon_url: null, description: "CCTV · Alarms · Access ctrl" },
    { name: "IT Support",    icon_url: null, description: "Network · Repair · Setup" },
    { name: "Photography",   icon_url: null, description: "Events · Product · Portraits" },
  ];

  // ─── Fixed CATEGORIES ──────────────────────────────────────────────────────
  const CategoryGrid = ({ categories }) => {
    const [hovered, setHovered] = useState(null);
    const cats = categories?.length ? categories : DEFAULT_CATEGORIES;

    return (
      <section className="relative z-10 border-b" style={{ borderColor: IK }}>
        <div className="flex items-center justify-between px-6 md:px-12 py-3 border-b" style={{ borderColor: IK, background: IK }}>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
            § 002 — CATEGORIES
          </span>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: CR }}>
            {cats.length} SERVICES AVAILABLE
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cats.map((cat, i) => {
            const isHov = hovered === i;
            return (
              <div
                key={cat.slug || i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="relative flex flex-col justify-between p-6 md:p-8 border-r border-b cursor-pointer transition-all duration-100"
                style={{
                  borderColor: IK,
                  background: isHov ? IK : i % 2 === 0 ? CR : CR_ALT,
                }}
              >
                <span className="text-2xs font-black mb-4" style={{ color: isHov ? CR : LIGHT_IK }}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icon: use icon_url from API, fallback to symbol */}
                <div className="text-3xl font-black mb-4 leading-none transition-colors" style={{ color: isHov ? C : IK }}>
                  {cat.icon_url ? (
                    <img src={cat.icon_url} alt={cat.name} className="w-8 h-8" style={{ filter: isHov ? "brightness(0) saturate(100%) invert(45%) sepia(80%) saturate(1500%) hue-rotate(340deg)" : "none" }} />
                  ) : (
                    <span>◆</span>
                  )}
                </div>

                {/* Name */}
                <p className="text-xs font-black uppercase tracking-wide mb-1 transition-colors" style={{ color: isHov ? CR : IK }}>
                  {cat.name || cat.label}
                </p>

                {/* Description */}
                <p className="text-2xs font-black uppercase tracking-wide leading-snug transition-colors" style={{ color: isHov ? CR : LIGHT_IK }}>
                  {cat.description || cat.sub || ""}
                </p>

                {isHov && (
                  <span className="absolute bottom-5 right-5 text-sm font-black" style={{ color: C }}>→</span>
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
      <section className="relative z-10 border-b" style={{ borderColor: IK }}>
        <div className="flex items-center justify-between px-6 md:px-12 py-3 border-b" style={{ borderColor: IK, background: IK }}>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>§ 003 — PROCESS</span>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: CR }}>FOUR STEPS</span>
        </div>
        <div className="grid md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={i} className="px-8 py-12 border-r last:border-r-0" style={{ borderColor: IK, background: i % 2 === 0 ? CR : CR_ALT }}>
              <div className="text-6xl font-black mb-6 leading-none" style={{ color: C, opacity: 0.18, letterSpacing: "-0.04em" }}>
                {s.n}
              </div>
              <h4 className="text-sm font-black uppercase tracking-wide mb-4">{s.title}</h4>
              <p className="text-2xs font-black uppercase tracking-wide leading-relaxed" style={{ color: LIGHT_IK }}>
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
      <section className="relative z-10 border-b overflow-hidden" style={{ borderColor: IK }}>
        <div className="flex items-center justify-between px-6 md:px-12 py-3 border-b" style={{ borderColor: IK, background: IK }}>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>§ 004 — REVIEWS</span>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: CR }}>★ 4.9 / 5 PLATFORM RATING</span>
        </div>
        <div className="py-10 overflow-hidden" style={{ background: CR }}>
          <div className="flex gap-0 whitespace-nowrap" style={{ animation: "ticker 35s linear infinite" }}>
            {[...reviews, ...reviews].map((r, i) => (
              <div key={i} className="inline-flex flex-col justify-between border mx-4 p-7 shrink-0" style={{ borderColor: IK, width: 300, whiteSpace: "normal", background: i % 2 === 0 ? CR : CR_ALT }}>
                <p className="text-sm leading-relaxed mb-6" style={{ color: LIGHT_IK, fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
                  "{r.quote}"
                </p>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide">{r.name}</p>
                  <p className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>{r.city}</p>
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
    <section className="relative z-10 border-b" style={{ borderColor: IK, background: IK }}>
      <div className="grid lg:grid-cols-12 items-center">
        <div className="lg:col-span-8 px-6 md:px-12 py-14 border-r" style={{ borderColor: C }}>
          <h2 className="font-black uppercase leading-none" style={{ fontSize: "clamp(2rem,5vw,4.5rem)", color: CR, letterSpacing: "-0.02em" }}>
            READY TO GET
            <br />
            <span style={{ color: C }}>THINGS DONE?</span>
          </h2>
          <p className="mt-4 text-sm" style={{ color: LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Find the right professional in minutes. No account needed to browse.
          </p>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-3 px-8 py-12">
          <a href="/discovery"
            className="block text-center px-8 py-4 font-black text-2xs uppercase tracking-superwide transition-all duration-100 border-2"
            style={{ background: C, color: CR, borderColor: C, textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; e.currentTarget.style.borderColor = CR; }}
            onMouseLeave={e => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; e.currentTarget.style.borderColor = C; }}
          >
            FIND A PROVIDER →
          </a>
          <a href="/signup"
            className="block text-center px-8 py-4 font-black text-2xs uppercase tracking-superwide transition-all duration-100 border-2"
            style={{ background: "transparent", color: CR, borderColor: CR, textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = CR; }}
          >
            BECOME A PROVIDER →
          </a>
        </div>
      </div>
    </section>
  );


  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, statsData] = await Promise.all([
          fetchCategories(),
          fetchPublicStats().catch(() => null),
        ]);
        if (categoriesData) setCategories(categoriesData);
        if (statsData) setStats(statsData);
      } catch (err) {
        console.error("Failed to load landing page data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="relative min-h-screen font-sans" style={{ background: CR, color: IK }}>
      <GridOverlay />
      <Header />
      <main>
        <Hero stats={stats} categories={categories} />
        <CategoryGrid categories={categories} />
        <HowItWorks />
        <Testimonials />
        <CTABand />
      </main>
      <Footer />
    </div>
  );
}