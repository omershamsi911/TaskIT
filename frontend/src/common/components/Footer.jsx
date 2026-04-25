import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

const FOOTER_COLS = [
  {
    heading: "Platform",
    links: [
      { label: "How it Works", path: "/#how-it-works" },
      { label: "Browse Services", path: "/discovery" },
      { label: "For Providers", path: "/signup" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", path: "/#about" },
      { label: "Contact", path: "/#contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Service", path: "/terms" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Centre", path: "/help" },
      { label: "Dispute Centre", path: "/disputes" },
    ],
  },
];

const Footer = () => {
  const { C, CR, IK, CR_ALT, LIGHT_IK } = useTheme();
  const socials = ["TW", "IN", "FB", "YT"];

  return (
    <footer className="relative z-10 font-sans" style={{ borderTop: `1px solid ${IK}` }}>
      {/* Top grid */}
      <div className="grid md:grid-cols-12 border-b" style={{ borderColor: IK }}>
        {/* Brand column */}
        <div className="md:col-span-3 px-6 md:px-10 py-10 border-r" style={{ borderColor: IK }}>
          <Link to="/" className="no-underline">
            <div className="font-black text-2xl uppercase tracking-superwide mb-1" style={{ color: C }}>TASKIT</div>
          </Link>
          <div className="text-2xs font-black uppercase tracking-superwide mb-6" style={{ color: LIGHT_IK }}>[STUDIO]</div>
          <p className="text-2xs leading-relaxed" style={{ color: LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Pakistan's premier AI-powered service marketplace. Connecting skilled professionals with people who need them most.
          </p>
          <div className="flex mt-8 border" style={{ borderColor: IK }}>
            {socials.map((s, i) => (
              <button key={i}
                className="flex-1 py-2.5 text-2xs font-black border-r last:border-r-0 transition-all duration-100"
                style={{ borderColor: IK, background: "transparent", cursor: "pointer", color: IK }}
                onMouseEnter={e => { e.currentTarget.style.background = C; e.currentTarget.style.color = CR; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IK; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_COLS.map((col, ci) => (
          <div key={ci} className="md:col-span-2 px-6 md:px-8 py-10 border-r last:border-r-0" style={{ borderColor: IK }}>
            <h5 className="text-2xs font-black uppercase tracking-superwide mb-6" style={{ color: C }}>
              {col.heading}
            </h5>
            <ul className="space-y-3">
              {col.links.map((lnk, li) => (
                <li key={li}>
                  <Link
                    to={lnk.path}
                    className="text-2xs font-black uppercase tracking-superwide no-underline transition-all duration-100"
                    style={{ color: LIGHT_IK }}
                    onMouseEnter={e => { e.currentTarget.style.color = C; }}
                    onMouseLeave={e => { e.currentTarget.style.color = LIGHT_IK; }}
                  >
                    {lnk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter */}
        <div className="md:col-span-3 px-6 md:px-8 py-10 border-t md:border-t-0 md:border-l" style={{ borderColor: IK }}>
          <h5 className="text-2xs font-black uppercase tracking-superwide mb-2" style={{ color: C }}>NEWSLETTER</h5>
          <p className="text-2xs leading-relaxed mb-5" style={{ color: LIGHT_IK, fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Platform updates, city launches, and new service categories.
          </p>
          <div className="flex border" style={{ borderColor: IK }}>
            <input
              type="email"
              placeholder="YOUR@EMAIL.COM"
              className="w-full px-3 py-3 text-2xs font-black uppercase tracking-superwide bg-transparent outline-none"
              style={{ color: IK, border: "none" }}
            />
            <button
              className="px-4 py-3 text-2xs font-black uppercase shrink-0 transition-all duration-100 border-l"
              style={{ background: C, color: CR, borderColor: IK, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = IK; }}
              onMouseLeave={e => { e.currentTarget.style.background = C; }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 md:px-10 py-5 gap-3" style={{ borderTop: `1px solid ${IK}` }}>
        <span className="text-2xs font-black uppercase tracking-superwide" style={{ color: LIGHT_IK }}>
          © {new Date().getFullYear()} TASKIT PLATFORM INC. — ALL RIGHTS RESERVED
        </span>
        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Cookies"].map((lnk, i) => (
            <Link key={i} to={`/${lnk.toLowerCase()}`}
              className="text-2xs font-black uppercase tracking-superwide no-underline transition-all duration-100"
              style={{ color: LIGHT_IK }}
              onMouseEnter={e => { e.currentTarget.style.color = C; }}
              onMouseLeave={e => { e.currentTarget.style.color = LIGHT_IK; }}
            >
              {lnk}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;