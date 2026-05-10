// privacy.jsx
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

const Privacy = () => {
  const sections = [
    {
      id: "01",
      title: "Information We Collect",
      content: (
        <>
          <p className="text-xs font-black uppercase tracking-wide mb-3">
            Personal data you provide directly
          </p>
          <p className="text-2xs leading-relaxed" style={{ color: T.LIGHT_IK }}>
            When you register, post a task, or contact a provider, we collect your name, email, phone number, location, and payment details.
            Service history, ratings, and communications are also stored to improve matching and trust.
          </p>
        </>
      ),
    },
    {
      id: "02",
      title: "How We Use Your Data",
      content: (
        <>
          <p className="text-xs font-black uppercase tracking-wide mb-3">
            Matching, payments, and safety
          </p>
          <p className="text-2xs leading-relaxed" style={{ color: T.LIGHT_IK }}>
            We use your information to connect you with providers, process payments, verify identities, prevent fraud, and send essential updates.
            Aggregated usage data helps us improve AI matching and platform performance.
          </p>
        </>
      ),
    },
    {
      id: "03",
      title: "Sharing & Disclosure",
      content: (
        <>
          <p className="text-xs font-black uppercase tracking-wide mb-3">
            Limited to service delivery
          </p>
          <p className="text-2xs leading-relaxed" style={{ color: T.LIGHT_IK }}>
            Your data is shared with providers only to fulfill your request (name, location, job details). We never sell personal data.
            Trusted partners assist with payments, cloud hosting, and analytics under strict confidentiality.
          </p>
        </>
      ),
    },
    {
      id: "04",
      title: "Your Rights",
      content: (
        <>
          <p className="text-xs font-black uppercase tracking-wide mb-3">
            Access, correction, deletion
          </p>
          <p className="text-2xs leading-relaxed" style={{ color: T.LIGHT_IK }}>
            You can review, update, or delete your account data anytime via settings. For data export or deletion requests, contact support.
            We retain transaction records as required by Pakistani law.
          </p>
        </>
      ),
    },
    {
      id: "05",
      title: "Security & Cookies",
      content: (
        <>
          <p className="text-xs font-black uppercase tracking-wide mb-3">
            Encryption + essential cookies
          </p>
          <p className="text-2xs leading-relaxed" style={{ color: T.LIGHT_IK }}>
            All data encrypted in transit and at rest. Cookies are used for authentication and session management only — no tracking or advertising cookies.
            You may disable cookies but some features may break.
          </p>
        </>
      ),
    },
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
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0H0v20' fill='none' stroke='%23ff4d2d' stroke-opacity='0.08' stroke-width='0.5'/%3E%3C/svg%3E\")",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <div className="border-b px-6 md:px-10 py-5" style={{ borderColor: T.IK }}>
            <h1
              className="font-black uppercase leading-none"
              style={{ fontSize: "clamp(2rem, 3vw, 3rem)", letterSpacing: "-0.02em" }}
            >
              Privacy Policy
            </h1>
            <p className="text-2xs font-black uppercase tracking-superwide mt-2" style={{ color: T.LIGHT_IK }}>
              Last updated: May 2025
            </p>
          </div>

          <div className="h-[6px]" style={{ background: "linear-gradient(to bottom, rgba(255,77,45,0.08), transparent)" }} />

          <div className="flex-1 px-6 md:px-10 py-6">
            <div className="max-w-4xl mx-auto space-y-8">
              {sections.map((sec) => (
                <div key={sec.id} className="border" style={{ borderColor: T.IK }}>
                  <SectionBar n={sec.id} title={sec.title} />
                  <div className="p-6">{sec.content}</div>
                </div>
              ))}

              {/* Contact for privacy questions */}
              <div className="border p-6 text-center" style={{ borderColor: T.IK }}>
                <p className="text-xs font-black uppercase tracking-wide">
                  Questions about your data?
                </p>
                <p className="text-2xs mt-2" style={{ color: T.LIGHT_IK }}>
                  Reach our Data Protection Officer at{" "}
                  <span className="font-black" style={{ color: T.C }}>
                    privacy@taskit.pk
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default Privacy;