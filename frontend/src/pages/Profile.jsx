import { useEffect, useState } from "react";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import { getMe } from "../handlers/userHandlers";
import { getMyProviderDetails, updateProviderLocation } from "../handlers/providerHandlers";
import { getUserReviews } from "../handlers/reviewHandlers";
import { useNotify } from "../context/NotificationContext";

const SectionBar = ({ left, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", background: T.IK }}>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>{left}</span>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f5f0e6" }}>{right}</span>
  </div>
);

const FieldBlock = ({ label, value }) => (
  <div>
    <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, margin: "0 0 6px" }}>{label}</p>
    <p style={{ fontSize: 14, fontWeight: 600, color: T.IK, margin: 0 }}>{value || "N/A"}</p>
  </div>
);

// ─── STAR DISPLAY ─────────────────────────────────────────────────
const Stars = ({ rating }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} style={{ fontSize: 13, color: s <= rating ? T.C : "#ddd", lineHeight: 1 }}>★</span>
    ))}
  </div>
);

// ─── REVIEW CARD ──────────────────────────────────────────────────
const ReviewCard = ({ review }) => (
  <div style={{ background: "#fff", border: `1px solid ${T.IK}`, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
      <Stars rating={review.rating} />
      <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: T.LIGHT_IK }}>
        BOOKING #{review.booking_id}
      </span>
    </div>
    {review.comment && (
      <p style={{ fontSize: 12, color: T.IK, fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.7, margin: 0, paddingLeft: 12, borderLeft: `3px solid ${T.C}` }}>
        "{review.comment}"
      </p>
    )}
    {review.is_verified !== undefined && (
      <span style={{
        alignSelf: "flex-start",
        fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em",
        padding: "3px 8px",
        background: review.is_verified ? "rgba(40,199,111,0.1)" : "rgba(234,84,85,0.08)",
        border: `1px solid ${review.is_verified ? "#28c76f" : "#ea5455"}`,
        color: review.is_verified ? "#28c76f" : "#ea5455",
      }}>
        {review.is_verified ? "✓ AI VERIFIED" : "PENDING VERIFICATION"}
      </span>
    )}
  </div>
);

