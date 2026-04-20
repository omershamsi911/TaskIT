// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CORAL  = "#FF5733";
const CREAM  = "#F5F0E6";
const INK    = "#1A1A1A";
const BORDER = `1px solid ${INK}`;
const FONT   = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";

const FOOTER_COLS = [
  {
    heading: "Platform",
    links: ["How it Works", "Pricing", "For Providers", "Enterprise", "API Docs"],
  },
  {
    heading: "Company",
    links: ["About Us", "Careers", "Press Kit", "Blog", "Contact"],
  },
  {
    heading: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
  },
  {
    heading: "Support",
    links: ["Help Centre", "Community", "Status Page", "Dispute Centre"],
  },
];

// ─── FOOTER ──────────────────────────────────────────────────────────────────
const Footer = () => {
  const socials = ["TW", "IN", "FB", "YT"];
  return (
    <footer className="relative z-10" style={{ borderTop: BORDER, fontFamily: FONT }}>
      {/* Top grid */}
      <div className="grid md:grid-cols-12 border-b" style={{ borderColor: INK }}>
        {/* Brand column */}
        <div className="md:col-span-3 px-6 md:px-10 py-10 border-r" style={{ borderColor: INK }}>
          <div className="font-black text-2xl uppercase tracking-widest mb-1" style={{ color: CORAL }}>TASKIT</div>
          <div className="text-xs font-black uppercase tracking-widest opacity-30 mb-6">[STUDIO]</div>
          <p className="text-xs leading-relaxed opacity-50" style={{ fontFamily: "Georgia, serif", fontWeight: 400, letterSpacing: 0 }}>
            Pakistan's premier AI-powered service marketplace. Connecting skilled professionals with people who need them most.
          </p>
          <div className="flex gap-0 mt-8 border" style={{ borderColor: INK }}>
            {socials.map((s, i) => (
              <button key={i}
                className="flex-1 py-2.5 text-xs font-black border-r last:border-r-0 transition-all duration-100"
                style={{ borderColor: INK, background: "transparent", cursor: "pointer", color: INK }}
                onMouseEnter={e => { e.currentTarget.style.background = CORAL; e.currentTarget.style.color = CREAM; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = INK; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_COLS.map((col, ci) => (
          <div key={ci} className="md:col-span-2 px-6 md:px-8 py-10 border-r last:border-r-0" style={{ borderColor: INK }}>
            <h5 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: CORAL }}>
              {col.heading}
            </h5>
            <ul className="space-y-3">
              {col.links.map((lnk, li) => (
                <li key={li}>
                  <a href="#" className="text-xs font-black uppercase tracking-widest opacity-40 transition-opacity duration-100"
                    style={{ textDecoration: "none", color: INK }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = CORAL; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.4; e.currentTarget.style.color = INK; }}
                  >
                    {lnk}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter */}
        <div className="md:col-span-3 px-6 md:px-8 py-10 border-t md:border-t-0 border-l" style={{ borderColor: INK }}>
          <h5 className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: CORAL }}>NEWSLETTER</h5>
          <p className="text-xs opacity-40 mb-5 leading-relaxed" style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Platform updates, city launches, and new service categories.
          </p>
          <div className="flex border" style={{ borderColor: INK }}>
            <input
              type="email"
              placeholder="YOUR@EMAIL.COM"
              className="w-full px-3 py-3 text-xs font-black uppercase tracking-widest"
              style={{ background: "transparent", outline: "none", border: "none", color: INK, fontFamily: FONT, letterSpacing: "0.08em" }}
            />
            <button
              className="px-4 py-3 text-xs font-black uppercase shrink-0 transition-all duration-100"
              style={{ background: CORAL, color: CREAM, border: "none", cursor: "pointer", borderLeft: BORDER }}
              onMouseEnter={e => { e.currentTarget.style.background = INK; }}
              onMouseLeave={e => { e.currentTarget.style.background = CORAL; }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 md:px-10 py-5 gap-3"
        style={{ borderTop: BORDER }}>
        <span className="text-xs font-black uppercase tracking-widest opacity-30">
          © {new Date().getFullYear()} TASKIT PLATFORM INC. — ALL RIGHTS RESERVED
        </span>
        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Cookies"].map((lnk, i) => (
            <a key={i} href="#"
              className="text-xs font-black uppercase tracking-widest opacity-30 transition-opacity"
              style={{ textDecoration: "none", color: INK }}
              onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = CORAL; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = 0.3; e.currentTarget.style.color = INK; }}
            >
              {lnk}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;