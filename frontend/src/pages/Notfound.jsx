import { useState } from "react";
import { Link } from "react-router-dom";

const T = {
  C: "#FF5733",
  CR: "#F5F0E6",
  CR_ALT: "#FFFFFF",
  IK: "#1A1A1A",
  LIGHT_IK: "#6B6B6B",
};

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.CR,
        color: T.IK,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ghost number */}
      <div
        style={{
          position: "absolute",
          fontSize: "clamp(180px, 30vw, 320px)",
          fontWeight: 900,
          color: T.IK,
          opacity: 0.04,
          letterSpacing: "-0.05em",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        404
      </div>

      <div
        style={{
          textAlign: "center",
          maxWidth: 520,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          zIndex: 1,
        }}
      >
        {/* badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            border: `1px solid ${T.C}`,
            padding: "6px 12px",
          }}
        >
          <span style={{ width: 6, height: 6, background: T.C }} />
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: T.C,
            }}
          >
            Page Not Found
          </span>
        </div>

        {/* heading */}
        <h1
          style={{
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            lineHeight: 0.9,
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          Lost in <br />
          <span style={{ color: T.C }}>The System</span>
        </h1>

        {/* text */}
        <p
          style={{
            fontSize: 13,
            color: T.LIGHT_IK,
            lineHeight: 1.7,
            fontFamily: "Georgia, serif",
            margin: 0,
          }}
        >
          The page you’re looking for doesn’t exist or has been moved.
          Let’s get you back to something useful.
        </p>

        {/* buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Btn to="/" label="Back to Home" primary />
          <Btn to="/services" label="Browse Services" />
        </div>
      </div>
    </div>
  );
};

const Btn = ({ to, label, primary }) => {
  const [h, setH] = useState(false);

  return (
    <Link
      to={to}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: "14px 26px",
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        textDecoration: "none",
        border: `2px solid ${primary ? T.C : T.IK}`,
        background: primary ? (h ? T.IK : T.C) : h ? T.IK : "transparent",
        color: primary ? T.CR : h ? T.CR : T.IK,
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </Link>
  );
};

export default NotFound;