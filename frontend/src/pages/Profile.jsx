import { useEffect, useState } from "react";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import { getMe } from "../handlers/userHandlers";
import { getMyProviderDetails, updateProviderLocation } from "../handlers/providerHandlers";

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

const Profile = () => {
  const [user,            setUser]            = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
        if (userData.role === "provider" || userData.role === "both") {
          const provData = await getMyProviderDetails();
          setProviderDetails(provData);
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
      alert("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const updatedProvider = await updateProviderLocation(position.coords.latitude, position.coords.longitude);
          setProviderDetails(updatedProvider);
          alert("Location saved! You are now visible to customers.");
        } catch {
          alert("Failed to save location to the server.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => { alert("Location access denied."); setLocationLoading(false); }
    );
  };

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
                {/* Avatar + name */}
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
              <div style={{ background: "#fff", border: `1px solid ${T.IK}`, overflow: "hidden" }}>
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
          </>
        )}
      </div>
    </SharedLayout>
  );
};

export default Profile;