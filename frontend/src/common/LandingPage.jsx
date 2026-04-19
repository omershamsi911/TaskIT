import heroImg from '../assets/hero.png'
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-green-400 tracking-wide">
          TaskIt
        </h1>

        <div className="flex items-center gap-4">
          <Link to="/login">
            <button className="text-gray-400 hover:text-white transition">
              Become a Provider
            </button>
          
          </Link>

          <Link to="/get-providers">
            <button className="px-5 py-2.5 bg-green-500 hover:bg-green-600 transition text-black font-semibold rounded-xl shadow-lg shadow-green-500/20">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="grid md:grid-cols-2 gap-12 items-center px-6 md:px-12 mt-10">

        {/* LEFT */}
        <div>
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Find trusted professionals{" "}
            <span className="text-green-400">near you</span>
          </h2>

          <p className="text-gray-400 mt-5 max-w-lg text-lg">
            Book verified plumbers, electricians, cleaners and more — fast, reliable, and hassle-free.
          </p>

          {/* SEARCH */}
          <div className="mt-8 flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <input
              type="text"
              placeholder="What service do you need?"
              className="w-full px-4 py-3 bg-transparent outline-none text-white placeholder:text-gray-500"
            />
            <button className="px-6 bg-green-500 hover:bg-green-600 transition text-black font-bold">
              Search
            </button>
          </div>

          {/* TRUST BADGES */}
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-400">
            <span>✔ Verified Providers</span>
            <span>✔ Fast Booking</span>
            <span>✔ Transparent Pricing</span>
          </div>
        </div>

        {/* RIGHT (IMAGE) */}
        <div className="relative flex justify-center">
          <div className="absolute w-72 h-72 bg-green-500/20 blur-3xl rounded-full"></div>
          <img
            src={heroImg}
            alt="Hero"
            className="relative w-80 md:w-96 rounded-2xl shadow-2xl border border-white/10"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-24 px-6 md:px-12 text-center">
        <h3 className="text-3xl font-bold text-white mb-12">
          How it works
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Search", desc: "Find the service you need instantly" },
            { title: "Compare", desc: "Check reviews and pricing بسهولة" },
            { title: "Book", desc: "Hire the right professional quickly" }
          ].map((step, i) => (
            <div
              key={i}
              className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-green-400/40 hover:bg-white/10 transition"
            >
              <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
              <p className="text-gray-400 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="mt-24 px-6 md:px-12">
        <h3 className="text-2xl font-bold mb-8 text-white">
          Popular Services
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            "Cleaning","Plumbing","Electrician","Moving",
            "Carpentry","Painting","AC Repair","Tutoring"
          ].map((item, index) => (
            <div
              key={index}
              className="group bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:-translate-y-1 transition cursor-pointer"
            >
              <div className="w-10 h-10 mx-auto mb-3 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition">
                🔧
              </div>
              <p className="font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24 px-6 md:px-12 text-center">
        <div className="bg-linear-to-r from-green-500 to-emerald-400 text-black py-12 rounded-3xl shadow-xl">
          <h3 className="text-3xl font-bold mb-3">
            Ready to get things done?
          </h3>
          <p className="mb-6 text-black/80">
            Find the right professional in minutes.
          </p>

          <Link to="/get-providers">
            <button className="px-8 py-3 bg-black text-white rounded-xl font-semibold hover:scale-105 transition">
              Get Started
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-24 py-10 text-center text-gray-500 text-sm border-t border-white/10">
        © {new Date().getFullYear()} TaskIt — All rights reserved
      </footer>

    </div>
  );
}

export default LandingPage;