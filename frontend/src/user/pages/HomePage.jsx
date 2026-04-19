import { useState } from "react";
import { Link } from "react-router-dom";
import MapView from "../components/MapComponent";

export default function HomePage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* TOP BAR */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4 py-3">

          {/* Logo */}
          <Link to="/">
            <h1 className="text-xl font-bold text-green-400 tracking-wide">
                TaskIt
            </h1>
          </Link>

          {/* Search */}
          <div className="flex-1 flex bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-inner">
            <input
              type="text"
              placeholder="Search services (e.g. plumber, electrician)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-transparent outline-none text-white placeholder:text-gray-500"
            />
            <button className="px-5 bg-green-500 hover:bg-green-600 transition text-black font-semibold">
              Search
            </button>
          </div>

        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">

        {/* MAP */}
        <div className="flex-1 relative">

          <MapView search={search} />

          {/* Overlay */}
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-lg px-4 py-2 rounded-xl text-sm text-gray-300 border border-white/10 shadow-lg">
            Showing nearby providers
          </div>

        </div>

        {/* SIDEBAR */}
        <div className="w-85 bg-slate-900/80 backdrop-blur-xl border-l border-white/10 flex flex-col">

          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">
              Nearby Providers
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Based on your search & location
            </p>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-green-400/30 transition cursor-pointer"
              >
                {/* Top */}
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white group-hover:text-green-400 transition">
                    Provider Name
                  </h3>
                  <span className="text-xs text-green-400 font-medium">
                    ★ 4.{item}
                  </span>
                </div>

                {/* Meta */}
                <p className="text-sm text-gray-400 mt-1">
                  Plumbing • 2 km away
                </p>

                {/* Status */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-green-400">
                    ● Available now
                  </span>

                  <button className="text-xs px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition">
                    View
                  </button>
                </div>
              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}