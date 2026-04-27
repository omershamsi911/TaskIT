import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../common/components/Header";
import Footer from "../../common/components/Footer";
import FilterSidebar from "../components/FilterSidebar";
import ProviderCard from "../components/ProviderCard";
import { searchProviders } from "../../../handlers/providers";
import { useTheme } from "../../hooks/useTheme";
import { fetchCategories } from "../../../handlers/categories";

const SORT_OPTIONS = [
  { label: "RECOMMENDED", key: "recommended" },
  { label: "TOP RATED", key: "rating" },
  { label: "PRICE ↑", key: "priceAsc" },
  { label: "PRICE ↓", key: "priceDesc" },
  { label: "DISTANCE", key: "distance" },
];

const CITIES = ["ALL CITIES", "Karachi", "Lahore", "Islamabad"];

// ─── DISCOVERY PAGE ───────────────────────────────────────────────────────────
export default function DiscoveryPage() {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [sortKey, setSortKey] = useState("recommended");
  const [city, setCity] = useState("ALL CITIES");

  const [distance, setDistance] = useState("10km"); // matches backend expectation
  const [minRating, setMinRating] = useState(0);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || null,
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    searchParams.get("subcategory") || null,
  );

  // Coordinates — default to Lahore center
  const [userLocation] = useState({ lat: 31.5204, lng: 74.3587 });

  // Fetch categories for filter sidebar
  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        console.log("CATEGORIES RESPONSE:", data);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  // Fetch providers
  // Fetch all providers once
  useEffect(() => {
    const loadAllProviders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchProviders({
          lat: userLocation.lat,
          lng: userLocation.lng,
          max_distance_km: 10000, // get virtually all providers
        });
        // Transform API response to match ProviderCard format
        const transformed = (data || []).map((p, i) => ({
          id: p.id || p.provider_id,
          user_id: p.user_id,
          name: p.full_name || "PROVIDER",
          category: p.services?.[0]?.title || p.category || "SERVICE",
          rating: p.avg_rating || 0,
          reviews: p.total_reviews || 0,
          location: p.city || "Lahore",
          priceFrom: p.services?.[0]?.base_price || 500,
          verified: p.profile_approved_at ? true : false,
          available: p.availability_status === "available",
          avatar_url: p.avatar_url,
          bio: p.bio,
          total_completed_jobs: p.total_completed_jobs || 0,
          response_rate: p.response_rate || 0,
          service_radius_km: p.service_radius_km,
          trust_score: p.trust_score,
          distance_km: p.distance, // used for distance filter
          badges: p.badges || [],
          services: p.services || [],
          // store the raw categories/service subcategory ids for frontend filtering
          _categoryIds: (p.services || [])
            .map((s) => s.subcategory_id)
            .filter(Boolean),
        }));
        setProviders(transformed);
      } catch (err) {
        console.error("Failed to load providers:", err);
        setError("Failed to load providers");
      } finally {
        setIsLoading(false);
      }
    };
    loadAllProviders();
  }, [userLocation.lat, userLocation.lng]); // only re‑fetch on location change

  // Map of category id → Set of subcategory ids
  const categoryMap = useMemo(() => {
    const map = {};
    (categories || []).forEach((cat) => {
      const subIds = (cat.subcategories || []).map((sub) => sub.id);
      map[cat.id] = new Set(subIds);
    });
    return map;
  }, [categories]);

  const displayed = useMemo(() => {
    let list = providers;

    // ── 1. Category / Subcategory ──────────────────────────────
    if (selectedCategory) {
      const allowedSubs = categoryMap[selectedCategory] || new Set();
      list = list.filter((p) =>
        p._categoryIds.some((id) => allowedSubs.has(id)),
      );
    }
    if (selectedSubcategory) {
      const subId = Number(selectedSubcategory);
      list = list.filter((p) => p._categoryIds.includes(subId));
    }

    // ── 2. City ──────────────────────────────────────────────────
    if (city !== "ALL CITIES") {
      list = list.filter(
        (p) => (p.location || "").toLowerCase() === city.toLowerCase(),
      );
    }

    // ── 3. Distance ──────────────────────────────────────────────
    if (distance !== "any") {
      const km = Number(distance.replace("km", ""));
      list = list.filter((p) => p.distance_km != null && p.distance_km <= km);
    }

    // ── 4. Min Rating ────────────────────────────────────────────
    if (minRating > 0) {
      list = list.filter((p) => p.rating >= minRating);
    }

    // ── 5. Price Range ───────────────────────────────────────────
    if (priceMin !== "") {
      list = list.filter((p) => (p.priceFrom || 0) >= Number(priceMin));
    }
    if (priceMax !== "") {
      list = list.filter((p) => (p.priceFrom || 0) <= Number(priceMax));
    }

    // ── 6. Verified / Available toggles ──────────────────────────
    if (verifiedOnly) {
      list = list.filter((p) => p.verified);
    }
    if (availableOnly) {
      list = list.filter((p) => p.available);
    }

    // ── 7. Text search ───────────────────────────────────────────
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.location && p.location.toLowerCase().includes(q)),
      );
    }

    // ── 8. Sorting ──────────────────────────────────────────────
    switch (sortKey) {
      case "priceAsc":
        list = [...list].sort(
          (a, b) => (a.priceFrom || 0) - (b.priceFrom || 0),
        );
        break;
      case "priceDesc":
        list = [...list].sort(
          (a, b) => (b.priceFrom || 0) - (a.priceFrom || 0),
        );
        break;
      case "rating":
        list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      // "recommended" and "distance" can stay in the order they came from API (already sorted by recommendation)
      default:
        break;
    }

    return list;
  }, [
    providers,
    query,
    city,
    sortKey,
    distance,
    minRating,
    priceMin,
    priceMax,
    verifiedOnly,
    availableOnly,
    selectedCategory,
    selectedSubcategory,
    categoryMap,
  ]);

  const totalPages = Math.max(1, Math.ceil(displayed.length / 6));
  const paginatedProviders = displayed.slice(
    (currentPage - 1) * 6,
    currentPage * 6,
  );

  return (
    <div
      className="min-h-screen font-sans relative"
      style={{ background: CR, color: IK }}
    >
      {/* Grid overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* Search bar */}
        <div className="border-b" style={{ borderColor: IK, background: CR }}>
          <div className="flex items-stretch">
            {/* Vertical label */}
            <div
              className="hidden lg:flex items-center px-5 border-r shrink-0"
              style={{ borderColor: IK }}
            >
              <span
                className="text-2xs font-black tracking-superwide uppercase py-6"
                style={{ color: LIGHT_IK, writingMode: "vertical-rl" }}
              >
                § DISCOVERY
              </span>
            </div>

            {/* Input */}
            <div className="flex flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="SEARCH PROVIDERS, SERVICES, CITIES…"
                className="flex-1 px-6 py-4 bg-transparent text-2xs font-black uppercase tracking-superwide outline-none"
                style={{ color: IK }}
              />
              <button
                className="px-8 py-4 font-black text-2xs uppercase tracking-superwide border-l transition-colors duration-100"
                style={{ background: C, color: CR, borderColor: IK }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = IK;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C;
                }}
              >
                SEARCH →
              </button>
            </div>

            {/* Result count */}
            <div
              className="hidden md:flex flex-col items-center justify-center px-6 border-l shrink-0"
              style={{ borderColor: IK }}
            >
              <span
                className="text-3xl font-black tabular-nums leading-none"
                style={{ color: C }}
              >
                {displayed.length}
              </span>
              <span
                className="text-2xs font-black uppercase tracking-superwide"
                style={{ color: LIGHT_IK }}
              >
                RESULTS
              </span>
            </div>

            {/* Mobile filter toggle */}
            <button
              className="lg:hidden flex items-center gap-2 px-5 border-l"
              style={{ borderColor: IK }}
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <span
                className="text-2xs font-black uppercase tracking-superwide"
                style={{ color: IK }}
              >
                FILTER
              </span>
              <span className="text-sm font-black" style={{ color: IK }}>
                {sidebarOpen ? "✕" : "⊟"}
              </span>
            </button>
          </div>
        </div>

        {/* City + Sort bar */}
        <div
          className="flex items-stretch border-b overflow-x-auto shrink-0"
          style={{ background: CR, borderColor: IK }}
        >
          {/* City tabs */}
          <div
            className="flex items-stretch border-r shrink-0"
            style={{ borderColor: IK }}
          >
            {CITIES.map((c) => {
              const active = city === c;
              return (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className="px-4 py-2.5 text-2xs font-black uppercase tracking-superwide border-r last:border-r-0 whitespace-nowrap transition-colors duration-100"
                  style={{
                    background: active ? IK : CR,
                    color: active ? CR : IK,
                    borderColor: IK,
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {/* Sort label */}
          <div
            className="hidden sm:flex items-center px-5 border-r shrink-0"
            style={{ borderColor: IK }}
          >
            <span
              className="text-2xs font-black uppercase tracking-superwide"
              style={{ color: LIGHT_IK }}
            >
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
                className="px-4 py-2.5 text-2xs font-black uppercase tracking-superwide border-r whitespace-nowrap shrink-0 transition-colors duration-100"
                style={{
                  background: active ? C : CR,
                  color: active ? CR : IK,
                  borderColor: IK,
                }}
              >
                {label}
              </button>
            );
          })}

          {/* View toggle */}
          <div
            className="ml-auto flex items-stretch border-l shrink-0"
            style={{ borderColor: IK }}
          >
            {[
              { mode: "grid", icon: "⊞" },
              { mode: "list", icon: "☰" },
            ].map(({ mode, icon }) => {
              const active = viewMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="px-4 py-2.5 text-xs font-black border-r last:border-r-0 transition-colors duration-100"
                  style={{
                    background: active ? IK : CR,
                    color: active ? CR : IK,
                    borderColor: IK,
                  }}
                >
                  {icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside
            className={`shrink-0 border-r overflow-y-auto
              ${sidebarOpen ? "block" : "hidden"} lg:block
              w-full lg:w-56 xl:w-64
              ${sidebarOpen ? "absolute inset-0 z-40 lg:relative lg:z-auto" : ""}
            `}
            style={{ background: CR, borderColor: IK }}
          >
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategoryChange={(categoryId) => {
                setSelectedCategory(categoryId);
                setSelectedSubcategory(null);
                setCurrentPage(1);
                setSearchParams({ category: String(categoryId) });
              }}
              onSubcategoryChange={(subcategoryId) => {
                setSelectedSubcategory(subcategoryId);
                setSelectedCategory(null);
                setCurrentPage(1);
                setSearchParams({ subcategory: String(subcategoryId) });
              }}
              priceMin={priceMin}
              setPriceMin={setPriceMin}
              priceMax={priceMax}
              setPriceMax={setPriceMax}
              minRating={minRating}
              setMinRating={setMinRating}
              distance={distance}
              setDistance={setDistance}
              verifiedOnly={verifiedOnly}
              setVerifiedOnly={setVerifiedOnly}
              availableOnly={availableOnly}
              setAvailableOnly={setAvailableOnly}
            />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 flex flex-col">
            {/* Section header */}
            <div
              className="flex items-center justify-between px-6 py-3 border-b shrink-0"
              style={{ background: CR, borderColor: IK }}
            >
              <div className="flex items-center gap-4">
                <span
                  className="text-2xs font-black uppercase tracking-superwide"
                  style={{ color: LIGHT_IK }}
                >
                  § 001 — PROVIDERS
                </span>
                <span
                  className="text-2xs font-black uppercase tracking-superwide"
                  style={{ color: C }}
                >
                  {displayed.length} FOUND
                </span>
              </div>
              {isLoading && (
                <span
                  className="flex items-center gap-2 text-2xs font-black uppercase tracking-superwide"
                  style={{ color: LIGHT_IK }}
                >
                  <span className="animate-spin text-sm" style={{ color: C }}>
                    ◎
                  </span>
                  LOADING...
                </span>
              )}
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <span
                  className="animate-spin text-4xl font-black"
                  style={{ color: C }}
                >
                  ◎
                </span>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <span className="text-7xl font-black mb-4" style={{ color: C }}>
                  !
                </span>
                <p
                  className="text-xs font-black uppercase tracking-superwide mb-2"
                  style={{ color: IK }}
                >
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="border px-6 py-3 text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
                  style={{ background: C, color: CR, borderColor: C }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = IK;
                    e.currentTarget.style.borderColor = IK;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = C;
                    e.currentTarget.style.borderColor = C;
                  }}
                >
                  RETRY →
                </button>
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <span
                  className="text-7xl font-black mb-4"
                  style={{ color: IK, opacity: 0.08 }}
                >
                  ◈
                </span>
                <p
                  className="text-xs font-black uppercase tracking-superwide"
                  style={{ color: LIGHT_IK }}
                >
                  NO PROVIDERS FOUND
                </p>
                <p
                  className="text-2xs font-black uppercase tracking-superwide mt-1"
                  style={{ color: LIGHT_IK }}
                >
                  TRY ADJUSTING YOUR FILTERS
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedProviders.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col">
                {paginatedProviders.map((provider, i) => (
                  <div
                    key={provider.id}
                    className="flex items-center border-b last:border-b-0 transition-colors duration-100 cursor-pointer group"
                    style={{
                      background: i % 2 === 0 ? CR : CR_ALT,
                      borderColor: IK,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = IK)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        i % 2 === 0 ? CR : CR_ALT)
                    }
                  >
                    <span
                      className="w-12 shrink-0 flex items-center justify-center border-r py-4 text-2xs font-black"
                      style={{ borderColor: IK, color: LIGHT_IK }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div
                      className="w-12 h-12 border-r flex items-center justify-center shrink-0"
                      style={{ borderColor: IK, background: "#e8e2d6" }}
                    >
                      {provider.avatar_url ? (
                        <img
                          src={provider.avatar_url}
                          alt={provider.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span
                          className="text-xl"
                          style={{ color: IK, opacity: 0.1 }}
                        >
                          ◆
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex items-center gap-6 px-5 py-3 min-w-0">
                      <div className="min-w-0">
                        <p
                          className="text-xs font-black uppercase tracking-wide truncate"
                          style={{ color: IK }}
                        >
                          {provider.name}
                        </p>
                        <p
                          className="text-2xs font-black uppercase tracking-superwide"
                          style={{ color: C }}
                        >
                          {provider.category}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                        <span className="text-xs" style={{ color: C }}>
                          {"★".repeat(Math.floor(provider.rating))}
                        </span>
                        <span
                          className="text-2xs font-black"
                          style={{ color: LIGHT_IK }}
                        >
                          {provider.rating?.toFixed(1)}
                        </span>
                      </div>
                      <span
                        className="hidden md:block text-2xs font-black uppercase tracking-superwide"
                        style={{ color: LIGHT_IK }}
                      >
                        ⌖ {provider.location}
                      </span>
                    </div>
                    {provider.verified && (
                      <div
                        className="hidden sm:flex items-center px-4 border-l self-stretch"
                        style={{ borderColor: IK }}
                      >
                        <span
                          className="border text-2xs font-black uppercase tracking-superwide px-1.5 py-0.5"
                          style={{ borderColor: C, color: C }}
                        >
                          ✓ VER.
                        </span>
                      </div>
                    )}
                    <div
                      className="flex flex-col items-end justify-center px-4 border-l self-stretch shrink-0"
                      style={{ borderColor: IK }}
                    >
                      <span
                        className="text-2xs font-black uppercase"
                        style={{ color: LIGHT_IK }}
                      >
                        FROM
                      </span>
                      <span
                        className="text-xs font-black uppercase"
                        style={{ color: C }}
                      >
                        {(provider.priceFrom || 0).toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="hidden md:flex items-center self-stretch border-l px-4"
                      style={{ borderColor: IK }}
                    >
                      <span className="text-xs" style={{ color: C }}>
                        →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {displayed.length > 6 && (
              <div
                className="flex items-stretch border-t mt-auto shrink-0"
                style={{ background: CR, borderColor: IK }}
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-6 py-3.5 border-r text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
                  style={{ borderColor: IK, color: IK }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = IK;
                    e.currentTarget.style.color = CR;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = IK;
                  }}
                >
                  ← PREV
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className="px-5 py-3.5 border-r text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
                      style={{
                        background: currentPage === p ? C : CR,
                        color: currentPage === p ? CR : IK,
                        borderColor: IK,
                      }}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="px-6 py-3.5 border-r text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
                  style={{ borderColor: IK, color: IK }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = IK;
                    e.currentTarget.style.color = CR;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = IK;
                  }}
                >
                  NEXT →
                </button>
                <div
                  className="ml-auto hidden sm:flex items-center px-6 border-l"
                  style={{ borderColor: IK }}
                >
                  <span
                    className="text-2xs font-black uppercase tracking-superwide tabular-nums"
                    style={{ color: LIGHT_IK }}
                  >
                    PAGE {currentPage} OF {totalPages}
                  </span>
                </div>
              </div>
            )}
          </main>
        </div>

        <Footer />
      </div>
    </div>
  );
}
