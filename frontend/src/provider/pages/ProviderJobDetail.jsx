import { useState, useEffect } from "react";
import Header from "../../common/components/Header";
import Footer from "../../common/components/Footer";
import { Link, useParams } from "react-router-dom";
import { fetchBookingById, updateBookingStatus, cancelBooking, uploadJobPhoto } from "../../../handlers/bookings";
import { useTheme } from "../../hooks/useTheme";

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ProviderJobDetail() {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [address, setAddress] = useState(null);
  const [payment, setPayment] = useState(null);
  const [photos, setPhotos] = useState({ before: [], after: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  // ─── STATUS CONFIG ────────────────────────────────────────────────────────────
  const JOB_STATUS_META = {
    requested:   { label: "REQUESTED",   sym: "○", bg: CR_ALT, fg: IK,       border: IK },
    accepted:    { label: "ACCEPTED",    sym: "◎", bg: IK,     fg: CR,       border: IK },
    in_progress: { label: "IN PROGRESS", sym: "◆", bg: C,      fg: CR,       border: C  },
    completed:   { label: "COMPLETED",   sym: "✓", bg: IK,     fg: C,        border: IK },
    cancelled:   { label: "CANCELLED",   sym: "✗", bg: CR,     fg: LIGHT_IK, border: IK },
  };

  const ACTIONS_BY_STATUS = {
    accepted: [
      { value: "in_progress", label: "START JOB", requires_confirmation: true, icon: "▶" },
      { value: "cancelled", label: "CANCEL JOB", requires_confirmation: true, icon: "✗" },
    ],
    in_progress: [
      { value: "completed", label: "MARK COMPLETE", requires_confirmation: true, icon: "✓" },
      { value: "cancelled", label: "EMERGENCY CANCEL", requires_confirmation: true, icon: "⚠" },
    ],
    completed: [],
    cancelled: [],
  };

  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  const fmtPrice = (price) => `PKR ${Number(price || 0).toLocaleString("en-PK")}`;

  const formatDateTime = (isoString) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-PK", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase() + " · " + date.toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toUpperCase();
  };

  const formatTime = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toUpperCase();
  };

  const maskPhone = (phone) => {
    if (!phone) return "—";
    return phone.slice(0, 4) + "****" + phone.slice(-3);
  };

  const getGoogleMapsUrl = (lat, lng) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  // ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

  const SectionBar = ({ n, title, action }) => (
    <div className="flex items-center justify-between px-6 py-2.5" style={{ background: IK }}>
      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>{title}</span>
      <div className="flex items-center gap-3">
        {action}
        <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>{n}</span>
      </div>
    </div>
  );

  const StatusBadge = ({ status, size = "normal" }) => {
    const m = JOB_STATUS_META[status] ?? JOB_STATUS_META.requested;
    return (
      <div className={`inline-flex items-center gap-1.5 border ${size === "large" ? "px-4 py-2" : "px-2.5 py-1"}`}
        style={{ borderColor: m.border, background: m.bg }}>
        <span className={`font-black leading-none ${size === "large" ? "text-base" : "text-xs"}`} style={{ color: m.fg }}>{m.sym}</span>
        <span className={`font-black uppercase tracking-superwide ${size === "large" ? "text-xs" : "text-2xs"}`} style={{ color: m.fg }}>{m.label}</span>
      </div>
    );
  };

  const InfoRow = ({ label, value, accent = false }) => (
    <div className="flex items-center justify-between py-2.5 border-b last:border-b-0" style={{ borderColor: IK }}>
      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>{label}</span>
      <span className="text-xs font-black uppercase tracking-wide" style={{ color: accent ? C : IK }}>{value}</span>
    </div>
  );

  // ─── CONFIRMATION MODAL ───────────────────────────────────────────────────────
  const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDestructive = false, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(26, 26, 26, 0.7)" }} onClick={onClose}>
        <div className="max-w-md w-full border shadow-lg" style={{ background: CR, borderColor: IK }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: IK, borderColor: IK }}>
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: isDestructive ? C : CR }}>{title}</span>
            <button onClick={onClose} className="text-sm font-black transition-colors" style={{ color: CR }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = CR; }}>✕</button>
          </div>
          <div className="p-6" style={{ background: CR }}>
            <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: IK }}>{message}</p>
            {children}
          </div>
          <div className="flex items-center gap-3 px-5 py-4 border-t" style={{ background: CR_ALT, borderColor: IK }}>
            <button onClick={onClose}
              className="flex-1 border py-2 text-2xs font-black uppercase tracking-superwide transition-colors"
              style={{ background: "transparent", borderColor: IK, color: IK }}
              onMouseEnter={(e) => { e.currentTarget.style.background = CR; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>CANCEL</button>
            <button onClick={onConfirm}
              className="flex-1 py-2 text-2xs font-black uppercase tracking-superwide transition-colors"
              style={{ background: isDestructive ? C : IK, color: CR }}
              onMouseEnter={(e) => { e.currentTarget.style.background = isDestructive ? "#cc4422" : C; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isDestructive ? C : IK; }}>{confirmText}</button>
          </div>
        </div>
      </div>
    );
  };

  // ─── PHOTO UPLOAD SECTION ─────────────────────────────────────────────────────
  const PhotoUploadSection = ({ jobStatus, photos, onUpload }) => {
    const [activeTab, setActiveTab] = useState("before");
    const [isDragging, setIsDragging] = useState(false);

    const canUpload = jobStatus === "in_progress" || jobStatus === "completed";

    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length && onUpload) {
        Array.from(e.dataTransfer.files).forEach(file => {
          onUpload(file, activeTab);
        });
      }
    };

    const handleFileSelect = (e) => {
      if (e.target.files?.length && onUpload) {
        Array.from(e.target.files).forEach(file => {
          onUpload(file, activeTab);
        });
      }
    };

    return (
      <div className="border overflow-hidden" style={{ borderColor: IK }}>
        <SectionBar n="§ 004" title="JOB PHOTOS" />

        <div className="p-6" style={{ background: CR }}>
          <div className="flex items-center border-b mb-4" style={{ borderColor: IK }}>
            <button onClick={() => setActiveTab("before")}
              className="px-5 py-2 text-2xs font-black uppercase tracking-superwide border-r transition-colors"
              style={{ background: activeTab === "before" ? IK : "transparent", color: activeTab === "before" ? CR : IK, borderColor: IK }}>BEFORE</button>
            <button onClick={() => setActiveTab("after")}
              className="px-5 py-2 text-2xs font-black uppercase tracking-superwide transition-colors"
              style={{ background: activeTab === "after" ? IK : "transparent", color: activeTab === "after" ? CR : IK }}>AFTER</button>
          </div>

          {canUpload ? (
            <>
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                className="border-2 border-dashed p-8 text-center transition-colors cursor-pointer"
                style={{ borderColor: isDragging ? C : LIGHT_IK, background: isDragging ? "rgba(255,87,51,0.05)" : CR_ALT }}
                onClick={() => document.getElementById("photo-upload").click()}>
                <input id="photo-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
                <span className="text-4xl font-black block mb-3" style={{ color: IK, opacity: 0.15 }}>📸</span>
                <span className="text-xs font-black uppercase tracking-wide block mb-1" style={{ color: IK }}>
                  {isDragging ? "DROP FILES HERE" : "CLICK OR DRAG TO UPLOAD"}
                </span>
                <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
                  {activeTab === "before" ? "BEFORE STARTING WORK" : "AFTER COMPLETING WORK"}
                </span>
              </div>

              {photos[activeTab]?.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {photos[activeTab].map((photo, i) => (
                    <div key={i} className="aspect-square border overflow-hidden relative group" style={{ borderColor: IK, background: CR_ALT }}>
                      <img src={photo.url} alt={`${activeTab} ${i + 1}`} className="w-full h-full object-cover" />
                      <button className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: C, color: CR, fontSize: "12px" }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12" style={{ background: CR_ALT }}>
              <span className="text-4xl font-black mb-3" style={{ color: IK, opacity: 0.1 }}>📸</span>
              <span className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: LIGHT_IK }}>PHOTOS AVAILABLE AFTER STARTING JOB</span>
              <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>UPLOAD BEFORE AND AFTER PHOTOS AS PROOF OF WORK</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── FETCH BOOKING ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadBooking = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchBookingById(jobId);
        
        setJob({
          id: data.id,
          booking_ref: data.booking_ref,
          status: data.status,
          scheduled_at: data.scheduled_at,
          description: data.description,
          special_instructions: data.special_instructions,
          quoted_price: data.quoted_price,
          created_at: data.created_at,
          accepted_at: data.accepted_at,
          started_at: data.started_at,
          completed_at: data.completed_at,
          cancellation_reason: data.cancellation_reason,
        });
        
        setCustomer({
          id: data.user_id,
          full_name: data.user?.full_name || "CUSTOMER",
          phone: data.user?.phone || "—",
          avatar_url: data.user?.avatar_url || null,
        });
        
        setAddress({
          label: data.address?.label || "HOME",
          address_line1: data.address?.address_line1 || "—",
          address_line2: data.address?.address_line2 || null,
          city: data.address?.city || "—",
          lat: data.address?.lat || 31.5204,
          lng: data.address?.lng || 74.3587,
        });
        
        setPayment({
          quoted_price: data.quoted_price || 0,
          platform_fee: data.platform_fee || Math.round((data.quoted_price || 0) * 0.1),
          your_earning: data.provider_payout || (data.quoted_price || 0) * 0.9,
        });
        
        setPhotos({
          before: (data.photos || []).filter(p => p.photo_type === "before"),
          after: (data.photos || []).filter(p => p.photo_type === "after"),
        });
        
      } catch (err) {
        console.error("Failed to load booking:", err);
        setError("Failed to load booking details");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (jobId) loadBooking();
  }, [jobId]);

  // ─── HANDLERS ───────────────────────────────────────────────────────────────
  const handleActionClick = (action) => {
    setPendingAction(action);
    setCancellationReason("");
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || !job) return;
    
    setIsUpdating(true);
    setShowConfirmation(false);

    try {
      if (pendingAction.value === "cancelled") {
        await cancelBooking(job.id, cancellationReason);
      } else {
        await updateBookingStatus(job.id, pendingAction.value);
      }
      
      const data = await fetchBookingById(jobId);
      setJob({
        id: data.id,
        booking_ref: data.booking_ref,
        status: data.status,
        scheduled_at: data.scheduled_at,
        description: data.description,
        special_instructions: data.special_instructions,
        quoted_price: data.quoted_price,
        created_at: data.created_at,
        accepted_at: data.accepted_at,
        started_at: data.started_at,
        completed_at: data.completed_at,
        cancellation_reason: data.cancellation_reason,
      });
      
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdating(false);
      setPendingAction(null);
    }
  };

  const handlePhotoUpload = async (file, photoType) => {
    try {
      const result = await uploadJobPhoto(jobId, photoType, file);
      setPhotos(prev => ({
        ...prev,
        [photoType]: [...(prev[photoType] || []), result],
      }));
    } catch (err) {
      console.error("Failed to upload photo:", err);
    }
  };

  const getConfirmationConfig = () => {
    if (!pendingAction) return {};
    switch (pendingAction.value) {
      case "in_progress":
        return { title: "START JOB", message: "Are you sure you want to start this job? Your location will be shared with the customer.", confirmText: "START JOB", isDestructive: false };
      case "completed":
        return { title: "MARK AS COMPLETED", message: "Are you sure the job is complete? Payment will be released from escrow after 24 hours.", confirmText: "MARK COMPLETE", isDestructive: false };
      case "cancelled":
        return { title: pendingAction.label, message: "Cancelling this job may affect your completion rate and trust score.", confirmText: "CANCEL JOB", isDestructive: true };
      default:
        return { title: "UPDATE STATUS", message: "Are you sure?", confirmText: "CONFIRM", isDestructive: false };
    }
  };

  const confConfig = getConfirmationConfig();

  // ─── LOADING STATE ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
        <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <span className="animate-spin text-4xl font-black" style={{ color: C }}>◎</span>
              <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>LOADING BOOKING...</span>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  // ─── ERROR STATE ─────────────────────────────────────────────────────────────
  if (error || !job) {
    return (
      <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
        <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center border max-w-md w-full" style={{ borderColor: IK }}>
              <div className="px-6 py-3 border-b" style={{ background: IK }}>
                <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>ERROR</span>
              </div>
              <div className="p-10 flex flex-col items-center">
                <span className="text-6xl font-black block mb-4" style={{ color: C }}>!</span>
                <p className="text-xs font-black uppercase tracking-superwide mb-2" style={{ color: IK }}>{error || "BOOKING NOT FOUND"}</p>
                <p className="text-2xs font-black uppercase tracking-wide mb-6" style={{ color: LIGHT_IK }}>THE BOOKING YOU'RE LOOKING FOR DOESN'T EXIST OR YOU DON'T HAVE ACCESS.</p>
                <div className="flex gap-3">
                  <Link to="/provider/jobs"
                    className="border px-6 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
                    style={{ background: C, color: CR, borderColor: C }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.borderColor = IK; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.borderColor = C; }}>BACK TO JOBS →</Link>
                  <button onClick={() => window.location.reload()}
                    className="border px-6 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
                    style={{ background: "transparent", borderColor: IK, color: IK }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>RETRY ↺</button>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  // ✅ Now job is guaranteed to exist
  const statusMeta = JOB_STATUS_META[job.status] ?? JOB_STATUS_META.requested;
  const availableActions = ACTIONS_BY_STATUS[job.status] || [];
  const isCompleted = job.status === "completed";
  const isCancelled = job.status === "cancelled";
  const isReadOnly = isCompleted || isCancelled;

  // ─── MAIN RETURN ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* Breadcrumb */}
        <div className="flex items-center border-b px-6" style={{ background: CR, borderColor: IK }}>
          <Link to="/provider/jobs" className="py-3 pr-5 border-r text-2xs font-black uppercase tracking-superwide transition-colors no-underline"
            style={{ color: LIGHT_IK, borderColor: IK }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = LIGHT_IK; }}>
            ← PROVIDER / JOBS
          </Link>
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>/ {job.booking_ref}</span>
          <div className="ml-auto py-2">
            <StatusBadge status={job.status} size="large" />
          </div>
        </div>

        {/* Job Header */}
        <div className="border-b px-6 md:px-10 py-8" style={{ background: CR, borderColor: IK }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="font-black uppercase leading-none" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", letterSpacing: "-0.02em", color: IK }}>{job.booking_ref}</h1>
                <StatusBadge status={job.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>SCHEDULED: {formatDateTime(job.scheduled_at)}</span>
                {job.accepted_at && (
                  <>
                    <span style={{ color: LIGHT_IK }}>·</span>
                    <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>ACCEPTED: {formatTime(job.accepted_at)}</span>
                  </>
                )}
                {job.started_at && (
                  <>
                    <span style={{ color: LIGHT_IK }}>·</span>
                    <span className="text-2xs font-black uppercase tracking-wide" style={{ color: C }}>STARTED: {formatTime(job.started_at)}</span>
                  </>
                )}
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/chat/${job.chat_room_id || 5678}`}
                  className="border px-5 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
                  style={{ background: "transparent", borderColor: IK, color: IK }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>💬 MESSAGE</Link>
                {availableActions.map((action) => (
                  <button key={action.value} onClick={() => handleActionClick(action)} disabled={isUpdating}
                    className="px-5 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 disabled:opacity-50"
                    style={{
                      background: action.value === "cancelled" ? "transparent" : C,
                      color: action.value === "cancelled" ? C : CR,
                      borderColor: action.value === "cancelled" ? C : "transparent",
                      borderWidth: action.value === "cancelled" ? "1px" : "0",
                    }}
                    onMouseEnter={(e) => {
                      if (action.value === "cancelled") { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }
                      else { e.currentTarget.style.background = IK; }
                    }}
                    onMouseLeave={(e) => {
                      if (action.value === "cancelled") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C; }
                      else { e.currentTarget.style.background = C; }
                    }}>{action.icon} {action.label}</button>
                ))}
              </div>
            )}

            {isReadOnly && (
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/chat/${job.chat_room_id || 5678}`}
                  className="border px-5 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
                  style={{ background: "transparent", borderColor: IK, color: IK }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>💬 VIEW CHAT</Link>
                <Link to="/provider/jobs"
                  className="px-5 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
                  style={{ background: C, color: CR }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = IK; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = C; }}>BACK TO JOBS →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 md:px-10 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {customer && (
                <div className="border overflow-hidden" style={{ borderColor: IK }}>
                  <SectionBar n="§ 001" title="CUSTOMER" />
                  <div className="p-6" style={{ background: CR }}>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 border flex items-center justify-center shrink-0 overflow-hidden" style={{ borderColor: IK, background: "#e8e2d6" }}>
                        {customer.avatar_url ? (
                          <img src={customer.avatar_url} alt={customer.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-black" style={{ color: IK, opacity: 0.15 }}>{customer.full_name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-black uppercase tracking-wide mb-1" style={{ color: IK }}>{customer.full_name}</h3>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>PHONE:</span>
                          {phoneRevealed ? (
                            <a href={`tel:${customer.phone}`} className="text-xs font-black uppercase tracking-wide transition-colors no-underline" style={{ color: C }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = IK; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = C; }}>{customer.phone}</a>
                          ) : (
                            <button onClick={() => setPhoneRevealed(true)}
                              className="text-xs font-black uppercase tracking-wide transition-colors bg-transparent border-none cursor-pointer"
                              style={{ color: LIGHT_IK }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = C; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = LIGHT_IK; }}>{maskPhone(customer.phone)} · TAP TO REVEAL</button>
                          )}
                        </div>
                        {address && (
                          <div className="border-t pt-3" style={{ borderColor: IK }}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-2xs font-black uppercase tracking-wide px-2 py-0.5 border" style={{ borderColor: C, color: C }}>{address.label}</span>
                                </div>
                                <p className="text-xs font-black uppercase tracking-wide mb-0.5" style={{ color: IK }}>{address.address_line1}</p>
                                {address.address_line2 && (
                                  <p className="text-2xs font-black uppercase tracking-wide mb-1" style={{ color: LIGHT_IK }}>{address.address_line2}</p>
                                )}
                                <p className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>{address.city}</p>
                              </div>
                              <a href={getGoogleMapsUrl(address.lat, address.lng)} target="_blank" rel="noopener noreferrer"
                                className="border px-3 py-1.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 shrink-0 no-underline"
                                style={{ background: "transparent", borderColor: IK, color: IK }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>🗺 MAP</a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border overflow-hidden" style={{ borderColor: IK }}>
                <SectionBar n="§ 002" title="JOB DETAILS" />
                <div className="p-6 space-y-4" style={{ background: CR }}>
                  <div>
                    <span className="text-2xs font-black uppercase tracking-superwide block mb-2" style={{ color: LIGHT_IK }}>DESCRIPTION</span>
                    <p className="text-xs font-black uppercase tracking-wide leading-relaxed" style={{ color: IK }}>{job.description || "No description provided"}</p>
                  </div>
                  {job.special_instructions && (
                    <div className="border-l-2 p-4" style={{ borderColor: C, background: CR_ALT }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black" style={{ color: C }}>📋</span>
                        <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>SPECIAL INSTRUCTIONS</span>
                      </div>
                      <p className="text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>{job.special_instructions}</p>
                    </div>
                  )}
                  {job.cancellation_reason && (
                    <div className="border p-4" style={{ borderColor: C, background: "rgba(255,87,51,0.05)" }}>
                      <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: C }}>CANCELLATION REASON</span>
                      <p className="text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>{job.cancellation_reason.replace(/_/g, " ").toUpperCase()}</p>
                    </div>
                  )}
                </div>
              </div>

              {(job.status === "in_progress" || job.status === "completed" || job.status === "accepted") && (
                <PhotoUploadSection jobStatus={job.status} photos={photos} onUpload={handlePhotoUpload} />
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              
              {payment && (
                <div className="border overflow-hidden" style={{ borderColor: IK }}>
                  <SectionBar n="§ 003" title="PRICING" />
                  <div className="p-6" style={{ background: CR }}>
                    <div className="space-y-3">
                      <InfoRow label="SERVICE FEE" value={fmtPrice(payment.quoted_price)} />
                      <InfoRow label={`PLATFORM FEE (${Math.round((payment.platform_fee / payment.quoted_price) * 100) || 10}%)`} value={`- ${fmtPrice(payment.platform_fee)}`} />
                      <div className="border-t pt-3" style={{ borderColor: IK }}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-superwide" style={{ color: IK }}>YOUR EARNING</span>
                          <span className="text-xl font-black leading-none" style={{ color: C, letterSpacing: "-0.02em" }}>{fmtPrice(payment.your_earning)}</span>
                        </div>
                      </div>
                    </div>
                    {job.status === "completed" && (
                      <div className="mt-4 border p-3 flex items-start gap-2" style={{ borderColor: "#22C55E", background: "rgba(34,197,94,0.05)" }}>
                        <span className="text-sm font-black shrink-0" style={{ color: "#22C55E" }}>🔒</span>
                        <div>
                          <span className="text-2xs font-black uppercase tracking-superwide block mb-0.5" style={{ color: "#22C55E" }}>ESCROW RELEASED IN 24H</span>
                          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>FUNDS WILL BE AVAILABLE FOR WITHDRAWAL SHORTLY</span>
                        </div>
                      </div>
                    )}
                    {isReadOnly && (
                      <Link to="/provider/earnings"
                        className="mt-4 w-full block text-center border py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
                        style={{ background: "transparent", borderColor: IK, color: IK }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}>VIEW EARNINGS →</Link>
                    )}
                  </div>
                </div>
              )}

              <div className="border overflow-hidden" style={{ borderColor: IK }}>
                <button onClick={() => setIsChatOpen(!isChatOpen)}
                  className="w-full flex items-center justify-between px-6 py-2.5 transition-colors" style={{ background: IK }}>
                  <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>§ CHAT</span>
                  <span className="text-sm font-black transition-transform duration-200" style={{ color: CR, transform: isChatOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                </button>
                {isChatOpen && (
                  <div className="p-6" style={{ background: CR }}>
                    <div className="border p-8 flex flex-col items-center justify-center text-center" style={{ borderColor: IK, background: CR_ALT, minHeight: 200 }}>
                      <span className="text-4xl font-black mb-3" style={{ color: IK, opacity: 0.1 }}>💬</span>
                      <span className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: IK }}>JOB CHAT</span>
                      <span className="text-2xs font-black uppercase tracking-wide mb-4" style={{ color: LIGHT_IK }}>COMMUNICATE WITH YOUR CUSTOMER</span>
                      <Link to={`/chat/${job.chat_room_id || 5678}`}
                        className="border px-5 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
                        style={{ background: C, color: CR, borderColor: C }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.borderColor = IK; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.borderColor = C; }}>OPEN FULL CHAT →</Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="border overflow-hidden" style={{ borderColor: IK }}>
                <SectionBar n="§" title="TIMELINE" />
                <div className="p-6" style={{ background: CR }}>
                  <div className="relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5" style={{ background: IK, opacity: 0.15 }} />
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="w-4 h-4 border rounded-full shrink-0 mt-0.5" style={{ borderColor: C, background: C }} />
                        <div>
                          <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: C }}>BOOKING CREATED</span>
                          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>{formatDateTime(job.created_at)}</span>
                        </div>
                      </div>
                      {job.accepted_at && (
                        <div className="flex items-start gap-4">
                          <div className="w-4 h-4 border rounded-full shrink-0 mt-0.5" style={{ borderColor: IK, background: IK }} />
                          <div>
                            <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: IK }}>ACCEPTED</span>
                            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>{formatDateTime(job.accepted_at)}</span>
                          </div>
                        </div>
                      )}
                      {job.started_at && (
                        <div className="flex items-start gap-4">
                          <div className="w-4 h-4 border rounded-full shrink-0 mt-0.5" style={{ borderColor: C, background: C }} />
                          <div>
                            <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: C }}>IN PROGRESS</span>
                            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>{formatDateTime(job.started_at)}</span>
                          </div>
                        </div>
                      )}
                      {job.completed_at && (
                        <div className="flex items-start gap-4">
                          <div className="w-4 h-4 border rounded-full shrink-0 mt-0.5" style={{ borderColor: "#22C55E", background: "#22C55E" }} />
                          <div>
                            <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: "#22C55E" }}>COMPLETED</span>
                            <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>{formatDateTime(job.completed_at)}</span>
                          </div>
                        </div>
                      )}
                      {job.status === "cancelled" && (
                        <div className="flex items-start gap-4">
                          <div className="w-4 h-4 border rounded-full shrink-0 mt-0.5" style={{ borderColor: C, background: "transparent" }} />
                          <div><span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: C }}>CANCELLED</span></div>
                        </div>
                      )}
                      {!isReadOnly && (
                        <div className="flex items-start gap-4 opacity-30">
                          <div className="w-4 h-4 border rounded-full shrink-0 mt-0.5" style={{ borderColor: LIGHT_IK }} />
                          <div><span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: LIGHT_IK }}>COMPLETED (PENDING)</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Updating Overlay */}
        {isUpdating && (
          <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(26, 26, 26, 0.5)" }}>
            <div className="border px-8 py-6 flex flex-col items-center gap-3" style={{ background: CR, borderColor: IK }}>
              <span className="animate-spin text-2xl font-black" style={{ color: C }}>◎</span>
              <span className="text-xs font-black uppercase tracking-superwide" style={{ color: IK }}>UPDATING...</span>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => { setShowConfirmation(false); setPendingAction(null); }}
          onConfirm={handleConfirmAction}
          title={confConfig.title}
          message={confConfig.message}
          confirmText={confConfig.confirmText}
          isDestructive={confConfig.isDestructive}>
          {pendingAction?.value === "cancelled" && (
            <div className="space-y-2">
              <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: C }}>SELECT REASON *</span>
              <select value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full border px-3 py-2.5 text-2xs font-black uppercase"
                style={{ background: CR_ALT, borderColor: !cancellationReason ? C : IK, color: IK }}>
                <option value="">SELECT A REASON</option>
                <option value="emergency">EMERGENCY / UNABLE TO ATTEND</option>
                <option value="customer_request">CUSTOMER REQUESTED CANCELLATION</option>
                <option value="cannot_complete">CANNOT COMPLETE THE JOB</option>
                <option value="other">OTHER REASON</option>
              </select>
            </div>
          )}
          {pendingAction?.value === "in_progress" && (
            <div className="flex items-center gap-2 p-3 border" style={{ borderColor: "#22C55E", background: "rgba(34,197,94,0.05)" }}>
              <span className="text-base">📍</span>
              <span className="text-2xs font-black uppercase tracking-wide" style={{ color: "#22C55E" }}>YOUR LOCATION WILL BE SHARED WITH THE CUSTOMER</span>
            </div>
          )}
        </ConfirmationModal>

        <Footer />
      </div>
    </div>
  );
}
// import { useState } from "react";
// import Header from "../../common/components/Header";
// import Footer from "../../common/components/Footer";
// import { Link, useParams } from "react-router-dom";
// import StatusUpdater from "../components/StatusUpdater";

