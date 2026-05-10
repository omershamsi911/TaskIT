import { useState } from "react";
import { useLocation, useNavigate, Navigate, Link } from "react-router-dom";
import { createBooking } from "../handlers/bookingHandlers";

// ---------------------------------------------------------------------------
// Light‑theme only colour palette (replicates useTheme for the old UI)
// ---------------------------------------------------------------------------
const useTheme = () => ({
  C: "#ff4d2d",        // Coral accent
  CR: "#fdfbf7",       // Main background (cream)
  IK: "#1a1a1a",       // Primary text / borders
  CR_ALT: "#efe9e1",   // Alternate cream
  LIGHT_IK: "#6b6b6b", // Muted text
});

// ---------------------------------------------------------------------------
// Footer component (identical to the one from old implementation)
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
  const { C, CR, IK, LIGHT_IK } = useTheme();
  const socials = ["TW", "IN", "FB", "YT"];

  return (
    <footer className="relative z-10 font-sans" style={{ borderTop: `1px solid ${IK}` }}>
      <div className="grid md:grid-cols-12 border-b" style={{ borderColor: IK }}>
        <div className="md:col-span-3 px-6 md:px-10 py-10 border-r" style={{ borderColor: IK }}>
          <Link to="/" className="no-underline">
            <div className="font-black text-2xl uppercase tracking-superwide mb-1" style={{ color: C }}>TASKIT</div>
          </Link>
          <div className="text-2xs font-black uppercase tracking-superwide mb-6" style={{ color: LIGHT_IK }}>[STUDIO]</div>
          <p className="text-2xs leading-relaxed" style={{ color: LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Pakistan's premier AI-powered service marketplace. Connecting skilled professionals with people who need them most.
          </p>
          <div className="flex mt-8 border" style={{ borderColor: IK }}>
            {socials.map((s, i) => (
              <button
                key={i}
                className="flex-1 py-2.5 text-2xs font-black border-r last:border-r-0 transition-all duration-100"
                style={{ borderColor: IK, background: "transparent", color: IK }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        {FOOTER_COLS.map((col, ci) => (
          <div key={ci} className="md:col-span-2 px-6 md:px-8 py-10 border-r last:border-r-0" style={{ borderColor: IK }}>
            <h5 className="text-2xs font-black uppercase tracking-superwide mb-6" style={{ color: C }}>{col.heading}</h5>
            <ul className="space-y-3">
              {col.links.map((lnk, li) => (
                <li key={li}>
                  <Link
                    to={lnk.path}
                    className="text-2xs font-black uppercase tracking-superwide no-underline transition-all duration-100"
                    style={{ color: LIGHT_IK }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = C; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = LIGHT_IK; }}
                  >
                    {lnk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="md:col-span-3 px-6 md:px-8 py-10 border-t md:border-t-0 md:border-l" style={{ borderColor: IK }}>
          <h5 className="text-2xs font-black uppercase tracking-superwide mb-2" style={{ color: C }}>NEWSLETTER</h5>
          <p className="text-2xs leading-relaxed mb-5" style={{ color: LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400 }}>
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
              style={{ background: C, color: CR, borderColor: IK, cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = IK; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C; }}
            >
              →
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 md:px-10 py-5 gap-3" style={{ borderTop: `1px solid ${IK}` }}>
        <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
          © {new Date().getFullYear()} TASKIT PLATFORM INC. — ALL RIGHTS RESERVED
        </span>
        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Cookies"].map((lnk, i) => (
            <Link
              key={i}
              to={`/${lnk.toLowerCase()}`}
              className="text-2xs font-black uppercase tracking-superwide no-underline transition-all duration-100"
              style={{ color: LIGHT_IK }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = LIGHT_IK; }}
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
// BookService Page (UI upgraded, logic untouched)
// ---------------------------------------------------------------------------
const BookService = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();

  // If navigated here directly without a service, go back to catalog
  if (!state?.service) {
    return <Navigate to="/services" />;
  }

  const { service } = state;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scheduled_at: "",
    address: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBooking({
        provider_id: service.provider_id,
        service_id: service.id,
        address: formData.address,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
        description: formData.description,
      });
      alert("Booking requested successfully!");
      navigate("/dashboard/bookings");
    } catch (err) {
      alert("Failed to create booking. " + (err.response?.data?.detail || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0H0v20' fill='none' stroke='%23ff4d2d' stroke-opacity='0.08' stroke-width='0.5'/%3E%3C/svg%3E\")",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar is injected by app.jsx */}

        {/* Breadcrumb */}
        <div
          className="flex items-center border-b px-6"
          style={{ background: CR, borderColor: IK }}
        >
          <span
            className="py-3 pr-5 border-r text-2xs font-black uppercase tracking-superwide"
            style={{ color: LIGHT_IK, borderColor: IK }}
          >
            SERVICES
          </span>
          <span
            className="px-5 text-2xs font-black uppercase tracking-superwide"
            style={{ color: LIGHT_IK }}
          >
            / BOOK
          </span>
          <span
            className="px-5 text-2xs font-black uppercase tracking-superwide"
            style={{ color: IK }}
          >
            / {service.title}
          </span>
          <div className="ml-auto py-2">
            <div
              className="inline-flex items-center gap-2 border px-3 py-1.5"
              style={{ background: IK, borderColor: IK }}
            >
              <span className="text-sm font-black leading-none" style={{ color: C }}>
                ◎
              </span>
              <span
                className="text-2xs font-black uppercase tracking-superwide"
                style={{ color: CR }}
              >
                NEW BOOKING
              </span>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div
          className="border-b px-6 md:px-10 py-6"
          style={{ borderColor: IK }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="font-black uppercase leading-none mb-2"
                style={{
                  fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)",
                  letterSpacing: "-0.02em",
                  color: IK,
                }}
              >
                Book {service.title}
              </h1>
              <p
                className="text-2xs font-black uppercase tracking-superwide"
                style={{ color: LIGHT_IK }}
              >
                {service.pricing_type || "FIXED"} · Rs.{" "}
                {service.price || service.base_price}
              </p>
            </div>
            <div
              className="w-14 h-14 border overflow-hidden"
              style={{ borderColor: IK, background: CR_ALT }}
            >
              {/* Placeholder icon – can be replaced by provider avatar if available in the future */}
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className="text-2xl font-black"
                  style={{ color: IK, opacity: 0.2 }}
                >
                  {service.title.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 px-6 md:px-10 py-8"
        >
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Booking Details Section */}
            <div className="border overflow-hidden" style={{ borderColor: IK }}>
              {/* Section bar */}
              <div
                className="flex items-center justify-between px-6 py-2.5"
                style={{ background: IK }}
              >
                <span
                  className="text-2xs font-black uppercase tracking-superwide"
                  style={{ color: C }}
                >
                  BOOKING DETAILS
                </span>
                <span
                  className="text-2xs font-black"
                  style={{ color: CR, opacity: 0.3 }}
                >
                  § 001
                </span>
              </div>

              <div className="p-6 space-y-6" style={{ background: CR }}>
                {/* Date & Time */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xs font-black uppercase tracking-superwide"
                      style={{ color: IK }}
                    >
                      Date & Time
                    </span>
                    <span className="text-2xs font-black" style={{ color: C }}>
                      *
                    </span>
                  </div>
                  <input
                    type="datetime-local"
                    name="scheduled_at"
                    required
                    onChange={handleChange}
                    className="w-full border px-4 py-3 text-xs font-black uppercase tracking-wide transition-colors"
                    style={{
                      background: CR_ALT,
                      borderColor: IK,
                      color: IK,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e8e2d6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = CR_ALT;
                    }}
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xs font-black uppercase tracking-superwide"
                      style={{ color: IK }}
                    >
                      Full Address
                    </span>
                    <span className="text-2xs font-black" style={{ color: C }}>
                      *
                    </span>
                  </div>
                  <input
                    type="text"
                    name="address"
                    placeholder="E.g., House 12, Street 4, F-8/4, Islamabad"
                    required
                    onChange={handleChange}
                    className="w-full border px-4 py-3 text-xs font-black uppercase tracking-wide transition-colors"
                    style={{
                      background: CR_ALT,
                      borderColor: IK,
                      color: IK,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e8e2d6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = CR_ALT;
                    }}
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xs font-black uppercase tracking-superwide"
                      style={{ color: IK }}
                    >
                      Job Description (Optional)
                    </span>
                  </div>
                  <textarea
                    name="description"
                    rows="4"
                    placeholder="Describe exactly what you need done..."
                    onChange={handleChange}
                    className="w-full border px-4 py-3 text-2xs font-black uppercase tracking-wide resize-none transition-colors"
                    style={{
                      background: CR_ALT,
                      borderColor: IK,
                      color: IK,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e8e2d6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = CR_ALT;
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 text-sm font-black uppercase tracking-superwide transition-all duration-100 disabled:opacity-50"
                style={{ background: C, color: CR }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = IK;
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = C;
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">◎</span>
                    PROCESSING...
                  </span>
                ) : (
                  "CONFIRM BOOKING →"
                )}
              </button>
            </div>
          </div>
        </form>

        <Footer />
      </div>
    </div>
  );
};

export default BookService;