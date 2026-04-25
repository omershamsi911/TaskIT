import { useState } from "react";
import Header from "../../common/components/Header";
import Footer from "../../common/components/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK_DATA = {
  provider: {
    id: 5,
    full_name: "BILAL AHMED",
    avatar_url: "https://cdn.taskit.pk/avatars/5.jpg",
    category: "Plumbing",
    avg_rating: 4.8,
  },
  selected_service: {
    id: 1001,
    title: "PIPE REPAIR",
    description: "Fix leaking, burst, or damaged pipes",
    pricing_type: "fixed",
    base_price: 500.00,
    estimated_hours: 1.5,
  },
  user_addresses: [
    {
      id: 1,
      label: "HOME",
      address_line1: "123 Main Street, Gulberg III",
      city: "Lahore",
      province: "Punjab",
      is_default: true,
    },
    {
      id: 2,
      label: "OFFICE",
      address_line1: "45 Business Avenue, Blue Area",
      city: "Islamabad",
      province: "ICT",
      is_default: false,
    },
  ],
  available_slots: {
    "2024-04-22": ["09:00", "11:00", "14:00", "16:00"],
    "2024-04-23": ["10:00", "13:00", "15:00", "18:00"],
    "2024-04-24": ["09:00", "12:00", "14:00", "17:00"],
    "2024-04-25": ["11:00", "13:00", "16:00", "19:00"],
  },
};

const PLATFORM_FEE_PCT = 10; // 10%


// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function BookingNew() {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("provider");
  const serviceId = searchParams.get("service");
  
  const { provider, selected_service, user_addresses, available_slots } = MOCK_DATA;
  
  // Form State
  const [selectedAddress, setSelectedAddress] = useState(
    user_addresses.find(a => a.is_default)?.id || ""
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [description, setDescription] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  // Validation State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    label: "HOME",
    address_line1: "",
    city: "",
    province: "Punjab",
  });

  // Calculations
  const serviceFee = selected_service.base_price;
  const platformFee = Math.round(serviceFee * PLATFORM_FEE_PCT) / 100;
  const total = serviceFee + platformFee;

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedAddress) newErrors.address = "Please select an address";
    if (!selectedDate) newErrors.date = "Please select a date";
    if (!selectedTime) newErrors.time = "Please select a time";
    if (!description.trim()) newErrors.description = "Please describe the issue";
    if (!paymentMethod) newErrors.payment = "Please select a payment method";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[style*="border-color: #FF5733"]');
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/bookings/12345"); // Redirect to booking detail
    }, 1500);
  };

  const handleAddAddress = () => {
    // In real app, this would call API
    console.log("New address:", newAddress);
    setShowNewAddressForm(false);
    setNewAddress({ label: "HOME", address_line1: "", city: "", province: "Punjab" });
  };

  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  const fmtPrice = (price) => `PKR ${price.toLocaleString("en-PK")}`;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PK", { 
      weekday: "short", 
      day: "2-digit", 
      month: "short" 
    }).toUpperCase();
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

  const FormField = ({ label, required, error, children }) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK }}>
          {label}
        </span>
        {required && (
          <span className="text-2xs font-black" style={{ color: C }}>*</span>
        )}
      </div>
      {children}
      {error && (
        <span className="text-2xs font-black uppercase tracking-wide" style={{ color: C }}>
          {error}
        </span>
      )}
    </div>
  );

  const DateTimeScheduler = ({ availableSlots, selectedDate, selectedTime, onDateSelect, onTimeSelect, error }) => {
    const dates = Object.keys(availableSlots);
    
    return (
      <div className="flex flex-col gap-4">
        {/* Date Selection */}
        <div>
          <span className="text-2xs font-black uppercase tracking-wide block mb-3" style={{ color: LIGHT_IK }}>
            SELECT DATE
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {dates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => {
                  onDateSelect(date);
                  onTimeSelect(null);
                }}
                className="border py-3 px-2 text-2xs font-black uppercase tracking-wide transition-colors duration-100"
                style={{
                  background: selectedDate === date ? C : "transparent",
                  borderColor: selectedDate === date ? C : IK,
                  color: selectedDate === date ? CR : IK,
                }}
                onMouseEnter={(e) => {
                  if (selectedDate !== date) {
                    e.currentTarget.style.background = CR_ALT;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDate !== date) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div>
            <span className="text-2xs font-black uppercase tracking-wide block mb-3" style={{ color: LIGHT_IK }}>
              SELECT TIME
            </span>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {availableSlots[selectedDate].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => onTimeSelect(time)}
                  className="border py-3 text-2xs font-black uppercase tracking-wide transition-colors duration-100"
                  style={{
                    background: selectedTime === time ? C : "transparent",
                    borderColor: selectedTime === time ? C : IK,
                    color: selectedTime === time ? CR : IK,
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTime !== time) {
                      e.currentTarget.style.background = CR_ALT;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTime !== time) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {error && (
          <span className="text-2xs font-black uppercase tracking-wide" style={{ color: C }}>
            {error}
          </span>
        )}
      </div>
    );
  };


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
            / PROVIDER
          </span>
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
            / {provider.full_name}
          </span>
          <span className="px-5 text-2xs font-black uppercase tracking-wide" style={{ color: IK }}>
            / BOOK
          </span>
          <div className="ml-auto py-2">
            <div
              className="inline-flex items-center gap-2 border px-3 py-1.5"
              style={{ background: IK, borderColor: IK }}
            >
              <span className="text-sm font-black leading-none" style={{ color: C }}>◎</span>
              <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: CR }}>
                NEW BOOKING
              </span>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="border-b px-6 md:px-10 py-6" style={{ borderColor: IK }}>
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="font-black uppercase leading-none mb-2"
                style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", letterSpacing: "-0.02em", color: IK }}
              >
                BOOK {provider.full_name}
              </h1>
              <p className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
                {provider.category} · ★ {provider.avg_rating}
              </p>
            </div>
            <div className="w-14 h-14 border overflow-hidden" style={{ borderColor: IK }}>
              {provider.avatar_url ? (
                <img src={provider.avatar_url} alt={provider.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: CR_ALT }}>
                  <span className="text-2xl font-black" style={{ color: IK, opacity: 0.2 }}>
                    {provider.full_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 px-6 md:px-10 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* 1. Service Confirmation */}
            <div className="border overflow-hidden" style={{ borderColor: IK }}>
              <SectionBar n="§ 001" title="SERVICE CONFIRMATION" />
              <div className="p-6" style={{ background: CR }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wide mb-2" style={{ color: IK }}>
                      {selected_service.title}
                    </h3>
                    <p className="text-2xs font-black uppercase tracking-wide mb-4" style={{ color: LIGHT_IK }}>
                      {selected_service.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span
                        className="text-2xs font-black uppercase tracking-wide px-3 py-1 border"
                        style={{ borderColor: IK, color: LIGHT_IK }}
                      >
                        {selected_service.pricing_type.toUpperCase()}
                      </span>
                      {selected_service.estimated_hours && (
                        <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
                          EST. {selected_service.estimated_hours} HRS
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-2xl font-black leading-none" style={{ color: C, letterSpacing: "-0.02em" }}>
                    {fmtPrice(selected_service.base_price)}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Address Selection */}
            <div className="border overflow-hidden" style={{ borderColor: IK }}>
              <SectionBar n="§ 002" title="DELIVERY ADDRESS" />
              <div className="p-6" style={{ background: CR }}>
                <FormField label="SELECT SAVED ADDRESS" required error={errors.address}>
                  <select
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="w-full border px-4 py-3 text-xs font-black uppercase tracking-wide appearance-none cursor-pointer transition-colors"
                    style={{ 
                      background: CR_ALT, 
                      borderColor: errors.address ? C : IK,
                      color: IK,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#e8e2d6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = CR_ALT; }}
                  >
                    <option value="">SELECT AN ADDRESS</option>
                    {user_addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} — {addr.address_line1}, {addr.city}
                      </option>
                    ))}
                  </select>
                </FormField>

                {!showNewAddressForm ? (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className="mt-4 text-2xs font-black uppercase tracking-superwide transition-colors"
                    style={{ color: C }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = IK; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = C; }}
                  >
                    + ADD NEW ADDRESS
                  </button>
                ) : (
                  <div className="mt-4 p-4 border space-y-3" style={{ borderColor: IK, background: CR_ALT }}>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        className="border px-3 py-2 text-2xs font-black uppercase"
                        style={{ background: CR, borderColor: IK }}
                      >
                        <option value="HOME">HOME</option>
                        <option value="OFFICE">OFFICE</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                      <input
                        type="text"
                        placeholder="CITY"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="border px-3 py-2 text-2xs font-black uppercase"
                        style={{ background: CR, borderColor: IK }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="STREET ADDRESS"
                      value={newAddress.address_line1}
                      onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                      className="w-full border px-3 py-2 text-2xs font-black uppercase"
                      style={{ background: CR, borderColor: IK }}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddAddress}
                        className="flex-1 py-2 text-2xs font-black uppercase tracking-superwide transition-colors"
                        style={{ background: C, color: CR }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = IK; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = C; }}
                      >
                        SAVE ADDRESS
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="flex-1 border py-2 text-2xs font-black uppercase tracking-superwide transition-colors"
                        style={{ background: "transparent", borderColor: IK, color: IK }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = CR_ALT; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Schedule Picker */}
            <div className="border overflow-hidden" style={{ borderColor: IK }}>
              <SectionBar n="§ 003" title="SCHEDULE" />
              <div className="p-6" style={{ background: CR }}>
                <DateTimeScheduler
                  availableSlots={available_slots}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateSelect={setSelectedDate}
                  onTimeSelect={setSelectedTime}
                  error={errors.date || errors.time}
                />
              </div>
            </div>

            {/* 4. Job Details */}
            <div className="border overflow-hidden" style={{ borderColor: IK }}>
              <SectionBar n="§ 004" title="JOB DETAILS" />
              <div className="p-6 space-y-4" style={{ background: CR }}>
                <FormField label="PROBLEM DESCRIPTION" required error={errors.description}>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="DESCRIBE THE ISSUE YOU NEED HELP WITH..."
                    rows={4}
                    className="w-full border px-4 py-3 text-2xs font-black uppercase tracking-wide resize-none transition-colors"
                    style={{ 
                      background: CR_ALT, 
                      borderColor: errors.description ? C : IK,
                      color: IK,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#e8e2d6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = CR_ALT; }}
                  />
                </FormField>
                
                <FormField label="SPECIAL INSTRUCTIONS (OPTIONAL)">
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="ANYTHING THE PROVIDER SHOULD KNOW?"
                    rows={2}
                    className="w-full border px-4 py-3 text-2xs font-black uppercase tracking-wide resize-none transition-colors"
                    style={{ background: CR_ALT, borderColor: IK, color: IK }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#e8e2d6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = CR_ALT; }}
                  />
                </FormField>
              </div>
            </div>

            {/* 5 & 6. Price Summary + Payment Method */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Price Summary */}
              <div className="border overflow-hidden" style={{ borderColor: IK }}>
                <SectionBar n="§ 005" title="PRICE SUMMARY" />
                <div className="p-6 space-y-3" style={{ background: CR }}>
                  <div className="flex justify-between">
                    <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
                      SERVICE FEE
                    </span>
                    <span className="text-xs font-black uppercase" style={{ color: IK }}>
                      {fmtPrice(serviceFee)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-3" style={{ borderColor: IK }}>
                    <span className="text-2xs font-black uppercase tracking-wide" style={{ color: LIGHT_IK }}>
                      PLATFORM FEE ({PLATFORM_FEE_PCT}%)
                    </span>
                    <span className="text-xs font-black uppercase" style={{ color: IK }}>
                      {fmtPrice(platformFee)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-xs font-black uppercase tracking-superwide" style={{ color: IK }}>
                      TOTAL
                    </span>
                    <span className="text-xl font-black leading-none" style={{ color: C, letterSpacing: "-0.02em" }}>
                      {fmtPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border overflow-hidden" style={{ borderColor: IK }}>
                <SectionBar n="§ 006" title="PAYMENT METHOD" />
                <div className="p-6 space-y-2" style={{ background: CR }}>
                  <FormField required error={errors.payment}>
                    <div className="space-y-2">
                      {[
                        { value: "cash", label: "CASH ON COMPLETION", icon: "💵" },
                        { value: "wallet", label: "WALLET (BALANCE: PKR 1,250)", icon: "💰" },
                        { value: "jazzcash", label: "JAZZCASH", icon: "📱" },
                        { value: "easypaisa", label: "EASYPAISA", icon: "📲" },
                      ].map((method) => (
                        <label
                          key={method.value}
                          className="flex items-center gap-3 border px-4 py-3 cursor-pointer transition-colors"
                          style={{
                            background: paymentMethod === method.value ? CR_ALT : "transparent",
                            borderColor: errors.payment ? C : IK,
                          }}
                          onMouseEnter={(e) => {
                            if (paymentMethod !== method.value) {
                              e.currentTarget.style.background = CR_ALT;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (paymentMethod !== method.value) {
                              e.currentTarget.style.background = "transparent";
                            }
                          }}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="sr-only"
                          />
                          <span className="text-base">{method.icon}</span>
                          <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: IK }}>
                            {method.label}
                          </span>
                          {paymentMethod === method.value && (
                            <span className="ml-auto text-xs font-black" style={{ color: C }}>✓</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </FormField>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-4 text-sm font-black uppercase tracking-superwide transition-all duration-100 disabled:opacity-50"
                style={{ background: C, color: CR }}
                onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = IK; }}
                onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = C; }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">◎</span>
                    PROCESSING...
                  </span>
                ) : (
                  `CONFIRM BOOKING · ${fmtPrice(total)} →`
                )}
              </button>
            </div>

          </div>
        </form>

        <Footer />
      </div>
    </div>
  );
}