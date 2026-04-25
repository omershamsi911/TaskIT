import { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function JobRequestCard({ 
  request, 
  onAccept, 
  onDecline,
  isAccepting = false,
  isDeclining = false 
}) {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerColor, setTimerColor] = useState(C);
  
  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    const timeStr = date.toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toUpperCase();
    
    if (isToday) return `TODAY, ${timeStr}`;
    if (isTomorrow) return `TOMORROW, ${timeStr}`;
    
    return date.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
    }).toUpperCase() + `, ${timeStr}`;
  };

  const formatDistance = (km) => {
    if (km < 1) return `${(km * 1000).toFixed(0)}M`;
    return `${km.toFixed(1)} KM`;
  };

  const truncateText = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // Calculate expiry timer
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const created = new Date(request.created_at);
      const expiry = new Date(created.getTime() + 60 * 60 * 1000); // 60 min expiry
      const now = new Date();
      const diff = expiry - now;
      
      if (diff <= 0) {
        setTimeRemaining("EXPIRED");
        setTimerColor(C);
        return;
      }
      
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      
      // Color coding
      if (minutes > 30) setTimerColor("#22C55E"); // Green
      else if (minutes > 10) setTimerColor("#EAB308"); // Orange/Yellow
      else setTimerColor(C); // Coral/Red
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [request.created_at]);
  
  const handleAccept = () => {
    if (!isAccepting && !isDeclining && timeRemaining !== "EXPIRED") {
      onAccept(request.id);
    }
  };
  
  const handleDecline = () => {
    if (!isAccepting && !isDeclining) {
      onDecline(request.id);
    }
  };
  
  const isExpired = timeRemaining === "EXPIRED";
  
  return (
    <div
      className="border overflow-hidden transition-all duration-150"
      style={{ 
        background: CR, 
        borderColor: IK,
        opacity: isExpired ? 0.6 : 1,
      }}
    >
      {/* Header: User + Expiry */}
      <div 
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ background: CR_ALT, borderColor: IK }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 border flex items-center justify-center shrink-0 overflow-hidden"
            style={{ borderColor: IK, background: "#e8e2d6" }}
          >
            {request.user?.avatar_url ? (
              <img
                src={request.user.avatar_url}
                alt={request.user.full_name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <span className="text-lg font-black" style={{ color: IK, opacity: 0.2 }}>
                {request.user?.full_name?.charAt(0) || "?"}
              </span>
            )}
          </div>
          
          {/* User Info */}
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>
              {request.user?.full_name || "CUSTOMER"}
            </span>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
              {request.user?.previous_bookings || 0} BOOKINGS
            </span>
          </div>
        </div>
        
        {/* Expiry Timer */}
        <div className="flex flex-col items-end">
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
            EXPIRES IN
          </span>
          <span 
            className="text-sm font-black tabular-nums leading-none"
            style={{ color: timerColor }}
          >
            {timeRemaining}
          </span>
        </div>
      </div>
      
      {/* Body: Service + Schedule + Distance */}
      <div className="px-5 py-4 space-y-3">
        {/* Service Title */}
        <div>
          <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: C }}>
            SERVICE REQUESTED
          </span>
          <h3 className="text-sm font-black uppercase tracking-wide" style={{ color: IK }}>
            {request.service_title}
          </h3>
        </div>
        
        {/* Schedule & Distance Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-black" style={{ color: LIGHT_IK }}>📅</span>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>
              {formatDateTime(request.scheduled_at)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xs font-black" style={{ color: LIGHT_IK }}>📍</span>
            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>
              {formatDistance(request.distance_km)}
            </span>
          </div>
        </div>
        
        {/* Address */}
        <div className="flex items-start gap-2">
          <span className="text-2xs font-black shrink-0 mt-0.5" style={{ color: LIGHT_IK }}>🏠</span>
          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
            {request.address_short}
          </span>
        </div>
        
        {/* Description Preview */}
        {request.description && (
          <div className="relative">
            <div 
              className="border-l-2 pl-3 py-1"
              style={{ borderColor: C }}
            >
              <p className="text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>
                {truncateText(request.description)}
              </p>
            </div>
            
            {/* Special Instructions Indicator */}
            {request.special_instructions && (
              <div className="absolute -top-1 -right-1">
                <span 
                  className="text-xs font-black px-1.5 py-0.5"
                  style={{ color: C }}
                  title={request.special_instructions}
                >
                  📋
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer: Price + Actions */}
      <div 
        className="flex items-center justify-between px-5 py-3 border-t"
        style={{ background: CR_ALT, borderColor: IK }}
      >
        <div>
          <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: LIGHT_IK }}>
            QUOTED PRICE
          </span>
          <span className="text-lg font-black leading-none" style={{ color: C, letterSpacing: "-0.02em" }}>
            PKR {request.base_price?.toLocaleString("en-PK")}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Decline Button */}
          <button
            onClick={handleDecline}
            disabled={isAccepting || isDeclining || isExpired}
            className="border px-4 py-2 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 disabled:opacity-40"
            style={{ 
              background: "transparent", 
              borderColor: C, 
              color: C 
            }}
            onMouseEnter={(e) => { 
              if (!isAccepting && !isDeclining && !isExpired) {
                e.currentTarget.style.background = C; 
                e.currentTarget.style.color = CR; 
              }
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.background = "transparent"; 
              e.currentTarget.style.color = C; 
            }}
          >
            {isDeclining ? "..." : "DECLINE"}
          </button>
          
          {/* Accept Button */}
          <button
            onClick={handleAccept}
            disabled={isAccepting || isDeclining || isExpired}
            className="px-5 py-2 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 disabled:opacity-40"
            style={{ background: C, color: CR }}
            onMouseEnter={(e) => { 
              if (!isAccepting && !isDeclining && !isExpired) {
                e.currentTarget.style.background = IK; 
              }
            }}
            onMouseLeave={(e) => { 
              if (!isAccepting && !isDeclining && !isExpired) {
                e.currentTarget.style.background = C; 
              }
            }}
          >
            {isAccepting ? "..." : "ACCEPT"}
          </button>
        </div>
      </div>
    </div>
  );
}