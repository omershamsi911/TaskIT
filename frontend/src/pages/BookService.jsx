import { useState, useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import { createBooking } from "../handlers/bookingHandlers";
import { getWalletBalance } from "../handlers/walletHandlers";
import { useNotify } from "../context/NotificationContext";
import { Clock, MapPin, FileText, CreditCard, AlertCircle, CheckCircle, ChevronRight, ArrowLeft, Loader } from "lucide-react";

const BookService = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {notify} = useNotify();

  if (!state?.service) return <Navigate to="/services" />;

  const { service } = state;
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [checkingWallet, setCheckingWallet] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("wallet");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formData, setFormData] = useState({ 
    scheduled_at: "", 
    address: "", 
    description: "" 
  });

  const servicePrice = service.price || service.base_price || 0;
  const serviceFee = servicePrice * 0.05;
  const tax = servicePrice * 0.03;
  const totalAmount = servicePrice + serviceFee + tax;

  const hasSufficientBalance = walletBalance !== null && walletBalance >= totalAmount;

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const balance = await getWalletBalance();
        setWalletBalance(balance);
      } catch (err) {
        console.error("Failed to fetch wallet balance:", err);
      } finally {
        setCheckingWallet(false);
      }
    };
    fetchWalletBalance();
  }, []);

  const handleChange = (e) => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handlePaymentAndBooking = async (e) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      notify("Please agree to the terms and conditions.", "error");
      return;
    }

    if (selectedPaymentMethod === "wallet" && !hasSufficientBalance) {
      notify(`Insufficient wallet balance. You need Rs. ${totalAmount.toLocaleString()} but have Rs. ${walletBalance?.toLocaleString()}. Please top up your wallet.`, "error");
      return;
    }

    setLoading(true);
    try {
      await createBooking({
        provider_id: service.provider_id,
        service_id: service.id,
        address: formData.address,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
        description: formData.description,
      });
      
      notify("Payment successful! Booking confirmed.", "success");
      navigate("/my-bookings");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "";
      if (errorMsg.includes("insufficient") || errorMsg.includes("balance")) {
        notify("Payment failed: Insufficient wallet balance. Please top up and try again.", "error");
      } else {
        notify("Failed to process payment and create booking. " + errorMsg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTopUpRedirect = () => {
    navigate("/wallet");
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", fontSize: 11, fontWeight: 700, background: T.CR_ALT,
    border: `1px solid ${T.IK}`, color: T.IK, outline: "none", transition: "border-color 0.1s",
    letterSpacing: "0.05em",
  };
  
  const labelStyle = { 
    fontSize: 10, fontWeight: 900, textTransform: "uppercase", 
    letterSpacing: "0.15em", color: T.LIGHT_IK, marginBottom: 6, display: "block" 
  };

  const priceRowStyle = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 0", borderBottom: `1px solid ${T.IK}20`,
  };

  if (checkingWallet) {
    return (
      <SharedLayout>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "80px 20px", textAlign: "center", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Loader size={36} style={{ color: T.C, animation: "spin 1s linear infinite" }} />
            <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>
              CHECKING WALLET BALANCE...
            </div>
          </div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: T.IK, borderBottom: `1px solid ${T.IK}` }}>
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>BOOKING & PAYMENT</span>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: T.CR, padding: "4px 12px", background: T.C, color: T.CR, borderRadius: 2 }}>SECURE CHECKOUT</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, "@media (max-width: 1024px)": { gridTemplateColumns: "1fr" } }}>
        <style>{`
          @media (max-width: 1024px) {
            .booking-sidebar { order: -1; }
          }
        `}</style>
        
        <div>
          <div style={{ border: `1px solid ${T.IK}`, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", background: T.IK, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle size={16} style={{ color: T.C }} />
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>SERVICE SUMMARY</span>
            </div>
            <div style={{ padding: "24px 20px", background: T.CR }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: T.IK, margin: "0 0 10px", lineHeight: 1.3 }}>{service.title}</h3>
              <p style={{ fontSize: 11, fontWeight: 500, color: T.LIGHT_IK, margin: 0, lineHeight: 1.6 }}>{service.description || "Professional service with quality assurance"}</p>
            </div>
          </div>

          <div style={{ border: `1px solid ${T.IK}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", background: T.IK, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={16} style={{ color: T.C }} />
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>BOOKING DETAILS</span>
            </div>
            <form onSubmit={handlePaymentAndBooking} style={{ padding: "24px 20px", background: T.CR, display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={labelStyle}>Date & Time <span style={{ color: T.C }}>*</span></label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: T.CR_ALT, border: `1px solid ${T.IK}`, borderRadius: 4 }}>
                  <Clock size={16} style={{ color: T.LIGHT_IK, flexShrink: 0 }} />
                  <input 
                    type="datetime-local" 
                    name="scheduled_at" 
                    required 
                    onChange={handleChange} 
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.IK, fontSize: 11, fontWeight: 700 }}
                    onFocus={e => { e.target.parentElement.style.borderColor = T.C; }}
                    onBlur={e => { e.target.parentElement.style.borderColor = T.IK; }} 
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Full Address <span style={{ color: T.C }}>*</span></label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: T.CR_ALT, border: `1px solid ${T.IK}`, borderRadius: 4 }}>
                  <MapPin size={16} style={{ color: T.LIGHT_IK, flexShrink: 0 }} />
                  <input 
                    type="text" 
                    name="address" 
                    required 
                    placeholder="House 12, Street 4, F-8/4" 
                    onChange={handleChange} 
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.IK, fontSize: 11, fontWeight: 700 }}
                    onFocus={e => { e.target.parentElement.style.borderColor = T.C; }}
                    onBlur={e => { e.target.parentElement.style.borderColor = T.IK; }} 
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Job Description (Optional)</label>
                <textarea 
                  name="description" 
                  rows="3" 
                  placeholder="Describe what you need done..." 
                  onChange={handleChange}
                  style={{ width: "100%", padding: "12px 16px", fontSize: 11, fontWeight: 700, background: T.CR_ALT, border: `1px solid ${T.IK}`, borderRadius: 4, color: T.IK, outline: "none", transition: "border-color 0.1s", resize: "none", fontFamily: "inherit" }}
                  onFocus={e => { e.target.style.borderColor = T.C; }}
                  onBlur={e => { e.target.style.borderColor = T.IK; }} 
                />
              </div>
            </form>
          </div>
        </div>

        <div className="booking-sidebar">
          <div style={{ border: `1px solid ${T.IK}`, overflow: "hidden", position: "sticky", top: 100 }}>
            <div style={{ padding: "16px 20px", background: T.IK, display: "flex", alignItems: "center", gap: 8 }}>
              <CreditCard size={16} style={{ color: T.C }} />
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>PAYMENT SUMMARY</span>
            </div>
            
            <div style={{ padding: "20px", background: T.CR }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.IK}20` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.LIGHT_IK }}>Service Price</span>
                <span style={{ fontSize: 12, fontWeight: 900, color: T.IK }}>Rs. {servicePrice.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.IK}20` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.LIGHT_IK }}>Service Fee (5%)</span>
                <span style={{ fontSize: 12, fontWeight: 900, color: T.IK }}>Rs. {serviceFee.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `2px solid ${T.IK}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.LIGHT_IK }}>Tax (3%)</span>
                <span style={{ fontSize: 12, fontWeight: 900, color: T.IK }}>Rs. {tax.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", marginTop: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: T.C }}>TOTAL</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: T.C }}>Rs. {totalAmount.toLocaleString()}</span>
              </div>

              <div style={{ 
                marginTop: 20, padding: "16px", background: hasSufficientBalance ? "#28c76f12" : "#ea545512",
                borderRadius: 4, border: `1px solid ${hasSufficientBalance ? "#28c76f50" : "#ea545550"}`, display: "flex", alignItems: "center", gap: 12
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: T.LIGHT_IK, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    WALLET BALANCE
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: hasSufficientBalance ? "#28c76f" : "#ea5455" }}>
                    Rs. {walletBalance?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  {hasSufficientBalance ? (
                    <CheckCircle size={28} style={{ color: "#28c76f" }} />
                  ) : (
                    <AlertCircle size={28} style={{ color: "#ea5455" }} />
                  )}
                </div>
              </div>
              {!hasSufficientBalance && (
                <button
                  type="button"
                  onClick={handleTopUpRedirect}
                  style={{
                    marginTop: 12, width: "100%", padding: "10px", fontSize: 9,
                    fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                    background: T.C, color: T.CR, border: "none", cursor: "pointer", borderRadius: 4, transition: "all 0.1s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  TOP UP WALLET
                </button>
              )}

              <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${T.IK}20` }}>
                <label style={labelStyle}>Payment Method</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 12px", background: selectedPaymentMethod === "wallet" ? T.IK + "20" : "transparent", borderRadius: 4, transition: "all 0.1s" }}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="wallet"
                      checked={selectedPaymentMethod === "wallet"}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.IK }}>WALLET BALANCE</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "not-allowed", padding: "10px 12px", opacity: 0.5 }}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="card"
                      disabled
                      style={{ cursor: "not-allowed" }}
                    />
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.LIGHT_IK }}>CARD (COMING SOON)</span>
                  </label>
                </div>
              </div>

              <div style={{ marginTop: 16, padding: "12px 12px", background: T.IK + "10", borderRadius: 4, borderLeft: `3px solid ${T.C}` }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                  <input 
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ cursor: "pointer", marginTop: 3, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 9, fontWeight: 700, color: T.LIGHT_IK, letterSpacing: "0.04em", lineHeight: 1.5 }}>
                    I agree to the <span style={{ color: T.C, textDecoration: "underline", cursor: "pointer" }}>Terms of Service</span> and confirm sufficient balance
                  </span>
                </label>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
                <button 
                  type="submit"
                  onClick={handlePaymentAndBooking}
                  disabled={loading || !agreeTerms || (selectedPaymentMethod === "wallet" && !hasSufficientBalance)}
                  style={{
                    width: "100%", padding: "14px", fontSize: 10, fontWeight: 900,
                    textTransform: "uppercase", letterSpacing: "0.12em",
                    background: (loading || !agreeTerms || (selectedPaymentMethod === "wallet" && !hasSufficientBalance)) ? T.LIGHT_IK : T.C,
                    color: T.CR, border: "none", cursor: (loading || !agreeTerms || (selectedPaymentMethod === "wallet" && !hasSufficientBalance)) ? "not-allowed" : "pointer",
                    transition: "all 0.15s", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: (loading || !agreeTerms || (selectedPaymentMethod === "wallet" && !hasSufficientBalance)) ? 0.6 : 1
                  }}
                >
                  {loading ? (
                    <>
                      <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
                      PROCESSING
                    </>
                  ) : (
                    <>
                      CONFIRM BOOKING
                      <ChevronRight size={14} />
                    </>
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => navigate(-1)}
                  style={{
                    width: "100%", padding: "12px", fontSize: 9, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.12em",
                    border: `1px solid ${T.IK}`, background: "transparent",
                    color: T.IK, cursor: "pointer", transition: "all 0.1s", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.IK; e.currentTarget.style.color = T.CR; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.IK; }}
                >
                  <ArrowLeft size={12} />
                  BACK
                </button>
              </div>

              {selectedPaymentMethod === "wallet" && !hasSufficientBalance && !loading && (
                <div style={{
                  marginTop: 12, padding: "12px", background: "#ea545520", borderRadius: 4,
                  fontSize: 9, fontWeight: 700, color: "#ea5455", textAlign: "center",
                  textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  Insufficient balance. Top up to continue.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default BookService;
