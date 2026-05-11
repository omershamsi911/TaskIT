import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { handleEmailLogin } from "../handlers/authHandlers";

const T = {
  C: "#FF5733", CR: "#F5F0E6", IK: "#1A1A1A", LIGHT_IK: "#6B6B6B",
  GREEN: "#28c76f", RED: "#ea5455",
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? T.GREEN : type === "error" ? T.RED : T.IK;
  const icon = type === "success" ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : type === "error" ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ) : null;

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 20px",
        background: bgColor,
        color: "#fff",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        animation: "slideIn 0.3s ease",
        maxWidth: 360,
      }}
    >
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          marginLeft: "auto",
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          opacity: 0.7,
          fontSize: 14,
          padding: 0,
          display: "flex",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

// Custom hook for media queries
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
};

const Login = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [btnHov, setBtnHov] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await handleEmailLogin(formData);

      const accessToken = data?.tokens?.access_token || data?.access_token;
      const refreshToken = data?.tokens?.refresh_token || data?.refresh_token;
      const userData = data?.user || data;

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }

      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      localStorage.setItem("user", JSON.stringify(userData));

      showToast("Login successful! Redirecting...", "success");

      setTimeout(() => {
        if (userData.email === "admin@admin.com") {
          navigate("/admin");
        } else {
          navigate("/services");
        }
      }, 1000);
    } catch (err) {
      showToast(err?.message || err || "Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: T.CR,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "24px 16px" : 24,
        position: "relative",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Grid overlay */}
      <div
        style={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          zIndex: 0,
          opacity: 0.035,
          backgroundImage: `linear-gradient(${T.IK} 1px, transparent 1px), linear-gradient(90deg, ${T.IK} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 480,
          border: `1px solid ${T.IK}`,
          background: T.CR,
          boxShadow: "0 16px 64px rgba(26,26,26,0.08)",
        }}
      >
        {/* Header band */}
        <div
          style={{
            padding: isMobile ? "20px 24px" : "24px 32px",
            borderBottom: `1px solid ${T.IK}`,
            background: T.IK,
          }}
        >
          <h1
            style={{
              fontWeight: 900,
              textTransform: "uppercase",
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              margin: 0,
              fontSize: isMobile ? "2rem" : "2.5rem",
              color: T.CR,
            }}
          >
            LOGIN
            <br />
            <span style={{ color: T.C }}>TO TASKIT.</span>
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          style={{
            padding: isMobile ? "24px" : "32px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* Email */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: T.LIGHT_IK,
                marginBottom: 8,
              }}
            >
              EMAIL ADDRESS
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                name="email"
                placeholder="YOUR@EMAIL.COM"
                required
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 44px",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  background: "transparent",
                  border: `1px solid ${focused === "email" ? T.C : T.IK}`,
                  outline: "none",
                  color: T.IK,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                  boxShadow: focused === "email" ? `0 0 0 3px ${T.C}15` : "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: focused === "email" ? T.C : T.LIGHT_IK,
                  transition: "color 0.15s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 32 }}>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: T.LIGHT_IK,
                marginBottom: 8,
              }}
            >
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••••••"
                required
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 44px",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  background: "transparent",
                  border: `1px solid ${focused === "password" ? T.C : T.IK}`,
                  outline: "none",
                  color: T.IK,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                  boxShadow: focused === "password" ? `0 0 0 3px ${T.C}15` : "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: focused === "password" ? T.C : T.LIGHT_IK,
                  transition: "color 0.15s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: T.LIGHT_IK,
                  padding: 0,
                  display: "flex",
                }}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => !loading && setBtnHov(true)}
            onMouseLeave={() => setBtnHov(false)}
            style={{
              width: "100%",
              padding: isMobile ? "18px" : "16px",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              background: loading ? T.LIGHT_IK : btnHov ? T.IK : T.C,
              color: T.CR,
              border: `2px solid ${loading ? T.LIGHT_IK : btnHov ? T.IK : T.C}`,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    border: `2px solid ${T.CR}40`,
                    borderTopColor: T.CR,
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                LOGGING IN...
              </>
            ) : (
              <>
                LOGIN
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>

          {/* Forgot password */}
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Link
              to="/forgot-password"
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: T.LIGHT_IK,
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = T.C)}
              onMouseLeave={(e) => (e.currentTarget.style.color = T.LIGHT_IK)}
            >
              FORGOT PASSWORD?
            </Link>
          </div>

          {/* Footer link */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: `1px solid ${T.IK}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: T.LIGHT_IK,
              }}
            >
              NO ACCOUNT?
            </span>
            <Link
              to="/register"
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: T.C,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = T.IK)}
              onMouseLeave={(e) => (e.currentTarget.style.color = T.C)}
            >
              SIGN UP
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Login;