// // ─── CONSTANTS ────────────────────────────────────────────────────────────────
// const C  = "#FF5733";
// const CR = "#F5F0E6";
// const IK = "#1A1A1A";

// // Derived colors
// const getAltBackground = () => {
//   const r = parseInt(CR.slice(1,3), 16);
//   const g = parseInt(CR.slice(3,5), 16);
//   const b = parseInt(CR.slice(5,7), 16);
//   return `rgb(${Math.max(0, r-12)}, ${Math.max(0, g-12)}, ${Math.max(0, b-12)})`;
// };

// const getLightInk = () => {
//   const r = parseInt(IK.slice(1,3), 16);
//   const g = parseInt(IK.slice(3,5), 16);
//   const b = parseInt(IK.slice(5,7), 16);
//   return `rgba(${r}, ${g}, ${b}, 0.4)`;
// };

// const CR_ALT = getAltBackground();
// const LIGHT_IK = getLightInk();

// // ─── MOCK DATA ───────────────────────────────────────────────────────────────
// const DATA = {
//   job: {
//     id: 12345,
//     booking_ref: "TK-202404-123456",
//     status: "accepted",
//     scheduled_at: "2024-04-22T14:00:00Z",
//     description: "Need to install new water heater, old one stopped working",
//     special_instructions: "Please call before arriving",
//     quoted_price: 1500.00,
//     created_at: "2024-04-21T10:30:00Z",
//     accepted_at: "2024-04-21T10:45:00Z",
//     started_at: null,
//     completed_at: null,
//   },
//   customer: {
//     id: 301,
//     full_name: "SARA MALIK",
//     phone: "03001234570",
//     avatar_url: null,
//   },
//   address: {
//     label: "HOME",
//     address_line1: "45-C, DHA Phase 5",
//     address_line2: "Near McDonald's",
//     city: "Lahore",
//     lat: 31.4820,
//     lng: 74.4020,
//   },
//   payment: {
//     quoted_price: 1500.00,
//     platform_fee: 150.00,
//     your_earning: 1350.00,
//   },
//   allowed_actions: ["start_job", "cancel_job", "message_customer"],
//   chat_room_id: 5678,
//   photos: {
//     before: [],
//     after: [],
//   },
// };

