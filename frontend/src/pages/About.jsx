import { Link } from "react-router-dom";
import Footer from "../components/Footer";

// ---------------------------------------------------------------------------
// Theme (unchanged)
// ---------------------------------------------------------------------------
const useTheme = () => ({
  C: "#ff4d2d",
  CR: "#fdfbf7",
  IK: "#1a1a1a",
  CR_ALT: "#efe9e1",
  LIGHT_IK: "#6b6b6b",
});

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------
const SectionBar = ({ n, title }) => {
  const { C, CR, IK } = useTheme();

  return (
    <div
      className="flex items-center justify-between px-6 py-2.5"
      style={{ background: IK }}
    >
      <span
        className="text-2xs font-black uppercase tracking-superwide"
        style={{ color: C }}
      >
        {title}
      </span>
      <span className="text-2xs font-black" style={{ color: CR, opacity: 0.35 }}>
        {n}
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// About Page
// ---------------------------------------------------------------------------
const About = () => {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();

  const team = [
    { name: "Founder", role: "Vision & Direction" },
    { name: "Tech Lead", role: "Platform Architecture" },
    { name: "Design Lead", role: "Brutalist UI Systems" },
    { name: "Ops Lead", role: "Provider Network Growth" },
  ];

  const stats = [
    { value: "500+", label: "Verified Providers" },
    { value: "10K+", label: "Jobs Completed" },
    { value: "4.8", label: "Avg Rating" },
    { value: "5", label: "Cities Live" },
  ];

  return (
    <div
      className="min-h-screen font-sans relative"
      style={{ background: CR, color: IK }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0H0v20' fill='none' stroke='%23ff4d2d' stroke-opacity='0.08' stroke-width='0.5'/%3E%3C/svg%3E\")",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Breadcrumb */}
        <div
          className="flex items-center border-b px-6"
          style={{ borderColor: IK }}
        >
          <span
            className="py-3 pr-5 border-r text-2xs font-black uppercase tracking-superwide"
            style={{ color: LIGHT_IK, borderColor: IK }}
          >
            ABOUT
          </span>

          <div className="ml-auto py-2">
            <div
              className="inline-flex items-center gap-2 border px-3 py-1.5"
              style={{ background: IK, borderColor: IK }}
            >
              <span className="text-sm font-black" style={{ color: C }}>
                §
              </span>
              <span
                className="text-2xs font-black uppercase tracking-superwide"
                style={{ color: CR }}
              >
                STUDIO INFO
              </span>
            </div>
          </div>
        </div>

        {/* HEADER (tight + no dead space fix applied here) */}
        <div
          className="border-b px-6 md:px-10 py-5"
          style={{ borderColor: IK }}
        >
          <h1
            className="font-black uppercase leading-none"
            style={{
              fontSize: "clamp(2rem, 3vw, 3rem)",
              letterSpacing: "-0.02em",
            }}
          >
            About Taskit
          </h1>

          <p
            className="text-2xs font-black uppercase tracking-superwide mt-2"
            style={{ color: LIGHT_IK }}
          >
            AI-powered service marketplace built in Pakistan
          </p>
        </div>

        {/* subtle seam (fixes “gap feeling”) */}
        <div
          className="h-[6px]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,77,45,0.08), transparent)",
          }}
        />

        {/* CONTENT */}
        <div className="flex-1 px-6 md:px-10 py-6">

          <div className="max-w-4xl mx-auto space-y-8">

            {/* Mission */}
            <div className="border" style={{ borderColor: IK }}>
              <SectionBar n="01" title="Mission" />
              <div className="p-6">
                <p className="text-xs font-black uppercase tracking-wide mb-3">
                  We connect people with trusted professionals instantly.
                </p>
                <p className="text-2xs leading-relaxed" style={{ color: LIGHT_IK }}>
                  Taskit eliminates uncertainty in hiring services by using AI-driven matching,
                  verified providers, and transparent ratings so every job is done right the first time.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="border" style={{ borderColor: IK }}>
              <SectionBar n="02" title="Vision" />
              <div className="p-6">
                <p className="text-2xs leading-relaxed" style={{ color: LIGHT_IK }}>
                  We aim to build Pakistan’s largest digital workforce layer — where every skilled person
                  can earn fairly and every household can access reliable help in seconds.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="border" style={{ borderColor: IK }}>
              <SectionBar n="03" title="Impact" />
              <div className="grid grid-cols-2 md:grid-cols-4 border-b" style={{ borderColor: IK }}>
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="p-6 border-r last:border-r-0 text-center"
                    style={{ borderColor: IK }}
                  >
                    <div className="text-2xl font-black" style={{ color: C }}>
                      {s.value}
                    </div>
                    <div
                      className="text-2xs font-black uppercase tracking-superwide mt-2"
                      style={{ color: LIGHT_IK }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="border" style={{ borderColor: IK }}>
              <SectionBar n="04" title="How It Works" />
              <div className="grid md:grid-cols-3">
                {[
                  ["Post Request", "Describe what you need"],
                  ["AI Match", "Get best providers instantly"],
                  ["Complete Job", "Track & finish securely"],
                ].map((s, i) => (
                  <div
                    key={i}
                    className="p-6 border-r last:border-r-0"
                    style={{ borderColor: IK }}
                  >
                    <div className="text-sm font-black" style={{ color: C }}>
                      0{i + 1}
                    </div>
                    <div className="text-xs font-black uppercase mt-2">
                      {s[0]}
                    </div>
                    <div className="text-2xs mt-1" style={{ color: LIGHT_IK }}>
                      {s[1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team */}
            <div className="border" style={{ borderColor: IK }}>
              <SectionBar n="05" title="Team" />
              <div className="grid sm:grid-cols-2 gap-4 p-6">
                {team.map((m, i) => (
                  <div
                    key={i}
                    className="border p-5"
                    style={{
                      borderColor: IK,
                      background: i % 2 ? CR_ALT : CR,
                    }}
                  >
                    <div className="text-xs font-black uppercase">
                      {m.name}
                    </div>
                    <div
                      className="text-2xs font-black uppercase mt-1"
                      style={{ color: C }}
                    >
                      {m.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="border p-8 text-center" style={{ borderColor: IK }}>
              <h2 className="text-sm font-black uppercase mb-4">
                Join Taskit Network
              </h2>

              <Link
                to="/signup"
                className="inline-block px-10 py-3 text-sm font-black uppercase tracking-superwide"
                style={{ background: C, color: CR }}
              >
                Become a Provider →
              </Link>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default About;