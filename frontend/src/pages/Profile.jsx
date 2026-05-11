import { useEffect, useState } from "react";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import { getMe } from "../handlers/userHandlers";
import { getMyProviderDetails, updateProviderLocation } from "../handlers/providerHandlers";
import { getUserReviews } from "../handlers/reviewHandlers";
import { useNotify } from "../context/NotificationContext";

// ─── RESPONSIVE HOOK ──────────────────────────────────────────────
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
};

// ─── SECTION BAR ──────────────────────────────────────────────────
const SectionBar = ({ left, right, isMobile }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: isMobile ? "14px 20px" : "14px 48px",
      background: T.IK,
      flexWrap: "wrap",
      gap: 8,
    }}
  >
    <span
      style={{
        fontSize: isMobile ? 9 : 10,
        fontWeight: 900,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: T.C,
      }}
    >
      {left}
    </span>
    <span
      style={{
        fontSize: isMobile ? 9 : 10,
        fontWeight: 900,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "#f5f0e6",
        opacity: 0.7,
      }}
    >
      {right}
    </span>
  </div>
);

// ─── FIELD BLOCK ──────────────────────────────────────────────────
const FieldBlock = ({ label, value }) => (
  <div style={{ minWidth: 0 }}>
    <p
      style={{
        fontSize: 10,
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        color: T.LIGHT_IK,
        margin: "0 0 8px",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontSize: 15,
        fontWeight: 600,
        color: T.IK,
        margin: 0,
        wordBreak: "break-word",
        lineHeight: 1.4,
      }}
    >
      {value || "N/A"}
    </p>
  </div>
);

// ─── STAR DISPLAY ─────────────────────────────────────────────────
const Stars = ({ rating, size = 14 }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        style={{
          fontSize: size,
          color: s <= rating ? T.C : "#ddd",
          lineHeight: 1,
          transition: "transform 0.2s ease",
        }}
      >
        ★
      </span>
    ))}
  </div>
);

