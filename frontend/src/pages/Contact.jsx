import { useState, useEffect } from "react";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";

// Custom hook for media queries
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

// Section header component
const SectionBar = ({ n, title }) => (
  <div
    className="flex items-center justify-between px-4 sm:px-6 py-2.5"
    style={{ background: T.IK }}
  >
    <span
      className="text-2xs font-black uppercase tracking-superwide"
      style={{ color: T.C }}
    >
      {title}
    </span>
    <span
      className="text-2xs font-black"
      style={{ color: T.CR, opacity: 0.35 }}
    >
      {n}
    </span>
  </div>
);

// Animated input field component
const AnimatedInput = ({ label, type = "text", name, value, onChange, required = true, rows }) => {
  const [focused, setFocused] = useState(false);
  const isTextarea = rows !== undefined;

  const inputStyles = {
    borderColor: focused ? T.C : T.IK,
    color: T.IK,
    background: "transparent",
    transition: "all 0.3s ease",
    boxShadow: focused ? `0 0 0 2px ${T.C}20` : "none",
  };

  return (
    <div className="relative">
      <label
        className="block text-2xs font-black uppercase tracking-superwide mb-2 transition-colors duration-300"
        style={{ color: focused ? T.C : T.LIGHT_IK }}
      >
        {label}
      </label>
      {isTextarea ? (
        <textarea
          name={name}
          rows={rows}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full p-3 sm:p-4 border text-sm font-medium tracking-wide focus:outline-none resize-none"
          style={inputStyles}
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full p-3 sm:p-4 border text-sm font-medium tracking-wide focus:outline-none"
          style={inputStyles}
        />
      )}
    </div>
  );
};

