import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";

// Main Component
export default function StatusUpdater({ 
  currentStatus, 
  availableStatuses = [], 
  onStatusChange,
  jobDetails = {},
  isLoading = false 
}) {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showReasonSelect, setShowReasonSelect] = useState(false);
  const [requireLocationConfirm, setRequireLocationConfirm] = useState(false);
  
  const dropdownRef = useRef(null);
  
  // ─── STATUS CONFIG ────────────────────────────────────────────────────────────
  const STATUS_META = {
    requested:    { label: "REQUESTED",    bg: CR_ALT, fg: IK, border: IK, sym: "○" },
    accepted:     { label: "ACCEPTED",     bg: IK,     fg: CR, border: IK, sym: "◎" },
    in_progress:  { label: "IN PROGRESS",  bg: C,      fg: CR, border: C,  sym: "◆" },
    completed:    { label: "COMPLETED",    bg: IK,     fg: C,  border: IK, sym: "✓" },
    cancelled:    { label: "CANCELLED",    bg: CR,     fg: IK, border: IK, sym: "✗" },
    disputed:     { label: "DISPUTED",     bg: CR_ALT, fg: C,  border: C,  sym: "⚠" },
  };

  const CANCELLATION_REASONS = [
    { value: "emergency", label: "EMERGENCY / UNABLE TO ATTEND" },
    { value: "customer_request", label: "CUSTOMER REQUESTED CANCELLATION" },
    { value: "cannot_complete", label: "CANNOT COMPLETE THE JOB" },
    { value: "other", label: "OTHER REASON" },
  ];

  // ─── COMPONENTS ───────────────────────────────────────────────────────────────

  // Status Badge
  const StatusBadge = ({ status }) => {
    const m = STATUS_META[status] ?? STATUS_META.requested;
    return (
      <div
        className="inline-flex items-center gap-2 border px-3 py-1.5"
        style={{ borderColor: m.border, background: m.bg }}
      >
        <span className="text-sm font-black leading-none" style={{ color: m.fg }}>{m.sym}</span>
        <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: m.fg }}>
          {m.label}
        </span>
      </div>
    );
  };

  // Confirmation Modal
  const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, confirmText = "CONFIRM", isDestructive = false }) => {
    if (!isOpen) return null;
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(26, 26, 26, 0.7)" }}
        onClick={onClose}
      >
        <div 
          className="max-w-md w-full border shadow-lg"
          style={{ background: CR, borderColor: IK }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div 
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{ background: IK, borderColor: IK }}
          >
            <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
              {title}
            </span>
            <button
              onClick={onClose}
              className="text-sm font-black transition-colors"
              style={{ color: CR }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = CR; }}
            >
              ✕
            </button>
          </div>
          
          {/* Modal Body */}
          <div className="p-6" style={{ background: CR }}>
            {children}
          </div>
          
          {/* Modal Footer */}
          <div 
            className="flex items-center gap-3 px-5 py-4 border-t"
            style={{ background: CR_ALT, borderColor: IK }}
          >
            <button
              onClick={onClose}
              className="flex-1 border py-2 text-2xs font-black uppercase tracking-superwide transition-colors"
              style={{ background: "transparent", borderColor: IK, color: IK }}
              onMouseEnter={(e) => { e.currentTarget.style.background = CR_ALT; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              CANCEL
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 text-2xs font-black uppercase tracking-superwide transition-colors"
              style={{ 
                background: isDestructive ? C : IK, 
                color: CR 
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.background = isDestructive ? "#cc4422" : C; 
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.background = isDestructive ? C : IK; 
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleStatusClick = (status) => {
    setPendingStatus(status);
    setShowReasonSelect(status === "cancelled");
    setRequireLocationConfirm(status === "in_progress");
    setShowConfirmation(true);
    setIsDropdownOpen(false);
  };
  
  const handleConfirm = () => {
    if (pendingStatus === "cancelled" && !cancellationReason) {
      return;
    }
    
    const metadata = {};
    if (pendingStatus === "cancelled") {
      metadata.reason = cancellationReason;
    }
    if (requireLocationConfirm) {
      metadata.location_confirmed = true;
    }
    
    onStatusChange(pendingStatus, metadata);
    setShowConfirmation(false);
    setPendingStatus(null);
    setCancellationReason("");
  };
  
  const handleCancel = () => {
    setShowConfirmation(false);
    setPendingStatus(null);
    setCancellationReason("");
  };
  
  const getConfirmationTitle = () => {
    switch (pendingStatus) {
      case "in_progress": return "START JOB";
      case "completed": return "MARK AS COMPLETED";
      case "cancelled": return "CANCEL JOB";
      default: return "UPDATE STATUS";
    }
  };
  
  const getConfirmationMessage = () => {
    switch (pendingStatus) {
      case "in_progress":
        return "Are you sure you want to start this job? This will notify the customer that you're on your way.";
      case "completed":
        return "Are you sure the job is complete? This will release payment from escrow after 24 hours.";
      case "cancelled":
        return "Are you sure you want to cancel this job? This may affect your completion rate.";
      default:
        return `Are you sure you want to change status to ${pendingStatus}?`;
    }
  };
  
  const hasAvailableStatuses = availableStatuses.length > 0;
  const currentMeta = STATUS_META[currentStatus] ?? STATUS_META.requested;
  
  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Current Status Display */}
        <div className="flex items-center gap-2">
          <StatusBadge status={currentStatus} />
          
          {hasAvailableStatuses && (
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoading}
              className="border px-3 py-1.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100 disabled:opacity-50"
              style={{ background: "transparent", borderColor: IK, color: IK }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
              onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}
            >
              {isLoading ? "..." : "UPDATE ▼"}
            </button>
          )}
        </div>
        
        {/* Dropdown Menu */}
        {isDropdownOpen && hasAvailableStatuses && (
          <div 
            className="absolute top-full left-0 mt-1 border shadow-lg z-40 min-w-[200px]"
            style={{ background: CR, borderColor: IK }}
          >
            {availableStatuses.map((status) => {
              const meta = STATUS_META[status.value] ?? STATUS_META.requested;
              return (
                <button
                  key={status.value}
                  onClick={() => handleStatusClick(status.value)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left border-b last:border-b-0 transition-colors duration-100"
                  style={{ borderColor: IK }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = CR_ALT; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span className="text-sm font-black" style={{ color: meta.fg === CR ? CR : C }}>
                    {meta.sym}
                  </span>
                  <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK }}>
                    {status.label}
                  </span>
                  {status.requires_confirmation && (
                    <span className="ml-auto text-2xs font-black" style={{ color: LIGHT_IK }}>⚠</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={getConfirmationTitle()}
        confirmText={pendingStatus === "cancelled" ? "CANCEL JOB" : "CONFIRM"}
        isDestructive={pendingStatus === "cancelled"}
      >
        <div className="space-y-4">
          <p className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>
            {getConfirmationMessage()}
          </p>
          
          {/* Job Summary */}
          {jobDetails.service && (
            <div className="border p-3 space-y-1" style={{ borderColor: IK, background: CR_ALT }}>
              <div className="flex justify-between">
                <span className="text-2xs font-black uppercase" style={{ color: LIGHT_IK }}>SERVICE</span>
                <span className="text-2xs font-black uppercase" style={{ color: IK }}>{jobDetails.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-2xs font-black uppercase" style={{ color: LIGHT_IK }}>CUSTOMER</span>
                <span className="text-2xs font-black uppercase" style={{ color: IK }}>{jobDetails.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-2xs font-black uppercase" style={{ color: LIGHT_IK }}>SCHEDULED</span>
                <span className="text-2xs font-black uppercase" style={{ color: IK }}>{jobDetails.scheduled}</span>
              </div>
            </div>
          )}
          
          {/* Cancellation Reason Selector */}
          {showReasonSelect && (
            <div className="space-y-2">
              <span className="text-2xs font-black uppercase tracking-superwide block" style={{ color: C }}>
                SELECT REASON *
              </span>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full border px-3 py-2.5 text-2xs font-black uppercase"
                style={{ 
                  background: CR_ALT, 
                  borderColor: !cancellationReason ? C : IK,
                  color: IK,
                }}
              >
                <option value="">SELECT A REASON</option>
                {CANCELLATION_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Location Confirmation Indicator */}
          {requireLocationConfirm && (
            <div className="flex items-center gap-2 p-3 border" style={{ borderColor: "#22C55E", background: "rgba(34,197,94,0.05)" }}>
              <span className="text-base">📍</span>
              <span className="text-2xs font-black uppercase tracking-wide" style={{ color: "#22C55E" }}>
                YOUR LOCATION WILL BE SHARED WITH THE CUSTOMER
              </span>
            </div>
          )}
        </div>
      </ConfirmationModal>
    </>
  );
}