// // ─── STATUS CONFIG ────────────────────────────────────────────────────────────
// const JOB_STATUS_META = {
//   requested:   { label: "REQUESTED",   sym: "○", bg: CR_ALT, fg: IK,       border: IK },
//   accepted:    { label: "ACCEPTED",    sym: "◎", bg: IK,     fg: CR,       border: IK },
//   in_progress: { label: "IN PROGRESS", sym: "◆", bg: C,      fg: CR,       border: C  },
//   completed:   { label: "COMPLETED",   sym: "✓", bg: IK,     fg: C,        border: IK },
//   cancelled:   { label: "CANCELLED",   sym: "✗", bg: CR,     fg: LIGHT_IK, border: IK },
// };

// const ACTIONS_BY_STATUS = {
//   accepted: [
//     { value: "in_progress", label: "START JOB", requires_confirmation: true, icon: "▶" },
//     { value: "cancelled", label: "CANCEL JOB", requires_confirmation: true, icon: "✗" },
//   ],
//   in_progress: [
//     { value: "completed", label: "MARK COMPLETE", requires_confirmation: true, icon: "✓" },
//     { value: "cancelled", label: "EMERGENCY CANCEL", requires_confirmation: true, icon: "⚠" },
//   ],
//   completed: [],
//   cancelled: [],
// };

