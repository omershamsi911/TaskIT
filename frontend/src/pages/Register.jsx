import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { handleSignup } from "../handlers/authHandlers";

const T = {
  C: "#FF5733", CR: "#F5F0E6", IK: "#1A1A1A", LIGHT_IK: "#6B6B6B",
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "", email: "", phone: "", password: "", role: "customer",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [btnHov, setBtnHov] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const onSubmit = async (e) => {
  e.preventDefault();

  setError(null);
  setLoading(true);

  try {
    const data = await handleSignup(formData);

    const accessToken =
      data?.tokens?.access_token ||
      data?.access_token;

    const refreshToken =
      data?.tokens?.refresh_token ||
      data?.refresh_token;

    const userData =
      data?.user || {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      };

    if (accessToken) {
      localStorage.setItem(
        "access_token",
        accessToken
      );
    }

    if (refreshToken) {
      localStorage.setItem(
        "refresh_token",
        refreshToken
      );
    }

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    navigate("/profile");
  } catch (err) {
    setError(
      err?.message ||
      err ||
      "Registration failed"
    );
  } finally {
    setLoading(false);
  }
};

  const fields = [
    { name: "full_name", label: "FULL NAME",     type: "text",     placeholder: "YOUR FULL NAME" },
    { name: "email",     label: "EMAIL ADDRESS", type: "email",    placeholder: "YOUR@EMAIL.COM" },
    { name: "phone",     label: "PHONE NUMBER",  type: "tel",      placeholder: "0300 0000000"   },
    { name: "password",  label: "PASSWORD",      type: "password", placeholder: "••••••••••••"   },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: T.CR, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 24px 48px", position: "relative", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

      {/* Grid overlay */}
      <div style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 0, opacity: 0.035, backgroundImage: `linear-gradient(${T.IK} 1px, transparent 1px), linear-gradient(90deg, ${T.IK} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

      {/* Card */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 480, border: `1px solid ${T.IK}`, background: T.CR }}>

        {/* Header band */}
        <div style={{ padding: "24px 32px", borderBottom: `1px solid ${T.IK}`, background: T.IK }}>
          <h1 style={{ fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", margin: 0, fontSize: "2.5rem", color: T.CR }}>
            CREATE<br />
            <span style={{ color: T.C }}>ACCOUNT.</span>
          </h1>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 24px", borderBottom: `1px solid ${T.C}`, background: "rgba(255,87,51,0.06)" }}>
            <span style={{ fontWeight: 900, color: T.C, fontSize: 14, flexShrink: 0 }}>!</span>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: T.C, lineHeight: 1.6 }}>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Role toggle */}
          <div style={{ display: "flex", border: `1px solid ${T.IK}`, marginBottom: 28 }}>
            {["customer", "provider"].map((r) => (
              <button key={r} type="button" onClick={() => setFormData({ ...formData, role: r })}
                style={{ flex: 1, padding: "12px", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", border: "none", borderRight: r === "customer" ? `1px solid ${T.IK}` : "none", background: formData.role === r ? T.C : "transparent", color: formData.role === r ? T.CR : T.IK, transition: "all 0.1s" }}>
                {r === "customer" ? "CUSTOMER" : "PROVIDER"}
              </button>
            ))}
          </div>

          {/* Fields */}
          {fields.map((f, i) => (
            <div key={f.name} style={{ marginBottom: i === fields.length - 1 ? 32 : 24 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.LIGHT_IK, marginBottom: 8 }}>
                {f.label}
              </label>
              <input
                type={f.type}
                name={f.name}
                placeholder={f.placeholder}
                required
                onChange={handleChange}
                onFocus={() => setFocused(f.name)}
                onBlur={() => setFocused(null)}
                style={{ width: "100%", padding: "14px 16px", fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: f.type !== "password" ? "uppercase" : "none", background: "transparent", border: `1px solid ${focused === f.name ? T.C : T.IK}`, outline: "none", color: T.IK, transition: "border-color 0.1s", boxSizing: "border-box" }}
              />
            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => !loading && setBtnHov(true)}
            onMouseLeave={() => setBtnHov(false)}
            style={{ width: "100%", padding: "16px", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", background: loading ? T.LIGHT_IK : (btnHov ? T.IK : T.C), color: T.CR, border: `2px solid ${loading ? T.LIGHT_IK : (btnHov ? T.IK : T.C)}`, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.1s", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {loading ? (
              <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>◎</span> CREATING ACCOUNT...</>
            ) : `SIGN UP AS ${formData.role.toUpperCase()} →`}
          </button>

          {/* Footer link */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${T.IK}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: T.LIGHT_IK }}>HAVE AN ACCOUNT?&nbsp;</span>
            <Link to="/login"
              style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: T.C, textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = T.IK}
              onMouseLeave={e => e.currentTarget.style.color = T.C}>
              LOGIN →
            </Link>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
};

export default Register;