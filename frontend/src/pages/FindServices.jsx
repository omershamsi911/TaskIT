import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAllServices, searchProviders } from "../handlers/providerHandlers";
import { getCategories } from "../handlers/categoryHandlers";

// ---------------------------------------------------------------------------
// Light‑theme only colour palette  (replicates useTheme for the old UI)
// ---------------------------------------------------------------------------
const useTheme = () => {
  // All values are hard‑coded for the light theme – no dark theme support.
  return {
    C: "#ff4d2d",        // Coral accent
    CR: "#fdfbf7",       // Main background (cream)
    IK: "#1a1a1a",       // Primary text / borders
    CR_ALT: "#efe9e1",   // Alternate cream for subtle stripes
    LIGHT_IK: "#6b6b6b", // Muted text
  };
};

// ---------------------------------------------------------------------------
// Helper: precise distance calculation (front‑end)
// ---------------------------------------------------------------------------
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

// ---------------------------------------------------------------------------
// Sort options (mirrors the old “SORT” bar)
// ---------------------------------------------------------------------------
const SORT_OPTIONS = [
  { label: "RECOMMENDED", key: "recommended" },
  { label: "PRICE ↑", key: "priceAsc" },
  { label: "PRICE ↓", key: "priceDesc" },
];

// ---------------------------------------------------------------------------
// Footer component (identical to the one you provided)
// ---------------------------------------------------------------------------
const FOOTER_COLS = [
  {
    heading: "Platform",
    links: [
      { label: "How it Works", path: "/#how-it-works" },
      { label: "Browse Services", path: "/discovery" },
      { label: "For Providers", path: "/signup" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", path: "/#about" },
      { label: "Contact", path: "/#contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Service", path: "/terms" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Centre", path: "/help" },
      { label: "Dispute Centre", path: "/disputes" },
    ],
  },
];

const Footer = () => {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const socials = ["TW", "IN", "FB", "YT"];

  return (
    <footer
      className="relative z-10 font-sans"
      style={{ borderTop: `1px solid ${IK}` }}
    >
      {/* Top grid */}
      <div
        className="grid md:grid-cols-12 border-b"
        style={{ borderColor: IK }}
      >
        {/* Brand column */}
        <div
          className="md:col-span-3 px-6 md:px-10 py-10 border-r"
          style={{ borderColor: IK }}
        >
          <Link to="/" className="no-underline">
            <div
              className="font-black text-2xl uppercase tracking-superwide mb-1"
              style={{ color: C }}
            >
              TASKIT
            </div>
          </Link>
          <div
            className="text-2xs font-black uppercase tracking-superwide mb-6"
            style={{ color: LIGHT_IK }}
          >
            [STUDIO]
          </div>
          <p
            className="text-2xs leading-relaxed"
            style={{
              color: LIGHT_IK,
              fontFamily: "Georgia, serif",
              fontWeight: 400,
            }}
          >
            Pakistan's premier AI-powered service marketplace. Connecting
            skilled professionals with people who need them most.
          </p>
          <div className="flex mt-8 border" style={{ borderColor: IK }}>
            {socials.map((s, i) => (
              <button
                key={i}
                className="flex-1 py-2.5 text-2xs font-black border-r last:border-r-0 transition-all duration-100"
                style={{
                  borderColor: IK,
                  background: "transparent",
                  cursor: "pointer",
                  color: IK,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C;
                  e.currentTarget.style.color = CR;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = IK;
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_COLS.map((col, ci) => (
          <div
            key={ci}
            className="md:col-span-2 px-6 md:px-8 py-10 border-r last:border-r-0"
            style={{ borderColor: IK }}
          >
            <h5
              className="text-2xs font-black uppercase tracking-superwide mb-6"
              style={{ color: C }}
            >
              {col.heading}
            </h5>
            <ul className="space-y-3">
              {col.links.map((lnk, li) => (
                <li key={li}>
                  <Link
                    to={lnk.path}
                    className="text-2xs font-black uppercase tracking-superwide no-underline transition-all duration-100"
                    style={{ color: LIGHT_IK }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = C;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = LIGHT_IK;
                    }}
                  >
                    {lnk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter */}
        <div
          className="md:col-span-3 px-6 md:px-8 py-10 border-t md:border-t-0 md:border-l"
          style={{ borderColor: IK }}
        >
          <h5
            className="text-2xs font-black uppercase tracking-superwide mb-2"
            style={{ color: C }}
          >
            NEWSLETTER
          </h5>
          <p
            className="text-2xs leading-relaxed mb-5"
            style={{
              color: LIGHT_IK,
              fontFamily: "Georgia, serif",
              fontWeight: 400,
            }}
          >
            Platform updates, city launches, and new service categories.
          </p>
          <div className="flex border" style={{ borderColor: IK }}>
            <input
              type="email"
              placeholder="YOUR@EMAIL.COM"
              className="w-full px-3 py-3 text-2xs font-black uppercase tracking-superwide bg-transparent outline-none"
              style={{ color: IK, border: "none" }}
            />
            <button
              className="px-4 py-3 text-2xs font-black uppercase shrink-0 transition-all duration-100 border-l"
              style={{
                background: C,
                color: CR,
                borderColor: IK,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = IK;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C;
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 md:px-10 py-5 gap-3"
        style={{ borderTop: `1px solid ${IK}` }}
      >
        <span
          className="text-2xs font-black uppercase tracking-superwide"
          style={{ color: LIGHT_IK }}
        >
          © {new Date().getFullYear()} TASKIT PLATFORM INC. — ALL RIGHTS
          RESERVED
        </span>
        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Cookies"].map((lnk, i) => (
            <Link
              key={i}
              to={`/${lnk.toLowerCase()}`}
              className="text-2xs font-black uppercase tracking-superwide no-underline transition-all duration-100"
              style={{ color: LIGHT_IK }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = C;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = LIGHT_IK;
              }}
            >
              {lnk}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
const FindServices = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("access_token");
  const { C, CR, IK, LIGHT_IK, CR_ALT } = useTheme();

  // Data states
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & location states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [radiusKm, setRadiusKm] = useState(10);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  // Sort state
  const [sortKey, setSortKey] = useState("recommended");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // 1. Fetch categories on mount
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // 2. Fetch services whenever location, radius, or category changes
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        if (userLocation) {
          const providers = await searchProviders(
            userLocation.lat,
            userLocation.lng,
            radiusKm,
            selectedCategory === "ALL" ? null : selectedCategory
          );

          let flattenedServices = [];
          providers.forEach((provider) => {
            if (provider.services) {
              provider.services.forEach((service) => {
                flattenedServices.push({
                  ...service,
                  provider_id: provider.user_id,
                  provider_name:
                    provider.full_name || `Provider #${provider.user_id}`,
                  distance: calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    provider.lat,
                    provider.lng
                  ),
                });
              });
            }
          });
          setServices(flattenedServices);
        } else {
          const res = await getAllServices();
          let allServices = res.data || [];

          if (selectedCategory !== "ALL") {
            allServices = allServices.filter(
              (s) => s.category_id === selectedCategory
            );
          }
          setServices(allServices);
        }
      } catch (err) {
        console.error("Failed to fetch services", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [userLocation, radiusKm, selectedCategory]);

  // Request geolocation
  const requestLocation = () => {
    setLocationStatus("loading");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus("granted");
        },
        (error) => {
          console.error(error);
          setLocationStatus("denied");
        }
      );
    } else {
      setLocationStatus("denied");
    }
  };

  const handleBookNow = (service) => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/book", { state: { service } });
    }
  };

  // Text search filter
  let filteredServices = services.filter((service) => {
    return (
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Apply sorting
  const sortedServices = useMemo(() => {
    const list = [...filteredServices];
    switch (sortKey) {
      case "priceAsc":
        return list.sort(
          (a, b) =>
            (a.base_price || a.price || 0) - (b.base_price || b.price || 0)
        );
      case "priceDesc":
        return list.sort(
          (a, b) =>
            (b.base_price || b.price || 0) - (a.base_price || a.price || 0)
        );
      default: // recommended – leave as is
        return list;
    }
  }, [filteredServices, sortKey]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(sortedServices.length / ITEMS_PER_PAGE)
  );
  const paginatedServices = sortedServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, radiusKm, userLocation]);

  return (
    <div
      className="min-h-screen font-sans relative m-0 p-0"
      style={{ background: CR, color: IK }}
    >
      {/* Grid overlay (mirrors the old bg-grid-coral class) */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0H0v20' fill='none' stroke='%23ff4d2d' stroke-opacity='0.08' stroke-width='0.5'/%3E%3C/svg%3E\")",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen m-0 p-0">
        {/* ==================== SEARCH BAR – attaches directly to navbar ==================== */}
        <div
          className="border-t border-b m-0"
          style={{ borderColor: IK, background: CR, marginTop: "-1px" }}
        >
          <div className="flex items-stretch">
            {/* Input */}
            <div className="flex flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH FOR SERVICES…"
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
                {sortedServices.length}
              </span>
              <span
                className="text-2xs font-black uppercase tracking-superwide"
                style={{ color: LIGHT_IK }}
              >
                RESULTS
              </span>
            </div>
          </div>
        </div>

        {/* ==================== SORT & LOCATION BAR ==================== */}
        <div
          className="flex items-stretch border-b overflow-x-auto shrink-0"
          style={{ background: CR, borderColor: IK }}
        >
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

          {/* Location button (inline with sort, no green highlight) */}
          <button
            onClick={requestLocation}
            disabled={locationStatus === "loading"}
            className="px-4 py-2.5 text-2xs font-black uppercase tracking-superwide border-r whitespace-nowrap shrink-0 transition-colors duration-100 ml-auto"
            style={{
              background: locationStatus === "granted" ? C : CR,
              color: locationStatus === "granted" ? CR : IK,
              borderColor: IK,
            }}
          >
            {locationStatus === "loading"
              ? "LOCATING..."
              : locationStatus === "granted"
              ? "LOCATION ACTIVE ✓"
              : "USE MY LOCATION"}
          </button>
        </div>

        {/* Radius slider (shown only when location is granted) */}
        {locationStatus === "granted" && (
          <div
            className="flex items-center gap-4 px-6 py-3 border-b"
            style={{ borderColor: IK }}
          >
            <span
              className="text-2xs font-black uppercase tracking-superwide"
              style={{ color: LIGHT_IK }}
            >
              SEARCH RADIUS: <span style={{ color: C }}>{radiusKm} KM</span>
            </span>
            <input
              type="range"
              min="1"
              max="50"
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
              className="w-full md:w-[200px] cursor-pointer"
              style={{ accentColor: C }}
            />
          </div>
        )}

        {/* ==================== CATEGORY FILTER ==================== */}
        <div
          className="flex flex-wrap gap-2 border-b px-6 py-4"
          style={{ borderColor: IK }}
        >
          <button
            onClick={() => setSelectedCategory("ALL")}
            className="px-4 py-2 text-2xs font-black uppercase tracking-superwide border transition-colors duration-100"
            style={{
              background:
                selectedCategory === "ALL" ? C : "transparent",
              borderColor: selectedCategory === "ALL" ? C : IK,
              color: selectedCategory === "ALL" ? CR : IK,
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== "ALL") {
                e.currentTarget.style.background = IK;
                e.currentTarget.style.color = CR;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== "ALL") {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = IK;
              }
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="px-4 py-2 text-2xs font-black uppercase tracking-superwide border transition-colors duration-100"
              style={{
                background:
                  selectedCategory === cat.id ? C : "transparent",
                borderColor: selectedCategory === cat.id ? C : IK,
                color: selectedCategory === cat.id ? CR : IK,
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat.id) {
                  e.currentTarget.style.background = IK;
                  e.currentTarget.style.color = CR;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat.id) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = IK;
                }
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ==================== MAIN CONTENT ==================== */}
        <main className="flex-1 min-w-0">
          {/* Section header */}
          <div
            className="flex items-center justify-between px-6 py-3 border-b shrink-0"
            style={{ borderColor: IK }}
          >
            <div className="flex items-center gap-4">
              <span
                className="text-2xs font-black uppercase tracking-superwide"
                style={{ color: LIGHT_IK }}
              >
                § 001 — SERVICES
              </span>
              <span
                className="text-2xs font-black uppercase tracking-superwide"
                style={{ color: C }}
              >
                {sortedServices.length} FOUND
              </span>
            </div>
            {loading && (
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

          {/* Services grid / empty state */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <span
                className="animate-spin text-4xl font-black"
                style={{ color: C }}
              >
                ◎
              </span>
            </div>
          ) : sortedServices.length === 0 ? (
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
                NO SERVICES FOUND
              </p>
              <p
                className="text-2xs font-black uppercase tracking-superwide mt-1"
                style={{ color: LIGHT_IK }}
              >
                TRY ADJUSTING YOUR FILTERS
              </p>
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedServices.map((service, idx) => (
                <div
                  key={service.id}
                  className="border p-6 hover:scale-[1.01] transition-transform flex flex-col justify-between group"
                  style={{
                    borderColor: IK,
                    background: idx % 2 === 0 ? CR : CR_ALT,
                  }}
                >
                  <div>
                    <div className="mb-4 flex justify-between items-start">
                      <span
                        className="px-2 py-1 text-2xs font-black uppercase tracking-superwide"
                        style={{ background: IK, color: CR }}
                      >
                        {service.pricing_type || "Fixed Price"}
                      </span>
                      {service.distance && (
                        <span
                          className="text-2xs font-black uppercase tracking-superwide flex items-center gap-1"
                          style={{ color: C }}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {service.distance} km away
                        </span>
                      )}
                    </div>
                    <h3
                      className="text-xs font-black uppercase leading-tight mb-2"
                      style={{ color: IK }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="text-2xs leading-relaxed line-clamp-3 mb-4"
                      style={{
                        color: LIGHT_IK,
                        fontFamily: "Georgia, serif",
                        fontWeight: 400,
                      }}
                    >
                      {service.description || "No description provided."}
                    </p>
                  </div>

                  <div
                    className="mt-4 pt-4 border-t flex flex-col gap-4"
                    style={{ borderColor: IK }}
                  >
                    <div className="flex justify-between items-end">
                      <span
                        className="text-2xs font-black uppercase tracking-superwide"
                        style={{ color: LIGHT_IK }}
                      >
                        Base Price
                      </span>
                      <span
                        className="text-xl font-extrabold"
                        style={{ color: C }}
                      >
                        Rs. {service.base_price || service.price}
                      </span>
                    </div>
                    <button
                      onClick={() => handleBookNow(service)}
                      className="w-full bg-transparent border py-3 text-2xs font-black uppercase transition-colors"
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
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {sortedServices.length > ITEMS_PER_PAGE && (
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
              ))}
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

        {/* Footer (now the one from your old implementation) */}
        <Footer />
      </div>
    </div>
  );
};

export default FindServices;