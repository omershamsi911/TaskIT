import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import { getAllServices, searchProviders } from "../handlers/providerHandlers";
import { getCategories } from "../handlers/categoryHandlers";
import { getUserReviews } from "../handlers/reviewHandlers";

// ─── HELPERS ──────────────────────────────────────────────────────
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R    = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a    = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

const SORT_OPTIONS = [
  { label: "RECOMMENDED", key: "recommended" },
  { label: "PRICE ↑",     key: "priceAsc"    },
  { label: "PRICE ↓",     key: "priceDesc"   },
];

const ITEMS_PER_PAGE = 9;

// ─── SECTION BAR ──────────────────────────────────────────────────
const SectionBar = ({ left, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 32px", background: T.IK }}>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>{left}</span>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.CR }}>{right}</span>
  </div>
);

// ─── FIND SERVICES ────────────────────────────────────────────────
const FindServices = () => {
  const navigate = useNavigate();

  const [services,     setServices]     = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [reviewsData, setReviewsData] = useState({});

  const [filters, setFilters] = useState({ categoryId: "ALL", search: "", sort: "recommended" });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    Promise.all([getAllServices(), getCategories()])
      .then(async ([svcs, cats]) => {
        // Fetch reviews for all providers
        const uniqueProviderIds = [...new Set(svcs.map(s => s.provider_id).filter(id => id))];
        const reviewsMap = {};
        
        await Promise.all(
          uniqueProviderIds.map(async (providerId) => {
            try {
              const reviews = await getUserReviews(providerId);
              const avgRating = reviews.length
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;
              reviewsMap[providerId] = { avgRating, reviewCount: reviews.length };
            } catch (err) {
              reviewsMap[providerId] = { avgRating: 0, reviewCount: 0 };
            }
          })
        );
        
        setReviewsData(reviewsMap);
        setServices(svcs);
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredServices = useMemo(() => {
    let list = Array.isArray(services) ? [...services] : [];

    if (filters.categoryId !== "ALL") {
      list = list.filter(s => String(s.category_id) === String(filters.categoryId));
    }

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(s => s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
    }

    // Apply sorting
    if (filters.sort === "recommended") {
      // Sort by average rating (highest first), then by review count
      list.sort((a, b) => {
        const aRating = reviewsData[a.provider_id]?.avgRating || 0;
        const bRating = reviewsData[b.provider_id]?.avgRating || 0;
        if (bRating !== aRating) return bRating - aRating;
        // If ratings are equal, sort by review count
        const aCount = reviewsData[a.provider_id]?.reviewCount || 0;
        const bCount = reviewsData[b.provider_id]?.reviewCount || 0;
        return bCount - aCount;
      });
    } else if (filters.sort === "priceAsc") {
      list.sort((a, b) => (a.base_price || a.price) - (b.base_price || b.price));
    } else if (filters.sort === "priceDesc") {
      list.sort((a, b) => (b.base_price || b.price) - (a.base_price || a.price));
    }

    return list;
  }, [services, filters, reviewsData]);

  const totalPages        = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const paginatedServices = filteredServices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setCurrentPage(1); };

  const handleLocationSearch = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        try {
          const catId = filters.categoryId !== "ALL" ? filters.categoryId : null;
          const results = await searchProviders(lat, lng, 10, catId);
          const withDist = results.flatMap(p =>
            (p.services || []).map(s => ({
              ...s,
              provider_id: p.id,
              distance: calculateDistance(lat, lng, p.lat, p.lng),
            }))
          );
          setServices(withDist);
        } catch (e) {
          console.error(e);
        } finally {
          setLocationLoading(false);
        }
      },
      () => { alert("Location access denied."); setLocationLoading(false); }
    );
  };

  const handleBookNow = (service) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      if (window.confirm("You need to log in to book a service. Go to login?")) navigate("/login");
      return;
    }
    navigate("/book-service", { state: { service } });
  };

  return (
    <SharedLayout>
      <SectionBar left="FIND SERVICES" right={`${filteredServices.length} RESULTS`} />

      {/* Filter bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 0, borderBottom: `1px solid ${T.IK}`, background: T.CR }}>
        <div style={{ display: "flex", alignItems: "stretch", flex: "1 1 240px", borderRight: `1px solid ${T.IK}` }}>
          <input
            type="text"
            placeholder="SEARCH SERVICES..."
            value={filters.search}
            onChange={e => handleFilter("search", e.target.value)}
            style={{ flex: 1, padding: "14px 20px", fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", background: "transparent", border: "none", outline: "none", color: T.IK }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "stretch", borderRight: `1px solid ${T.IK}` }}>
          <select
            value={filters.categoryId}
            onChange={e => handleFilter("categoryId", e.target.value)}
            style={{ padding: "0 20px", fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", background: "transparent", border: "none", outline: "none", color: T.IK, cursor: "pointer", appearance: "none", minWidth: 180 }}>
            <option value="ALL">ALL CATEGORIES</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "stretch" }}>
          {SORT_OPTIONS.map(opt => (
            <button key={opt.key}
              onClick={() => handleFilter("sort", opt.key)}
              style={{ padding: "0 20px", fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", borderRight: `1px solid ${T.IK}`, cursor: "pointer", transition: "all 0.1s", background: filters.sort === opt.key ? T.C : "transparent", color: filters.sort === opt.key ? T.CR : T.IK }}>
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleLocationSearch}
          disabled={locationLoading}
          style={{ marginLeft: "auto", padding: "0 24px", fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", borderLeft: `1px solid ${T.IK}`, cursor: "pointer", transition: "all 0.1s", background: userLocation ? T.C : T.IK, color: T.CR, opacity: locationLoading ? 0.6 : 1 }}>
          {locationLoading ? "DETECTING..." : userLocation ? "📍 NEARBY" : "📍 FIND NEARBY"}
        </button>
      </div>

      {/* Services grid */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: T.C, animation: "spin 1s linear infinite" }}>◎</span>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : paginatedServices.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
          <span style={{ fontSize: 72, fontWeight: 900, color: T.IK, opacity: 0.08, marginBottom: 16 }}>◈</span>
          <p style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>NO SERVICES FOUND</p>
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>TRY ADJUSTING YOUR FILTERS</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 0, padding: 0 }}>
          {paginatedServices.map((service, idx) => (
            <ServiceCard key={service.id || idx} service={service} idx={idx} onBook={handleBookNow} reviewData={reviewsData[service.provider_id]} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "stretch", borderTop: `1px solid ${T.IK}` }}>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            style={{ padding: "14px 24px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", background: "transparent", border: "none", borderRight: `1px solid ${T.IK}`, cursor: "pointer", color: T.IK }}
            onMouseEnter={e => { e.currentTarget.style.background = T.IK; e.currentTarget.style.color = T.CR; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.IK; }}>
            ← PREV
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)}
              style={{ padding: "14px 20px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", border: "none", borderRight: `1px solid ${T.IK}`, cursor: "pointer", background: currentPage === p ? T.C : "transparent", color: currentPage === p ? T.CR : T.IK }}>
              {p}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            style={{ padding: "14px 24px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", background: "transparent", border: "none", borderRight: `1px solid ${T.IK}`, cursor: "pointer", color: T.IK }}
            onMouseEnter={e => { e.currentTarget.style.background = T.IK; e.currentTarget.style.color = T.CR; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.IK; }}>
            NEXT →
          </button>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", padding: "0 24px", borderLeft: `1px solid ${T.IK}` }}>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: T.LIGHT_IK }}>PAGE {currentPage} OF {totalPages}</span>
          </div>
        </div>
      )}
    </SharedLayout>
  );
};

