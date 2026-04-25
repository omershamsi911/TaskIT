// src/pages/Signup.jsx
import { useState } from "react";
import { handleUserSignup, handleProviderSignup } from "../../../handlers/auth";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Signup() {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res =
        role === "customer"
          ? await handleUserSignup(form)
          : await handleProviderSignup(form);

      navigate("/signin");
    } catch (err) {
      const message = err?.detail || "Signup failed. Please try again.";
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
        § CREATE ACCOUNT
      </div>

      {/* Card */}
      <div className="min-h-screen flex items-center justify-center p-4 py-24">
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
              CREATE
              <br />
              <span style={{ color: C }}>ACCOUNT.</span>
            </h1>
          </div>

          {/* Error banner */}
          {error && (
            <div
              className="flex items-start gap-3 px-6 py-4 border-b"
              style={{ borderColor: C, background: "rgba(255,87,51,0.06)" }}
            >
              <span className="text-sm font-black shrink-0 mt-0.5" style={{ color: C }}>!</span>
              <span className="text-2xs font-black uppercase tracking-superwide leading-relaxed" style={{ color: C }}>
                {error}
              </span>
            </div>
          )}

          {/* Form body */}
          <form onSubmit={onSubmit} className="px-8 py-8 flex flex-col gap-0">

            {/* ROLE SWITCH */}
            <div className="flex border mb-8" style={{ borderColor: IK }}>
              <button
                type="button"
                onClick={() => setRole("customer")}
                className="flex-1 py-3 text-2xs font-black uppercase tracking-superwide transition-all duration-100 border-r"
                style={{
                  background: role === "customer" ? C : "transparent",
                  color: role === "customer" ? CR : IK,
                  borderColor: IK,
                }}
              >
                CUSTOMER
              </button>
              <button
                type="button"
                onClick={() => setRole("provider")}
                className="flex-1 py-3 text-2xs font-black uppercase tracking-superwide transition-all duration-100"
                style={{
                  background: role === "provider" ? C : "transparent",
                  color: role === "provider" ? CR : IK,
                }}
              >
                PROVIDER
              </button>
            </div>

            {/* Full Name */}
            <div className="mb-6">
              <label className="block text-2xs font-black uppercase tracking-superwide mb-2" style={{ color: LIGHT_IK }}>
                FULL NAME
              </label>
              <input
                type="text"
                placeholder="YOUR FULL NAME"
                value={form.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                onFocus={() => setFocused("full_name")}
                onBlur={() => setFocused(null)}
                required
                className="w-full py-3.5 px-4 text-2xs font-black uppercase tracking-superwide bg-transparent outline-none border transition-colors duration-100"
                style={{
                  borderColor: focused === "full_name" ? C : IK,
                  color: IK,
                }}
              />
            </div>

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

            {/* Phone */}
            <div className="mb-6">
              <label className="block text-2xs font-black uppercase tracking-superwide mb-2" style={{ color: LIGHT_IK }}>
                PHONE NUMBER
              </label>
              <input
                type="text"
                placeholder="0300 0000000"
                value={form.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                onFocus={() => setFocused("phone")}
                onBlur={() => setFocused(null)}
                required
                className="w-full py-3.5 px-4 text-2xs font-black uppercase tracking-superwide bg-transparent outline-none border transition-colors duration-100"
                style={{
                  borderColor: focused === "phone" ? C : IK,
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
                  CREATING ACCOUNT...
                </>
              ) : (
                `SIGN UP AS ${role.toUpperCase()} →`
              )}
            </button>

            {/* Footer */}
            <div
              className="mt-6 pt-6 border-t flex items-center justify-center"
              style={{ borderColor: IK }}
            >
              <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
                HAVE AN ACCOUNT?&nbsp;
              </span>
              <Link
                to="/signin"
                className="text-2xs font-black uppercase tracking-superwide transition-colors duration-100 no-underline"
                style={{ color: C }}
                onMouseEnter={e => { e.currentTarget.style.color = IK; }}
                onMouseLeave={e => { e.currentTarget.style.color = C; }}
              >
                LOGIN →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}