// // ─── HELPERS ──────────────────────────────────────────────────────────────────
// const fmtPrice = (price) => `PKR ${price.toLocaleString("en-PK")}`;

// const formatDateTime = (isoString) => {
//   if (!isoString) return "—";
//   const date = new Date(isoString);
//   return date.toLocaleDateString("en-PK", {
//     weekday: "long",
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   }).toUpperCase() + " · " + date.toLocaleTimeString("en-PK", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   }).toUpperCase();
// };

// const formatTime = (isoString) => {
//   if (!isoString) return null;
//   const date = new Date(isoString);
//   return date.toLocaleTimeString("en-PK", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   }).toUpperCase();
// };

// const maskPhone = (phone) => {
//   if (!phone) return "—";
//   return phone.slice(0, 4) + "****" + phone.slice(-3);
// };

// const getGoogleMapsUrl = (lat, lng) => {
//   return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
// };

// // ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

// const SectionBar = ({ n, title, action }) => (
//   <div
//     className="flex items-center justify-between px-6 py-2.5"
//     style={{ background: IK }}
//   >
//     <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
//       {title}
//     </span>
//     <div className="flex items-center gap-3">
//       {action}
//       <span className="text-2xs font-black" style={{ color: CR, opacity: 0.3 }}>{n}</span>
//     </div>
//   </div>
// );

