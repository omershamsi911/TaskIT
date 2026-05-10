// contact.jsx
import { useState } from "react";
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

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form:", form);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: "", email: "", message: "" });
  };

  const contactInfo = [
    { label: "Email", value: "support@taskit.pk", icon: "✉" },
    { label: "Phone", value: "+92 21 111 827 548", icon: "📞" },
    { label: "WhatsApp", value: "+92 300 123 4567", icon: "📱" },
    { label: "Office", value: "10th Floor, D-17, Block 4, Clifton, Karachi", icon: "📍" },
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
              Contact Taskit
            </h1>
            <p className="text-2xs font-black uppercase tracking-superwide mt-2" style={{ color: T.LIGHT_IK }}>
              We reply within 24 hours
            </p>
          </div>

          <div className="h-[6px]" style={{ background: "linear-gradient(to bottom, rgba(255,77,45,0.08), transparent)" }} />

          <div className="flex-1 px-6 md:px-10 py-6">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
              {/* Contact info panel */}
              <div className="border" style={{ borderColor: T.IK }}>
                <SectionBar n="01" title="Direct Reach" />
                <div className="p-6 space-y-6">
                  {contactInfo.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="text-lg" style={{ color: T.C }}>{item.icon}</span>
                      <div>
                        <div className="text-2xs font-black uppercase tracking-superwide" style={{ color: T.LIGHT_IK }}>
                          {item.label}
                        </div>
                        <div className="text-xs font-black mt-1">{item.value}</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t" style={{ borderColor: T.IK }}>
                    <p className="text-2xs font-black uppercase tracking-superwide" style={{ color: T.LIGHT_IK }}>
                      Support hours
                    </p>
                    <p className="text-xs mt-1">Mon–Sat, 9 AM – 9 PM (PKT)</p>
                  </div>
                </div>
              </div>

              {/* Contact form panel */}
              <div className="border" style={{ borderColor: T.IK }}>
                <SectionBar n="02" title="Send Message" />
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-2xs font-black uppercase tracking-superwide mb-2" style={{ color: T.LIGHT_IK }}>
                      Full name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full p-3 border bg-transparent text-sm font-black uppercase tracking-wide focus:outline-none"
                      style={{ borderColor: T.IK, color: T.IK }}
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-black uppercase tracking-superwide mb-2" style={{ color: T.LIGHT_IK }}>
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full p-3 border bg-transparent text-sm font-black uppercase tracking-wide focus:outline-none"
                      style={{ borderColor: T.IK, color: T.IK }}
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-black uppercase tracking-superwide mb-2" style={{ color: T.LIGHT_IK }}>
                      Message / Inquiry
                    </label>
                    <textarea
                      name="message"
                      rows="5"
                      required
                      value={form.message}
                      onChange={handleChange}
                      className="w-full p-3 border bg-transparent text-sm font-black uppercase tracking-wide focus:outline-none resize-none"
                      style={{ borderColor: T.IK, color: T.IK }}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 text-xs font-black uppercase tracking-superwide transition-all"
                    style={{ background: T.C, color: T.CR }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.IK)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = T.C)}
                  >
                    Send message →
                  </button>
                  {submitted && (
                    <div className="text-center text-2xs font-black p-2" style={{ background: T.IK, color: T.CR }}>
                      ✓ Message sent – we’ll get back to you soon.
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Map / location callout */}
            <div className="mt-12 max-w-5xl mx-auto border" style={{ borderColor: T.IK }}>
              <SectionBar n="03" title="Karachi HQ" />
              <div className="p-6 text-center">
                <p className="text-2xs font-black uppercase tracking-superwide" style={{ color: T.LIGHT_IK }}>
                  Visit our headquarters by appointment
                </p>
                <iframe
                  title="Taskit location"
                  className="w-full h-64 mt-4 border-0"
                  style={{ filter: "grayscale(1) contrast(1.2)" }}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=67.0011%2C24.8138%2C67.0411%2C24.8538&layer=mapnik&marker=24.8338%2C67.0211"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default Contact;