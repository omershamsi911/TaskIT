import { useEffect, useState } from "react";
import { useInRouterContext, useNavigate } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";
import { getCategories } from "../handlers/categoryHandlers";
import { addProviderService, deleteProviderService, getMyProviderDetails } from "../handlers/providerHandlers";
import { useNotify } from "../context/NotificationContext";


const SectionBar = ({ left, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", background: T.IK }}>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>{left}</span>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f5f0e6" }}>{right}</span>
  </div>
);

const ManageServices = () => {
  const navigate = useNavigate();
  const [services,    setServices]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [showForm,    setShowForm]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const notify = useNotify();

  const [formData, setFormData] = useState({ category_id: "", title: "", description: "", price: "" });

  // Guard: provider only
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const u = userStr ? (() => { try { return JSON.parse(userStr); } catch { return null; } })() : null;
    if (!u || (u.role !== "provider" && u.role !== "both")) {
      navigate("/");
      return;
    }

    Promise.all([getCategories(), getMyProviderDetails()])
      .then(([cats, provData]) => {
        setCategories(cats);
        setServices(provData?.services || []);
      })
      .catch(console.error)
      .finally(() => setPageLoading(false));
  }, [navigate]);

  const handleChange = (e) => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newService = await addProviderService({
        ...formData,
        category_id: parseInt(formData.category_id),
        price:       parseFloat(formData.price),
      });
      setServices(s => [...s, newService]);
      setShowForm(false);
      setFormData({ category_id: "", title: "", description: "", price: "" });
    } catch (err) {
      notify(err.response?.data?.detail || "Failed to add service", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await deleteProviderService(serviceId);
      setServices(s => s.filter(sv => sv.id !== serviceId));
    } catch {
      notify("Failed to delete service.", "error");
    }
  };

  const inputStyle = { width: "100%", padding: "13px 16px", fontSize: 11, fontWeight: 700, background: "#fff", border: `1px solid ${T.IK}`, color: T.IK, outline: "none", transition: "border-color 0.1s", letterSpacing: "0.04em", fontFamily: "inherit" };

  return (
    <SharedLayout>
      <SectionBar left="MANAGE SERVICES" right={`${services.length} LISTED`} />

      {/* Top action bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "16px 32px", borderBottom: `1px solid ${T.IK}`, background: T.CR }}>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{ padding: "12px 28px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", background: showForm ? T.LIGHT_IK : T.IK, color: "#fff", border: "none", cursor: "pointer", transition: "all 0.1s", fontFamily: "inherit" }}
          onMouseEnter={e => e.currentTarget.style.background = showForm ? "#555" : T.C}
          onMouseLeave={e => e.currentTarget.style.background = showForm ? T.LIGHT_IK : T.IK}>
          {showForm ? "✕ CANCEL" : "+ ADD SERVICE"}
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px" }}>
        {pageLoading ? (
          <div style={{ textAlign: "center", padding: "80px 0", fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>LOADING SERVICES...</div>
        ) : (
          <>
            {/* Add service form */}
            {showForm && (
              <div style={{ border: `1px solid ${T.IK}`, marginBottom: 32, overflow: "hidden" }}>
                <div style={{ padding: "12px 24px", background: T.IK, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>NEW SERVICE DETAILS</span>
                  <span style={{ fontSize: 9, fontWeight: 900, color: "#f5f0e6", opacity: 0.4 }}>§ FORM</span>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: 28, background: "#fff", display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, display: "block", marginBottom: 6 }}>Category <span style={{ color: T.C }}>*</span></label>
                      <select name="category_id" value={formData.category_id} onChange={handleChange} required
                        style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                        <option value="" disabled>SELECT CATEGORY</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, display: "block", marginBottom: 6 }}>Base Price (PKR) <span style={{ color: T.C }}>*</span></label>
                      <input type="number" name="price" required min="0" placeholder="0.00" value={formData.price} onChange={handleChange} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = T.C} onBlur={e => e.target.style.borderColor = T.IK} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, display: "block", marginBottom: 6 }}>Service Title <span style={{ color: T.C }}>*</span></label>
                    <input type="text" name="title" required placeholder="E.g., Deep House Cleaning" value={formData.title} onChange={handleChange} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = T.C} onBlur={e => e.target.style.borderColor = T.IK} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK, display: "block", marginBottom: 6 }}>Description</label>
                    <textarea name="description" rows="3" placeholder="Describe what is included..." value={formData.description} onChange={handleChange}
                      style={{ ...inputStyle, resize: "none" }}
                      onFocus={e => e.target.style.borderColor = T.C} onBlur={e => e.target.style.borderColor = T.IK} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" disabled={loading}
                      style={{ padding: "13px 36px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", background: loading ? T.LIGHT_IK : T.C, color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.1s", fontFamily: "inherit" }}
                      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.IK; }}
                      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.C; }}>
                      {loading ? "SAVING..." : "SAVE SERVICE →"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Services grid */}
            {services.length === 0 ? (
              <div style={{ border: `1px dashed ${T.IK}`, padding: "64px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: T.IK, opacity: 0.08, marginBottom: 16 }}>◈</div>
                <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.LIGHT_IK }}>No services added yet.</p>
                <p style={{ fontSize: 10, fontWeight: 700, color: T.LIGHT_IK, marginTop: 8 }}>Click "+ ADD SERVICE" to get started.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {services.map(service => (
                  <ServiceCard key={service.id} service={service} categories={categories} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </SharedLayout>
  );
};

// ─── SERVICE CARD ─────────────────────────────────────────────────
const ServiceCard = ({ service, categories, onDelete }) => {
  const [hov, setHov] = useState(false);
  const catName = categories.find(c => c.id === service.category_id)?.name || `Category #${service.category_id}`;
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#fff", border: `1px solid ${T.IK}`, display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "transform 0.1s", transform: hov ? "scale(1.01)" : "scale(1)", overflow: "hidden" }}>
      {/* Card header */}
      <div style={{ padding: "10px 16px", background: T.IK, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: T.C }}>{catName}</span>
        <button onClick={() => onDelete(service.id)}
          style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ea5455", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "2px 0" }}
          onMouseEnter={e => e.currentTarget.style.color = "#ff6b6b"}
          onMouseLeave={e => e.currentTarget.style.color = "#ea5455"}>
          DELETE
        </button>
      </div>
      {/* Body */}
      <div style={{ padding: "20px 20px 0" }}>
        <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.03em", color: T.IK, margin: "0 0 8px", lineHeight: 1.3 }}>{service.title}</h3>
        <p style={{ fontSize: 11, lineHeight: 1.6, color: T.LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>
          {service.description || "No description."}
        </p>
      </div>
      {/* Footer */}
      <div style={{ padding: "16px 20px", marginTop: 16, borderTop: `1px solid ${T.IK}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.LIGHT_IK }}>Price</span>
        <span style={{ fontSize: 24, fontWeight: 900, color: T.C, lineHeight: 1 }}>Rs. {service.price}</span>
      </div>
    </div>
  );
};

export default ManageServices;