import reactLogo from './assets/react.svg'
import heroImg from './assets/hero.png'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-10 py-6">
        <h1 className="text-3xl font-bold text-green-400 tracking-wide">
          TaskIt
        </h1>

        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl">
          Get Started
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center px-6 mt-10">

        <h2 className="text-5xl font-extrabold leading-tight max-w-3xl">
          Book trusted service providers <span className="text-green-400">at your doorstep</span>
        </h2>

        <p className="text-gray-400 mt-4 max-w-xl">
          From cleaning to plumbing, find skilled professionals near you instantly with TaskIt.
        </p>

        {/* SEARCH BAR */}
        <div className="mt-8 w-full max-w-2xl flex bg-white/10 backdrop-blur-md border border-green-500/30 rounded-2xl overflow-hidden">
          <input
            type="text"
            placeholder="Search for services (e.g. plumber, cleaner, electrician)"
            className="w-full px-4 py-3 bg-transparent outline-none text-white"
          />
          <button className="px-6 bg-green-500 hover:bg-green-600 text-black font-bold">
            Search
          </button>
        </div>

        {/* HERO IMAGE */}
        <img
          src={heroImg}
          alt="Hero"
          className="w-80 mt-10 rounded-2xl shadow-2xl border border-green-500/30"
        />
      </section>

      {/* SERVICES */}
      <section className="mt-16 px-10">

        <h3 className="text-2xl font-bold mb-6 text-green-400">
          Popular Services
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {[
            "Cleaning",
            "Plumbing",
            "Electrician",
            "Moving",
            "Carpentry",
            "Painting",
            "AC Repair",
            "Tutoring"
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white/5 border border-green-500/20 rounded-2xl p-5 text-center hover:bg-green-500/10 transition"
            >
              <img src={reactLogo} className="w-10 mx-auto mb-3 opacity-70" alt="" />
              <p className="font-semibold">{item}</p>
            </div>
          ))}

        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-20 py-10 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} TaskIt — All rights reserved
      </footer>

    </div>
  )
}

export default App