// const StatusBadge = ({ status, size = "normal" }) => {
//   const m = JOB_STATUS_META[status] ?? JOB_STATUS_META.requested;
//   return (
//     <div
//       className={`inline-flex items-center gap-1.5 border ${size === "large" ? "px-4 py-2" : "px-2.5 py-1"}`}
//       style={{ borderColor: m.border, background: m.bg }}
//     >
//       <span className={`font-black leading-none ${size === "large" ? "text-base" : "text-xs"}`} style={{ color: m.fg }}>
//         {m.sym}
//       </span>
//       <span className={`font-black uppercase tracking-superwide ${size === "large" ? "text-xs" : "text-2xs"}`} style={{ color: m.fg }}>
//         {m.label}
//       </span>
//     </div>
//   );
// };

// const InfoRow = ({ label, value, accent = false, mono = false }) => (
//   <div className="flex items-center justify-between py-2.5 border-b last:border-b-0" style={{ borderColor: IK }}>
//     <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
//       {label}
//     </span>
//     <span 
//       className={`text-xs font-black uppercase tracking-wide ${mono ? "tabular-nums" : ""}`}
//       style={{ color: accent ? C : IK }}
//     >
//       {value}
//     </span>
//   </div>
// );

// // ─── CONFIRMATION MODAL ───────────────────────────────────────────────────────
// const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDestructive = false, children }) => {
//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{ background: "rgba(26, 26, 26, 0.7)" }}
//       onClick={onClose}
//     >
//       <div
//         className="max-w-md w-full border shadow-lg"
//         style={{ background: CR, borderColor: IK }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div
//           className="flex items-center justify-between px-5 py-3 border-b"
//           style={{ background: IK, borderColor: IK }}
//         >
//           <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: isDestructive ? C : CR }}>
//             {title}
//           </span>
//           <button
//             onClick={onClose}
//             className="text-sm font-black transition-colors"
//             style={{ color: CR }}
//             onMouseEnter={(e) => { e.currentTarget.style.color = C; }}
//             onMouseLeave={(e) => { e.currentTarget.style.color = CR; }}
//           >
//             ✕
//           </button>
//         </div>

//         <div className="p-6" style={{ background: CR }}>
//           <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: IK }}>
//             {message}
//           </p>
//           {children}
//         </div>

//         <div
//           className="flex items-center gap-3 px-5 py-4 border-t"
//           style={{ background: CR_ALT, borderColor: IK }}
//         >
//           <button
//             onClick={onClose}
//             className="flex-1 border py-2 text-2xs font-black uppercase tracking-superwide transition-colors"
//             style={{ background: "transparent", borderColor: IK, color: IK }}
//             onMouseEnter={(e) => { e.currentTarget.style.background = CR; }}
//             onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
//           >
//             CANCEL
//           </button>
//           <button
//             onClick={onConfirm}
//             className="flex-1 py-2 text-2xs font-black uppercase tracking-superwide transition-colors"
//             style={{ background: isDestructive ? C : IK, color: CR }}
//             onMouseEnter={(e) => { e.currentTarget.style.background = isDestructive ? "#cc4422" : C; }}
//             onMouseLeave={(e) => { e.currentTarget.style.background = isDestructive ? C : IK; }}
//           >
//             {confirmText}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── PHOTO UPLOAD SECTION ─────────────────────────────────────────────────────
// const PhotoUploadSection = ({ jobStatus, photos }) => {
//   const [activeTab, setActiveTab] = useState("before");
//   const [isDragging, setIsDragging] = useState(false);

