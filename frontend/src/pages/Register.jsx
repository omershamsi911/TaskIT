import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  handleSignup,
  handleGoogleAuth,
} from "../handlers/authHandlers";

const T = {
  C: "#FF5733",
  CR: "#F5F0E6",
  IK: "#1A1A1A",
  LIGHT_IK: "#6B6B6B",
  GREEN: "#28c76f",
  RED: "#ea5455",
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? T.GREEN
      : type === "error"
      ? T.RED
      : T.IK;

  const icon =
    type === "success" ? (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ) : type === "error" ? (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
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

      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
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
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
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

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);

    media.addEventListener("change", listener);

    return () =>
      media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

// Password strength indicator
const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) {
      return {
        level: 0,
        label: "",
        color: T.LIGHT_IK,
      };
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        level: 1,
        label: "WEAK",
        color: T.RED,
      };
    }

    if (score <= 3) {
      return {
        level: 2,
        label: "FAIR",
        color: "#F5A623",
      };
    }

    return {
      level: 3,
      label: "STRONG",
      color: T.GREEN,
    };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 4,
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              background:
                i <= strength.level
                  ? strength.color
                  : `${T.IK}20`,
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      <span
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.1em",
          color: strength.color,
        }}
      >
        {strength.label}
      </span>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();

  const isMobile = useMediaQuery(
    "(max-width: 640px)"
  );

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [btnHov, setBtnHov] = useState(false);
  const [showPassword, setShowPassword] =
    useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const {
      full_name,
      email,
      phone,
      password,
    } = formData;

    if (
      !full_name ||
      !email ||
      !phone ||
      !password
    ) {
      return "All fields are required";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Invalid email format";
    }

    const phoneRegex = /^03[0-9]{9}$/;

    if (
      !phoneRegex.test(
        phone.replace(/\s/g, "")
      )
    ) {
      return "Invalid phone number (must be 03XXXXXXXXX)";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return null;
  };

  const processAuthData = (data) => {
    const accessToken =
      data?.tokens?.access_token ||
      data?.access_token;

    const refreshToken =
      data?.tokens?.refresh_token ||
      data?.refresh_token;

    const userData = data?.user || {
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

    return userData;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    setLoading(true);

    try {
      const data = await handleSignup(formData);

      processAuthData(data);

      showToast(
        "Account created successfully!",
        "success"
      );

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (err) {
      showToast(
        err?.message ||
          err ||
          "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (
    credentialResponse
  ) => {
    try {
      setLoading(true);

      const data = await handleGoogleAuth(
        credentialResponse.credential,
        formData.role
      );

      processAuthData(data);

      showToast(
        "Google signup successful!",
        "success"
      );

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (err) {
      showToast(
        err?.message ||
          "Google Signup failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const onGoogleError = () => {
    showToast(
      "Google Signup was unsuccessful.",
      "error"
    );
  };

  const fields = [
    {
      name: "full_name",
      label: "FULL NAME",
      type: "text",
      placeholder: "YOUR FULL NAME",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      name: "email",
      label: "EMAIL ADDRESS",
      type: "email",
      placeholder: "YOUR@EMAIL.COM",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      name: "phone",
      label: "PHONE NUMBER",
      type: "tel",
      placeholder: "0300 0000000",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
    {
      name: "password",
      label: "PASSWORD",
      type: "password",
      placeholder: "MIN 6 CHARACTERS",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect
            x="3"
            y="11"
            width="18"
            height="11"
            rx="2"
            ry="2"
          />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: T.CR,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile
          ? "24px 16px 48px"
          : "24px 24px 48px",
        position: "relative",
        fontFamily:
          "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
          boxShadow:
            "0 16px 64px rgba(26,26,26,0.08)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: isMobile
              ? "20px 24px"
              : "24px 32px",
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
              fontSize: isMobile
                ? "2rem"
                : "2.5rem",
              color: T.CR,
            }}
          >
            CREATE
            <br />
            <span style={{ color: T.C }}>
              ACCOUNT.
            </span>
          </h1>
        </div>

        <form
          onSubmit={onSubmit}
          style={{
            padding: isMobile
              ? "24px"
              : "32px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* Role toggle */}
          <div
            style={{
              display: "flex",
              border: `1px solid ${T.IK}`,
              marginBottom: 28,
              overflow: "hidden",
            }}
          >
            {["customer", "provider"].map(
              (r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      role: r,
                    })
                  }
                  style={{
                    flex: 1,
                    padding: isMobile
                      ? "14px"
                      : "12px",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.15em",
                    textTransform:
                      "uppercase",
                    cursor: "pointer",
                    border: "none",
                    borderRight:
                      r === "customer"
                        ? `1px solid ${T.IK}`
                        : "none",
                    background:
                      formData.role === r
                        ? T.C
                        : "transparent",
                    color:
                      formData.role === r
                        ? T.CR
                        : T.IK,
                    transition:
                      "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    gap: 8,
                  }}
                >
                  {r === "customer" ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  )}

                  {r === "customer"
                    ? "CUSTOMER"
                    : "PROVIDER"}
                </button>
              )
            )}
          </div>

          {/* Google Signup */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
              theme="outline"
              shape="rectangular"
              text="signup_with"
              size="large"
              width={
                isMobile ? "100%" : "380"
              }
            />
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: `${T.IK}25`,
              }}
            />

            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.12em",
                color: T.LIGHT_IK,
                textTransform:
                  "uppercase",
              }}
            >
              OR
            </span>

            <div
              style={{
                flex: 1,
                height: 1,
                background: `${T.IK}25`,
              }}
            />
          </div>

          {/* Fields */}
          {fields.map((f, i) => (
            <div
              key={f.name}
              style={{
                marginBottom:
                  i === fields.length - 1
                    ? 32
                    : 24,
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  textTransform:
                    "uppercase",
                  color: T.LIGHT_IK,
                  marginBottom: 8,
                }}
              >
                {f.label}
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <input
                  type={
                    f.name ===
                      "password" &&
                    showPassword
                      ? "text"
                      : f.type
                  }
                  name={f.name}
                  placeholder={
                    f.placeholder
                  }
                  required
                  value={
                    formData[f.name]
                  }
                  onChange={
                    handleChange
                  }
                  onFocus={() =>
                    setFocused(
                      f.name
                    )
                  }
                  onBlur={() =>
                    setFocused(null)
                  }
                  style={{
                    width: "100%",
                    padding:
                      f.name ===
                      "password"
                        ? "14px 44px 14px 44px"
                        : "14px 16px 14px 44px",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing:
                      "0.12em",
                    textTransform:
                      f.type !==
                      "password"
                        ? "uppercase"
                        : "none",
                    background:
                      "transparent",
                    border: `1px solid ${
                      focused ===
                      f.name
                        ? T.C
                        : T.IK
                    }`,
                    outline:
                      "none",
                    color: T.IK,
                    transition:
                      "border-color 0.15s, box-shadow 0.15s",
                    boxSizing:
                      "border-box",
                    boxShadow:
                      focused ===
                      f.name
                        ? `0 0 0 3px ${T.C}15`
                        : "none",
                  }}
                />

                <div
                  style={{
                    position:
                      "absolute",
                    left: 14,
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    color:
                      focused ===
                      f.name
                        ? T.C
                        : T.LIGHT_IK,
                    transition:
                      "color 0.15s",
                  }}
                >
                  {f.icon}
                </div>

                {f.name ===
                  "password" && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    style={{
                      position:
                        "absolute",
                      right: 14,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      background:
                        "transparent",
                      border: "none",
                      cursor:
                        "pointer",
                      color:
                        T.LIGHT_IK,
                      padding: 0,
                      display:
                        "flex",
                    }}
                  >
                    {showPassword ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line
                          x1="1"
                          y1="1"
                          x2="23"
                          y2="23"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {f.name ===
                "password" && (
                <PasswordStrength
                  password={
                    formData.password
                  }
                />
              )}
            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() =>
              !loading &&
              setBtnHov(true)
            }
            onMouseLeave={() =>
              setBtnHov(false)
            }
            style={{
              width: "100%",
              padding: isMobile
                ? "18px"
                : "16px",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.15em",
              textTransform:
                "uppercase",
              background: loading
                ? T.LIGHT_IK
                : btnHov
                ? T.IK
                : T.C,
              color: T.CR,
              border: `2px solid ${
                loading
                  ? T.LIGHT_IK
                  : btnHov
                  ? T.IK
                  : T.C
              }`,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              transition:
                "all 0.15s",
              opacity: loading
                ? 0.7
                : 1,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              gap: 10,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    display:
                      "inline-block",
                    width: 14,
                    height: 14,
                    border: `2px solid ${T.CR}40`,
                    borderTopColor:
                      T.CR,
                    borderRadius:
                      "50%",
                    animation:
                      "spin 0.8s linear infinite",
                  }}
                />
                CREATING ACCOUNT...
              </>
            ) : (
              <>
                SIGN UP AS{" "}
                {formData.role.toUpperCase()}

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line
                    x1="5"
                    y1="12"
                    x2="19"
                    y2="12"
                  />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>

          {/* Footer */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: `1px solid ${T.IK}`,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing:
                  "0.12em",
                textTransform:
                  "uppercase",
                color: T.LIGHT_IK,
              }}
            >
              HAVE AN ACCOUNT?
            </span>

            <Link
              to="/login"
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing:
                  "0.12em",
                textTransform:
                  "uppercase",
                color: T.C,
                textDecoration:
                  "none",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: 4,
                transition:
                  "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color =
                  T.IK)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color =
                  T.C)
              }
            >
              LOGIN

              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }

          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;