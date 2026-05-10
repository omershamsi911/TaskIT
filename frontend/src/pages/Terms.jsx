// terms.jsx
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

const Terms = () => {
  const clauses = [
    {
      id: "01",
      title: "Acceptance of Terms",
      text: "By using Taskit, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.",
    },
    {
      id: "02",
      title: "User Accounts",
      text: "You must provide accurate information and are responsible for all activity under your account. One person may hold only one active account. Accounts cannot be transferred.",
    },
    {
      id: "03",
      title: "Service Listings & Bookings",
      text: "Providers are independent contractors, not employees of Taskit. We facilitate connections but are not responsible for the quality of work. Users agree to communicate and resolve disputes directly or via our support team.",
    },
    {
      id: "04",
      title: "Payments & Fees",
      text: "All payments are processed securely. Taskit holds funds in escrow until job completion. Service fees (10–15% per transaction) are shown before booking. Refunds are issued according to our cancellation policy.",
    },
    {
      id: "05",
      title: "Prohibited Conduct",
      text: "No harassment, fraud, illegal services, off-platform payments, or fake reviews. Violations result in immediate suspension and forfeiture of any pending payouts.",
    },
    {
      id: "06",
      title: "Limitation of Liability",
      text: "Taskit is not liable for indirect damages, loss of profits, or injuries arising from services. Maximum liability is the amount paid for the specific booking.",
    },
    {
      id: "07",
      title: "Changes to Terms",
      text: "We may update these terms with 14 days notice via email or in-app notification. Continued use after changes constitutes acceptance.",
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
          <div className="border-b px-6 md:px-10 py-5" style={{ borderColor: T.IK }}>
            <h1
              className="font-black uppercase leading-none"
              style={{ fontSize: "clamp(2rem, 3vw, 3rem)", letterSpacing: "-0.02em" }}
            >
              Terms of Service
            </h1>
            <p className="text-2xs font-black uppercase tracking-superwide mt-2" style={{ color: T.LIGHT_IK }}>
              Binding agreement – effective upon use
            </p>
          </div>

          <div className="h-[6px]" style={{ background: "linear-gradient(to bottom, rgba(255,77,45,0.08), transparent)" }} />

          <div className="flex-1 px-6 md:px-10 py-6">
            <div className="max-w-4xl mx-auto space-y-8">
              {clauses.map((clause) => (
                <div key={clause.id} className="border" style={{ borderColor: T.IK }}>
                  <SectionBar n={clause.id} title={clause.title} />
                  <div className="p-6">
                    <p className="text-2xs leading-relaxed" style={{ color: T.LIGHT_IK }}>
                      {clause.text}
                    </p>
                  </div>
                </div>
              ))}

              {/* Governing law */}
              <div className="border p-6 text-center" style={{ borderColor: T.IK }}>
                <p className="text-xs font-black uppercase tracking-wide">
                  Governing Law: Pakistan
                </p>
                <p className="text-2xs mt-2" style={{ color: T.LIGHT_IK }}>
                  These terms are governed by the laws of the Islamic Republic of Pakistan. Disputes shall be resolved through binding arbitration in Karachi.
                </p>
                <div className="mt-4">
                  <Link
                    to="/register"
                    className="inline-block px-6 py-2 text-2xs font-black uppercase tracking-superwide"
                    style={{ background: T.C, color: T.CR }}
                  >
                    Accept & Continue →
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

export default Terms;