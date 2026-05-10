import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import { createBooking } from "../handlers/bookingHandlers";

const BookService = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();

  if (!state?.service) return <Navigate to="/services" />;

  const { service } = state;
  const [loading,  setLoading]  = useState(false);
  const [formData, setFormData] = useState({ scheduled_at: "", address: "", description: "" });

  const handleChange = (e) => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBooking({
        provider_id: service.provider_id,
        service_id:  service.id,
        address:     formData.address,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
        description: formData.description,
      });
      alert("Booking requested successfully!");
      navigate("/my-bookings");
    } catch (err) {
      alert("Failed to create booking. " + (err.response?.data?.detail || ""));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", fontSize: 11, fontWeight: 700, background: T.CR_ALT,
    border: `1px solid ${T.IK}`, color: T.IK, outline: "none", transition: "border-color 0.1s",
    letterSpacing: "0.05em",
  };
  const labelStyle = { fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, marginBottom: 6, display: "block" };

  return (
    <SharedLayout>
      {/* Page header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", background: T.IK, borderBottom: `1px solid ${T.IK}` }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>BOOK SERVICE</span>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.CR }}>CONFIRM YOUR SLOT</span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 32px" }}>
        {/* Service info card */}
        <div style={{ border: `1px solid ${T.IK}`, marginBottom: 36, overflow: "hidden" }}>
          <div style={{ padding: "12px 24px", background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>SERVICE SELECTED</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: T.CR, opacity: 0.4 }}>§ 001</span>
          </div>
          <div style={{ padding: "24px", background: T.CR, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: T.IK, margin: "0 0 6px" }}>{service.title}</h2>
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK }}>{service.pricing_type || "FIXED"}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK, marginBottom: 4 }}>Base Price</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: T.C, lineHeight: 1 }}>Rs. {service.price || service.base_price}</div>
            </div>
          </div>
        </div>

        {/* Booking form */}
        <div style={{ border: `1px solid ${T.IK}`, overflow: "hidden" }}>
          <div style={{ padding: "12px 24px", background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>BOOKING DETAILS</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: T.CR, opacity: 0.4 }}>§ 002</span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: 28, background: T.CR, display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label style={labelStyle}>Date & Time <span style={{ color: T.C }}>*</span></label>
              <input type="datetime-local" name="scheduled_at" required onChange={handleChange} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = T.C; }}
                onBlur={e  => { e.target.style.borderColor = T.IK; }} />
            </div>
            <div>
              <label style={labelStyle}>Full Address <span style={{ color: T.C }}>*</span></label>
              <input type="text" name="address" required placeholder="E.g., House 12, Street 4, F-8/4, Islamabad" onChange={handleChange} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = T.C; }}
                onBlur={e  => { e.target.style.borderColor = T.IK; }} />
            </div>
            <div>
              <label style={labelStyle}>Job Description (Optional)</label>
              <textarea name="description" rows="4" placeholder="Describe exactly what you need done..." onChange={handleChange}
                style={{ ...inputStyle, resize: "none" }}
                onFocus={e => { e.target.style.borderColor = T.C; }}
                onBlur={e  => { e.target.style.borderColor = T.IK; }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, gap: 12 }}>
              <button type="button" onClick={() => navigate(-1)}
                style={{ padding: "14px 32px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", border: `1px solid ${T.IK}`, background: "transparent", color: T.IK, cursor: "pointer", transition: "all 0.1s" }}
                onMouseEnter={e => { e.currentTarget.style.background = T.IK; e.currentTarget.style.color = T.CR; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.IK; }}>
                ← BACK
              </button>
              <button type="submit" disabled={loading}
                style={{ padding: "14px 40px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", background: loading ? T.LIGHT_IK : T.C, color: T.CR, border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.1s" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.IK; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.C; }}>
                {loading ? "PROCESSING..." : "CONFIRM BOOKING →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SharedLayout>
  );
};

export default BookService;