// ─── STAR RATING DISPLAY ──────────────────────────────────────────
const StarRating = ({ avg, count }) => {
  const filled = Math.round(avg);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map(s => (
          <span key={s} style={{ fontSize: 11, color: s <= filled ? T.C : "#ddd", lineHeight: 1 }}>★</span>
        ))}
      </div>
      <span style={{ fontSize: 10, fontWeight: 900, color: T.IK }}>{avg}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: T.LIGHT_IK }}>({count})</span>
    </div>
  );
};

// ─── SERVICE CARD ─────────────────────────────────────────────────
const ServiceCard = ({ service, idx, onBook, reviewData }) => {
  const [hov, setHov] = useState(false);

  const avgRating = reviewData?.avgRating ? reviewData.avgRating.toFixed(1) : null;
  const reviewCount = reviewData?.reviewCount || 0;

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border: `1px solid ${T.IK}`, borderTop: "none", borderLeft: "none", padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between", background: idx % 2 === 0 ? T.CR : T.CR_ALT, transition: "transform 0.1s", transform: hov ? "scale(1.01)" : "scale(1)" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <span style={{ padding: "4px 8px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", background: T.IK, color: T.CR }}>
            {service.pricing_type || "FIXED PRICE"}
          </span>
          {service.distance && (
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.C }}>
              📍 {service.distance} km
            </span>
          )}
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: T.IK, marginBottom: 8, lineHeight: 1.3 }}>
          {service.title}
        </h3>

        <p style={{ fontSize: 11, lineHeight: 1.7, color: T.LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {service.description || "No description provided."}
        </p>

        {/* ── REVIEW RATING ── */}
        <div style={{ marginTop: 12, minHeight: 20 }}>
          {avgRating ? (
            <StarRating avg={avgRating} count={reviewCount} />
          ) : (
            <span style={{ fontSize: 10, fontWeight: 700, color: T.LIGHT_IK, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              NO REVIEWS YET
            </span>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.IK}`, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: T.LIGHT_IK }}>Base Price</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: T.C }}>Rs. {service.base_price || service.price}</span>
        </div>
        <button
          onClick={() => onBook(service)}
          style={{ width: "100%", padding: "12px 0", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", background: "transparent", border: `1px solid ${T.IK}`, color: T.IK, cursor: "pointer", transition: "all 0.1s" }}
          onMouseEnter={e => { e.currentTarget.style.background = T.IK; e.currentTarget.style.color = T.CR; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.IK; }}>
          BOOK NOW →
        </button>
      </div>
    </div>
  );
};

export default FindServices;