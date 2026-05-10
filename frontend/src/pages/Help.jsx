// help.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";

const Help = () => {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const categories = [
    { name: "Getting Started", icon: "🚀", count: 8, color: T.C },
    { name: "Payments & Billing", icon: "💳", count: 6, color: "#4ade80" },
    { name: "Provider Help", icon: "🔧", count: 10, color: "#facc15" },
    { name: "Account & Security", icon: "🔒", count: 7, color: "#60a5fa" },
    { name: "Disputes & Refunds", icon: "⚖️", count: 5, color: "#f87171" },
    { name: "Tech Support", icon: "📱", count: 9, color: "#a78bfa" },
  ];

  const faqs = [
    { id: 1, q: "How do I create an account?", a: "Click 'Register' on the top right, enter your phone number or email, verify OTP, and complete your profile in 2 minutes." },
    { id: 2, q: "What payment methods are accepted?", a: "Credit/debit cards, EasyPaisa, JazzCash, and bank transfers. All payments are held in escrow until job completion." },
    { id: 3, q: "How are providers verified?", a: "We run CNIC checks, criminal record verification, skill tests, and in-person interviews. Only 1 in 5 applicants pass." },
    { id: 4, q: "Can I cancel a booking?", a: "Yes, free cancellation up to 2 hours before the job. After that, a 50% fee may apply. Go to 'My Bookings' → Cancel." },
    { id: 5, q: "What if the provider doesn't show up?", a: "Report it within 1 hour. We'll refund you fully and find a replacement provider immediately." },
    { id: 6, q: "How do I become a provider?", a: "Apply through the 'Become a Provider' link. Submit your CNIC, skills, and a short video introduction. Our team reviews within 48h." },
    { id: 7, q: "Is there a fee for using Taskit?", a: "For customers: no platform fee. For providers: 12% success fee per completed job. No hidden charges." },
    { id: 8, q: "How do I reset my password?", a: "On login page, click 'Forgot password', enter your email, and follow the link sent to you. Valid for 15 minutes." },
  ];

  const popularTopics = ["Account Setup", "Payment Failed", "Cancel Booking", "Report Provider", "Refund Status"];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFaq = (id) => setOpenFaq(openFaq === id ? null : id);

  return (
    <SharedLayout>
      <div className="min-h-screen font-sans" style={{ background: T.CR, color: T.IK }}>
        {/* Hero section with search */}
        <div className="relative overflow-hidden border-b" style={{ borderColor: T.IK }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 px-6 md:px-12 py-16 md:py-24 max-w-6xl mx-auto">
            <div className="inline-block px-4 py-1 mb-6 text-2xs font-black uppercase tracking-wider border-l-4" style={{ borderLeftColor: T.C }}>
              HELP CENTER
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase leading-[1.1] tracking-tighter">
              How can we<br />
              <span style={{ color: T.C }}>help you today?</span>
            </h1>
            <div className="mt-8 max-w-2xl">
              <div className="flex border-2" style={{ borderColor: T.IK }}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for 'payment', 'cancel', 'verification'..."
                  className="flex-1 p-4 bg-transparent text-sm font-mono outline-none"
                  style={{ color: T.IK }}
                />
                <button className="px-8 font-black text-sm" style={{ background: T.C, color: T.CR }}>
                  SEARCH
                </button>
              </div>
              <div className="mt-3 text-right text-2xs font-mono opacity-60">
                {filteredFaqs.length} results found
              </div>
            </div>
          </div>
        </div>

        {/* Categories grid */}
        <div className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
          <div className="flex justify-between items-end border-b pb-4 mb-8" style={{ borderColor: T.IK }}>
            <h2 className="text-3xl font-black uppercase">Browse by topic</h2>
            <span className="text-2xs font-mono opacity-60">{categories.length} categories</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="group p-6 text-center border transition-all hover:scale-105 cursor-pointer"
                style={{ borderColor: T.IK, background: i % 2 === 0 ? T.CR_ALT : T.CR }}
              >
                <div className="text-4xl mb-3 group-hover:rotate-12 transition">{cat.icon}</div>
                <div className="text-xs font-black uppercase">{cat.name}</div>
                <div className="text-2xs font-mono mt-1" style={{ color: T.LIGHT_IK }}>{cat.count} articles</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ accordion section */}
        <div className="px-6 md:px-12 py-16 max-w-5xl mx-auto border-t" style={{ borderColor: T.IK }}>
          <div className="text-center mb-10">
            <span className="text-2xs font-mono bg-black text-white px-3 py-1" style={{ background: T.C }}>MOST ASKED</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase mt-4">Frequently asked questions</h2>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="border" style={{ borderColor: T.IK }}>
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex justify-between items-center p-5 text-left font-black uppercase tracking-wide transition-all hover:bg-black/5"
                  style={{ background: openFaq === faq.id ? T.IK : "transparent", color: openFaq === faq.id ? T.CR : T.IK }}
                >
                  <span>{faq.q}</span>
                  <span className="text-2xl">{openFaq === faq.id ? "−" : "+"}</span>
                </button>
                {openFaq === faq.id && (
                  <div className="p-5 border-t text-sm leading-relaxed" style={{ borderColor: T.IK, background: T.CR_ALT, color: T.LIGHT_IK }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="p-8 text-center text-sm opacity-60">No results found. Try a different keyword or contact support.</div>
            )}
          </div>
        </div>

        {/* Popular topics + Quick contact strip */}
        <div className="border-y py-12 my-8" style={{ borderColor: T.IK, background: T.CR_ALT }}>
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="text-2xs font-black uppercase tracking-wider mb-3" style={{ color: T.C }}>POPULAR NOW</div>
                <div className="flex flex-wrap gap-2">
                  {popularTopics.map((topic, i) => (
                    <span key={i} className="px-4 py-2 text-2xs font-black uppercase border cursor-pointer hover:bg-black hover:text-white transition" style={{ borderColor: T.IK }}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xs font-mono">STILL STUCK?</div>
                <Link to="/contact" className="inline-block mt-2 px-8 py-3 text-sm font-black uppercase border-4 hover:bg-black hover:text-white transition" style={{ borderColor: T.C }}>
                  CONTACT SUPPORT →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Live chat banner */}
        <div className="px-6 md:px-12 py-16 text-center">
          <div className="max-w-3xl mx-auto p-8 border-4" style={{ borderColor: T.IK, background: T.IK, color: T.CR }}>
            <div className="text-5xl mb-4 animate-pulse">💬</div>
            <h3 className="text-2xl font-black uppercase">Live chat available 24/7</h3>
            <p className="text-sm mt-2 opacity-90">Average wait time: under 60 seconds. Real humans, not bots.</p>
            <button className="mt-6 px-10 py-3 font-black uppercase border-2 border-current hover:bg-black hover:text-white transition">
              START CHAT NOW
            </button>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default Help;