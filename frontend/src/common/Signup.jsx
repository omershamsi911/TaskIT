import { useState } from "react";
import { handleUserSignup, handleProviderSignup } from "../../handlers/auth";

export default function Signup() {
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res =
        role === "user"
          ? await handleUserSignup(form)
          : await handleProviderSignup(form);

      console.log("Signup success:", res);
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
          Create Account
        </h1>

        {/* ROLE SWITCH */}
        <div className="flex bg-white/10 rounded-xl p-1 mb-4">
          <button
            type="button"
            onClick={() => setRole("user")}
            className={`flex-1 py-2 rounded-lg ${
              role === "user" ? "bg-green-500 text-black" : ""
            }`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setRole("provider")}
            className={`flex-1 py-2 rounded-lg ${
              role === "provider" ? "bg-green-500 text-black" : ""
            }`}
          >
            Provider
          </button>
        </div>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-3 px-4 py-3 bg-white/10 border border-white/10 rounded-xl"
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-4 py-3 bg-white/10 border border-white/10 rounded-xl"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="text"
          placeholder="Phone"
          className="w-full mb-3 px-4 py-3 bg-white/10 border border-white/10 rounded-xl"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-3 bg-white/10 border border-white/10 rounded-xl"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="w-full py-3 bg-green-500 text-black font-bold rounded-xl">
          Sign Up as {role}
        </button>

        <p className="text-sm text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-green-400">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}