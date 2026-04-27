// src/pages/Login.jsx
import { useState } from "react";
import { handleEmailLogin } from "../../../handlers/auth";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Login() {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data = await handleEmailLogin(form);
      // Store tokens
      localStorage.setItem("access_token", data.tokens.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.tokens.refresh_token);
      }

      // Store user (stringified)
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      const message = err?.detail || "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen font-sans relative" style={{ background: CR, color: IK }}>
      {/* Grid overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-coral bg-grid" />

      {/* Top-left wordmark */}
      <Link
        to="/"
        className="fixed top-0 left-0 z-20 px-6 py-4 border-b border-r text-sm font-black uppercase tracking-superwide no-underline"
        style={{ borderColor: IK, color: C, background: CR }}
      >
        TASKIT
      </Link>

      {/* Section label */}
      <div
        className="fixed top-0 right-0 z-20 px-6 py-4 border-b border-l text-2xs font-black uppercase tracking-superwide"
        style={{ borderColor: IK, background: CR, color: LIGHT_IK }}
      >
        § LOGIN
      </div>

      {/* Card */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="relative z-10 w-full border"
          style={{ maxWidth: 480, borderColor: IK, background: CR }}
        >
          {/* Header band */}
          <div
            className="px-8 py-6 border-b"
            style={{ borderColor: IK, background: IK }}
          >
            <h1
              className="font-black uppercase leading-none"
              style={{ fontSize: "2.5rem", color: CR, letterSpacing: "-0.02em" }}
            >
              LOGIN
              <br />
              <span style={{ color: C }}>TO TASKIT.</span>
            </h1>
          </div>

          {/* Error banner */}
          {error && (
            <div
              className="flex items-center gap-3 px-6 py-3 border-b"
              style={{ borderColor: C, background: "rgba(255,87,51,0.06)" }}
            >
              <span className="text-sm font-black" style={{ color: C }}>!</span>
              <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: C }}>
                {error}
              </span>
            </div>
          )}

          {/* Form body */}
          <form onSubmit={onSubmit} className="px-8 py-8 flex flex-col gap-0">

            {/* Email */}
            <div className="mb-6">
              <label className="block text-2xs font-black uppercase tracking-superwide mb-2" style={{ color: LIGHT_IK }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="YOUR@EMAIL.COM"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                required
                className="w-full py-3.5 px-4 text-2xs font-black uppercase tracking-superwide bg-transparent outline-none border transition-colors duration-100"
                style={{
                  borderColor: focused === "email" ? C : IK,
                  color: IK,
                }}
              />
            </div>

            {/* Password */}
            <div className="mb-8">
              <label className="block text-2xs font-black uppercase tracking-superwide mb-2" style={{ color: LIGHT_IK }}>
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                required
                className="w-full py-3.5 px-4 text-2xs font-black uppercase tracking-superwide bg-transparent outline-none border transition-colors duration-100"
                style={{
                  borderColor: focused === "password" ? C : IK,
                  color: IK,
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 font-black text-2xs uppercase tracking-superwide transition-all duration-100 disabled:opacity-50 flex items-center justify-center gap-2 border-2"
              style={{ background: C, color: CR, borderColor: C }}
              onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.background = IK; e.currentTarget.style.borderColor = IK; }}}
              onMouseLeave={e => { if (!isSubmitting) { e.currentTarget.style.background = C; e.currentTarget.style.borderColor = C; }}}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin text-sm">◎</span>
                  LOGGING IN...
                </>
              ) : (
                "LOGIN →"
              )}
            </button>

            {/* Footer */}
            <div
              className="mt-6 pt-6 border-t flex items-center justify-center"
              style={{ borderColor: IK }}
            >
              <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
                NO ACCOUNT?&nbsp;
              </span>
              <Link
                to="/signup"
                className="text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
                style={{ color: C }}
                onMouseEnter={e => { e.currentTarget.style.color = IK; }}
                onMouseLeave={e => { e.currentTarget.style.color = C; }}
              >
                SIGN UP →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}