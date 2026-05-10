/**
 * Pricing.jsx
 * ──────────────────────────────────────────────────────────────────
 * Pricing page for Service Providers.
 * Includes hoverable tier cards (commission-based and subscription),
 * feature breakdowns, and an FAQ section.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import SharedLayout, { T } from "../components/layouts/Sharedlayout";

// ─── REUSABLE HEADER ──────────────────────────────────────────────
const SectionBar = ({ left, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", background: T.IK }}>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: T.C }}>{left}</span>
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f5f0e6" }}>{right}</span>
  </div>
);

// ─── PRICING CARD COMPONENT ───────────────────────────────────────
const PricingCard = ({ title, price, subtitle, commission, features, cta, highlight, delay }) => {
  const [hov, setHov] = useState(false);

  return (
    <div 
      onMouseEnter={() => setHov(true)} 
      onMouseLeave={() => setHov(false)}
      style={{ 
        flex: "1 1 300px", 
        display: "flex", 
        flexDirection: "column", 
        border: `1px solid ${T.IK}`, 
        background: hov ? T.IK : "#fff", 
        transition: "all 0.2s ease-in-out", 
        position: "relative",
        animation: `fadeInUp 0.5s ease forwards ${delay}s`,
        opacity: 0, // for animation fallback
        transform: hov ? "translateY(-4px)" : "translateY(0)"
      }}
    >
      {/* Optional Highlight Banner */}
      {highlight && (
        <div style={{ background: T.C, color: T.IK, padding: "6px 0", textAlign: "center", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          MOST POPULAR
        </div>
      )}

      <div style={{ padding: "40px 32px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        {/* Header */}
        <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", color: hov ? T.C : T.IK }}>
          {title}
        </h3>
        <p style={{ fontSize: 11, color: hov ? "#bdbdbd" : T.LIGHT_IK, fontFamily: "Georgia, serif", margin: "0 0 24px", minHeight: 34 }}>
          {subtitle}
        </p>

        {/* Price & Commission */}
        <div style={{ paddingBottom: 24, borderBottom: `1px solid ${hov ? "rgba(255,255,255,0.1)" : T.IK}`, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, lineHeight: 1, color: hov ? "#fff" : T.IK, letterSpacing: "-0.03em" }}>
              {price}
            </span>
            {price !== "Custom" && <span style={{ fontSize: 12, fontWeight: 700, color: hov ? "#bdbdbd" : T.LIGHT_IK }}>/mo</span>}
          </div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ padding: "4px 8px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", background: hov ? T.C : T.IK, color: hov ? T.IK : "#fff" }}>
              {commission}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: hov ? "#bdbdbd" : T.LIGHT_IK }}>
              Platform Fee
            </span>
          </div>
        </div>

        {/* Features List */}
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flexGrow: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {features.map((feat, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 11, fontFamily: "Georgia, serif", color: hov ? "#f5f0e6" : T.IK, lineHeight: 1.4 }}>
              <span style={{ fontSize: 10, color: hov ? T.C : T.IK, marginTop: 2 }}>✦</span>
              {feat}
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link to="/register" style={{ display: "block", textAlign: "center", padding: "16px", background: hov ? "#fff" : "transparent", border: `1px solid ${hov ? "#fff" : T.IK}`, color: T.IK, textDecoration: "none", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", transition: "all 0.1s" }}>
          {cta}
        </Link>
      </div>
    </div>
  );
};

// ─── FAQ ACCORDION COMPONENT ──────────────────────────────────────
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${T.IK}` }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ width: "100%", padding: "24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
      >
        <span style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.IK }}>
          {question}
        </span>
        <span style={{ fontSize: 16, fontWeight: 900, color: T.IK, transform: open ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s" }}>
          +
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: 24, fontSize: 13, fontFamily: "Georgia, serif", color: T.LIGHT_IK, lineHeight: 1.6 }}>
          {answer}
        </div>
      )}
    </div>
  );
};

// ─── MAIN PRICING PAGE ────────────────────────────────────────────
const Pricing = () => {
  // Injecting a simple keyframe animation for card load-in
  const styleSheet = document.styleSheets[0];
  const keyframes = `
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;
  try { styleSheet.insertRule(keyframes, styleSheet.cssRules.length); } catch (e) { /* ignore if already exists */ }

  return (
    <SharedLayout>
      <SectionBar left="PRICING & PLANS" right="BECOME A PROVIDER" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px", display: "flex", flexDirection: "column", gap: 64 }}>
        
        {/* Intro Section */}
        <div style={{ maxWidth: 600 }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: T.IK, margin: "0 0 16px", lineHeight: 1 }}>
            GROW YOUR BUSINESS, <br/>YOUR WAY.
          </h1>
          <p style={{ fontSize: 14, fontFamily: "Georgia, serif", color: T.LIGHT_IK, margin: 0, lineHeight: 1.6 }}>
            Whether you're an independent plumber taking weekend jobs or a full-time service agency, we have a transparent pricing model built to scale with your success. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          <PricingCard
            delay={0.1}
            title="Pay-As-You-Go"
            subtitle="Perfect for independent contractors just getting started."
            price="$0"
            commission="15%"
            features={[
              "Create a complete provider profile",
              "Receive unlimited booking requests",
              "Standard placement in customer search",
              "In-app chat and notifications",
              "Basic analytics dashboard"
            ]}
            cta="Start for Free"
          />

          <PricingCard
            delay={0.2}
            highlight={true}
            title="Professional"
            subtitle="For established providers looking to maximize earnings."
            price="$39"
            commission="5%"
            features={[
              "Everything in Pay-As-You-Go",
              "Priority placement in local searches",
              "Automated follow-up reviews",
              "Advanced revenue & booking analytics",
              "Priority customer support"
            ]}
            cta="Upgrade to Pro"
          />

          <PricingCard
            delay={0.3}
            title="Agency Elite"
            subtitle="For large teams processing high volumes of bookings."
            price="$149"
            commission="0%"
            features={[
              "Keep 100% of your booking revenue",
              "Manage multiple team members",
              "Featured 'Top Tier' profile badge",
              "Dedicated success manager",
              "API access for external CRM integration"
            ]}
            cta="Go Elite"
          />
        </div>

        {/* FAQ Section */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 64, marginTop: 32 }}>
          <div style={{ flex: "1 1 300px" }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: T.IK, margin: "0 0 16px" }}>
              FREQUENTLY ASKED
            </h2>
            <p style={{ fontSize: 12, fontFamily: "Georgia, serif", color: T.LIGHT_IK, margin: 0, lineHeight: 1.6 }}>
              Have questions about how our commission structure works? We believe in absolute transparency so you can focus on providing great service.
            </p>
          </div>

          <div style={{ flex: "2 1 500px", borderTop: `1px solid ${T.IK}` }}>
            <FAQItem 
              question="How is the platform fee calculated?" 
              answer="The platform fee is a percentage calculated based on the total cost of the completed service. It is automatically deducted before the final payout is transferred to your linked bank account. If a booking is cancelled, no fee is charged." 
            />
            <FAQItem 
              question="Can I switch plans later?" 
              answer="Absolutely. You can upgrade to Professional or Agency Elite at any time from your Provider Dashboard. Upgrades take effect immediately, while downgrades apply at the start of your next billing cycle." 
            />
            <FAQItem 
              question="Are there any hidden lead fees?" 
              answer="No. Unlike other platforms that charge you just to bid on a job, we only make money when you actually complete a job and get paid. (Unless you are on the $0 commission Elite tier, in which case you keep everything)." 
            />
            <FAQItem 
              question="How do payouts work?" 
              answer="Payouts are processed 24 hours after a job is marked as 'COMPLETED' in your dashboard. Funds typically arrive in your connected bank account within 2-3 business days depending on your bank." 
            />
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ background: T.IK, padding: "64px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fff", margin: "0 0 16px" }}>
            READY TO JOIN OUR NETWORK?
          </h2>
          <p style={{ fontSize: 13, fontFamily: "Georgia, serif", color: "#bdbdbd", margin: "0 0 32px", maxWidth: 500 }}>
            Set up your profile in under 5 minutes and start receiving local service requests directly to your dashboard.
          </p>
          <Link to="/register" style={{ display: "inline-block", padding: "16px 48px", background: T.C, color: T.IK, textDecoration: "none", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            CREATE PROVIDER ACCOUNT →
          </Link>
        </div>

      </div>
    </SharedLayout>
  );
};

export default Pricing;