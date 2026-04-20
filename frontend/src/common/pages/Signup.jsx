import { useState } from "react";
import { handleUserSignup, handleProviderSignup } from "../../../handlers/auth";
import { Navigate, useNavigate } from "react-router-dom";

export default function Signup() {
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res =
        role === "customer"
          ? await handleUserSignup(form)
          : await handleProviderSignup(form);

      navigate("/login")
      console.log("Signup success:", res);
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "14px 16px",
    background: "transparent",
    border: "1px solid",
    borderColor: focused === field ? "#FF5733" : "#1a1a1a",
    borderRadius: 0,
    outline: "none",
    color: "#1a1a1a",
    fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.1em",
    transition: "border-color 0.1s",
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ background: "#F5F0E6", fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #FF573308 1px, transparent 1px),
            linear-gradient(to bottom, #FF573308 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Top-left wordmark */}
      <a
        href="/"
        className="fixed top-0 left-0 z-20 px-6 py-4 border-b border-r text-sm font-black uppercase tracking-widest"
        style={{ borderColor: "#1a1a1a", color: "#FF5733", textDecoration: "none", background: "#F5F0E6" }}
      >
        TASKIT
      </a>

      {/* Section label */}
      <div
        className="fixed top-0 right-0 z-20 px-6 py-4 border-b border-l text-xs font-black uppercase tracking-widest opacity-30"
        style={{ borderColor: "#1a1a1a", background: "#F5F0E6" }}
      >
        § CREATE ACCOUNT
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full border my-20"
        style={{ maxWidth: 480, borderColor: "#1a1a1a", background: "#F5F0E6" }}
      >
        {/* Header band */}
        <div
          className="px-8 py-6 border-b"
          style={{ borderColor: "#1a1a1a", background: "#1a1a1a" }}
        >
          <h1
            className="font-black uppercase leading-none"
            style={{ fontSize: "2.5rem", color: "#F5F0E6", letterSpacing: "-0.02em" }}
          >
            CREATE
            <br />
            <span style={{ color: "#FF5733" }}>ACCOUNT.</span>
          </h1>
        </div>

        {/* Form body */}
        <form onSubmit={onSubmit} className="px-8 py-8 flex flex-col gap-0">

          {/* ROLE SWITCH */}
          <div className="flex border mb-8" style={{ borderColor: "#1a1a1a" }}>
            <button
              type="button"
              onClick={() => setRole("customer")}
              className="flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all duration-100"
              style={{
                background: role === "customer" ? "#FF5733" : "transparent",
                color: role === "customer" ? "#F5F0E6" : "#1a1a1a",
                border: "none",
                borderRight: "1px solid #1a1a1a",
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              CUSTOMER
            </button>
            <button
              type="button"
              onClick={() => setRole("provider")}
              className="flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all duration-100"
              style={{
                background: role === "provider" ? "#FF5733" : "transparent",
                color: role === "provider" ? "#F5F0E6" : "#1a1a1a",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              PROVIDER
            </button>
          </div>

          {/* Full Name */}
          <div className="border-b mb-0" style={{ borderColor: "#1a1a1a" }}>
            <label className="block text-xs font-black tracking-widest uppercase mb-2 opacity-40">
              Full Name
            </label>
            <input
              type="text"
              placeholder="YOUR FULL NAME"
              style={inputStyle("full_name")}
              onFocus={() => setFocused("full_name")}
              onBlur={() => setFocused(null)}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="border-b pt-6 mb-0" style={{ borderColor: "#1a1a1a" }}>
            <label className="block text-xs font-black tracking-widest uppercase mb-2 opacity-40">
              Email Address
            </label>
            <input
              type="email"
              placeholder="YOUR@EMAIL.COM"
              style={inputStyle("email")}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div className="border-b pt-6 mb-0" style={{ borderColor: "#1a1a1a" }}>
            <label className="block text-xs font-black tracking-widest uppercase mb-2 opacity-40">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+92 300 0000000"
              style={inputStyle("phone")}
              onFocus={() => setFocused("phone")}
              onBlur={() => setFocused(null)}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="pt-6 mb-8">
            <label className="block text-xs font-black tracking-widest uppercase mb-2 opacity-40">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              style={inputStyle("password")}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 font-black text-xs uppercase tracking-widest transition-all duration-100"
            style={{
              background: "#FF5733",
              color: "#F5F0E6",
              border: "2px solid #FF5733",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.borderColor = "#1a1a1a"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#FF5733"; e.currentTarget.style.borderColor = "#FF5733"; }}
          >
            SIGN UP AS {role.toUpperCase()} →
          </button>

          <div
            className="mt-6 pt-6 border-t flex items-center justify-center"
            style={{ borderColor: "#1a1a1a" }}
          >
            <p className="text-xs font-black uppercase tracking-widest opacity-40">
              Have an account?&nbsp;
            </p>
            <a
              href="/login"
              className="text-xs font-black uppercase tracking-widest transition-colors duration-100"
              style={{ color: "#FF5733", textDecoration: "none" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#1a1a1a"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#FF5733"; }}
            >
              LOGIN →
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}