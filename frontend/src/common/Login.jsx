// src/pages/Login.jsx
import { useState } from "react";
import { handleEmailLogin } from "../../handlers/auth";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await handleEmailLogin(form);
      console.log("Logged in:", data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h1 className="text-2xl font-bold text-green-400 text-center mb-6">
          Login to TaskIt
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-4 py-3 bg-white/10 border border-white/10 rounded-xl"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-3 bg-white/10 border border-white/10 rounded-xl"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="w-full py-3 bg-green-500 text-black font-bold rounded-xl">
          Login
        </button>

        <p className="text-sm text-gray-400 text-center mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-green-400">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}