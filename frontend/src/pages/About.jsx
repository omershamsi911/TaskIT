import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
};

const useCountUp = (end, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime = null;
    const numericEnd = parseFloat(end.replace(/[^0-9.]/g, ""));
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * numericEnd));
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, hasStarted]);

  return { count, setHasStarted };
};

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------
const SectionBar = ({ n, title, subtitle }) => {
  return (
    <div
      className="flex items-center justify-between px-4 sm:px-6 py-3"
      style={{ background: T.IK }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-xs sm:text-sm font-black"
          style={{ color: T.C }}
        >
          {n}
        </span>
        <span
          className="text-2xs sm:text-xs font-black uppercase tracking-wider"
          style={{ color: T.C }}
        >
          {title}
        </span>
      </div>
      {subtitle && (
        <span
          className="text-2xs font-medium hidden sm:block"
          style={{ color: T.CR, opacity: 0.6 }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Animated Stat Card
// ---------------------------------------------------------------------------
const StatCard = ({ value, label, suffix = "", delay = 0 }) => {
  const { count, setHasStarted } = useCountUp(value, 1500);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setHasStarted(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, setHasStarted]);

  return (
    <div
      className="p-4 sm:p-6 text-center transition-all duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      <div
        className="text-xl sm:text-2xl md:text-3xl font-black tabular-nums"
        style={{ color: T.C }}
      >
        {count}{suffix}
      </div>
      <div
        className="text-2xs font-black uppercase tracking-wider mt-2"
        style={{ color: T.LIGHT_IK }}
      >
        {label}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Feature Card
// ---------------------------------------------------------------------------
const FeatureCard = ({ icon, title, description, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="p-5 sm:p-6 border transition-all duration-300 cursor-default"
      style={{
        borderColor: isHovered ? T.C : T.IK,
        background: isHovered ? `${T.C}08` : "transparent",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-4 transition-colors duration-300"
        style={{ background: isHovered ? T.C : T.IK }}
      >
        <span
          className="text-lg sm:text-xl"
          style={{ color: isHovered ? T.CR : T.C }}
        >
          {icon}
        </span>
      </div>
      <h3 className="text-xs sm:text-sm font-black uppercase mb-2">{title}</h3>
      <p
        className="text-2xs leading-relaxed"
        style={{ color: T.LIGHT_IK }}
      >
        {description}
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Timeline Step
// ---------------------------------------------------------------------------
const TimelineStep = ({ number, title, description, isLast }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex gap-4 sm:gap-6">
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-black text-sm sm:text-base transition-all duration-300"
          style={{
            background: isHovered ? T.C : T.IK,
            color: isHovered ? T.CR : T.C,
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {number}
        </div>
        {!isLast && (
          <div
            className="w-0.5 flex-1 min-h-[40px]"
            style={{ background: `${T.IK}40` }}
          />
        )}
      </div>
      <div className="pb-6 sm:pb-8 flex-1">
        <h4 className="text-xs sm:text-sm font-black uppercase mb-1">{title}</h4>
        <p
          className="text-2xs leading-relaxed"
          style={{ color: T.LIGHT_IK }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// FAQ Item
// ---------------------------------------------------------------------------
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="border-b last:border-b-0 transition-colors duration-300"
      style={{ borderColor: T.IK }}
    >
      <button
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xs sm:text-sm font-black uppercase pr-4">{question}</span>
        <span
          className="text-lg font-black transition-transform duration-300 flex-shrink-0"
          style={{
            color: T.C,
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isOpen ? "200px" : "0",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p
          className="px-4 sm:px-5 pb-4 sm:pb-5 text-2xs leading-relaxed"
          style={{ color: T.LIGHT_IK }}
        >
          {answer}
        </p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Testimonial Card
// ---------------------------------------------------------------------------
const TestimonialCard = ({ quote, name, role, rating }) => {
  return (
    <div
      className="p-5 sm:p-6 border h-full flex flex-col"
      style={{ borderColor: T.IK }}
    >
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className="text-xs sm:text-sm"
            style={{ color: i < rating ? T.C : `${T.IK}40` }}
          >
            ★
          </span>
        ))}
      </div>
      <p
        className="text-2xs leading-relaxed flex-1 mb-4"
        style={{ color: T.LIGHT_IK }}
      >
        "{quote}"
      </p>
      <div className="border-t pt-4" style={{ borderColor: T.IK }}>
        <div className="text-xs font-black uppercase">{name}</div>
        <div
          className="text-2xs mt-0.5"
          style={{ color: T.C }}
        >
          {role}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// About Page
// ---------------------------------------------------------------------------
const About = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 900px)");

  const team = [
    { name: "Syed Omer Ahmed Shamsi", role: "Vision & Direction", bio: "Leading the mission to transform service hiring in Pakistan" },
    { name: "Umer Safee", role: "Platform Architecture", bio: "Building scalable AI-powered matching systems" },
    { name: "Musfirah Waseem", role: "Brutalist UI Systems", bio: "Crafting bold, functional user experiences" },
    { name: "Claude", role: "Provider Network Growth", bio: "Expanding our verified professional network" },
  ];

  const stats = [
    { value: "500", label: "Verified Providers", suffix: "+" },
    { value: "10000", label: "Jobs Completed", suffix: "+" },
    { value: "4.8", label: "Avg Rating", suffix: "" },
    { value: "5", label: "Cities Live", suffix: "" },
  ];

  const values = [
    { icon: "⚡", title: "Speed", description: "Instant matching with the right professional" },
    { icon: "✓", title: "Trust", description: "Every provider is verified, rated, and accountable" },
    { icon: "◎", title: "Transparency", description: "Clear pricing, real reviews, no hidden surprises" },
    { icon: "∞", title: "Reliability", description: "Consistent quality backed by our service guarantee" },
  ];

  const howItWorks = [
    { title: "Post Your Request", description: "Describe what you need in seconds. Our AI understands context, urgency, and requirements." },
    { title: "AI-Powered Matching", description: "Our algorithm instantly matches you with the best available providers based on skills, ratings, and proximity." },
    { title: "Review & Select", description: "Compare profiles, reviews, and quotes. Choose the professional that fits your needs and budget." },
    { title: "Track & Complete", description: "Real-time updates, secure payments, and verified completion. Rate your experience to help others." },
  ];

  const faqs = [
    { question: "How are providers verified?", answer: "Every provider goes through a multi-step verification including ID check, skill assessment, background screening, and initial reviews from test jobs before being approved on the platform." },
    { question: "What if I'm not satisfied?", answer: "We offer a satisfaction guarantee. If the job isn't completed to standard, we'll either send another provider at no extra cost or provide a full refund." },
    { question: "How does pricing work?", answer: "Providers set their own rates based on market standards. You see the full price upfront before booking, with no hidden fees or surprise charges." },
    { question: "Is my data secure?", answer: "Yes. We use bank-level encryption for all transactions and never share your personal information with third parties without consent." },
  ];

  const testimonials = [
    { quote: "Found a reliable electrician in minutes. The AI matching is incredibly accurate.", name: "Ahmed K.", role: "Homeowner, Lahore", rating: 5 },
    { quote: "As a provider, Taskit has transformed my business. Consistent work and fair pay.", name: "Bilal M.", role: "Plumber, Karachi", rating: 5 },
    { quote: "Finally, a service app that actually works in Pakistan. Transparent and trustworthy.", name: "Sara A.", role: "Business Owner, Islamabad", rating: 4 },
  ];

  return (
    <SharedLayout>
      <div
        className="min-h-screen font-sans relative"
        style={{ background: T.CR, color: T.IK }}
      >
        {/* Grid overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0H0v20' fill='none' stroke='%23ff4d2d' stroke-opacity='0.06' stroke-width='0.5'/%3E%3C/svg%3E\")",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Hero Header */}
          <div
            className="border-b px-4 sm:px-6 md:px-10 py-8 sm:py-12 md:py-16"
            style={{ borderColor: T.IK }}
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-8">
                <div>
                  <p
                    className="text-2xs font-black uppercase tracking-wider mb-2 sm:mb-3"
                    style={{ color: T.C }}
                  >
                    Taskit Platform
                  </p>
                  <h1
                    className="font-black uppercase leading-none"
                    style={{
                      fontSize: isMobile ? "1.75rem" : isTablet ? "2.5rem" : "3.5rem",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Redefining How
                    <br />
                    <span style={{ color: T.C }}>Pakistan Works</span>
                  </h1>
                </div>
                <p
                  className="text-2xs sm:text-xs leading-relaxed max-w-xs"
                  style={{ color: T.LIGHT_IK }}
                >
                  AI-powered service marketplace connecting people with trusted professionals instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Seam */}
          <div
            className="h-1.5"
            style={{
              background: `linear-gradient(to bottom, ${T.C}15, transparent)`,
            }}
          />

          {/* Content */}
          <div className="flex-1 px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10">
            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">

              {/* Stats Bar */}
              <div
                className="border overflow-hidden"
                style={{ borderColor: T.IK }}
              >
                <div
                  className="grid grid-cols-2 md:grid-cols-4"
                  style={{
                    background: `linear-gradient(135deg, ${T.CR} 0%, ${T.CR_ALT || T.CR} 100%)`,
                  }}
                >
                  {stats.map((s, i) => (
                    <div
                      key={i}
                      className="border-r border-b md:border-b-0 last:border-r-0 [&:nth-child(2)]:border-r-0 md:[&:nth-child(2)]:border-r"
                      style={{ borderColor: T.IK }}
                    >
                      <StatCard
                        value={s.value}
                        label={s.label}
                        suffix={s.suffix}
                        delay={i * 150}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mission & Vision Grid */}
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {/* Mission */}
                <div
                  className="border"
                  style={{ borderColor: T.IK }}
                >
                  <SectionBar n="01" title="Our Mission" />
                  <div className="p-5 sm:p-6 md:p-8">
                    <p className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wide mb-3 sm:mb-4 leading-tight">
                      We connect people with trusted professionals instantly.
                    </p>
                    <p
                      className="text-2xs sm:text-xs leading-relaxed"
                      style={{ color: T.LIGHT_IK }}
                    >
                      Taskit eliminates uncertainty in hiring services by using AI-driven matching, verified providers, and transparent ratings so every job is done right the first time.
                    </p>
                  </div>
                </div>

                {/* Vision */}
                <div
                  className="border"
                  style={{ borderColor: T.IK }}
                >
                  <SectionBar n="02" title="Our Vision" />
                  <div className="p-5 sm:p-6 md:p-8">
                    <p className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wide mb-3 sm:mb-4 leading-tight">
                      {"Pakistan's"} largest digital workforce layer.
                    </p>
                    <p
                      className="text-2xs sm:text-xs leading-relaxed"
                      style={{ color: T.LIGHT_IK }}
                    >
                      Where every skilled person can earn fairly and every household can access reliable help in seconds. Building the infrastructure for the future of work.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Values */}
              <div
                className="border"
                style={{ borderColor: T.IK }}
              >
                <SectionBar n="03" title="Core Values" subtitle="What drives us" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-4">
                  {values.map((v, i) => (
                    <div
                      key={i}
                      className="border-r border-b lg:border-b-0 last:border-r-0 sm:[&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r"
                      style={{ borderColor: T.IK }}
                    >
                      <FeatureCard {...v} index={i} />
                    </div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div
                className="border"
                style={{ borderColor: T.IK }}
              >
                <SectionBar n="04" title="How It Works" subtitle="Simple 4-step process" />
                <div className="p-5 sm:p-6 md:p-8">
                  <div className="max-w-xl">
                    {howItWorks.map((step, i) => (
                      <TimelineStep
                        key={i}
                        number={`0${i + 1}`}
                        title={step.title}
                        description={step.description}
                        isLast={i === howItWorks.length - 1}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div
                className="border"
                style={{ borderColor: T.IK }}
              >
                <SectionBar n="05" title="What People Say" subtitle="Real experiences" />
                <div className="p-4 sm:p-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testimonials.map((t, i) => (
                      <TestimonialCard key={i} {...t} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Team */}
              <div
                className="border"
                style={{ borderColor: T.IK }}
              >
                <SectionBar n="06" title="Our Team" subtitle="The people behind Taskit" />
                <div className="p-4 sm:p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {team.map((m, i) => (
                      <div
                        key={i}
                        className="border p-5 sm:p-6 transition-all duration-300 hover:border-opacity-100"
                        style={{
                          borderColor: T.IK,
                          background: i % 2 ? T.CR_ALT : T.CR,
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-black text-sm"
                            style={{ background: T.IK, color: T.C }}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <span
                            className="text-2xs font-black uppercase px-2 py-1"
                            style={{ background: `${T.C}15`, color: T.C }}
                          >
                            {m.role}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm font-black uppercase mb-1">
                          {m.name}
                        </div>
                        <p
                          className="text-2xs"
                          style={{ color: T.LIGHT_IK }}
                        >
                          {m.bio}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div
                className="border"
                style={{ borderColor: T.IK }}
              >
                <SectionBar n="07" title="FAQ" subtitle="Common questions" />
                <div>
                  {faqs.map((faq, i) => (
                    <FAQItem key={i} {...faq} />
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div
                className="border overflow-hidden"
                style={{ borderColor: T.IK }}
              >
                <div
                  className="p-6 sm:p-8 md:p-12 text-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${T.IK} 0%, ${T.IK}ee 100%)`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0H0v40' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E\")",
                      backgroundSize: "40px 40px",
                    }}
                  />
                  <div className="relative z-10">
                    <h2
                      className="text-lg sm:text-xl md:text-2xl font-black uppercase mb-3"
                      style={{ color: T.CR }}
                    >
                      Ready to Get Started?
                    </h2>
                    <p
                      className="text-2xs sm:text-xs mb-6 max-w-md mx-auto"
                      style={{ color: `${T.CR}cc` }}
                    >
                      Join thousands of users and providers already transforming how services are delivered in Pakistan.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        to="/register"
                        className="inline-block px-6 sm:px-10 py-3 text-xs sm:text-sm font-black uppercase tracking-wide transition-transform duration-200 hover:scale-105"
                        style={{ background: T.C, color: T.CR }}
                      >
                        Become a Provider
                      </Link>
                      <Link
                        to="/services"
                        className="inline-block px-6 sm:px-10 py-3 text-xs sm:text-sm font-black uppercase tracking-wide border-2 transition-all duration-200 hover:bg-white hover:bg-opacity-10"
                        style={{ borderColor: T.CR, color: T.CR }}
                      >
                        Find Services
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div
                className="grid sm:grid-cols-3 gap-4 text-center"
              >
                {[
                  { label: "Email", value: "hello@taskit.pk" },
                  { label: "Phone", value: "+92 300 1234567" },
                  { label: "Location", value: "Karachi, Pakistan" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="border p-4 sm:p-5"
                    style={{ borderColor: T.IK }}
                  >
                    <div
                      className="text-2xs font-black uppercase tracking-wider mb-1"
                      style={{ color: T.C }}
                    >
                      {item.label}
                    </div>
                    <div className="text-xs sm:text-sm font-black">{item.value}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default About;
