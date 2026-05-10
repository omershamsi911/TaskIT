import { useEffect, useState } from "react";
import { getMe } from "../handlers/userHandlers"; // Assuming getMe is here now
import { getMyProviderDetails, updateProviderLocation } from "../handlers/providerHandlers";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userData = await getMe();
        setUser(userData);

        // If user is a provider, fetch their specific provider profile to check lat/lng
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
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const updatedProvider = await updateProviderLocation(
              position.coords.latitude,
              position.coords.longitude
            );
            setProviderDetails(updatedProvider);
            alert("Location saved successfully! You are now visible to customers.");
          } catch (err) {
            alert("Failed to save location to the server.");
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          alert("Location access denied. Please enable it in your browser settings.");
          setLocationLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setLocationLoading(false);
    }
  };

  if (loading) return <div className="p-6 font-bold uppercase animate-pulse">Loading Profile...</div>;
  if (error) return <div className="p-6 text-[#ea5455] font-bold uppercase">{error}</div>;

  const isProvider = user.role === "provider" || user.role === "both";
  const needsLocation = isProvider && (!providerDetails?.lat || !providerDetails?.lng);

  return (
    <div className="max-w-3xl">
      <h1 className="text-[40px] font-bold mb-8 uppercase leading-none tracking-tight">
        My Profile
      </h1>

      {/* LOCATION WARNING BANNER */}
      {needsLocation && (
        <div className="bg-[#ea5455]/10 border border-[#ea5455] p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-[#ea5455] font-bold uppercase mb-1">Action Required: Set Your Location</h3>
            <p className="text-sm text-[#111111]">
              Your services will not appear in local searches until you set your operational coordinates.
            </p>
          </div>
          <button
            onClick={handleSetLocation}
            disabled={locationLoading}
            className="bg-[#ea5455] text-white px-6 py-3 font-bold uppercase text-xs hover:bg-[#d44848] transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {locationLoading ? "Detecting..." : "Auto-Detect & Save"}
          </button>
        </div>
      )}

      {/* BASIC USER INFO */}
      <div className="bg-white border border-[#1a1a1a] p-8 flex flex-col gap-6 mb-8">
        <div className="flex items-center gap-6 border-b border-[#1a1a1a] pb-6">
          <div className="w-24 h-24 bg-[#111111] rounded-full flex items-center justify-center text-white text-[32px] font-bold shrink-0">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-[28px] font-bold uppercase m-0 leading-tight">
              {user.full_name}
            </h2>
            <div className="flex gap-2 mt-2">
              <span className="bg-[#111111] text-white px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[12px] font-bold text-[#6b6b6b] uppercase tracking-wide mb-1">
              Email Address
            </p>
            <p className="text-[14px] font-medium">{user.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#6b6b6b] uppercase tracking-wide mb-1">
              Phone Number
            </p>
            <p className="text-[14px] font-medium">{user.phone}</p>
          </div>
        </div>
      </div>

      {/* PROVIDER SPECIFIC INFO */}
      {isProvider && providerDetails && (
        <div className="bg-white border border-[#1a1a1a] p-8 flex flex-col gap-6">
          <h3 className="font-bold uppercase text-lg border-b border-[#1a1a1a] pb-4">Provider Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[12px] font-bold text-[#6b6b6b] uppercase tracking-wide mb-1">
                Service Radius
              </p>
              <p className="text-[14px] font-medium">{providerDetails.service_radius_km} km</p>
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#6b6b6b] uppercase tracking-wide mb-1">
                Location Coordinates
              </p>
              <p className="text-[14px] font-medium">
                {providerDetails.lat ? `${providerDetails.lat}, ${providerDetails.lng}` : "Not Set"}
              </p>
              {providerDetails.lat && (
                 <button onClick={handleSetLocation} className="text-[#ff4d2d] text-xs font-bold uppercase mt-2 hover:underline">
                   Update Location
                 </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;