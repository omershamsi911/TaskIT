import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { handleEmailLogin } from "../handlers/authHandlers";

const T = {
  C: "#FF5733", CR: "#F5F0E6", IK: "#1A1A1A", LIGHT_IK: "#6B6B6B",
};

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
    const data = await handleEmailLogin(formData);

    const accessToken =
      data?.tokens?.access_token || data?.access_token;

    const refreshToken =
      data?.tokens?.refresh_token || data?.refresh_token;

    const userData = data?.user || data;

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

  if (userData.email === "admin@admin.com") {
  navigate("/admin");
} else {
  navigate("/services");
}
  } catch (err) {
    setError(
      err?.message ||
      err ||
      "Login failed"
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: T.CR, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

      {/* Subtle grid overlay */}
      <div style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 0, opacity: 0.035, backgroundImage: `linear-gradient(${T.IK} 1px, transparent 1px), linear-gradient(90deg, ${T.IK} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

      {/* Card */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 480, border: `1px solid ${T.IK}`, background: T.CR }}>

        {/* Header band */}
        <div style={{ padding: "24px 32px", borderBottom: `1px solid ${T.IK}`, background: T.IK }}>
          <h1 style={{ fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", margin: 0, fontSize: "2.5rem", color: T.CR }}>
            LOGIN<br />
            <span style={{ color: T.C }}>TO TASKIT.</span>
          </h1>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderBottom: `1px solid ${T.C}`, background: "rgba(255,87,51,0.06)" }}>
            <span style={{ fontWeight: 900, color: T.C, fontSize: 14 }}>!</span>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: T.C }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Email */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.LIGHT_IK, marginBottom: 8 }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              name="email"
              placeholder="YOUR@EMAIL.COM"
              required
              onChange={handleChange}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              style={{ width: "100%", padding: "14px 16px", fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", background: "transparent", border: `1px solid ${focused === "email" ? T.C : T.IK}`, outline: "none", color: T.IK, transition: "border-color 0.1s", boxSizing: "border-box" }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.LIGHT_IK, marginBottom: 8 }}>
              PASSWORD
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••••••"
              required
              onChange={handleChange}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              style={{ width: "100%", padding: "14px 16px", fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", background: "transparent", border: `1px solid ${focused === "password" ? T.C : T.IK}`, outline: "none", color: T.IK, transition: "border-color 0.1s", boxSizing: "border-box" }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => !loading && setBtnHov(true)}
            onMouseLeave={() => setBtnHov(false)}
            style={{ width: "100%", padding: "16px", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", background: loading ? T.LIGHT_IK : (btnHov ? T.IK : T.C), color: T.CR, border: `2px solid ${loading ? T.LIGHT_IK : (btnHov ? T.IK : T.C)}`, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.1s", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {loading ? (
              <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>◎</span> LOGGING IN...</>
            ) : "LOGIN →"}
          </button>

          {/* Footer link */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${T.IK}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: T.LIGHT_IK }}>NO ACCOUNT?&nbsp;</span>
            <Link to="/register"
              style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: T.C, textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = T.IK}
              onMouseLeave={e => e.currentTarget.style.color = T.C}>
              SIGN UP →
            </Link>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
};

export default Login;