//   const canUpload = jobStatus === "in_progress" || jobStatus === "completed";

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = () => {
//     setIsDragging(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     // Handle file upload
//     console.log("Files dropped:", e.dataTransfer.files);
//   };

//   return (
//     <div className="border overflow-hidden" style={{ borderColor: IK }}>
//       <SectionBar n="§ 004" title="JOB PHOTOS" />

//       <div className="p-6" style={{ background: CR }}>
//         {/* Tab Selector */}
//         <div className="flex items-center border-b mb-4" style={{ borderColor: IK }}>
//           <button
//             onClick={() => setActiveTab("before")}
//             className="px-5 py-2 text-2xs font-black uppercase tracking-superwide border-r transition-colors"
//             style={{
//               background: activeTab === "before" ? IK : "transparent",
//               color: activeTab === "before" ? CR : IK,
//               borderColor: IK,
//             }}
//           >
//             BEFORE
//           </button>
//           <button
//             onClick={() => setActiveTab("after")}
//             className="px-5 py-2 text-2xs font-black uppercase tracking-superwide transition-colors"
//             style={{
//               background: activeTab === "after" ? IK : "transparent",
//               color: activeTab === "after" ? CR : IK,
//             }}
//           >
//             AFTER
//           </button>
//         </div>

//         {canUpload ? (
//           <>
//             {/* Upload Area */}
//             <div
//               onDragOver={handleDragOver}
//               onDragLeave={handleDragLeave}
//               onDrop={handleDrop}
//               className="border-2 border-dashed p-8 text-center transition-colors cursor-pointer"
//               style={{
//                 borderColor: isDragging ? C : LIGHT_IK,
//                 background: isDragging ? "rgba(255,87,51,0.05)" : CR_ALT,
//               }}
//               onClick={() => document.getElementById("photo-upload").click()}
//             >
//               <input
//                 id="photo-upload"
//                 type="file"
//                 accept="image/*"
//                 multiple
//                 className="hidden"
//                 onChange={(e) => console.log("Files selected:", e.target.files)}
//               />
//               <span className="text-4xl font-black block mb-3" style={{ color: IK, opacity: 0.15 }}>
//                 📸
//               </span>
//               <span className="text-xs font-black uppercase tracking-wide block mb-1" style={{ color: IK }}>
//                 {isDragging ? "DROP FILES HERE" : "CLICK OR DRAG TO UPLOAD"}
//               </span>
//               <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
//                 {activeTab === "before" ? "BEFORE STARTING WORK" : "AFTER COMPLETING WORK"}
//               </span>
//             </div>

//             {/* Existing Photos */}
//             {photos[activeTab]?.length > 0 && (
//               <div className="grid grid-cols-3 gap-3 mt-4">
//                 {photos[activeTab].map((photo, i) => (
//                   <div
//                     key={i}
//                     className="aspect-square border overflow-hidden relative group"
//                     style={{ borderColor: IK, background: CR_ALT }}
//                   >
//                     <img src={photo.url} alt={`${activeTab} ${i + 1}`} className="w-full h-full object-cover" />
//                     <button
//                       className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//                       style={{ background: C, color: CR, fontSize: "12px" }}
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-12" style={{ background: CR_ALT }}>
//             <span className="text-4xl font-black mb-3" style={{ color: IK, opacity: 0.1 }}>📸</span>
//             <span className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: LIGHT_IK }}>
//               PHOTOS AVAILABLE AFTER STARTING JOB
//             </span>
//             <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
//               UPLOAD BEFORE AND AFTER PHOTOS AS PROOF OF WORK
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ─── PAGE ─────────────────────────────────────────────────────────────────────
// export default function ProviderJobDetail() {
//   const { jobId } = useParams();
//   const [job, setJob] = useState(DATA.job);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [pendingAction, setPendingAction] = useState(null);
//   const [cancellationReason, setCancellationReason] = useState("");
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [phoneRevealed, setPhoneRevealed] = useState(false);

//   const statusMeta = JOB_STATUS_META[job.status] ?? JOB_STATUS_META.requested;
//   const availableActions = ACTIONS_BY_STATUS[job.status] || [];
//   const isCompleted = job.status === "completed";
//   const isCancelled = job.status === "cancelled";
//   const isReadOnly = isCompleted || isCancelled;

//   const handleActionClick = (action) => {
//     setPendingAction(action);
//     setCancellationReason("");
//     setShowConfirmation(true);
//   };

//   const handleConfirmAction = () => {
//     if (pendingAction?.value === "cancelled" && !cancellationReason) {
//       return;
//     }

//     setIsUpdating(true);
//     setShowConfirmation(false);

//     // Simulate API call
//     setTimeout(() => {
//       setJob((prev) => ({
//         ...prev,
//         status: pendingAction.value,
//         [pendingAction.value === "in_progress"
//           ? "started_at"
//           : pendingAction.value === "completed"
//           ? "completed_at"
//           : "cancelled_at"]: new Date().toISOString(),
//         cancellation_reason: pendingAction.value === "cancelled" ? cancellationReason : null,
//       }));
//       setIsUpdating(false);
//       setPendingAction(null);
//     }, 1000);
//   };

//   const getConfirmationConfig = () => {
//     if (!pendingAction) return {};

//     switch (pendingAction.value) {
//       case "in_progress":
//         return {
//           title: "START JOB",
//           message: "Are you sure you want to start this job? Your location will be shared with the customer.",
//           confirmText: "START JOB",
//           isDestructive: false,
//         };
//       case "completed":
//         return {
//           title: "MARK AS COMPLETED",
//           message: "Are you sure the job is complete? Payment will be released from escrow after 24 hours.",
//           confirmText: "MARK COMPLETE",
//           isDestructive: false,
//         };
//       case "cancelled":
//         return {
//           title: pendingAction.label,
//           message: "Cancelling this job may affect your completion rate and trust score.",
//           confirmText: "CANCEL JOB",
//           isDestructive: true,
//         };
//       default:
//         return {
//           title: "UPDATE STATUS",
//           message: "Are you sure?",
//           confirmText: "CONFIRM",
//           isDestructive: false,
//         };
//     }
//   };

//   const confConfig = getConfirmationConfig();

//   return (
//     <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
//       <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />

//       <div className="relative z-10 flex flex-col min-h-screen">
//         <Header />

//         {/* Breadcrumb */}
//         <div className="flex items-center border-b px-6" style={{ background: CR, borderColor: IK }}>
//           <span className="py-3 pr-5 border-r text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK, borderColor: IK }}>
//             PROVIDER
//           </span>
//           <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
//             / JOBS
//           </span>
//           <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>
//             / {job.booking_ref}
//           </span>
//           <div className="ml-auto py-2">
//             <StatusBadge status={job.status} size="large" />
//           </div>
//         </div>

//         {/* Job Header */}
//         <div className="border-b px-6 md:px-10 py-8" style={{ background: CR, borderColor: IK }}>
//           <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
//             <div>
//               <div className="flex items-center gap-4 mb-3">
//                 <h1
//                   className="font-black uppercase leading-none"
//                   style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", letterSpacing: "-0.02em", color: IK }}
//                 >
//                   {job.booking_ref}
//                 </h1>
//                 <StatusBadge status={job.status} />
//               </div>
//               <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
//                 <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
//                   SCHEDULED: {formatDateTime(job.scheduled_at)}
//                 </span>
//                 {job.accepted_at && (
//                   <>
//                     <span style={{ color: LIGHT_IK }}>·</span>
//                     <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
//                       ACCEPTED: {formatTime(job.accepted_at)}
//                     </span>
//                   </>
//                 )}
//                 {job.started_at && (
//                   <>
//                     <span style={{ color: LIGHT_IK }}>·</span>
//                     <span className="text-2xs font-black uppercase tracking-wide" style={{ color: C }}>
//                       STARTED: {formatTime(job.started_at)}
//                     </span>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* Action Buttons */}
//             {!isReadOnly && (
//               <div className="flex items-center gap-2 shrink-0">
//                 <Link
//                   to={`/chat/${DATA.chat_room_id}`}
//                   className="border px-5 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
//                   style={{ background: "transparent", borderColor: IK, color: IK }}
//                   onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
//                   onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}
//                 >
//                   💬 MESSAGE
//                 </Link>
//                 {availableActions.map((action) => (
//                   <button
//                     key={action.value}
//                     onClick={() => handleActionClick(action)}
//                     disabled={isUpdating}
//                     className="px-5 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 disabled:opacity-50"
//                     style={{
//                       background: action.value === "cancelled" ? "transparent" : C,
//                       color: action.value === "cancelled" ? C : CR,
//                       borderColor: action.value === "cancelled" ? C : "transparent",
//                       borderWidth: action.value === "cancelled" ? "1px" : "0",
//                     }}
//                     onMouseEnter={(e) => {
//                       if (action.value === "cancelled") {
//                         e.currentTarget.style.background = C;
//                         e.currentTarget.style.color = CR;
//                       } else {
//                         e.currentTarget.style.background = IK;
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       if (action.value === "cancelled") {
//                         e.currentTarget.style.background = "transparent";
//                         e.currentTarget.style.color = C;
//                       } else {
//                         e.currentTarget.style.background = C;
//                       }
//                     }}
//                   >
//                     {action.icon} {action.label}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 px-6 md:px-10 py-8">
//           <div className="grid lg:grid-cols-3 gap-8">
            
//             {/* Left Column - Customer & Job Details */}
//             <div className="lg:col-span-2 space-y-8">
              
//               {/* Customer Card */}
//               <div className="border overflow-hidden" style={{ borderColor: IK }}>
//                 <SectionBar n="§ 001" title="CUSTOMER" />
//                 <div className="p-6" style={{ background: CR }}>
//                   <div className="flex items-start gap-4">
//                     {/* Avatar */}
//                     <div
//                       className="w-16 h-16 border flex items-center justify-center shrink-0 overflow-hidden"
//                       style={{ borderColor: IK, background: "#e8e2d6" }}
//                     >
//                       {DATA.customer.avatar_url ? (
//                         <img
//                           src={DATA.customer.avatar_url}
//                           alt={DATA.customer.full_name}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <span className="text-3xl font-black" style={{ color: IK, opacity: 0.15 }}>
//                           {DATA.customer.full_name.charAt(0)}
//                         </span>
//                       )}
//                     </div>

//                     <div className="flex-1">
//                       <h3 className="text-sm font-black uppercase tracking-wide mb-1" style={{ color: IK }}>
//                         {DATA.customer.full_name}
//                       </h3>

//                       {/* Phone */}
//                       <div className="flex items-center gap-3 mb-3">
//                         <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
//                           PHONE:
//                         </span>
//                         {phoneRevealed ? (
//                           <a
//                             href={`tel:${DATA.customer.phone}`}
//                             className="text-xs font-black uppercase tracking-wide transition-colors"
//                             style={{ color: C }}
//                             onMouseEnter={(e) => { e.currentTarget.style.color = IK; }}
//                             onMouseLeave={(e) => { e.currentTarget.style.color = C; }}
//                           >
//                             {DATA.customer.phone}
//                           </a>
//                         ) : (
//                           <button
//                             onClick={() => setPhoneRevealed(true)}
//                             className="text-xs font-black uppercase tracking-wide transition-colors"
//                             style={{ color: LIGHT_IK }}
//                             onMouseEnter={(e) => { e.currentTarget.style.color = C; }}
//                             onMouseLeave={(e) => { e.currentTarget.style.color = LIGHT_IK; }}
//                           >
//                             {maskPhone(DATA.customer.phone)} · TAP TO REVEAL
//                           </button>
//                         )}
//                       </div>

//                       {/* Address */}
//                       <div className="border-t pt-3" style={{ borderColor: IK }}>
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <div className="flex items-center gap-2 mb-1">
//                               <span
//                                 className="text-2xs font-black uppercase tracking-wide px-2 py-0.5 border"
//                                 style={{ borderColor: C, color: C }}
//                               >
//                                 {DATA.address.label}
//                               </span>
//                             </div>
//                             <p className="text-xs font-black uppercase tracking-wide mb-0.5" style={{ color: IK }}>
//                               {DATA.address.address_line1}
//                             </p>
//                             {DATA.address.address_line2 && (
//                               <p className="text-2xs font-black uppercase tracking-wide mb-1" style={{ color: LIGHT_IK }}>
//                                 {DATA.address.address_line2}
//                               </p>
//                             )}
//                             <p className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
//                               {DATA.address.city}
//                             </p>
//                           </div>
//                           <a
//                             href={getGoogleMapsUrl(DATA.address.lat, DATA.address.lng)}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="border px-3 py-1.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 shrink-0"
//                             style={{ background: "transparent", borderColor: IK, color: IK }}
//                             onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
//                             onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}
//                           >
//                             🗺 MAP
//                           </a>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Job Description Card */}
//               <div className="border overflow-hidden" style={{ borderColor: IK }}>
//                 <SectionBar n="§ 002" title="JOB DETAILS" />
//                 <div className="p-6 space-y-4" style={{ background: CR }}>
//                   <div>
//                     <span className="text-2xs font-black uppercase tracking-superwide block mb-2" style={{ color: LIGHT_IK }}>
//                       DESCRIPTION
//                     </span>
//                     <p className="text-xs font-black uppercase tracking-wide leading-relaxed" style={{ color: IK }}>
//                       {job.description}
//                     </p>
//                   </div>

//                   {job.special_instructions && (
//                     <div 
//                       className="border-l-2 p-4"
//                       style={{ borderColor: C, background: CR_ALT }}
//                     >
//                       <div className="flex items-center gap-2 mb-1">
//                         <span className="text-sm font-black" style={{ color: C }}>📋</span>
//                         <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
//                           SPECIAL INSTRUCTIONS
//                         </span>
//                       </div>
//                       <p className="text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>
//                         {job.special_instructions}
//                       </p>
//                     </div>
//                   )}

//                   {/* Cancellation Reason (if cancelled) */}
//                   {job.cancellation_reason && (
//                     <div
//                       className="border p-4"
//                       style={{ borderColor: C, background: "rgba(255,87,51,0.05)" }}
//                     >
//                       <span className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: C }}>
//                         CANCELLATION REASON
//                       </span>
//                       <p className="text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>
//                         {job.cancellation_reason.replace(/_/g, " ").toUpperCase()}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Photo Upload Section */}
//               {(job.status === "in_progress" || job.status === "completed" || job.status === "accepted") && (
//                 <PhotoUploadSection jobStatus={job.status} photos={DATA.photos} />
//               )}
//             </div>

//             {/* Right Column - Pricing & Chat */}
//             <div className="space-y-8">
              
//               {/* Pricing Card */}
//               <div className="border overflow-hidden" style={{ borderColor: IK }}>
//                 <SectionBar n="§ 003" title="PRICING" />
//                 <div className="p-6" style={{ background: CR }}>
//                   <div className="space-y-3">
//                     <InfoRow label="SERVICE FEE" value={fmtPrice(DATA.payment.quoted_price)} />
//                     <InfoRow
//                       label="PLATFORM FEE (10%)"
//                       value={`- ${fmtPrice(DATA.payment.platform_fee)}`}
//                     />
//                     <div className="border-t pt-3" style={{ borderColor: IK }}>
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs font-black uppercase tracking-superwide" style={{ color: IK }}>
//                           YOUR EARNING
//                         </span>
//                         <span className="text-xl font-black leading-none" style={{ color: C, letterSpacing: "-0.02em" }}>
//                           {fmtPrice(DATA.payment.your_earning)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Escrow Info */}
//                   {job.status === "completed" && (
//                     <div
//                       className="mt-4 border p-3 flex items-start gap-2"
//                       style={{ borderColor: "#22C55E", background: "rgba(34,197,94,0.05)" }}
//                     >
//                       <span className="text-sm font-black shrink-0" style={{ color: "#22C55E" }}>🔒</span>
//                       <div>
//                         <span className="text-2xs font-black uppercase tracking-superwide block mb-0.5" style={{ color: "#22C55E" }}>
//                           ESCROW RELEASED IN 24H
//                         </span>
//                         <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
//                           FUNDS WILL BE AVAILABLE FOR WITHDRAWAL SHORTLY
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   {isReadOnly && (
//                     <Link
//                       to={`/provider/earnings`}
//                       className="mt-4 w-full block text-center border py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
//                       style={{ background: "transparent", borderColor: IK, color: IK }}
//                       onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
//                       onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}
//                     >
//                       VIEW EARNINGS →
//                     </Link>
//                   )}
//                 </div>
//               </div>

//               {/* Chat Card */}
//               <div className="border overflow-hidden" style={{ borderColor: IK }}>
//                 <button
//                   onClick={() => setIsChatOpen(!isChatOpen)}
//                   className="w-full flex items-center justify-between px-6 py-2.5 transition-colors"
//                   style={{ background: IK }}
//                 >
//                   <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
//                     § CHAT
//                   </span>
//                   <span
//                     className="text-sm font-black transition-transform duration-200"
//                     style={{ color: CR, transform: isChatOpen ? "rotate(180deg)" : "rotate(0deg)" }}
//                   >
//                     ▼
//                   </span>
//                 </button>

//                 {isChatOpen && (
//                   <div className="p-6" style={{ background: CR }}>
//                     <div 
//                       className="border p-8 flex flex-col items-center justify-center text-center"
//                       style={{ borderColor: IK, background: CR_ALT, minHeight: 200 }}
//                     >
//                       <span className="text-4xl font-black mb-3" style={{ color: IK, opacity: 0.1 }}>💬</span>
//                       <span className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: IK }}>
//                         JOB CHAT
//                       </span>
//                       <span className="text-2xs font-black uppercase tracking-wide mb-4" style={{ color: LIGHT_IK }}>
//                         COMMUNICATE WITH YOUR CUSTOMER
//                       </span>
//                       <Link
//                         to={`/chat/${DATA.chat_room_id}`}
//                         className="border px-5 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
//                         style={{ background: C, color: CR, borderColor: C }}
//                         onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.borderColor = IK; }}
//                         onMouseLeave={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.borderColor = C; }}
//                       >
//                         OPEN FULL CHAT →
//                       </Link>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Timeline Card */}
//               <div className="border overflow-hidden" style={{ borderColor: IK }}>
//                 <SectionBar n="§" title="TIMELINE" />
//                 <div className="p-6" style={{ background: CR }}>
//                   <div className="relative">
//                     {/* Vertical Line */}
//                     <div className="absolute left-[7px] top-2 bottom-2 w-0.5" style={{ background: IK, opacity: 0.15 }} />

//                     <div className="space-y-5">
//                       <div className="flex items-start gap-4">
//                         <div className="w-4 h-4 border rounded-full shrink-0 mt-0.5" style={{ borderColor: C, background: C }} />
//                         <div>
//                           <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: C }}>
//                             BOOKING CREATED
//                           </span>
//                           <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
//                             {formatDateTime(job.created_at)}
//                           </span>
//                         </div>
//                       </div>

//                       {job.accepted_at && (
//                         <div className="flex items-start gap-4">
//                           <div className="w-4 h-4 border rounded-full shrink-0 mt-0.5" style={{ borderColor: IK, background: IK }} />
//                           <div>
//                             <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: IK }}>
//                               ACCEPTED
//                             </span>
//                             <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
//                               {formatDateTime(job.accepted_at)}
//                             </span>
//                           </div>
//                         </div>
//                       )}

//                       {job.started_at && (
//                         <div className="flex items-start gap-4">
//                           <div className="w-4 h-4 border rounded-full shrink-0 mt-0.5" style={{ borderColor: C, background: C }} />
//                           <div>
//                             <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: C }}>
//                               IN PROGRESS
//                             </span>
//                             <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
//                               {formatDateTime(job.started_at)}
//                             </span>
//                           </div>
//                         </div>
//                       )}

//                       {job.completed_at && (
//                         <div className="flex items-start gap-4">
//                           <div className="w-4 h-4 border rounded-full shrink-0 mt-0.5" style={{ borderColor: "#22C55E", background: "#22C55E" }} />
//                           <div>
//                             <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: "#22C55E" }}>
//                               COMPLETED
//                             </span>
//                             <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
//                               {formatDateTime(job.completed_at)}
//                             </span>
//                           </div>
//                         </div>
//                       )}

//                       {job.status === "cancelled" && (
//                         <div className="flex items-start gap-4">
//                           <div className="w-4 h-4 border rounded-full shrink-0 mt-0.5" style={{ borderColor: C, background: "transparent" }} />
//                           <div>
//                             <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: C }}>
//                               CANCELLED
//                             </span>
//                           </div>
//                         </div>
//                       )}

//                       {!isReadOnly && (
//                         <div className="flex items-start gap-4 opacity-30">
//                           <div className="w-4 h-4 border rounded-full shrink-0 mt-0.5" style={{ borderColor: LIGHT_IK }} />
//                           <div>
//                             <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: LIGHT_IK }}>
//                               COMPLETED (PENDING)
//                             </span>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Updating Overlay */}
//         {isUpdating && (
//           <div
//             className="fixed inset-0 z-40 flex items-center justify-center"
//             style={{ background: "rgba(26, 26, 26, 0.5)" }}
//           >
//             <div
//               className="border px-8 py-6 flex flex-col items-center gap-3"
//               style={{ background: CR, borderColor: IK }}
//             >
//               <span className="animate-spin text-2xl font-black" style={{ color: C }}>◎</span>
//               <span className="text-xs font-black uppercase tracking-superwide" style={{ color: IK }}>
//                 UPDATING...
//               </span>
//             </div>
//           </div>
//         )}

//         {/* Confirmation Modal */}
//         <ConfirmationModal
//           isOpen={showConfirmation}
//           onClose={() => { setShowConfirmation(false); setPendingAction(null); }}
//           onConfirm={handleConfirmAction}
//           title={confConfig.title}
//           message={confConfig.message}
//           confirmText={confConfig.confirmText}
//           isDestructive={confConfig.isDestructive}
//         >
//           {pendingAction?.value === "cancelled" && (
//             <div className="space-y-2">
//               <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: C }}>
//                 SELECT REASON *
//               </span>
//               <select
//                 value={cancellationReason}
//                 onChange={(e) => setCancellationReason(e.target.value)}
//                 className="w-full border px-3 py-2.5 text-2xs font-black uppercase"
//                 style={{
//                   background: CR_ALT,
//                   borderColor: !cancellationReason ? C : IK,
//                   color: IK,
//                 }}
//               >
//                 <option value="">SELECT A REASON</option>
//                 <option value="emergency">EMERGENCY / UNABLE TO ATTEND</option>
//                 <option value="customer_request">CUSTOMER REQUESTED CANCELLATION</option>
//                 <option value="cannot_complete">CANNOT COMPLETE THE JOB</option>
//                 <option value="other">OTHER REASON</option>
//               </select>
//             </div>
//           )}
//           {pendingAction?.value === "in_progress" && (
//             <div
//               className="flex items-center gap-2 p-3 border"
//               style={{ borderColor: "#22C55E", background: "rgba(34,197,94,0.05)" }}
//             >
//               <span className="text-base">📍</span>
//               <span className="text-2xs font-black uppercase tracking-wide" style={{ color: "#22C55E" }}>
//                 YOUR LOCATION WILL BE SHARED WITH THE CUSTOMER
//               </span>
//             </div>
//           )}
//         </ConfirmationModal>

//         <Footer />
//       </div>
//     </div>
//   );
// }