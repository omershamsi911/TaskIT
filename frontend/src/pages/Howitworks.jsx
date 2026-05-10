// howItWorks.jsx
import { Link } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";

const SectionBar = ({ n, title }) => (
  <div
    className="flex items-center justify-between px-6 py-2.5"
    style={{ background: T.IK }}
  >
    <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: T.C }}>
      {title}
    </span>
    <span className="text-2xs font-black" style={{ color: T.CR, opacity: 0.35 }}>
      {n}
    </span>
  </div>
);

const HowItWorks = () => {
  const steps = [
    { step: "01", title: "Describe your task", desc: "Tell us what you need — plumbing, cleaning, tutoring, or any service. Add photos, address, and preferred time." },
    { step: "02", title: "AI instant matching", desc: "Our algorithm scans verified providers, availability, ratings, and price. You get 2–4 top matches in under 30 seconds." },
    { step: "03", title: "Compare & chat", desc: "View provider profiles, certifications, and past reviews. Chat directly to confirm details or ask questions." },
    { step: "04", title: "Book & pay securely", desc: "Pay via card, bank transfer, or wallet. Funds are held in escrow — only released when you approve the job." },
    { step: "05", title: "Job tracking", desc: "Get real‑time status: provider ETA, start/finish notifications, and in-app completion checklist." },
    { step: "06", title: "Review & release", desc: "Inspect the work, confirm satisfaction, and release payment. Both parties leave reviews to strengthen trust." },
  ];

  const features = [
    "Background‑checked professionals",
    "Transparent pricing (no hidden fees)",
    "24/7 customer support",
    "Free rework guarantee",
    "Provider insurance for damages",
  ];

  return (
    <SharedLayout>
      <div
        className="min-h-screen font-sans relative"
        style={{ background: T.CR, color: T.IK }}
      >
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0H0v20' fill='none' stroke='%23ff4d2d' stroke-opacity='0.08' stroke-width='0.5'/%3E%3C/svg%3E\")",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="border-b px-6 md:px-10 py-5" style={{ borderColor: T.IK }}>
            <h1
              className="font-black uppercase leading-none"
              style={{ fontSize: "clamp(2rem, 3vw, 3rem)", letterSpacing: "-0.02em" }}
            >
              How Taskit Works
            </h1>
            <p className="text-2xs font-black uppercase tracking-superwide mt-2" style={{ color: T.LIGHT_IK }}>
              From request to completion – fully digital, fully transparent
            </p>
          </div>

          <div className="h-[6px]" style={{ background: "linear-gradient(to bottom, rgba(255,77,45,0.08), transparent)" }} />

          <div className="flex-1 px-6 md:px-10 py-6">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Steps Grid */}
              <div className="border" style={{ borderColor: T.IK }}>
                <SectionBar n="01" title="The Process" />
                <div className="grid md:grid-cols-2">
                  {steps.map((s, idx) => (
                    <div
                      key={s.step}
                      className="p-6 border-b md:border-r border-t-0 last:border-r-0"
                      style={{ borderColor: T.IK }}
                    >
                      <span className="text-4xl font-black opacity-20" style={{ color: T.C }}>
                        {s.step}
                      </span>
                      <h3 className="text-sm font-black uppercase mt-2 mb-1">{s.title}</h3>
                      <p className="text-2xs leading-relaxed" style={{ color: T.LIGHT_IK }}>
                        {s.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Added trust & safety */}
              <div className="border" style={{ borderColor: T.IK }}>
                <SectionBar n="02" title="Why users trust Taskit" />
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm" style={{ color: T.C }}>◆</span>
                      <span className="text-2xs font-black uppercase tracking-wide">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* For providers */}
              <div className="border" style={{ borderColor: T.IK }}>
                <SectionBar n="03" title="For service providers" />
                <div className="p-6">
                  <p className="text-xs font-black uppercase mb-3">
                    Join the network & grow your business
                  </p>
                  <p className="text-2xs leading-relaxed" style={{ color: T.LIGHT_IK }}>
                    Create a provider profile, set your rates, and get matched with nearby customers.
                    We handle payment collection, scheduling tools, and dispute resolution. No upfront fees —
                    only a success commission when you complete a job.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/register?type=provider"
                      className="inline-block px-8 py-3 text-2xs font-black uppercase tracking-superwide"
                      style={{ background: T.C, color: T.CR }}
                    >
                      Become a provider →
                    </Link>
                  </div>
                </div>
              </div>

              {/* FAQ / CTA */}
              <div className="border p-8 text-center" style={{ borderColor: T.IK }}>
                <p className="text-sm font-black uppercase mb-2">
                  Ready to get things done?
                </p>
                <p className="text-2xs mb-5" style={{ color: T.LIGHT_IK }}>
                  Find a trusted professional in your city today.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    to="/services"
                    className="px-6 py-2 text-2xs font-black uppercase tracking-superwide border-2"
                    style={{ borderColor: T.C, color: T.C }}
                  >
                    Search services
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 text-2xs font-black uppercase tracking-superwide"
                    style={{ background: T.IK, color: T.CR }}
                  >
                    Create account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default HowItWorks;