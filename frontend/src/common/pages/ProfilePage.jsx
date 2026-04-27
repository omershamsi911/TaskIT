import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from "../../../handlers/users";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const C  = "#FF5733";
const CR  = "#F5F0E6";
const IK    = "#1A1A1A";

// Derived colors
const getAltBackground = () => {
  const r = parseInt(CR.slice(1,3), 16);
  const g = parseInt(CR.slice(3,5), 16);
  const b = parseInt(CR.slice(5,7), 16);
  return `rgb(${Math.max(0, r-12)}, ${Math.max(0, g-12)}, ${Math.max(0, b-12)})`;
};

const getLightInk = () => {
  const r = parseInt(IK.slice(1,3), 16);
  const g = parseInt(IK.slice(3,5), 16);
  const b = parseInt(IK.slice(5,7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.4)`;
};

const CR_ALT = getAltBackground();
const LIGHT_IK = getLightInk();

// ─── ROLE CONFIG ──────────────────────────────────────────────────────────────
const ROLE_META = {
  customer: { label: "CUSTOMER",         sym: "◎", bg: IK, fg: CR, accent: CR },
  provider: { label: "SERVICE PROVIDER", sym: "◆", bg: C,  fg: CR, accent: CR },
  both:     { label: "PROVIDER + USER",  sym: "◈", bg: IK, fg: C,  accent: C  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso)
    .toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
};

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

const VerifyPill = ({ ok, label }) => (
  <span
    className="inline-flex items-center gap-1.5 border text-2xs font-black uppercase tracking-wide px-2 py-0.5"
    style={{
      borderColor: ok ? C : LIGHT_IK,
      color:       ok ? C : LIGHT_IK,
      background:  "transparent",
    }}
  >
    <span>{ok ? "✓" : "✗"}</span>
    {label}
  </span>
);

const RoleBadge = ({ role }) => {
  const m = ROLE_META[role] ?? ROLE_META.customer;
  return (
    <div
      className="inline-flex items-center gap-2 border border-ink px-3 py-1.5"
      style={{ background: m.bg, borderColor: IK }}
    >
      <span className="text-sm font-black leading-none" style={{ color: m.accent }}>{m.sym}</span>
      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: m.fg }}>
        {m.label}
      </span>
    </div>
  );
};

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
    <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />
    <div className="relative z-10 flex flex-col min-h-screen">
      <Header />
      <div className="flex items-center justify-center py-32">
        <span className="animate-spin text-3xl font-black" style={{ color: C }}>◎</span>
        <span className="ml-3 text-xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
          LOADING PROFILE...
        </span>
      </div>
      <Footer />
    </div>
  </div>
);

// ─── ERROR STATE ──────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
    <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />
    <div className="relative z-10 flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center border p-10" style={{ borderColor: C }}>
          <span className="text-6xl font-black block mb-4" style={{ color: C }}>!</span>
          <p className="text-xs font-black uppercase tracking-superwide mb-2" style={{ color: IK }}>
            FAILED TO LOAD PROFILE
          </p>
          <p className="text-2xs font-black uppercase tracking-wide mb-6" style={{ color: LIGHT_IK }}>
            {message}
          </p>
          <button
            onClick={onRetry}
            className="border px-6 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
            style={{ background: C, color: CR, borderColor: C }}
            onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.borderColor = IK; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.borderColor = C; }}
          >
            RETRY →
          </button>
        </div>
      </div>
      <Footer />
    </div>
  </div>
);

// ─── EDIT ADDRESS MODAL ───────────────────────────────────────────────────────
const EditAddressModal = ({ isOpen, onClose, onSave, address, isNew = false }) => {
  const [form, setForm] = useState({
    label: address?.label || "Home",
    address_line1: address?.address_line1 || "",
    address_line2: address?.address_line2 || "",
    city: address?.city || "",
    province: address?.province || "",
    lat: address?.lat || 31.5204,
    lng: address?.lng || 74.3587,
    is_default: address?.is_default || false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (address) {
      setForm({
        label: address.label || "Home",
        address_line1: address.address_line1 || "",
        address_line2: address.address_line2 || "",
        city: address.city || "",
        province: address.province || "",
        lat: address.lat || 31.5204,
        lng: address.lng || 74.3587,
        is_default: address.is_default || false,
      });
    }
  }, [address]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error("Failed to save address:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(26, 26, 26, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full border shadow-lg"
        style={{ background: CR, borderColor: IK }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: IK, borderColor: IK }}>
          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
            {isNew ? "ADD ADDRESS" : "EDIT ADDRESS"}
          </span>
          <button onClick={onClose} className="text-sm font-black transition-colors" style={{ color: CR }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = CR; }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" style={{ background: CR }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>LABEL</label>
              <select
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full border px-3 py-2.5 text-2xs font-black uppercase"
                style={{ background: CR_ALT, borderColor: IK, color: IK }}
              >
                <option value="Home">HOME</option>
                <option value="Office">OFFICE</option>
                <option value="Other">OTHER</option>
              </select>
            </div>
            <div>
              <label className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>CITY</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border px-3 py-2.5 text-2xs font-black uppercase"
                style={{ background: CR_ALT, borderColor: IK, color: IK }}
                placeholder="LAHORE"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>ADDRESS LINE 1</label>
            <input
              type="text"
              value={form.address_line1}
              onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
              className="w-full border px-3 py-2.5 text-2xs font-black uppercase"
              style={{ background: CR_ALT, borderColor: IK, color: IK }}
              placeholder="STREET ADDRESS"
              required
            />
          </div>

          <div>
            <label className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>ADDRESS LINE 2 (OPTIONAL)</label>
            <input
              type="text"
              value={form.address_line2}
              onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
              className="w-full border px-3 py-2.5 text-2xs font-black uppercase"
              style={{ background: CR_ALT, borderColor: IK, color: IK }}
              placeholder="LANDMARK, AREA"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-black uppercase tracking-superwide block mb-1" style={{ color: LIGHT_IK }}>PROVINCE</label>
              <select
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                className="w-full border px-3 py-2.5 text-2xs font-black uppercase"
                style={{ background: CR_ALT, borderColor: IK, color: IK }}
              >
                <option value="Punjab">PUNJAB</option>
                <option value="Sindh">SINDH</option>
                <option value="KPK">KPK</option>
                <option value="Balochistan">BALOCHISTAN</option>
                <option value="ICT">ICT</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="w-4 h-4"
                  style={{ accentColor: C }}
                />
                <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK }}>
                  SET AS DEFAULT
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors"
              style={{ background: "transparent", borderColor: IK, color: IK }}
              onMouseEnter={(e) => { e.currentTarget.style.background = CR_ALT; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: C, color: CR }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = IK; }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = C; }}
            >
              {saving ? (
                <>
                  <span className="animate-spin text-sm">◎</span>
                  SAVING...
                </>
              ) : (
                isNew ? "ADD ADDRESS" : "SAVE CHANGES"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("PROFILE");
  const [editModal, setEditModal] = useState({ isOpen: false, address: null, isNew: false });

  const isProvider = user?.role === "provider" || user?.role === "both";
  const meta = ROLE_META[user?.role] ?? ROLE_META.customer;

  const TABS = isProvider
    ? ["PROFILE", "ACTIVITY", "EARNINGS", "SETTINGS"]
    : ["PROFILE", "ACTIVITY", "SETTINGS"];

  // ── Load profile from localStorage ────────────────────────────────────────
  const loadProfileData = () => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem("user");
      if (!stored) {
        throw new Error("No user data found in local storage");
      }
      const userData = JSON.parse(stored);
      setUser(userData);

      // Addresses still come from the handler; ignore any error silently
      fetchAddresses()
        .then((data) => setAddresses(data))
        .catch(() => console.warn("Addresses could not be fetched"));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  // ── Address handlers (unchanged) ──────────────────────────────────────────
  const handleSaveAddress = async (formData) => {
    if (editModal.isNew) {
      const newAddr = await addAddress(formData);
      setAddresses((prev) => [...prev, newAddr]);
    } else {
      const updated = await updateAddress(editModal.address.id, formData);
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === updated.id ? updated : addr))
      );
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    await deleteAddress(addressId);
    setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
  };

  const handleSetDefault = async (addressId) => {
    await setDefaultAddress(addressId);
    setAddresses((prev) =>
      prev.map((addr) => ({ ...addr, is_default: addr.id === addressId }))
    );
  };

  const openEditModal = (address = null) => {
    setEditModal({ isOpen: true, address, isNew: !address });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, address: null, isNew: false });
  };

  // ── Rendering ─────────────────────────────────────────────────────────────
  if (isLoading) return <LoadingSkeleton />;
  if (error || !user) {
    return <ErrorState message={error || "User data not available"} onRetry={loadProfileData} />;
  }

  return (
    <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* Breadcrumb */}
        <div className="flex items-center border-b px-6" style={{ background: CR, borderColor: IK }}>
          <span className="py-3 pr-5 border-r text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK, borderColor: IK }}>
            ACCOUNT
          </span>
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
            / MY PROFILE
          </span>
          <div className="ml-auto py-2">
            <RoleBadge role={user.role} />
          </div>
        </div>

        {/* HERO */}
        <div className="border-b" style={{ background: CR, borderColor: IK }}>
          <div className="grid lg:grid-cols-12">
            {/* Avatar */}
            <div
              className="lg:col-span-3 border-r flex items-center justify-center relative overflow-hidden"
              style={{ minHeight: 230, background: CR_ALT, borderColor: IK }}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full object-cover absolute inset-0"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <span className="text-9xl font-black select-none" style={{ color: IK, opacity: 0.05 }}>
                  {meta.sym}
                </span>
              )}
              <div
                className="absolute bottom-0 left-0 right-0 border-t flex items-center gap-2 px-4 py-2"
                style={{ background: meta.bg, borderColor: IK }}
              >
                <span className="text-xs font-black" style={{ color: meta.accent }}>{meta.sym}</span>
                <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: meta.fg }}>
                  {meta.label}
                </span>
              </div>
            </div>

            {/* Name + contact */}
            <div className="lg:col-span-6 border-r px-8 py-8 flex flex-col justify-between gap-6" style={{ borderColor: IK }}>
              <div className="flex flex-col gap-4">
                <h1
                  className="font-black uppercase leading-none"
                  style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)", letterSpacing: "-0.02em", color: IK }}
                >
                  {user.full_name}
                </h1>

                <div className="flex flex-col gap-2">
                  {/* Email */}
                  <div className="flex items-center justify-between border px-4 py-3" style={{ background: CR_ALT, borderColor: IK }}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>EMAIL</span>
                      <span className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>{user.email}</span>
                    </div>
                    <VerifyPill ok={user.is_email_verified} label={user.is_email_verified ? "VERIFIED" : "UNVERIFIED"} />
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between border px-4 py-3" style={{ background: CR_ALT, borderColor: IK }}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>PHONE</span>
                      <span className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>{user.phone}</span>
                    </div>
                    <VerifyPill ok={user.is_phone_verified} label={user.is_phone_verified ? "VERIFIED" : "UNVERIFIED"} />
                  </div>
                </div>

                {/* Meta info – only shown if data exists */}
                <div className="flex flex-wrap gap-x-5 gap-y-1 pt-1">
                  <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
                    ID #{user.id}
                  </span>
                  {user.created_at && (
                    <>
                      <span style={{ color: LIGHT_IK }}>·</span>
                      <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
                        MEMBER SINCE {fmtDate(user.created_at)}
                      </span>
                    </>
                  )}
                  {user.status && (
                    <>
                      <span style={{ color: LIGHT_IK }}>·</span>
                      <span className="text-2xs font-black uppercase tracking-wide" style={{ color: user.status === "active" ? "#22C55E" : C }}>
                        {user.status.toUpperCase()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Wallet & Points – only shown if data present */}
              <div className="flex items-center justify-between border-t pt-5" style={{ borderColor: IK }}>
                <div className="flex items-center gap-6">
                  {user.wallet_balance != null && (
                    <div>
                      <p className="text-2xs font-black uppercase tracking-wide mb-1" style={{ color: LIGHT_IK }}>WALLET BALANCE</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black tabular-nums leading-none" style={{ color: C, letterSpacing: "-0.04em" }}>
                          PKR {user.wallet_balance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  {user.loyalty_points != null && (
                    <>
                      {user.wallet_balance != null && <span style={{ color: LIGHT_IK }}>·</span>}
                      <div>
                        <p className="text-2xs font-black uppercase tracking-wide mb-1" style={{ color: LIGHT_IK }}>LOYALTY POINTS</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black tabular-nums leading-none" style={{ color: C, letterSpacing: "-0.04em" }}>
                            {user.loyalty_points.toLocaleString()}
                          </span>
                          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>PTS</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <button
                  className="border px-5 py-2.5 text-2xs font-black uppercase tracking-superwide transition-colors duration-100"
                  style={{ background: CR, color: IK, borderColor: IK }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; }}
                >
                  EDIT PROFILE →
                </button>
              </div>
            </div>

            {/* Stats column */}
            <div className="lg:col-span-3 flex flex-col divide-y border-t lg:border-t-0" style={{ borderColor: IK }}>
              {[
                { label: "EMAIL STATUS",    val: user.is_email_verified ? "VERIFIED" : "PENDING", accent: user.is_email_verified },
                { label: "PHONE STATUS",    val: user.is_phone_verified ? "VERIFIED" : "PENDING", accent: user.is_phone_verified },
                { label: "ACCOUNT STATUS",  val: (user.status || "ACTIVE").toUpperCase(),         accent: user.status === "active" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="flex-1 flex flex-col justify-center px-6 py-6"
                  style={{ background: i % 2 === 0 ? CR : CR_ALT }}
                >
                  <span
                    className="text-xl font-black leading-none mb-1 tabular-nums"
                    style={{ color: s.accent ? "#22C55E" : C, letterSpacing: "-0.03em" }}
                  >
                    {s.val}
                  </span>
                  <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
                    {s.label}
                  </span>
                </div>
              ))}
              {isProvider ? (
                <Link
                  to="/provider/jobs"
                  className="flex items-center justify-between px-6 py-4 border-t transition-colors duration-100 no-underline"
                  style={{ background: C, color: CR, borderColor: IK }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = IK; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = C; }}
                >
                  <span className="text-2xs font-black uppercase tracking-superwide">MY JOBS</span>
                  <span className="text-sm font-black">→</span>
                </Link>
              ) : (
                <button
                  className="flex flex-col items-start justify-center px-6 py-5 border-t transition-colors duration-100"
                  style={{ background: CR, borderColor: IK }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; }}
                >
                  <span className="text-2xs font-black uppercase tracking-wide mb-0.5" style={{ color: C }}>◆ BECOME A PROVIDER</span>
                  <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>START EARNING TODAY →</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab bar */}
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
              UID-{String(user.id).padStart(6, "0")}
            </span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 px-6 md:px-10 py-8 flex flex-col gap-8">
          {activeTab === "PROFILE" && (
            <>
              {/* Personal info */}
              <div className="border overflow-hidden" style={{ borderColor: IK }}>
                <SectionBar n="§ 001" title="PERSONAL INFORMATION" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "FULL NAME",    val: user.full_name },
                    { label: "ACCOUNT ID",   val: `#${user.id}` },
                    ...(user.created_at ? [{ label: "MEMBER SINCE", val: fmtDate(user.created_at) }] : []),
                    { label: "ROLE",         val: user.role?.toUpperCase(), hi: true },
                    { label: "EMAIL STATUS", val: user.is_email_verified ? "VERIFIED" : "UNVERIFIED", hi: user.is_email_verified },
                    { label: "PHONE STATUS", val: user.is_phone_verified ? "VERIFIED" : "UNVERIFIED", hi: user.is_phone_verified },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      className="px-6 py-5 border-r border-b last:border-r-0"
                      style={{
                        background: i % 2 === 0 ? CR : CR_ALT,
                        borderColor: IK
                      }}
                    >
                      <p className="text-2xs font-black uppercase tracking-superwide mb-2" style={{ color: LIGHT_IK }}>
                        {item.label}
                      </p>
                      <p className="text-xs font-black uppercase tracking-wide" style={{ color: item.hi ? C : IK }}>
                        {item.val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved addresses */}
              <div className="border overflow-hidden" style={{ borderColor: IK }}>
                <SectionBar n="§ 002" title={`SAVED ADDRESSES (${addresses.length})`} />
                <div className="grid md:grid-cols-2">
                  {addresses.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-16">
                      <span className="text-6xl font-black mb-4" style={{ color: IK, opacity: 0.06 }}>⌖</span>
                      <span className="text-xs font-black uppercase tracking-superwide mb-2" style={{ color: IK }}>NO ADDRESSES SAVED</span>
                      <span className="text-2xs font-black uppercase tracking-wide mb-4" style={{ color: LIGHT_IK }}>
                        ADD YOUR FIRST ADDRESS TO GET STARTED
                      </span>
                    </div>
                  )}
                  {addresses.map((addr, i) => (
                    <div
                      key={addr.id}
                      className="relative px-6 py-6 border-r border-b last:border-r-0"
                      style={{
                        background: i % 2 === 0 ? CR : CR_ALT,
                        borderColor: IK
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>
                          {addr.label}
                        </span>
                        {addr.is_default && (
                          <span
                            className="border text-2xs font-black uppercase tracking-wide px-1.5 py-0.5"
                            style={{ borderColor: C, color: C }}
                          >
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: IK }}>
                        {addr.address_line1}
                      </p>
                      {addr.address_line2 && (
                        <p className="text-2xs font-black uppercase tracking-wide mb-1" style={{ color: LIGHT_IK }}>
                          {addr.address_line2}
                        </p>
                      )}
                      <p className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
                        {addr.city}, {addr.province}
                      </p>
                      <p className="text-2xs font-black mt-3 tabular-nums" style={{ color: LIGHT_IK }}>
                        ⌖ {addr.lat?.toFixed(4)}, {addr.lng?.toFixed(4)}
                      </p>
                      <div className="absolute top-4 right-5 flex items-center gap-3">
                        {!addr.is_default && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="text-2xs font-black uppercase tracking-wide transition-colors"
                            style={{ color: LIGHT_IK }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = C; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = LIGHT_IK; }}
                          >
                            SET DEFAULT
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(addr)}
                          className="text-2xs font-black uppercase tracking-wide transition-colors"
                          style={{ color: C }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = IK; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = C; }}
                        >
                          EDIT →
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-2xs font-black uppercase tracking-wide transition-colors"
                          style={{ color: LIGHT_IK }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = C; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = LIGHT_IK; }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => openEditModal(null)}
                    className="flex items-center justify-center gap-2 px-6 py-6 border-r border-b transition-colors duration-100"
                    style={{ background: CR, borderColor: IK, minHeight: 120 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; }}
                  >
                    <span className="text-2xl font-black" style={{ color: C }}>+</span>
                    <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK }}>
                      ADD ADDRESS
                    </span>
                  </button>
                </div>
              </div>

              {/* Wallet & Loyalty (only when data exists) */}
              <div className="grid grid-cols-2 gap-8">
                {user.wallet_balance != null && (
                  <div className="border overflow-hidden" style={{ borderColor: IK }}>
                    <SectionBar n="§ 003" title="WALLET" />
                    <div className="p-6" style={{ background: CR }}>
                      <span className="text-2xs font-black uppercase tracking-superwide block mb-2" style={{ color: LIGHT_IK }}>
                        CURRENT BALANCE
                      </span>
                      <span className="text-4xl font-black leading-none" style={{ color: C, letterSpacing: "-0.03em" }}>
                        PKR {user.wallet_balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
                {user.loyalty_points != null && (
                  <div className="border overflow-hidden" style={{ borderColor: IK }}>
                    <SectionBar n="§ 004" title="LOYALTY POINTS" />
                    <div className="p-6" style={{ background: CR }}>
                      <span className="text-2xs font-black uppercase tracking-superwide block mb-2" style={{ color: LIGHT_IK }}>
                        AVAILABLE POINTS
                      </span>
                      <span className="text-4xl font-black leading-none" style={{ color: C, letterSpacing: "-0.03em" }}>
                        {user.loyalty_points.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
                {/* If neither wallet nor points exist, the grid will be empty */}
              </div>
            </>
          )}

          {activeTab === "ACTIVITY" && (
            <div className="border overflow-hidden" style={{ borderColor: IK }}>
              <SectionBar n="§ 001" title="RECENT ACTIVITY" />
              <div className="flex flex-col items-center justify-center py-20" style={{ background: CR }}>
                <span className="text-8xl font-black mb-4" style={{ color: IK, opacity: 0.05 }}>◎</span>
                <span className="text-xs font-black uppercase tracking-superwide mb-2" style={{ color: IK }}>
                  ACTIVITY FEED COMING SOON
                </span>
                <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
                  YOUR RECENT BOOKINGS AND TRANSACTIONS WILL APPEAR HERE
                </span>
              </div>
            </div>
          )}

          {activeTab === "EARNINGS" && isProvider && (
            <div className="border overflow-hidden" style={{ borderColor: IK }}>
              <SectionBar n="§ 001" title="EARNINGS OVERVIEW" />
              <div className="flex flex-col items-center justify-center py-20" style={{ background: CR }}>
                <span className="text-8xl font-black mb-4" style={{ color: IK, opacity: 0.05 }}>◆</span>
                <span className="text-xs font-black uppercase tracking-superwide mb-2" style={{ color: IK }}>
                  EARNINGS DASHBOARD
                </span>
                <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
                  VISIT PROVIDER DASHBOARD FOR DETAILED EARNINGS
                </span>
              </div>
            </div>
          )}

          {activeTab === "SETTINGS" && (
            <>
              <div className="border overflow-hidden" style={{ borderColor: IK }}>
                <SectionBar n="§ 001" title="ACCOUNT SETTINGS" />
                <div className="flex flex-col">
                  {[
                    { label: "CHANGE PASSWORD",          sub: "Update your login password"             },
                    { label: "NOTIFICATION PREFERENCES", sub: "Push, email, and SMS preferences"       },
                    { label: "PAYMENT METHODS",          sub: "JazzCash, EasyPaisa, Bank transfer"     },
                    { label: "LANGUAGE & CURRENCY",      sub: "Urdu / English · PKR"                   },
                    ...(isProvider ? [
                      { label: "KYC / CNIC VERIFICATION", sub: "Upload CNIC front, back & selfie"     },
                    ] : []),
                  ].map((item, i) => (
                    <button
                      key={item.label}
                      className="flex items-center justify-between px-8 py-5 border-b last:border-b-0 text-left transition-colors duration-100"
                      style={{
                        background: i % 2 === 0 ? CR : CR_ALT,
                        borderColor: IK
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? CR : CR_ALT; e.currentTarget.style.color = IK; }}
                    >
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>{item.label}</p>
                        <p className="text-2xs font-black uppercase tracking-wide mt-0.5" style={{ color: LIGHT_IK }}>{item.sub}</p>
                      </div>
                      <span className="text-sm font-black shrink-0" style={{ color: C }}>→</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border overflow-hidden" style={{ borderColor: IK }}>
                <SectionBar n="§ 002" title="DANGER ZONE" />
                <div className="flex flex-col md:flex-row">
                  <button
                    className="flex-1 flex items-center justify-between px-8 py-5 border-b md:border-b-0 md:border-r transition-colors duration-100"
                    style={{ background: CR, borderColor: IK }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = IK; e.currentTarget.style.color = CR; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; }}
                  >
                    <span className="text-xs font-black uppercase tracking-wide" style={{ color: IK }}>DEACTIVATE ACCOUNT</span>
                    <span style={{ color: C }}>→</span>
                  </button>
                  <button
                    className="flex-1 flex items-center justify-between px-8 py-5 transition-colors duration-100"
                    style={{ background: CR }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = C; e.currentTarget.style.color = IK; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = CR; e.currentTarget.style.color = IK; }}
                  >
                    <span className="text-xs font-black uppercase tracking-wide" style={{ color: C }}>DELETE ACCOUNT PERMANENTLY</span>
                    <span style={{ color: C }}>→</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <EditAddressModal
          isOpen={editModal.isOpen}
          onClose={closeEditModal}
          onSave={handleSaveAddress}
          address={editModal.address}
          isNew={editModal.isNew}
        />

        <Footer />
      </div>
    </div>
  );
}