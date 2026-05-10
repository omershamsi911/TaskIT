import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// ─── DESIGN TOKENS (light theme) ─────────────────────────────────────────────
const T = {
  C:        "#FF5733",
  CR:       "#F5F0E6",
  CR_ALT:   "#FFFFFF",
  IK:       "#1A1A1A",
  LIGHT_IK: "#6B6B6B",
};

const GLOBAL_CSS = `
  @keyframes ticker  { from { transform:translateX(0) } to { transform:translateX(-50%) } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
  .tk-ticker  { animation: ticker 28s linear infinite; }
  .tk-reviews { animation: ticker 38s linear infinite; }
  *{box-sizing:border-box;}
  @media(max-width:900px){
    .tk-hero-grid{grid-template-columns:1fr!important;}
    .tk-vert{display:none!important;}
    .tk-stats{flex-direction:row!important;flex-wrap:wrap;}
    .tk-stats>div{flex:1 1 50%!important;}
    .tk-cat{grid-template-columns:repeat(2,1fr)!important;}
    .tk-steps{grid-template-columns:repeat(2,1fr)!important;}
    .tk-steps>div{border-bottom:1px solid #1A1A1A!important;}
    .tk-cta{grid-template-columns:1fr!important;}
    .tk-cta>div:first-child{border-right:none!important;border-bottom:1px solid #FF5733!important;}
  }
  @media(max-width:600px){
    .tk-cat{grid-template-columns:1fr!important;}
    .tk-fnav{display:none;}
    .tk-desktop{display:none!important;}
    .tk-hamburger{display:flex!important;}
  }
  @media(min-width:601px){
    .tk-hamburger{display:none!important;}
    .tk-mobile-menu{display:none!important;}
  }
`;

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
const SectionBar = ({ left, right }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 48px", borderBottom:`1px solid ${T.IK}`, background:T.IK }}>
    <span style={{ fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:T.C }}>{left}</span>
    <span style={{ fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:T.CR }}>{right}</span>
  </div>
);

const HoverBtn = ({ to, label, filled, style={} }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"block", textAlign:"center", padding:"16px 32px", fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", textDecoration:"none", cursor:"pointer", transition:"all 0.1s",
        background: filled ? (hov?T.IK:T.C) : (hov?T.CR:"transparent"),
        color:       filled ? T.CR         : (hov?T.IK:T.CR),
        border:      filled ? `2px solid ${T.C}` : `2px solid ${T.CR}`,
        ...style }}>
      {label}
    </Link>
  );
};

// ─── 1. TICKER ────────────────────────────────────────────────────────────────
const Ticker = () => {
  const items = ["VERIFIED PROVIDERS","FAST BOOKING","TRANSPARENT PRICING","ZERO HIDDEN FEES","AVAILABLE NOW","KARACHI · LAHORE · ISLAMABAD","BACKGROUND CHECKED","INSTANT CONFIRMATION"];
  return (
    <div style={{ background:T.IK, overflow:"hidden" }}>
      <div className="tk-ticker" style={{ display:"flex", whiteSpace:"nowrap" }}>
        {[...items,...items].map((item,i) => (
          <span key={i} style={{ padding:"8px 32px", fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:T.CR, flexShrink:0 }}>
            {item}<span style={{ margin:"0 20px", color:T.C }}>//</span>
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── 2. LIVE CLOCK ────────────────────────────────────────────────────────────
const LiveClock = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () => setTime(new Date().toLocaleTimeString("en-PK",{ hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:"Asia/Karachi" }) + " PKT");
    fmt(); const id = setInterval(fmt,1000); return ()=>clearInterval(id);
  },[]);
  return <span style={{ fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", fontVariantNumeric:"tabular-nums", color:T.C }}>{time}</span>;
};

// ─── 3. NAVBAR ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label:"Services",  path:"/services" },
  { label:"Pricing",   path:"/pricing" },
  { label:"About",     path:"/about"   },
];

const NavLink = ({ label, path }) => {
  const [hov,setHov] = useState(false);
  return (
    <Link to={path} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", alignItems:"center", padding:"0 20px", fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", textDecoration:"none", borderRight:`1px solid ${T.IK}`, background:hov?T.C:"transparent", color:hov?T.CR:T.IK, transition:"all 0.1s" }}>
      {label}
    </Link>
  );
};

const AuthLink = ({ to, label, filled }) => {
  const [hov,setHov] = useState(false);
  return (
    <Link to={to} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", alignItems:"center", padding:"0 24px", borderLeft:`1px solid ${T.IK}`, textDecoration:"none", fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", transition:"all 0.1s",
        background: filled?(hov?T.IK:T.C):(hov?T.IK:"transparent"),
        color:       filled?T.CR:(hov?T.CR:T.IK) }}>
      {label}
    </Link>
  );
};

