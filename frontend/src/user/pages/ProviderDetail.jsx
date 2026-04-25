import { useState } from "react";
import Header from "../../common/components/Header";
import Footer from "../../common/components/Footer";
import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

// ─── MOCK DATA — matches ProviderDetail.json structure ─────────────────────────
  const DATA = {
    provider: {
      provider_id: 5,
      user_id: 205,
      full_name: "BILAL AHMED",
      avatar_url: "https://cdn.taskit.pk/avatars/5.jpg",
      bio: "Professional plumber with 8+ years experience in residential and commercial plumbing. Licensed and insured. Specializing in pipe repair, water heater installation, and drain cleaning.",
      avg_rating: 4.8,
      total_reviews: 42,
      total_completed_jobs: 156,
      response_rate: 98.5,
      avg_response_minutes: 12,
      years_of_experience: 8,
      service_radius_km: 10.00,
      availability_status: "available",
      joined_at: "2023-06-01T00:00:00Z",
    },
    services: [
      {
        id: 1001,
        title: "PIPE REPAIR",
        description: "Fix leaking, burst, or damaged pipes. Includes pipe replacement if needed.",
        pricing_type: "fixed",
        base_price: 500.00,
        price_unit: "per job",
        estimated_hours: 1.5,
      },
      {
        id: 1002,
        title: "WATER HEATER INSTALLATION",
        description: "Install new water heater or replace old unit. All brands supported.",
        pricing_type: "starting_from",
        base_price: 1500.00,
        max_price: 3500.00,
        price_unit: "per installation",
      },
      {
        id: 1003,
        title: "DRAIN CLEANING",
        description: "Professional drain unclogging using hydro-jetting and snake equipment.",
        pricing_type: "hourly",
        base_price: 400.00,
        price_unit: "per hour",
        estimated_hours: 1.0,
      },
    ],
    reviews: [
      {
        id: 5001,
        reviewer_name: "SARA MALIK",
        rating: 5,
        comment: "Very professional, fixed my kitchen pipe quickly. Cleaned up after work. Highly recommend!",
        created_at: "2024-03-15T14:30:00Z",
        helpful_count: 8,
        provider_reply: "Thank you Sara! Happy to help anytime.",
      },
      {
        id: 4890,
        reviewer_name: "OMAR FAROOQ",
        rating: 4,
        comment: "Good work, arrived on time. Slightly expensive but quality work speaks for itself.",
        created_at: "2024-03-10T09:15:00Z",
        helpful_count: 3,
        provider_reply: null,
      },
      {
        id: 4750,
        reviewer_name: "FATIMA ZAHRA",
        rating: 5,
        comment: "Installed new water heater perfectly. Explained maintenance tips. Great service!",
        created_at: "2024-03-05T16:45:00Z",
        helpful_count: 12,
        provider_reply: "Appreciate your kind words Fatima!",
      },
    ],
    rating_breakdown: {
      "5_star": 35,
      "4_star": 5,
      "3_star": 2,
      "2_star": 0,
      "1_star": 0,
    },
    badges: [
      { code: "verified_pro", name: "Verified Pro", icon: "✓" },
      { code: "top_rated", name: "Top Rated", icon: "★" },
      { code: "fast_responder", name: "Fast Responder", icon: "⚡" },
    ],
    availability: {
      today: { 
        is_available: true, 
        slots: ["09:00", "11:00", "14:00", "16:00"] 
      },
      tomorrow: { 
        is_available: true, 
        slots: ["10:00", "13:00", "15:00", "18:00"] 
      },
    },
  };

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ProviderDetail() {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const { provider, services, reviews, rating_breakdown, badges, availability } = DATA;
  const [activeTab, setActiveTab] = useState("SERVICES");
  const [selectedService, setSelectedService] = useState(null);
  
  const TABS = ["SERVICES", "REVIEWS", "AVAILABILITY"];
  // ─── STATUS CONFIG ────────────────────────────────────────────────────────────
  const AVAILABILITY_META = {
    available: { label: "AVAILABLE NOW", sym: "●", color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
    busy: { label: "BUSY", sym: "◆", color: "#EAB308", bg: "rgba(234,179,8,0.1)" },
    offline: { label: "OFFLINE", sym: "○", color: LIGHT_IK, bg: CR_ALT },
  };

  const availabilityMeta = AVAILABILITY_META[provider.availability_status] ?? AVAILABILITY_META.offline;
  
  const totalRatings = Object.values(rating_breakdown).reduce((a, b) => a + b, 0);
  
  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId === selectedService ? null : serviceId);
  };

  
  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  const fmtDate = (iso) =>
    new Date(iso)
      .toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })
      .toUpperCase();

  const fmtPrice = (price) => `PKR ${price.toLocaleString("en-PK")}`;

  // ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

  const SectionBar = ({ n, title }) => (
    <div
      className="flex items-center justify-between px-6 py-2.5"
      style={{ background: IK }}
    >
      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
        {title}
      </span>
      <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>{n}</span>
    </div>
  );

  const RatingStars = ({ rating, size = "sm" }) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className={size === "lg" ? "text-base" : "text-xs"} style={{ color: C }}>★</span>
        ))}
        {hasHalf && (
          <span className={size === "lg" ? "text-base" : "text-xs"} style={{ color: C }}>½</span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className={size === "lg" ? "text-base" : "text-xs"} style={{ color: LIGHT_IK }}>☆</span>
        ))}
      </div>
    );
  };

  const BadgeTag = ({ badge }) => (
    <div
      className="inline-flex items-center gap-1.5 border px-2.5 py-1"
      style={{ borderColor: C, background: "transparent" }}
    >
      <span className="text-xs font-black" style={{ color: C }}>{badge.icon}</span>
      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK }}>
        {badge.name}
      </span>
    </div>
  );

  const AvailabilityBadge = ({ status }) => {
    const m = AVAILABILITY_META[status] ?? AVAILABILITY_META.offline;
    return (
      <div
        className="inline-flex items-center gap-2 border px-3 py-1.5"
        style={{ borderColor: m.color, background: m.bg }}
      >
        <span className="text-xs animate-pulse" style={{ color: m.color }}>{m.sym}</span>
        <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK }}>
          {m.label}
        </span>
      </div>
    );
  };

  const ServiceCard = ({ service, isSelected, onSelect }) => {
    const priceDisplay = service.pricing_type === "starting_from" 
      ? `FROM ${fmtPrice(service.base_price)}`
      : service.pricing_type === "hourly"
      ? `${fmtPrice(service.base_price)} / HR`
      : fmtPrice(service.base_price);

    return (
      <div
        className="border p-5 flex flex-col h-full transition-all duration-150"
        style={{ 
          background: isSelected ? CR_ALT : CR, 
          borderColor: isSelected ? C : IK,
          borderWidth: isSelected ? "2px" : "1px",
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>
            {service.title}
          </h4>
          {isSelected && (
            <span className="text-xs font-black" style={{ color: C }}>✓ SELECTED</span>
          )}
        </div>
        
        <p className="text-2xs font-black uppercase tracking-wide mb-4 flex-1" style={{ color: LIGHT_IK }}>
          {service.description}
        </p>
        
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-black leading-none" style={{ color: C, letterSpacing: "-0.02em" }}>
            {priceDisplay}
          </span>
          {service.estimated_hours && (
            <span className="text-2xs font-black uppercase" style={{ color: LIGHT_IK }}>
              ~{service.estimated_hours} HRS
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span
            className="text-2xs font-black uppercase tracking-wide px-2 py-1 border"
            style={{ borderColor: IK, color: LIGHT_IK }}
          >
            {service.pricing_type.toUpperCase()}
          </span>
        </div>
        
        <button
          onClick={() => onSelect(service.id)}
          className="mt-4 w-full border py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
          style={{ 
            background: isSelected ? C : "transparent", 
            color: isSelected ? CR : C, 
            borderColor: C 
          }}
          onMouseEnter={(e) => { 
            if (!isSelected) {
              e.currentTarget.style.background = C; 
              e.currentTarget.style.color = CR; 
            }
          }}
          onMouseLeave={(e) => { 
            if (!isSelected) {
              e.currentTarget.style.background = "transparent"; 
              e.currentTarget.style.color = C; 
            }
          }}
        >
          {isSelected ? "SELECTED" : "SELECT SERVICE"}
        </button>
      </div>
    );
  };

  const ReviewCard = ({ review }) => (
    <div className="border-b last:border-b-0 py-5" style={{ borderColor: IK }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>
            {review.reviewer_name}
          </span>
          <div className="flex items-center gap-2">
            <RatingStars rating={review.rating} />
            <span className="text-2xs font-black uppercase" style={{ color: LIGHT_IK }}>
              {fmtDate(review.created_at)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-2xs font-black" style={{ color: LIGHT_IK }}>👍</span>
          <span className="text-2xs font-black" style={{ color: IK }}>{review.helpful_count}</span>
        </div>
      </div>
      
      <p className="text-2xs font-black uppercase tracking-wide mb-3" style={{ color: LIGHT_IK }}>
        {review.comment}
      </p>
      
      {review.provider_reply && (
        <div className="ml-4 pl-4 border-l-2" style={{ borderColor: C }}>
          <span className="text-2xs font-black uppercase tracking-wide block mb-1" style={{ color: C }}>
            PROVIDER REPLY
          </span>
          <p className="text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>
            {review.provider_reply}
          </p>
        </div>
      )}
    </div>
  );
  return (
    <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* Breadcrumb */}
        <div className="flex items-center border-b px-6" style={{ background: CR, borderColor: IK }}>
          <span className="py-3 pr-5 border-r text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK, borderColor: IK }}>
            DISCOVER
          </span>
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
            / PLUMBING
          </span>
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>
            / {provider.full_name}
          </span>
          <div className="ml-auto py-2">
            <AvailabilityBadge status={provider.availability_status} />
          </div>
        </div>

        {/* Hero Section */}
        <div className="border-b" style={{ background: CR, borderColor: IK }}>
          <div className="grid lg:grid-cols-12">
            
            {/* Avatar */}
            <div
              className="lg:col-span-3 border-r flex items-center justify-center relative overflow-hidden"
              style={{ minHeight: 280, background: CR_ALT, borderColor: IK }}
            >
              {provider.avatar_url ? (
                <img
                  src={provider.avatar_url}
                  alt={provider.full_name}
                  className="w-full h-full object-cover absolute inset-0"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <span className="text-9xl font-black select-none" style={{ color: IK, opacity: 0.05 }}>
                  {provider.full_name.charAt(0)}
                </span>
              )}
            </div>

            {/* Name + Info */}
            <div className="lg:col-span-6 border-r px-8 py-8 flex flex-col justify-between" style={{ borderColor: IK }}>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <h1
                    className="font-black uppercase leading-none"
                    style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)", letterSpacing: "-0.02em", color: IK }}
                  >
                    {provider.full_name}
                  </h1>
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-black" style={{ color: C }}>★</span>
                    <span className="text-sm font-black" style={{ color: IK }}>{provider.avg_rating}</span>
                    <span className="text-2xs font-black uppercase ml-1" style={{ color: LIGHT_IK }}>
                      ({provider.total_reviews})
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <BadgeTag key={badge.code} badge={badge} />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: IK }}>
                <button
                  className="flex-1 border px-6 py-3 text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
                  style={{ background: "transparent", color: C, borderColor: C }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C; }}
                >
                  💬 MESSAGE
                </button>
                <button
                  className="flex-1 px-6 py-3 text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
                  style={{ background: C, color: CR }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = IK; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = C; }}
                >
                  BOOK NOW →
                </button>
              </div>
            </div>

            {/* Stats Column */}
            <div className="lg:col-span-3 flex flex-col divide-y border-t lg:border-t-0" style={{ borderColor: IK }}>
              {[
                { label: "COMPLETED JOBS", val: provider.total_completed_jobs, accent: true },
                { label: "RESPONSE RATE", val: `${provider.response_rate}%`, accent: false },
                { label: "RESPONSE TIME", val: `${provider.avg_response_minutes} MIN`, accent: true },
                { label: "EXPERIENCE", val: `${provider.years_of_experience} YEARS`, accent: false },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="flex-1 flex flex-col justify-center px-6 py-5"
                  style={{ background: i % 2 === 0 ? CR : CR_ALT }}
                >
                  <span
                    className="text-2xl font-black leading-none mb-1 tabular-nums"
                    style={{ color: s.accent ? C : IK, letterSpacing: "-0.03em" }}
                  >
                    {s.val}
                  </span>
                  <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="px-6 md:px-10 py-6 border-b" style={{ borderColor: IK }}>
          <div className="max-w-4xl">
            <span className="text-2xs font-black uppercase tracking-superwide block mb-3" style={{ color: C }}>
              ABOUT
            </span>
            <p className="text-xs font-black uppercase tracking-wide leading-relaxed" style={{ color: IK }}>
              {provider.bio}
            </p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-stretch border-b overflow-x-auto shrink-0" style={{ background: CR, borderColor: IK }}>
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-7 py-3.5 text-2xs font-black uppercase tracking-superwide border-r whitespace-nowrap transition-colors duration-100"
                style={{ 
                  background: active ? IK : CR, 
                  color: active ? CR : IK,
                  borderColor: IK 
                }}
              >
                {tab}
              </button>
            );
          })}
          <div className="ml-auto flex items-center px-6 border-l shrink-0" style={{ borderColor: IK }}>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
              RADIUS {provider.service_radius_km} KM
            </span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 px-6 md:px-10 py-8">
          
          {/* SERVICES TAB */}
          {activeTab === "SERVICES" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={selectedService === service.id}
                  onSelect={handleServiceSelect}
                />
              ))}
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "REVIEWS" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Rating Breakdown */}
              <div className="lg:col-span-1">
                <div className="border p-6" style={{ borderColor: IK, background: CR_ALT }}>
                  <div className="text-center mb-6">
                    <span className="text-5xl font-black leading-none block mb-2" style={{ color: C }}>
                      {provider.avg_rating}
                    </span>
                    <RatingStars rating={provider.avg_rating} size="lg" />
                    <span className="text-2xs font-black uppercase tracking-wide block mt-2" style={{ color: LIGHT_IK }}>
                      {totalRatings} REVIEWS
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { stars: 5, count: rating_breakdown["5_star"] },
                      { stars: 4, count: rating_breakdown["4_star"] },
                      { stars: 3, count: rating_breakdown["3_star"] },
                      { stars: 2, count: rating_breakdown["2_star"] },
                      { stars: 1, count: rating_breakdown["1_star"] },
                    ].map((item) => {
                      const percentage = totalRatings > 0 ? (item.count / totalRatings) * 100 : 0;
                      return (
                        <div key={item.stars} className="flex items-center gap-2">
                          <span className="text-2xs font-black w-8" style={{ color: LIGHT_IK }}>{item.stars} ★</span>
                          <div className="flex-1 h-2 border" style={{ borderColor: IK, background: CR }}>
                            <div 
                              className="h-full transition-all" 
                              style={{ width: `${percentage}%`, background: C }}
                            />
                          </div>
                          <span className="text-2xs font-black w-8 text-right" style={{ color: IK }}>{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Reviews List */}
              <div className="lg:col-span-2 border p-6" style={{ borderColor: IK, background: CR }}>
                <div className="divide-y" style={{ borderColor: IK }}>
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AVAILABILITY TAB */}
          {activeTab === "AVAILABILITY" && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Today */}
              <div className="border p-6" style={{ borderColor: IK, background: CR }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-superwide" style={{ color: IK }}>
                    TODAY
                  </h3>
                  {availability.today.is_available ? (
                    <span className="text-2xs font-black uppercase" style={{ color: "#22C55E" }}>● AVAILABLE</span>
                  ) : (
                    <span className="text-2xs font-black uppercase" style={{ color: LIGHT_IK }}>○ UNAVAILABLE</span>
                  )}
                </div>
                {availability.today.is_available && (
                  <div className="grid grid-cols-2 gap-3">
                    {availability.today.slots.map((slot) => (
                      <button
                        key={slot}
                        className="border py-3 text-2xs font-black uppercase tracking-wide transition-colors duration-100"
                        style={{ background: "transparent", borderColor: IK, color: IK }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; e.currentTarget.style.borderColor = C; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; e.currentTarget.style.borderColor = IK; }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tomorrow */}
              <div className="border p-6" style={{ borderColor: IK, background: CR }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-superwide" style={{ color: IK }}>
                    TOMORROW
                  </h3>
                  {availability.tomorrow.is_available ? (
                    <span className="text-2xs font-black uppercase" style={{ color: "#22C55E" }}>● AVAILABLE</span>
                  ) : (
                    <span className="text-2xs font-black uppercase" style={{ color: LIGHT_IK }}>○ UNAVAILABLE</span>
                  )}
                </div>
                {availability.tomorrow.is_available && (
                  <div className="grid grid-cols-2 gap-3">
                    {availability.tomorrow.slots.map((slot) => (
                      <button
                        key={slot}
                        className="border py-3 text-2xs font-black uppercase tracking-wide transition-colors duration-100"
                        style={{ background: "transparent", borderColor: IK, color: IK }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; e.currentTarget.style.borderColor = C; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; e.currentTarget.style.borderColor = IK; }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
        </div>

        {/* Sticky Bottom Bar */}
        <div 
          className="sticky bottom-0 border-t px-6 md:px-10 py-4 flex items-center justify-between"
          style={{ background: IK, borderColor: IK }}
        >
          <div className="flex items-center gap-4">
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
              SELECTED SERVICE
            </span>
            {selectedService ? (
              <span className="text-xs font-black uppercase" style={{ color: C }}>
                {services.find(s => s.id === selectedService)?.title}
              </span>
            ) : (
              <span className="text-2xs font-black uppercase" style={{ color: CR, opacity: 0.5 }}>
                NO SERVICE SELECTED
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            {selectedService && (
              <span className="text-lg font-black" style={{ color: CR }}>
                {fmtPrice(services.find(s => s.id === selectedService)?.base_price || 0)}
              </span>
            )}
            <Link
              to={selectedService ? `/booking/new?provider=${provider.provider_id}&service=${selectedService}` : "#"}
              className={`px-8 py-3 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 ${
                !selectedService ? "pointer-events-none opacity-50" : ""
              }`}
              style={{ background: selectedService ? C : LIGHT_IK, color: CR }}
              onMouseEnter={(e) => { if (selectedService) e.currentTarget.style.background = CR; e.currentTarget.style.color = C; }}
              onMouseLeave={(e) => { if (selectedService) e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }}
            >
              CONTINUE TO BOOK →
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}