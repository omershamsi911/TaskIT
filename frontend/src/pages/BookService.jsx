import { useState, useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import { createBooking } from "../handlers/bookingHandlers";
import { getWalletBalance } from "../handlers/walletHandlers";

const BookService = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

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
      alert("Please agree to the terms and conditions.");
      return;
    }

    if (selectedPaymentMethod === "wallet" && !hasSufficientBalance) {
      alert(`Insufficient wallet balance. You need Rs. ${totalAmount.toLocaleString()} but have Rs. ${walletBalance?.toLocaleString()}. Please top up your wallet.`);
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
      
      alert("Payment successful! Booking confirmed.");
      navigate("/my-bookings");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "";
      if (errorMsg.includes("insufficient") || errorMsg.includes("balance")) {
        alert("Payment failed: Insufficient wallet balance. Please top up and try again.");
      } else {
        alert("Failed to process payment and create booking. " + errorMsg);
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
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>
            CHECKING WALLET BALANCE...
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", background: T.IK, borderBottom: `1px solid ${T.IK}` }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>CHECKOUT</span>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.CR }}>COMPLETE PAYMENT</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 32px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>
        
        <div>
          <div style={{ border: `1px solid ${T.IK}`, marginBottom: 32, overflow: "hidden" }}>
            <div style={{ padding: "12px 24px", background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>SERVICE SUMMARY</span>
              <span style={{ fontSize: 10, fontWeight: 900, color: T.CR, opacity: 0.4 }}>§ 001</span>
            </div>
            <div style={{ padding: "20px 24px", background: T.CR }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: T.IK, margin: "0 0 8px" }}>{service.title}</h3>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.LIGHT_IK, margin: 0 }}>{service.description || "Professional service with quality assurance"}</p>
            </div>
          </div>

          <div style={{ border: `1px solid ${T.IK}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 24px", background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>BOOKING DETAILS</span>
              <span style={{ fontSize: 10, fontWeight: 900, color: T.CR, opacity: 0.4 }}>§ 002</span>
            </div>
            <form onSubmit={handlePaymentAndBooking} style={{ padding: 28, background: T.CR, display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <label style={labelStyle}>Date & Time <span style={{ color: T.C }}>*</span></label>
                <input 
                  type="datetime-local" 
                  name="scheduled_at" 
                  required 
                  onChange={handleChange} 
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = T.C; }}
                  onBlur={e => { e.target.style.borderColor = T.IK; }} 
                />
              </div>
              <div>
                <label style={labelStyle}>Full Address <span style={{ color: T.C }}>*</span></label>
                <input 
                  type="text" 
                  name="address" 
                  required 
                  placeholder="E.g., House 12, Street 4, F-8/4, Islamabad" 
                  onChange={handleChange} 
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = T.C; }}
                  onBlur={e => { e.target.style.borderColor = T.IK; }} 
                />
              </div>
              <div>
                <label style={labelStyle}>Job Description (Optional)</label>
                <textarea 
                  name="description" 
                  rows="4" 
                  placeholder="Describe exactly what you need done..." 
                  onChange={handleChange}
                  style={{ ...inputStyle, resize: "none" }}
                  onFocus={e => { e.target.style.borderColor = T.C; }}
                  onBlur={e => { e.target.style.borderColor = T.IK; }} 
                />
              </div>
            </form>
          </div>
        </div>

        <div>
          <div style={{ border: `1px solid ${T.IK}`, overflow: "hidden", position: "sticky", top: 32 }}>
            <div style={{ padding: "12px 24px", background: T.IK }}>
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>PAYMENT SUMMARY</span>
            </div>
            
            <div style={{ padding: "24px", background: T.CR }}>
              <div style={priceRowStyle}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.LIGHT_IK }}>Service Price</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: T.IK }}>Rs. {servicePrice.toLocaleString()}</span>
              </div>
              <div style={priceRowStyle}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.LIGHT_IK }}>Service Fee (5%)</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: T.IK }}>Rs. {serviceFee.toLocaleString()}</span>
              </div>
              <div style={priceRowStyle}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.LIGHT_IK }}>Tax (3%)</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: T.IK }}>Rs. {tax.toLocaleString()}</span>
              </div>
              <div style={{ ...priceRowStyle, borderBottom: "none", paddingTop: 16, marginTop: 8, borderTop: `2px solid ${T.IK}` }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: T.C }}>TOTAL AMOUNT</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: T.C }}>Rs. {totalAmount.toLocaleString()}</span>
              </div>

              <div style={{ 
                marginTop: 24, padding: "16px", background: hasSufficientBalance ? "#28c76f10" : "#ea545510",
                borderRadius: 4, border: `1px solid ${hasSufficientBalance ? "#28c76f40" : "#ea545540"}`
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.LIGHT_IK, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Your Wallet Balance
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: hasSufficientBalance ? "#28c76f" : "#ea5455" }}>
                  Rs. {walletBalance?.toLocaleString() || 0}
                </div>
                {!hasSufficientBalance && (
                  <button
                    type="button"
                    onClick={handleTopUpRedirect}
                    style={{
                      marginTop: 12, width: "100%", padding: "10px", fontSize: 9,
                      fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                      background: T.C, color: T.CR, border: "none", cursor: "pointer"
                    }}
                  >
                    TOP UP WALLET →
                  </button>
                )}
              </div>

              <div style={{ marginTop: 24 }}>
                <label style={labelStyle}>Payment Method</label>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="wallet"
                      checked={selectedPaymentMethod === "wallet"}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.IK }}>Wallet Balance</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", opacity: 0.5 }}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="card"
                      disabled
                      style={{ cursor: "not-allowed" }}
                    />
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.LIGHT_IK }}>Card (Coming Soon)</span>
                  </label>
                </div>
              </div>

              <div style={{ marginTop: 20, padding: "12px 0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input 
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 9, fontWeight: 700, color: T.LIGHT_IK, letterSpacing: "0.05em" }}>
                    I agree to the <span style={{ color: T.C, textDecoration: "underline", cursor: "pointer" }}>Terms of Service</span> and confirm that I have sufficient balance for this booking
                  </span>
                </label>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                <button 
                  type="submit"
                  onClick={handlePaymentAndBooking}
                  disabled={loading || !agreeTerms || (selectedPaymentMethod === "wallet" && !hasSufficientBalance)}
                  style={{
                    width: "100%", padding: "16px", fontSize: 11, fontWeight: 900,
                    textTransform: "uppercase", letterSpacing: "0.15em",
                    background: (loading || !agreeTerms || (selectedPaymentMethod === "wallet" && !hasSufficientBalance)) ? T.LIGHT_IK : T.C,
                    color: T.CR, border: "none", cursor: (loading || !agreeTerms || (selectedPaymentMethod === "wallet" && !hasSufficientBalance)) ? "not-allowed" : "pointer",
                    transition: "all 0.1s"
                  }}
                >
                  {loading ? "PROCESSING..." : `PAY Rs. ${totalAmount.toLocaleString()} →`}
                </button>
                
                <button 
                  type="button"
                  onClick={() => navigate(-1)}
                  style={{
                    width: "100%", padding: "14px", fontSize: 9, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.12em",
                    border: `1px solid ${T.IK}`, background: "transparent",
                    color: T.IK, cursor: "pointer", transition: "all 0.1s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.IK; e.currentTarget.style.color = T.CR; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.IK; }}
                >
                  ← BACK TO SERVICES
                </button>
              </div>

              {selectedPaymentMethod === "wallet" && !hasSufficientBalance && !loading && (
                <div style={{
                  marginTop: 16, padding: "12px", background: "#ea545520",
                  fontSize: 9, fontWeight: 700, color: "#ea5455", textAlign: "center",
                  textTransform: "uppercase", letterSpacing: "0.08em"
                }}>
                  ⚠️ Insufficient balance. Please top up your wallet to continue.
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