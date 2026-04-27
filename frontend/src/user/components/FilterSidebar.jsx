import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";

const DISTANCE_OPTIONS = [
  ["any", "ANY DISTANCE"],
  ["5km", "< 5 KM"],
  ["10km", "< 10 KM"],
  ["25km", "< 25 KM"],
  ["50km", "< 50 KM"],
];

const SectionHeading = ({ label }) => (
  <div
    className="px-5 py-2 border-b border-ink"
    style={{ background: "#1A1A1A" }}
  >
    <span
      className="text-2xs font-black uppercase tracking-superwide"
      style={{ color: "#FF5733" }}
    >
      {label}
    </span>
  </div>
);

export default function FilterSidebar({
  categories,
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  minRating,
  setMinRating,
  distance,
  setDistance,
  verifiedOnly,
  setVerifiedOnly,
  availableOnly,
  setAvailableOnly,
}) {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();

const [expandedCategory, setExpandedCategory] = useState(null);

const toggleCategory = (id) => {
  setExpandedCategory(prev => (prev === id ? null : id));
};
  const handleReset = () => {
    setPriceMin("");
    setPriceMax("");
    setMinRating(null);
    setDistance("any");
    setSelectedCategories([]);
    setVerifiedOnly(false);
    setAvailableOnly(false);
  };

  return (
    <aside
      className="font-sans border-r border-ink h-full flex flex-col"
      style={{ background: "#F5F0E6" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink">
        <span
          className="text-xs font-black uppercase tracking-superwide"
          style={{ color: "#1A1A1A" }}
        >
          FILTERS
        </span>
        <button
          onClick={handleReset}
          className="text-2xs font-black uppercase tracking-wide transition-colors"
          style={{ color: "#FF5733" }}
        >
          RESET ✕
        </button>
      </div>

      {/* ── Category ── */}
      <div className="border-b border-ink">
        <SectionHeading label="§ CATEGORIES" />
        {categories.map((cat) => {
  const isExpanded = expandedCategory === cat.id;
  const isSelected = selectedCategory === String(cat.id);

  return (
    <div key={cat.id}>
      
      {/* CATEGORY */}
      <button
        onClick={() =>
          setExpandedCategory(prev => (prev === cat.id ? null : cat.id))
        }
        className="w-full flex items-center justify-between px-5 py-2.5 border-b transition-all duration-150 text-left"
        style={{
          borderColor: "#1A1A1A",
          background: isSelected ? "#1A1A1A" : "#F5F0E6",
        }}
      >
        <span
          className="text-2xs font-black uppercase tracking-wide"
          style={{
            color: isSelected ? "#F5F0E6" : "#1A1A1A",
          }}
        >
          {cat.name}
        </span>

        {cat.subcategories?.length > 0 && (
          <span
            style={{
              color: "#FF5733",
              fontSize: "10px",
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s ease",
            }}
          >
            ▼
          </span>
        )}
      </button>

      {/* SUBCATEGORIES */}
      <div
        style={{
          maxHeight: isExpanded ? "500px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.2s ease",
        }}
      >
        {cat.subcategories?.map((sub) => {
          const isSubSelected = selectedSubcategory === String(sub.id);

          return (
            <button
              key={sub.id}
              onClick={(e) => {
                e.stopPropagation(); // 🔥 prevents collapsing
                onSubcategoryChange(sub.id);
              }}
              className="w-full flex items-center gap-4 px-8 py-2 border-b transition-all duration-100"
              style={{
                borderColor: "#1A1A1A",
                background: isSubSelected ? "#FF5733" : "#F5F0E6",
              }}
            >
              <span
                className="text-2xs font-black uppercase tracking-wide"
                style={{
                  color: isSubSelected ? "#F5F0E6" : "#1A1A1A",
                }}
              >
                {sub.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
})}
      </div>

      {/* ── Price Range ── */}
      <div className="border-b border-ink">
        <SectionHeading label="§ Price Range (PKR)" />
        <div className="flex">
          <div className="flex-1 border-r border-ink flex flex-col">
            <span
              className="px-4 pt-2.5 text-2xs font-black uppercase tracking-wide"
              style={{ color: "#1A1A1A", opacity: 0.4 }}
            >
              MIN
            </span>
            <input
              type="number"
              placeholder="0"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full px-4 pb-2.5 pt-0.5 bg-transparent text-xs font-black outline-none"
              style={{ color: "#1A1A1A" }}
            />
          </div>
          <div className="flex-1 flex flex-col">
            <span
              className="px-4 pt-2.5 text-2xs font-black uppercase tracking-wide"
              style={{ color: "#1A1A1A", opacity: 0.4 }}
            >
              MAX
            </span>
            <input
              type="number"
              placeholder="∞"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full px-4 pb-2.5 pt-0.5 bg-transparent text-xs font-black outline-none"
              style={{ color: "#1A1A1A" }}
            />
          </div>
        </div>
      </div>

      {/* ── Min Rating ── */}
      <div className="border-b border-ink">
        <SectionHeading label="§ Min. Rating" />
        {[5, 4, 3, 2, 1].map((r) => {
          const active = minRating === r;
          return (
            <button
              key={r}
              onClick={() => setMinRating(active ? null : r)}
              className="w-full flex items-center justify-between px-5 py-2.5 border-b border-ink transition-colors duration-100"
              style={{ background: active ? "#FF5733" : "#F5F0E6" }}
            >
              <span
                className="text-xs tracking-wider"
                style={{ color: active ? "#F5F0E6" : "#FF5733" }}
              >
                {"★".repeat(r)}
                <span style={{ opacity: 0.3 }}>{"☆".repeat(5 - r)}</span>
              </span>
              <span
                className="text-2xs font-black uppercase tracking-wide"
                style={{ color: active ? "#F5F0E6" : "#1A1A1A" }}
              >
                & UP
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Distance ── */}
      <div className="border-b border-ink">
        <SectionHeading label="§ Distance" />
        {DISTANCE_OPTIONS.map(([val, label]) => {
          const active = distance === val;
          return (
            <button
              key={val}
              onClick={() => setDistance(val)}
              className="w-full flex items-center justify-between px-5 py-2.5 border-b border-ink transition-colors duration-100"
              style={{ background: active ? "#1A1A1A" : "#F5F0E6" }}
            >
              <span
                className="text-2xs font-black uppercase tracking-wide"
                style={{ color: active ? "#F5F0E6" : "#1A1A1A" }}
              >
                {label}
              </span>
              {active && <span style={{ color: "#FF5733" }}>◆</span>}
            </button>
          );
        })}
      </div>

      {/* ── Options / Toggles ── */}
      <div className="border-b border-ink">
        <SectionHeading label="§ Options" />
        {[
          { label: "VERIFIED ONLY", state: verifiedOnly, set: setVerifiedOnly },
          {
            label: "AVAILABLE NOW",
            state: availableOnly,
            set: setAvailableOnly,
          },
        ].map(({ label, state, set }) => (
          <button
            key={label}
            onClick={() => set((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 border-b border-ink transition-colors duration-100"
            style={{ background: state ? "#1A1A1A" : "#F5F0E6" }}
          >
            <span
              className="text-2xs font-black uppercase tracking-wide"
              style={{ color: state ? "#F5F0E6" : "#1A1A1A" }}
            >
              {label}
            </span>
            {/* Toggle pill */}
            <span
              className="w-8 h-4 border flex items-center transition-colors shrink-0"
              style={{
                borderColor: state ? "#FF5733" : "#1A1A1A",
                background: state ? "#FF5733" : "transparent",
              }}
            >
              <span
                className="w-3.5 h-3.5 transition-transform"
                style={{
                  background: "#F5F0E6",
                  transform: state ? "translateX(18px)" : "translateX(0px)",
                }}
              />
            </span>
          </button>
        ))}
      </div>

      {/* ── Apply ── */}
      <div className="p-4 mt-auto">
        <button
          className="w-full py-3 font-black text-2xs uppercase tracking-superwide transition-colors duration-100 hover:bg-ink"
          style={{ background: "#FF5733", color: "#F5F0E6" }}
        >
          APPLY FILTERS →
        </button>
      </div>
    </aside>
  );
}