// ─── PROFILE ──────────────────────────────────────────────────────
const Profile = () => {
  const [user,            setUser]            = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [reviews,         setReviews]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const notify =  useNotify();

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
          const updatedProvider = await updateProviderLocation(position.coords.latitude, position.coords.longitude);
          setProviderDetails(updatedProvider);
          notify("Location saved! You are now visible to customers.", "success");
        } catch {
          notify("Failed to save location to the server.", "errpr");
        } finally {
          setLocationLoading(false);
        }
      },
      () => { notify("Location access denied.", "error"); setLocationLoading(false); }
    );
  };

  // Compute average rating
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <SharedLayout>
      <SectionBar left="MY PROFILE" right="ACCOUNT SETTINGS" />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 32px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>LOADING PROFILE...</div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#ea5455", fontSize: 14, fontWeight: 900, textTransform: "uppercase" }}>{error}</div>
        ) : (
          <>
            {/* Location warning banner */}
            {(user.role === "provider" || user.role === "both") && (!providerDetails?.lat || !providerDetails?.lng) && (
              <div style={{ background: "rgba(234,84,85,0.08)", border: `1px solid #ea5455`, padding: "20px 28px", marginBottom: 32, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <h3 style={{ color: "#ea5455", fontWeight: 900, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.1em", margin: "0 0 4px" }}>Action Required: Set Your Location</h3>
                    <p style={{ fontSize: 11, color: T.IK, margin: 0 }}>Your services won't appear in local searches until you set your coordinates.</p>
                  </div>
                  <button onClick={handleSetLocation} disabled={locationLoading}
                    style={{ padding: "12px 24px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", background: "#ea5455", color: "#fff", border: "none", cursor: "pointer", opacity: locationLoading ? 0.6 : 1, whiteSpace: "nowrap", fontFamily: "inherit" }}>
                    {locationLoading ? "DETECTING..." : "AUTO-DETECT & SAVE"}
                  </button>
                </div>
              </div>
            )}

            {/* User info card */}
            <div style={{ background: "#fff", border: `1px solid ${T.IK}`, marginBottom: 24, overflow: "hidden" }}>
              <div style={{ padding: "12px 24px", background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>BASIC INFO</span>
                <span style={{ fontSize: 9, fontWeight: 900, color: "#f5f0e6", opacity: 0.4 }}>§ 001</span>
              </div>
              <div style={{ padding: "32px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 24, paddingBottom: 24, marginBottom: 24, borderBottom: `1px solid ${T.IK}` }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: T.IK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, flexShrink: 0 }}>
                    {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: T.IK, margin: "0 0 8px" }}>{user.full_name}</h2>
                    <span style={{ padding: "4px 10px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", background: T.IK, color: "#fff" }}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
                  <FieldBlock label="Email Address" value={user.email} />
                  <FieldBlock label="Phone Number"  value={user.phone} />
                </div>
              </div>
            </div>

            {/* Provider settings */}
            {(user.role === "provider" || user.role === "both") && providerDetails && (
              <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden", marginBottom: 24 }}>
                <div style={{ padding: "12px 24px", background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>PROVIDER SETTINGS</span>
                  <span style={{ fontSize: 9, fontWeight: 900, color: "#f5f0e6", opacity: 0.4 }}>§ 002</span>
                </div>
                <div style={{ padding: "28px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
                  <FieldBlock label="Service Radius" value={`${providerDetails.service_radius_km} km`} />
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, margin: "0 0 6px" }}>Location Coordinates</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.IK, margin: "0 0 8px" }}>
                      {providerDetails.lat ? `${Number(providerDetails.lat).toFixed(4)}, ${Number(providerDetails.lng).toFixed(4)}` : "Not Set"}
                    </p>
                    {providerDetails.lat && (
                      <button onClick={handleSetLocation}
                        style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.C, background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                        Update Location →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── REVIEWS SECTION (providers only) ── */}
            {(user.role === "provider" || user.role === "both") && (
              <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
                <div style={{ padding: "12px 24px", background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>MY REVIEWS</span>
                  <span style={{ fontSize: 9, fontWeight: 900, color: "#f5f0e6", opacity: 0.4 }}>§ 003</span>
                </div>

                <div style={{ padding: "24px 28px" }}>
                  {/* Summary bar */}
                  {reviews.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 24, paddingBottom: 20, marginBottom: 20, borderBottom: `1px solid ${T.IK}`, flexWrap: "wrap" }}>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, margin: "0 0 6px" }}>AVERAGE RATING</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 32, fontWeight: 900, color: T.C, lineHeight: 1 }}>{avgRating}</span>
                          <div style={{ display: "flex", gap: 3 }}>
                            {[1,2,3,4,5].map(s => (
                              <span key={s} style={{ fontSize: 16, color: s <= Math.round(avgRating) ? T.C : "#ddd" }}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ width: 1, height: 40, background: T.IK, opacity: 0.15 }} />
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, margin: "0 0 6px" }}>TOTAL REVIEWS</p>
                        <span style={{ fontSize: 32, fontWeight: 900, color: T.IK, lineHeight: 1 }}>{reviews.length}</span>
                      </div>
                    </div>
                  )}

                  {/* Review list */}
                  {reviews.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <div style={{ fontSize: 36, fontWeight: 900, color: T.IK, opacity: 0.08, marginBottom: 12 }}>◈</div>
                      <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, margin: 0 }}>
                        NO REVIEWS YET
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {reviews.map((review, idx) => (
                        <ReviewCard key={review.id || idx} review={review} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </SharedLayout>
  );
};

export default Profile;