const Navbar = () => {
  const [scrolled,setScrolled] = useState(false);
  const [mobileOpen,setMobileOpen] = useState(false);
  const token = typeof localStorage !== "undefined" && localStorage.getItem("access_token");
  useEffect(()=>{ const fn=()=>setScrolled(window.scrollY>4); window.addEventListener("scroll",fn); return()=>window.removeEventListener("scroll",fn); },[]);

  return (
    <header style={{ position:"sticky", top:0, zIndex:50, background:T.CR, borderBottom:`1px solid ${T.IK}`, boxShadow:scrolled?`0 2px 0 ${T.IK}`:"none" }}>
      <div style={{ display:"flex", alignItems:"stretch", minHeight:56 }}>
        {/* Logo */}
        <Link to="/" style={{ display:"flex", alignItems:"center", padding:"0 24px", borderRight:`1px solid ${T.IK}`, textDecoration:"none", flexShrink:0 }}>
          <span style={{ fontWeight:900, fontSize:16, textTransform:"uppercase", letterSpacing:"0.15em", color:T.C }}>TASKIT</span>
        </Link>
        {/* Nav */}
        <nav className="tk-desktop" style={{ display:"flex", alignItems:"stretch", borderRight:`1px solid ${T.IK}` }}>
          {NAV_LINKS.map(l=><NavLink key={l.label} {...l}/>)}
        </nav>
        {/* Clock */}
        <div className="tk-desktop" style={{ display:"flex", alignItems:"center", padding:"0 24px", borderRight:`1px solid ${T.IK}` }}>
          <LiveClock/>
        </div>
        {/* Live dot */}
        <div className="tk-desktop" style={{ display:"flex", alignItems:"center", padding:"0 20px", borderRight:`1px solid ${T.IK}`, gap:8 }}>
          <span style={{ width:8, height:8, background:T.C, animation:"pulse 1.8s infinite", display:"inline-block" }}/>
          <span style={{ fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:T.LIGHT_IK }}>LIVE</span>
        </div>
        {/* Auth */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"stretch" }}>
          {token ? (
            <Link to="/profile" style={{ display:"flex", alignItems:"center", padding:"0 20px", borderLeft:`1px solid ${T.IK}`, textDecoration:"none", fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:T.IK }}>MY ACCOUNT</Link>
          ) : (
            <>
              <AuthLink to="/login"    label="LOGIN"   filled={false}/>
              <AuthLink to="/register" label="SIGN UP" filled={true}/>
            </>
          )}
          {/* Hamburger */}
          <button className="tk-hamburger" onClick={()=>setMobileOpen(m=>!m)}
            style={{ display:"none", alignItems:"center", justifyContent:"center", padding:"0 20px", borderLeft:`1px solid ${T.IK}`, background:"transparent", cursor:"pointer", color:T.IK, fontSize:18, fontWeight:900, border:"none", borderLeft:`1px solid ${T.IK}` }}>
            {mobileOpen?"✕":"☰"}
          </button>
        </div>
      </div>
      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="tk-mobile-menu" style={{ borderTop:`1px solid ${T.IK}` }}>
          {NAV_LINKS.map(l=>(
            <Link key={l.label} to={l.path} onClick={()=>setMobileOpen(false)}
              style={{ display:"flex", alignItems:"center", padding:"16px 24px", borderBottom:`1px solid ${T.IK}`, textDecoration:"none", fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:T.IK }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

// ─── 4. HERO ──────────────────────────────────────────────────────────────────
const PLATFORM_STATS = [
  { val:"500+",   label:"Verified Providers" },
  { val:"3,800+", label:"Completed Jobs"     },
  { val:"5,000+", label:"Total Users"        },
  { val:"4.9/5",  label:"Platform Rating"   },
];
const QUICK_CHIPS = ["Plumber","Electrician","Cleaner","Tutor","AC Repair","Painter"];

const Hero = () => {
  const [query,setQuery] = useState("");
  const navigate = useNavigate();
  const go = ()=>{ navigate(query.trim()?`/services?search=${encodeURIComponent(query.trim())}`:"/services"); };
  const [searchHov,setSearchHov] = useState(false);

  return (
    <section className="tk-hero-grid" style={{ display:"grid", gridTemplateColumns:"56px 1fr 280px", borderBottom:`1px solid ${T.IK}` }}>
      {/* Vert label */}
      <div className="tk-vert" style={{ display:"flex", alignItems:"flex-start", justifyContent:"center", borderRight:`1px solid ${T.IK}`, paddingTop:40 }}>
        {/* <span style={{ fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:T.LIGHT_IK, writingMode:"vertical-rl", padding:"32px 0" }}></span> */}
      </div>

      {/* Copy */}
      <div style={{ padding:"56px 48px", borderRight:`1px solid ${T.IK}` }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:10, border:`1px solid ${T.C}`, padding:"6px 12px", marginBottom:32 }}>
          <span style={{ width:6, height:6, background:T.C, display:"inline-block" }}/>
          <span style={{ fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:T.C }}>DOMESTIC SERVICES PLATFORM — PAKISTAN</span>
        </div>
        <h1 style={{ fontWeight:900, textTransform:"uppercase", lineHeight:0.88, letterSpacing:"-0.025em", margin:0, fontSize:"clamp(2.8rem,7.5vw,5.5rem)" }}>
          EXPERTS<br/>FOR HIRE.<br/>
          <span style={{ color:T.C }}>PHENOMENAL</span><br/>
          <span style={{ WebkitTextStroke:`2px ${T.IK}`, color:"transparent" }}>RESULTS.</span>
        </h1>
        <p style={{ marginTop:32, maxWidth:480, fontSize:13, lineHeight:1.7, color:T.LIGHT_IK, fontFamily:"Georgia, serif", fontWeight:400 }}>
          Book verified plumbers, electricians, cleaners, tutors and more — across Pakistan's major cities. Transparent pricing. Background-checked professionals. Instant confirmation.
        </p>
        {/* Search */}
        <div style={{ marginTop:40, display:"flex", border:`2px solid ${T.IK}` }}>
          <input type="text" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}
            placeholder="WHAT SERVICE DO YOU NEED?"
            style={{ flex:1, padding:"16px", fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", background:"transparent", border:"none", outline:"none", color:T.IK }}/>
          <button onClick={go} onMouseEnter={()=>setSearchHov(true)} onMouseLeave={()=>setSearchHov(false)}
            style={{ padding:"16px 28px", fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", background:searchHov?T.IK:T.C, color:T.CR, border:"none", borderLeft:`2px solid ${T.IK}`, cursor:"pointer", transition:"all 0.1s", flexShrink:0 }}>
            SEARCH →
          </button>
        </div>
        {/* Chips */}
        <div style={{ marginTop:20, display:"flex", flexWrap:"wrap", gap:8 }}>
          {QUICK_CHIPS.map(s=>{
            const [h,setH]=useState(false);
            return (
              <button key={s} onClick={()=>navigate(`/services?search=${s}`)} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
                style={{ border:`1px solid ${T.IK}`, padding:"6px 12px", fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", background:h?T.C:"transparent", color:h?T.CR:T.IK, cursor:"pointer", transition:"all 0.1s" }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="tk-stats" style={{ display:"flex", flexDirection:"column" }}>
        {PLATFORM_STATS.map((s,i)=>(
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"28px 32px", borderBottom:i<3?`1px solid ${T.IK}`:"none", background:i%2===0?T.CR:T.CR_ALT }}>
            <div style={{ fontSize:"clamp(2rem,3.5vw,3rem)", fontWeight:900, lineHeight:1, letterSpacing:"-0.03em", color:T.C }}>{s.val}</div>
            <div style={{ marginTop:4, fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:T.LIGHT_IK }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── 5. CATEGORY GRID ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { name:"Plumbing",    desc:"Leak fixes · Pipe fitting"  },
  { name:"Electrician", desc:"Wiring · Panels · Sockets"  },
  { name:"Cleaning",    desc:"Deep clean · Office · Home" },
  { name:"Tutoring",    desc:"Math · Science · Languages" },
  { name:"Carpentry",   desc:"Custom furniture · Repairs" },
  { name:"AC Repair",   desc:"Service · Gas · Install"    },
  { name:"Painting",    desc:"Interior · Exterior"        },
  { name:"Moving",      desc:"Packing · Loading"          },
  { name:"Gardening",   desc:"Lawn · Pruning · Landscape" },
  { name:"Security",    desc:"CCTV · Alarms · Access"     },
  { name:"IT Support",  desc:"Network · Repair · Setup"   },
  { name:"Photography", desc:"Events · Product · Portraits"},
];

const CategoryGrid = () => {
  const [hovered,setHovered] = useState(null);
  return (
    <section style={{ borderBottom:`1px solid ${T.IK}` }}>
      <SectionBar left="CATEGORIES" right={`${CATEGORIES.length} SERVICES AVAILABLE`}/>
      <div className="tk-cat" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
        {CATEGORIES.map((cat,i)=>{
          const isHov = hovered===i;
          const col = 4;
          const isLastRow = i >= CATEGORIES.length - col;
          const isLastCol = (i+1)%col===0;
          return (
            <Link key={i} to="/services"
              onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)}
              style={{ position:"relative", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"32px", borderRight:isLastCol?`1px solid ${T.IK}`:`1px solid ${T.IK}`, borderBottom:isLastRow?"none":`1px solid ${T.IK}`, background:isHov?T.IK:(i%2===0?T.CR:T.CR_ALT), cursor:"pointer", transition:"background 0.1s", textDecoration:"none" }}>
              <span style={{ fontSize:10, fontWeight:900, color:isHov?T.CR:T.LIGHT_IK, marginBottom:16 }}>{String(i+1).padStart(2,"0")}</span>
              <div style={{ fontSize:20, fontWeight:900, marginBottom:16, color:isHov?T.C:T.IK }}>◆</div>
              <p style={{ fontSize:11, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.08em", color:isHov?T.CR:T.IK, margin:"0 0 4px" }}>{cat.name}</p>
              <p style={{ fontSize:10, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.1em", color:isHov?T.CR:T.LIGHT_IK, margin:0, lineHeight:1.5 }}>{cat.desc}</p>
              {isHov&&<span style={{ position:"absolute", bottom:20, right:20, fontSize:14, fontWeight:900, color:T.C }}>→</span>}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

// ─── 6. HOW IT WORKS ──────────────────────────────────────────────────────────
const STEPS = [
  { n:"01", title:"SEARCH",   body:"Enter what you need. Every verified provider in your area — ranked by proximity, rating, and price." },
  { n:"02", title:"COMPARE",  body:"Inspect profiles, certifications, job history, and transparent pricing. All data verified by our team." },
  { n:"03", title:"BOOK",     body:"Confirm your slot in seconds. Get provider contact, ETA, and a job reference number immediately." },
  { n:"04", title:"PAY SAFE", body:"Payment held securely until your job is complete. Release funds only when you're satisfied." },
];

const HowItWorks = () => (
  <section style={{ borderBottom:`1px solid ${T.IK}` }}>
    <SectionBar left="PROCESS" right="FOUR STEPS"/>
    <div className="tk-steps" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
      {STEPS.map((s,i)=>(
        <div key={i} style={{ padding:"48px 32px", borderRight:i<3?`1px solid ${T.IK}`:"none", background:i%2===0?T.CR:T.CR_ALT }}>
          <div style={{ fontSize:64, fontWeight:900, marginBottom:24, lineHeight:1, letterSpacing:"-0.04em", color:T.C, opacity:0.18 }}>{s.n}</div>
          <h4 style={{ fontSize:12, fontWeight:900, letterSpacing:"0.1em", textTransform:"uppercase", margin:"0 0 16px" }}>{s.title}</h4>
          <p style={{ fontSize:10, fontWeight:900, letterSpacing:"0.1em", textTransform:"uppercase", lineHeight:1.7, color:T.LIGHT_IK, margin:0 }}>{s.body}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── 7. TESTIMONIALS ──────────────────────────────────────────────────────────
const REVIEWS = [
  { quote:"Booked a plumber at midnight — arrived in 2 hours. Exceptional.", name:"Amna K.", city:"Karachi"   },
  { quote:"AI matched me with the perfect tutor for my daughter. 10/10.",    name:"Bilal R.", city:"Lahore"   },
  { quote:"Transparent pricing, no surprises. Will use Taskit for every job.",name:"Sara M.", city:"Islamabad"},
  { quote:"Secure payment gave me total confidence to pay online.",           name:"Usman T.",city:"Karachi"   },
  { quote:"Best platform for finding reliable home service professionals.",   name:"Hira N.", city:"Lahore"   },
];

const Testimonials = () => (
  <section style={{ borderBottom:`1px solid ${T.IK}`, overflow:"hidden" }}>
    <SectionBar left="REVIEWS" right="★ 4.9 / 5 PLATFORM RATING"/>
    <div style={{ padding:"40px 0", background:T.CR, overflow:"hidden" }}>
      <div className="tk-reviews" style={{ display:"flex", gap:0, whiteSpace:"nowrap" }}>
        {[...REVIEWS,...REVIEWS].map((r,i)=>(
          <div key={i} style={{ display:"inline-flex", flexDirection:"column", justifyContent:"space-between", border:`1px solid ${T.IK}`, margin:"0 16px", padding:28, flexShrink:0, width:300, whiteSpace:"normal", background:i%2===0?T.CR:T.CR_ALT }}>
            <p style={{ fontSize:13, lineHeight:1.7, color:T.LIGHT_IK, fontFamily:"Georgia, serif", fontStyle:"italic", fontWeight:400, marginBottom:24 }}>"{r.quote}"</p>
            <div>
              <p style={{ fontSize:11, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 2px" }}>{r.name}</p>
              <p style={{ fontSize:10, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.12em", color:T.LIGHT_IK, margin:0 }}>{r.city}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── 8. CTA BAND ─────────────────────────────────────────────────────────────
const CTABand = () => (
  <section style={{ borderBottom:`1px solid ${T.IK}`, background:T.IK }}>
    <div className="tk-cta" style={{ display:"grid", gridTemplateColumns:"1fr 320px", alignItems:"center" }}>
      <div style={{ padding:"56px 48px", borderRight:`1px solid ${T.C}` }}>
        <h2 style={{ fontWeight:900, textTransform:"uppercase", lineHeight:1, letterSpacing:"-0.02em", color:T.CR, margin:"0 0 16px", fontSize:"clamp(2rem,5vw,4rem)" }}>
          READY TO GET<br/><span style={{ color:T.C }}>THINGS DONE?</span>
        </h2>
        <p style={{ fontSize:13, color:T.LIGHT_IK, fontFamily:"Georgia, serif", fontWeight:400, margin:0 }}>
          Find the right professional in minutes. No account needed to browse.
        </p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12, padding:"0 32px" }}>
        <HoverBtn to="/services"  label="FIND A PROVIDER →"   filled={true}/>
        <HoverBtn to="/register"  label="BECOME A PROVIDER →" filled={false}/>
      </div>
    </div>
  </section>
);

// ─── 9. FOOTER ────────────────────────────────────────────────────────────────
const FOOTER_COLS = [
  { heading:"Platform", links:[{label:"How it Works",path:"/#how-it-works"},{label:"Browse Services",path:"/services"},{label:"For Providers",path:"/register"}] },
  { heading:"Company",  links:[{label:"About Us",path:"/#about"},{label:"Contact",path:"/#contact"}] },
  { heading:"Legal",    links:[{label:"Privacy Policy",path:"/privacy"},{label:"Terms of Service",path:"/terms"}] },
  { heading:"Support",  links:[{label:"Help Centre",path:"/help"},{label:"My Bookings",path:"/dashboard/bookings"}] },
];

const FLink = ({ label, path }) => {
  const [h,setH]=useState(false);
  return (
    <li style={{ listStyle:"none" }}>
      <Link to={path} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", textDecoration:"none", color:h?T.C:T.LIGHT_IK, transition:"color 0.1s" }}>
        {label}
      </Link>
    </li>
  );
};

const SocialBtn = ({ label, last }) => {
  const [h,setH]=useState(false);
  return (
    <button onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ flex:1, padding:"10px 0", fontSize:10, fontWeight:900, letterSpacing:"0.1em", borderRight:last?"none":`1px solid ${T.IK}`, background:h?T.C:"transparent", color:h?T.CR:T.IK, border:"none", borderRight:last?"none":`1px solid ${T.IK}`, cursor:"pointer", transition:"all 0.1s" }}>
      {label}
    </button>
  );
};

const Footer = () => {
  const [email,setEmail]=useState("");
  const [subH,setSubH]=useState(false);
  return (
    <footer style={{ borderTop:`1px solid ${T.IK}` }}>
      <div style={{ display:"grid", gridTemplateColumns:"260px repeat(4,1fr) 260px", borderBottom:`1px solid ${T.IK}` }} className="tk-footer-wrap">
        {/* Brand */}
        <div style={{ padding:"40px", borderRight:`1px solid ${T.IK}`, borderBottom:`1px solid ${T.IK}` }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <div style={{ fontWeight:900, fontSize:22, textTransform:"uppercase", letterSpacing:"0.15em", color:T.C, marginBottom:4 }}>TASKIT</div>
          </Link>
          <div style={{ fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:T.LIGHT_IK, marginBottom:24 }}>[PLATFORM]</div>
          <p style={{ fontSize:11, lineHeight:1.7, color:T.LIGHT_IK, fontFamily:"Georgia, serif", fontWeight:400 }}>Pakistan's home service marketplace. Connecting skilled professionals with people who need them.</p>
          <div style={{ display:"flex", marginTop:32, border:`1px solid ${T.IK}` }}>
            {["TW","IN","FB","YT"].map((s,i)=><SocialBtn key={i} label={s} last={i===3}/>)}
          </div>
        </div>
        {/* Link cols */}
        {FOOTER_COLS.map((col,ci)=>(
          <div key={ci} style={{ padding:"40px 32px", borderRight:`1px solid ${T.IK}`, borderBottom:`1px solid ${T.IK}` }} className="tk-fnav">
            <h5 style={{ fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:T.C, margin:"0 0 24px" }}>{col.heading}</h5>
            <ul style={{ padding:0, margin:0, display:"flex", flexDirection:"column", gap:12 }}>
              {col.links.map((l,li)=><FLink key={li} {...l}/>)}
            </ul>
          </div>
        ))}
        {/* Newsletter */}
        <div style={{ padding:"40px 32px", borderBottom:`1px solid ${T.IK}` }}>
          <h5 style={{ fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:T.C, margin:"0 0 8px" }}>NEWSLETTER</h5>
          <p style={{ fontSize:11, lineHeight:1.7, color:T.LIGHT_IK, fontFamily:"Georgia, serif", fontWeight:400, marginBottom:20 }}>Platform updates, city launches, and new service categories.</p>
          <div style={{ display:"flex", border:`1px solid ${T.IK}` }}>
            <input type="email" placeholder="YOUR@EMAIL.COM" value={email} onChange={e=>setEmail(e.target.value)}
              style={{ flex:1, padding:"12px", fontSize:10, fontWeight:900, letterSpacing:"0.1em", textTransform:"uppercase", background:"transparent", border:"none", outline:"none", color:T.IK }}/>
            <button onMouseEnter={()=>setSubH(true)} onMouseLeave={()=>setSubH(false)}
              style={{ padding:"12px 16px", fontSize:12, fontWeight:900, background:subH?T.IK:T.C, color:T.CR, border:"none", borderLeft:`1px solid ${T.IK}`, cursor:"pointer", transition:"all 0.1s" }}>→</button>
          </div>
        </div>
      </div>
      {/* Bottom strip */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 40px", flexWrap:"wrap", gap:12 }}>
        <span style={{ fontSize:10, fontWeight:900, letterSpacing:"0.1em", textTransform:"uppercase", color:T.LIGHT_IK }}>© {new Date().getFullYear()} TASKIT PLATFORM — ALL RIGHTS RESERVED</span>
        <div style={{ display:"flex", gap:24 }}>
          {["Privacy","Terms","Cookies"].map((l,i)=><FLink key={i} label={l} path={`/${l.toLowerCase()}`}/>)}
        </div>
      </div>
      <style>{`
        @media(max-width:1100px){.tk-footer-wrap{grid-template-columns:1fr 1fr!important;}}
        @media(max-width:600px){.tk-footer-wrap{grid-template-columns:1fr!important;}}
      `}</style>
    </footer>
  );
};

// ─── GRID OVERLAY ─────────────────────────────────────────────────────────────
const GridOverlay = () => (
  <div style={{ pointerEvents:"none", position:"fixed", inset:0, zIndex:0, opacity:0.035, backgroundImage:`linear-gradient(${T.IK} 1px, transparent 1px), linear-gradient(90deg, ${T.IK} 1px, transparent 1px)`, backgroundSize:"40px 40px" }}/>
);

// ─── ROOT ─────────────────────────────────────────────────────────────────────
const Landing = () => (
  <div style={{ position:"relative", minHeight:"100vh", background:T.CR, color:T.IK, fontFamily:"'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
    <style>{GLOBAL_CSS}</style>
    <GridOverlay/>
    <div style={{ position:"relative", zIndex:1 }}>
      <Ticker/>
      <Navbar/>
      <main>
        <Hero/>
        <CategoryGrid/>
        <HowItWorks/>
        <Testimonials/>
        <CTABand/>
      </main>
      <Footer/>
    </div>
  </div>
);

export default Landing;