export default function ProviderCard({ provider = {} }) {
  const {
    index     = "01",
    name      = "PROVIDER NAME",
    category  = "SERVICE",
    rating    = 4.8,
    reviews   = 0,
    location  = "—",
    priceFrom = 0,
    verified  = false,
    available = false,
  } = provider;

  const fullStars  = Math.floor(rating);
  const halfStar   = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <article
      className="group flex flex-col font-sans border border-ink cursor-pointer transition-colors duration-100 hover:bg-ink"
      style={{ background: "#F5F0E6" }}
    >
      {/* ── Image placeholder ──────────────────────────────────────────── */}
      <div
        className="relative border-b border-ink overflow-hidden"
        style={{ height: 130, background: "#e8e2d6" }}
      >
        {/* Hover tint overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
          style={{ background: "#1A1A1A" }}
        />

        {/* Decorative glyph */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-5xl font-black select-none" style={{ color: "#1A1A1A", opacity: 0.07 }}>
            ◈
          </span>
        </div>

        {/* Corner index */}
        <span
          className="absolute top-2 left-3 text-2xs font-black group-hover:text-cream transition-colors"
          style={{ color: "#1A1A1A", opacity: 0.3 }}
        >
          [{index}]
        </span>

        {/* Availability badge */}
        <div className="absolute top-2 right-2">
          {available ? (
            <div className="flex items-center gap-1 border border-ink px-1.5 py-0.5" style={{ background: "#F5F0E6" }}>
              <span className="w-1.5 h-1.5 inline-block shrink-0 animate-pulse" style={{ background: "#FF5733" }} />
              <span className="text-2xs font-black uppercase tracking-wide" style={{ color: "#1A1A1A" }}>AVAIL</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 border px-1.5 py-0.5" style={{ background: "#F5F0E6", borderColor: "rgba(26,26,26,0.25)" }}>
              <span className="w-1.5 h-1.5 inline-block shrink-0" style={{ background: "rgba(26,26,26,0.2)" }} />
              <span className="text-2xs font-black uppercase tracking-wide" style={{ color: "rgba(26,26,26,0.35)" }}>BUSY</span>
            </div>
          )}
        </div>

        {/* Category ribbon */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-ink px-3 py-1" style={{ background: "#F5F0E6" }}>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: "#FF5733" }}>
            {category}
          </span>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-3 pt-3 pb-2">

        {/* Name + Verified */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="text-xs font-black uppercase leading-tight tracking-wide group-hover:text-cream transition-colors"
            style={{ color: "#1A1A1A" }}
          >
            {name}
          </h3>
          {verified && (
            <span
              className="shrink-0 border text-2xs font-black uppercase tracking-wide px-1 py-0.5 group-hover:text-cream transition-colors"
              style={{ borderColor: "#FF5733", color: "#FF5733" }}
            >
              ✓ VER
            </span>
          )}
        </div>

        {/* Stars + review count */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs tracking-wider leading-none" style={{ color: "#FF5733" }}>
            {"★".repeat(fullStars)}
            {halfStar ? "½" : ""}
            <span style={{ opacity: 0.25 }}>{"☆".repeat(emptyStars)}</span>
          </span>
          <span
            className="text-2xs font-black uppercase tracking-wide group-hover:text-cream transition-colors"
            style={{ color: "#1A1A1A", opacity: 0.45 }}
          >
            {rating.toFixed(1)} · {reviews}
          </span>
        </div>

        {/* Location + Price */}
        <div
          className="mt-auto pt-2 flex items-center justify-between border-t"
          style={{ borderColor: "rgba(26,26,26,0.12)" }}
        >
          <span
            className="text-2xs font-black uppercase tracking-wide group-hover:text-cream transition-colors"
            style={{ color: "#1A1A1A", opacity: 0.5 }}
          >
            ⌖ {location}
          </span>
          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: "#FF5733" }}>
            PKR {priceFrom.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <a
        href="#"
        className="flex items-center justify-between px-3 py-2 border-t border-ink transition-colors duration-100 group-hover:bg-coral"
        style={{ background: "#F5F0E6" }}
        onClick={(e) => e.preventDefault()}
      >
        <span
          className="text-2xs font-black uppercase tracking-superwide group-hover:text-cream transition-colors"
          style={{ color: "#1A1A1A" }}
        >
          VIEW PROFILE
        </span>
        <span className="text-xs group-hover:text-cream transition-colors" style={{ color: "#1A1A1A" }}>→</span>
      </a>
    </article>
  );
}