// Contact method card with hover effect
const ContactMethodCard = ({ icon, label, value, href, delay }) => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block border p-4 sm:p-5 transition-all duration-300"
      style={{
        borderColor: hovered ? T.C : T.IK,
        background: hovered ? `${T.C}08` : "transparent",
        transform: visible ? "translateY(0)" : "translateY(20px)",
        opacity: visible ? 1 : 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border transition-all duration-300"
          style={{
            borderColor: hovered ? T.C : T.IK,
            background: hovered ? T.C : "transparent",
          }}
        >
          <span
            className="text-lg sm:text-xl transition-colors duration-300"
            style={{ color: hovered ? T.CR : T.C }}
          >
            {icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-2xs font-black uppercase tracking-superwide mb-1"
            style={{ color: T.LIGHT_IK }}
          >
            {label}
          </div>
          <div
            className="text-xs sm:text-sm font-bold truncate transition-colors duration-300"
            style={{ color: hovered ? T.C : T.IK }}
          >
            {value}
          </div>
        </div>
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform duration-300"
          style={{
            color: T.C,
            transform: hovered ? "translateX(4px)" : "translateX(0)",
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </a>
  );
};

// FAQ accordion item
const FAQItem = ({ question, answer, isOpen, onClick, index }) => {
  return (
    <div
      className="border-b transition-colors duration-300"
      style={{ borderColor: T.IK }}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-4 sm:py-5 text-left transition-colors duration-300 group"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <span
            className="text-2xs font-black"
            style={{ color: T.C, opacity: 0.5 }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors duration-300"
            style={{ color: isOpen ? T.C : T.IK }}
          >
            {question}
          </span>
        </div>
        <div
          className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border transition-all duration-300"
          style={{
            borderColor: isOpen ? T.C : T.IK,
            background: isOpen ? T.C : "transparent",
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            style={{ color: isOpen ? T.CR : T.IK }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>
      <div
        className="overflow-hidden transition-all duration-500"
        style={{
          maxHeight: isOpen ? "200px" : "0",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p
          className="pb-4 sm:pb-5 pl-7 sm:pl-10 text-xs sm:text-sm leading-relaxed"
          style={{ color: T.LIGHT_IK }}
        >
          {answer}
        </p>
      </div>
    </div>
  );
};

// Stats component
const StatItem = ({ value, label, delay }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className="text-center p-4 sm:p-6 transition-all duration-500"
      style={{
        transform: visible ? "translateY(0)" : "translateY(20px)",
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="text-2xl sm:text-3xl md:text-4xl font-black"
        style={{ color: T.C }}
      >
        {value}
      </div>
      <div
        className="text-2xs font-black uppercase tracking-superwide mt-2"
        style={{ color: T.LIGHT_IK }}
      >
        {label}
      </div>
    </div>
  );
};

const Contact = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 900px)");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      console.log("Contact form:", form);
      setSending(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 1500);
  };

  const contactMethods = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: "Email Support",
      value: "support@taskit.pk",
      href: "mailto:support@taskit.pk",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: "Phone Hotline",
      value: "+92 21 111 827 548",
      href: "tel:+922111827548",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      label: "WhatsApp",
      value: "+92 300 123 4567",
      href: "https://wa.me/923001234567",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: "Office Address",
      value: "10th Floor, D-17, Block 4, Clifton, Karachi",
      href: "https://maps.google.com/?q=24.8338,67.0211",
    },
  ];

  const faqItems = [
    {
      question: "How quickly will I receive a response?",
      answer: "Our support team typically responds within 2-4 hours during business hours (Mon-Sat, 9 AM - 9 PM PKT). For urgent matters, we recommend calling our hotline or using WhatsApp for faster assistance.",
    },
    {
      question: "Can I schedule an in-person meeting?",
      answer: "Yes, you can schedule an appointment to visit our Karachi headquarters. Please contact us via email or phone at least 48 hours in advance to arrange a meeting with our team.",
    },
    {
      question: "How do I report a problem with a service provider?",
      answer: "You can report issues directly through the app's rating system, or contact our support team with details about your experience. We take all feedback seriously and investigate thoroughly.",
    },
    {
      question: "Do you have offices in other cities?",
      answer: "Currently, our headquarters is in Karachi. However, Taskit operates nationwide across Pakistan. We're planning to open regional offices in Lahore and Islamabad soon.",
    },
    {
      question: "How can I become a Taskit service provider?",
      answer: "Download the Taskit app, complete the registration process, submit your verification documents, and once approved, you can start accepting service requests in your area.",
    },
  ];

  const stats = [
    { value: "<2hrs", label: "Avg Response Time" },
    { value: "98%", label: "Resolution Rate" },
    { value: "24/7", label: "WhatsApp Support" },
    { value: "4.9/5", label: "Support Rating" },
  ];

  return (
    <SharedLayout>
      <div
        className="min-h-screen font-sans relative"
        style={{ background: T.CR, color: T.IK }}
      >
        {/* Background pattern */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0H0v20' fill='none' stroke='%23ff4d2d' stroke-opacity='0.08' stroke-width='0.5'/%3E%3C/svg%3E\")",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Hero Header */}
          <div
            className="border-b px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-12"
            style={{ borderColor: T.IK }}
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <div
                    className="text-2xs font-black uppercase tracking-superwide mb-2 sm:mb-3"
                    style={{ color: T.C }}
                  >
                    Get In Touch
                  </div>
                  <h1
                    className="font-black uppercase leading-none"
                    style={{
                      fontSize: isMobile ? "1.75rem" : isTablet ? "2.5rem" : "3.5rem",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Contact Taskit
                  </h1>
                  <p
                    className="text-xs sm:text-sm mt-2 sm:mt-3 max-w-md leading-relaxed"
                    style={{ color: T.LIGHT_IK }}
                  >
                    Have questions or need support? Our team is here to help you with anything related to Taskit services.
                  </p>
                </div>
                <div
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 border"
                  style={{ borderColor: T.C, background: `${T.C}10` }}
                >
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: T.C }}
                  />
                  <span
                    className="text-2xs font-black uppercase tracking-superwide"
                    style={{ color: T.C }}
                  >
                    We reply within 24 hours
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Gradient divider */}
          <div
            className="h-[6px]"
            style={{
              background: `linear-gradient(to bottom, ${T.C}15, transparent)`,
            }}
          />

          {/* Stats Section */}
          <div
            className="border-b px-4 sm:px-6 md:px-10 py-6 sm:py-8"
            style={{ borderColor: T.IK }}
          >
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <StatItem
                    key={i}
                    value={stat.value}
                    label={stat.label}
                    delay={i * 100}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-12">
            <div className="max-w-6xl mx-auto">
              {/* Contact Methods Grid */}
              <div className="mb-8 sm:mb-12">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div
                    className="w-8 h-[2px]"
                    style={{ background: T.C }}
                  />
                  <span
                    className="text-2xs font-black uppercase tracking-superwide"
                    style={{ color: T.LIGHT_IK }}
                  >
                    Quick Contact Methods
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {contactMethods.map((method, i) => (
                    <ContactMethodCard
                      key={i}
                      icon={method.icon}
                      label={method.label}
                      value={method.value}
                      href={method.href}
                      delay={i * 100}
                    />
                  ))}
                </div>
              </div>

              {/* Two Column Layout: Form + FAQ */}
              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Contact Form */}
                <div
                  className="border"
                  style={{ borderColor: T.IK }}
                >
                  <SectionBar n="01" title="Send Us a Message" />
                  <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <AnimatedInput
                        label="Full Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                      />
                      <AnimatedInput
                        label="Email Address"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <AnimatedInput
                        label="Phone Number"
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required={false}
                      />
                      <AnimatedInput
                        label="Subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                      />
                    </div>
                    <AnimatedInput
                      label="Your Message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full py-3 sm:py-4 text-xs font-black uppercase tracking-superwide transition-all duration-300 flex items-center justify-center gap-2"
                      style={{
                        background: sending ? T.LIGHT_IK : T.C,
                        color: T.CR,
                        opacity: sending ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!sending) e.currentTarget.style.background = T.IK;
                      }}
                      onMouseLeave={(e) => {
                        if (!sending) e.currentTarget.style.background = T.C;
                      }}
                    >
                      {sending ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                    {submitted && (
                      <div
                        className="flex items-center gap-3 p-3 sm:p-4 transition-all duration-300"
                        style={{ background: T.IK, color: T.CR }}
                      >
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-xs sm:text-sm font-bold">
                          Message sent successfully! We&apos;ll get back to you soon.
                        </span>
                      </div>
                    )}
                  </form>
                </div>

                {/* FAQ Section */}
                <div
                  className="border"
                  style={{ borderColor: T.IK }}
                >
                  <SectionBar n="02" title="Frequently Asked Questions" />
                  <div className="p-4 sm:p-6">
                    {faqItems.map((item, i) => (
                      <FAQItem
                        key={i}
                        index={i}
                        question={item.question}
                        answer={item.answer}
                        isOpen={openFAQ === i}
                        onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div
                className="mt-8 sm:mt-12 border"
                style={{ borderColor: T.IK }}
              >
                <SectionBar n="03" title="Visit Our Headquarters" />
                <div className="grid md:grid-cols-3">
                  <div className="p-4 sm:p-6 md:border-r" style={{ borderColor: T.IK }}>
                    <div
                      className="text-2xs font-black uppercase tracking-superwide mb-3"
                      style={{ color: T.LIGHT_IK }}
                    >
                      Office Address
                    </div>
                    <p className="text-sm sm:text-base font-bold leading-relaxed">
                      10th Floor, D-17,<br />
                      Block 4, Clifton,<br />
                      Karachi, Pakistan
                    </p>
                    <div
                      className="mt-4 pt-4 border-t"
                      style={{ borderColor: T.IK }}
                    >
                      <div
                        className="text-2xs font-black uppercase tracking-superwide mb-2"
                        style={{ color: T.LIGHT_IK }}
                      >
                        Business Hours
                      </div>
                      <p className="text-xs sm:text-sm">
                        Monday - Saturday<br />
                        9:00 AM - 9:00 PM (PKT)
                      </p>
                    </div>
                    <a
                      href="https://maps.google.com/?q=24.8338,67.0211"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-2xs font-black uppercase tracking-superwide transition-all duration-300"
                      style={{ background: T.C, color: T.CR }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = T.IK)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = T.C)}
                    >
                      Get Directions
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                  <div className="md:col-span-2">
                    <iframe
                      title="Taskit location"
                      className="w-full h-64 sm:h-72 md:h-full min-h-[250px] border-0"
                      style={{ filter: "grayscale(1) contrast(1.2)" }}
                      src="https://www.openstreetmap.org/export/embed.html?bbox=67.0011%2C24.8138%2C67.0411%2C24.8538&layer=mapnik&marker=24.8338%2C67.0211"
                    />
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div
                className="mt-8 sm:mt-12 border p-6 sm:p-8 md:p-10 text-center"
                style={{ borderColor: T.C, background: `${T.C}08` }}
              >
                <h2
                  className="text-lg sm:text-xl md:text-2xl font-black uppercase"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Ready to Get Started?
                </h2>
                <p
                  className="mt-2 sm:mt-3 text-xs sm:text-sm max-w-lg mx-auto"
                  style={{ color: T.LIGHT_IK }}
                >
                  Join thousands of users who trust Taskit for their everyday service needs.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-5 sm:mt-6">
                  <a
                    href="#"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-xs font-black uppercase tracking-superwide transition-all duration-300"
                    style={{ background: T.C, color: T.CR }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.IK)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = T.C)}
                  >
                    Download Taskit App
                  </a>
                  <a
                    href="#"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-xs font-black uppercase tracking-superwide border transition-all duration-300"
                    style={{ borderColor: T.IK, color: T.IK }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = T.IK;
                      e.currentTarget.style.color = T.CR;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = T.IK;
                    }}
                  >
                    Become a Provider
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Support Banner */}
          <div
            className="border-t px-4 sm:px-6 md:px-10 py-4 sm:py-5"
            style={{ borderColor: T.IK, background: T.IK }}
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
              <p
                className="text-2xs font-black uppercase tracking-superwide"
                style={{ color: T.CR }}
              >
                Need immediate assistance? Our support team is available 24/7 on WhatsApp
              </p>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 transition-all duration-300"
                style={{ background: T.CR, color: T.IK }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = T.C;
                  e.currentTarget.style.color = T.CR;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = T.CR;
                  e.currentTarget.style.color = T.IK;
                }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="text-2xs font-black uppercase tracking-superwide">
                  Chat on WhatsApp
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default Contact;