// ─── CARD HEADER ──────────────────────────────────────────────────
const CardHeader = ({ title, section, isMobile }) => (
  <div
    style={{
      padding: isMobile ? "14px 20px" : "14px 28px",
      background: T.IK,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <span
      style={{
        fontSize: isMobile ? 9 : 10,
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        color: T.C,
      }}
    >
      {title}
    </span>
    <span
      style={{
        fontSize: 9,
        fontWeight: 900,
        color: "#f5f0e6",
        opacity: 0.4,
      }}
    >
      {section}
    </span>
  </div>
);

// ─── REVIEW CARD ──────────────────────────────────────────────────
const ReviewCard = ({ review, isMobile }) => (
  <div
    style={{
      background: "#fff",
      border: `1px solid ${T.IK}`,
      borderRadius: 2,
      padding: isMobile ? 16 : 24,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      transition: "box-shadow 0.2s ease",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <Stars rating={review.rating} size={isMobile ? 14 : 16} />
      <span
        style={{
          fontSize: 9,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: T.LIGHT_IK,
          background: "rgba(0,0,0,0.03)",
          padding: "4px 8px",
          borderRadius: 2,
        }}
      >
        BOOKING #{review.booking_id}
      </span>
    </div>
    {review.comment && (
      <p
        style={{
          fontSize: isMobile ? 13 : 14,
          color: T.IK,
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          lineHeight: 1.8,
          margin: 0,
          paddingLeft: isMobile ? 14 : 18,
          borderLeft: `3px solid ${T.C}`,
        }}
      >
        &ldquo;{review.comment}&rdquo;
      </p>
    )}
    {review.is_verified !== undefined && (
      <span
        style={{
          alignSelf: "flex-start",
          fontSize: 9,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          padding: "5px 10px",
          borderRadius: 2,
          background: review.is_verified
            ? "rgba(40,199,111,0.1)"
            : "rgba(234,84,85,0.08)",
          border: `1px solid ${review.is_verified ? "#28c76f" : "#ea5455"}`,
          color: review.is_verified ? "#28c76f" : "#ea5455",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {review.is_verified ? "✓ AI VERIFIED" : "PENDING VERIFICATION"}
      </span>
    )}
  </div>
);

// ─── PROFILE ──────────────────────────────────────────────────────
const Profile = () => {
  const [user, setUser] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const notify = useNotify();

  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 900px)");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userData = await getMe();
        setUser(userData);

        if (userData.role === "provider" || userData.role === "both") {
          const [provData, reviewData] = await Promise.all([
            getMyProviderDetails(),
            getUserReviews(userData.id),
          ]);
          setProviderDetails(provData);
          setReviews(Array.isArray(reviewData) ? reviewData : []);
        }
      } catch (err) {
        setError("Failed to load profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleSetLocation = () => {
    setLocationLoading(true);
    if (!("geolocation" in navigator)) {
      notify("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const updatedProvider = await updateProviderLocation(
            position.coords.latitude,
            position.coords.longitude
          );
          setProviderDetails(updatedProvider);
          notify("Location saved! You are now visible to customers.", "success");
        } catch {
          notify("Failed to save location to the server.", "error");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        notify("Location access denied.", "error");
        setLocationLoading(false);
      }
    );
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const isProvider = user?.role === "provider" || user?.role === "both";

  return (
    <SharedLayout>
      <SectionBar left="MY PROFILE" right="ACCOUNT SETTINGS" isMobile={isMobile} />

      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: isMobile ? "24px 16px" : isTablet ? "32px 24px" : "48px 32px",
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: isMobile ? "60px 20px" : "100px 0",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: `3px solid ${T.IK}`,
                borderTopColor: T.C,
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p
              style={{
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: T.LIGHT_IK,
                margin: 0,
              }}
            >
              LOADING PROFILE...
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: isMobile ? "60px 20px" : "100px 0",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(234,84,85,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 24,
              }}
            >
              ✕
            </div>
            <p
              style={{
                color: "#ea5455",
                fontSize: 13,
                fontWeight: 900,
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {error}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 20 : 28 }}>
            {/* Location warning banner */}
            {isProvider && (!providerDetails?.lat || !providerDetails?.lng) && (
              <div
                style={{
                  background: "rgba(234,84,85,0.06)",
                  border: "1px solid #ea5455",
                  borderRadius: 2,
                  padding: isMobile ? "20px" : "24px 32px",
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "stretch" : "center",
                  gap: 20,
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      color: "#ea5455",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      margin: "0 0 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>⚠</span>
                    Action Required: Set Your Location
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: T.IK,
                      margin: 0,
                      lineHeight: 1.5,
                      opacity: 0.85,
                    }}
                  >
                    Your services won&apos;t appear in local searches until you set your
                    coordinates.
                  </p>
                </div>
                <button
                  onClick={handleSetLocation}
                  disabled={locationLoading}
                  style={{
                    padding: isMobile ? "14px 20px" : "14px 28px",
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    background: "#ea5455",
                    color: "#fff",
                    border: "none",
                    borderRadius: 2,
                    cursor: locationLoading ? "not-allowed" : "pointer",
                    opacity: locationLoading ? 0.6 : 1,
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                    flexShrink: 0,
                    transition: "opacity 0.2s ease, transform 0.2s ease",
                  }}
                >
                  {locationLoading ? "DETECTING..." : "AUTO-DETECT & SAVE"}
                </button>
              </div>
            )}

            {/* User info card */}
            <div
              style={{
                background: "#fff",
                border: `1px solid ${T.IK}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <CardHeader title="BASIC INFO" section="" isMobile={isMobile} />
              <div style={{ padding: isMobile ? "24px 20px" : "36px 32px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "center" : "center",
                    gap: isMobile ? 20 : 28,
                    paddingBottom: isMobile ? 24 : 32,
                    marginBottom: isMobile ? 24 : 32,
                    borderBottom: `1px solid ${T.IK}`,
                    textAlign: isMobile ? "center" : "left",
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? 80 : 88,
                      height: isMobile ? 80 : 88,
                      borderRadius: "50%",
                      background: T.IK,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: isMobile ? 28 : 34,
                      fontWeight: 900,
                      flexShrink: 0,
                      boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
                    }}
                  >
                    {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                      style={{
                        fontSize: isMobile ? 22 : 28,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "-0.01em",
                        color: T.IK,
                        margin: "0 0 12px",
                        lineHeight: 1.1,
                        wordBreak: "break-word",
                      }}
                    >
                      {user.full_name}
                    </h2>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 14px",
                        fontSize: 9,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        background: T.IK,
                        color: "#fff",
                        borderRadius: 2,
                      }}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: isMobile ? 20 : 28,
                  }}
                >
                  <FieldBlock label="Email Address" value={user.email} />
                  <FieldBlock label="Phone Number" value={user.phone} />
                </div>
              </div>
            </div>

            {/* Provider settings */}
            {isProvider && providerDetails && (
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${T.IK}`,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <CardHeader title="PROVIDER SETTINGS" section="" isMobile={isMobile} />
                <div
                  style={{
                    padding: isMobile ? "24px 20px" : "32px",
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: isMobile ? 20 : 28,
                  }}
                >
                  <FieldBlock
                    label="Service Radius"
                    value={`${providerDetails.service_radius_km} km`}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: T.LIGHT_IK,
                        margin: "0 0 8px",
                      }}
                    >
                      Location Coordinates
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: T.IK,
                        margin: "0 0 12px",
                        fontFamily: "monospace",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {providerDetails.lat
                        ? `${Number(providerDetails.lat).toFixed(4)}, ${Number(
                            providerDetails.lng
                          ).toFixed(4)}`
                        : "Not Set"}
                    </p>
                    {providerDetails.lat && (
                      <button
                        onClick={handleSetLocation}
                        style={{
                          fontSize: 10,
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: T.C,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "6px 0",
                          fontFamily: "inherit",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        Update Location
                        <span style={{ fontSize: 12 }}>→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {isProvider && (
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${T.IK}`,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <CardHeader title="MY REVIEWS" section="" isMobile={isMobile} />

                <div style={{ padding: isMobile ? "24px 20px" : "32px" }}>
                  {/* Summary bar */}
                  {reviews.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "flex-start" : "center",
                        gap: isMobile ? 20 : 40,
                        paddingBottom: isMobile ? 24 : 28,
                        marginBottom: isMobile ? 24 : 28,
                        borderBottom: `1px solid ${T.IK}`,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            color: T.LIGHT_IK,
                            margin: "0 0 10px",
                          }}
                        >
                          AVERAGE RATING
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                          }}
                        >
                          <span
                            style={{
                              fontSize: isMobile ? 36 : 44,
                              fontWeight: 900,
                              color: T.C,
                              lineHeight: 1,
                            }}
                          >
                            {avgRating}
                          </span>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: isMobile ? 18 : 22,
                                  color: s <= Math.round(avgRating) ? T.C : "#ddd",
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {!isMobile && (
                        <div
                          style={{
                            width: 1,
                            height: 50,
                            background: T.IK,
                            opacity: 0.15,
                          }}
                        />
                      )}
                      <div>
                        <p
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            color: T.LIGHT_IK,
                            margin: "0 0 10px",
                          }}
                        >
                          TOTAL REVIEWS
                        </p>
                        <span
                          style={{
                            fontSize: isMobile ? 36 : 44,
                            fontWeight: 900,
                            color: T.IK,
                            lineHeight: 1,
                          }}
                        >
                          {reviews.length}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Review list */}
                  {reviews.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: isMobile ? "40px 20px" : "60px 0",
                      }}
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.03)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 28,
                            color: T.IK,
                            opacity: 0.2,
                          }}
                        >
                          ★
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          color: T.LIGHT_IK,
                          margin: "0 0 8px",
                        }}
                      >
                        NO REVIEWS YET
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: T.LIGHT_IK,
                          margin: 0,
                          opacity: 0.7,
                        }}
                      >
                        Complete bookings to receive reviews
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: isMobile ? 12 : 16,
                      }}
                    >
                      {reviews.map((review, idx) => (
                        <ReviewCard
                          key={review.id || idx}
                          review={review}
                          isMobile={isMobile}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SharedLayout>
  );
};

export default Profile;
