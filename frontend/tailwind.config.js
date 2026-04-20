/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {

      // ── Colors ──────────────────────────────────────────────────────────────
      colors: {
        coral:  "#FF5733",
        cream:  "#F5F0E6",
        ink:    "#1A1A1A",
      },

      // ── Typography ──────────────────────────────────────────────────────────
      fontFamily: {
        sans:   ["Arial Black", "Helvetica Neue", "Arial", "sans-serif"],
        serif:  ["Georgia", "serif"],
      },

      fontWeight: {
        black: "900",
      },

      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },

      letterSpacing: {
        superwide: "0.18em",
        ultrawide: "0.1em",
      },

      // ── Border radius — always 0 ─────────────────────────────────────────────
      borderRadius: {
        none:    "0px",
        DEFAULT: "0px",
        sm:      "0px",
        md:      "0px",
        lg:      "0px",
        xl:      "0px",
        "2xl":   "0px",
        "3xl":   "0px",
        full:    "0px",
      },

      // ── Box shadow — none ────────────────────────────────────────────────────
      boxShadow: {
        none:    "none",
        DEFAULT: "none",
        sm:      "none",
        md:      "none",
        lg:      "none",
        xl:      "none",
        "2xl":   "none",
        inner:   "none",
        ink:     `0 2px 0 #1A1A1A`,
      },

      // ── Keyframes & animations ───────────────────────────────────────────────
      keyframes: {
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1"  },
          "50%":      { opacity: "0.25" },
        },
      },

      animation: {
        ticker:      "ticker 28s linear infinite",
        "ticker-slow": "ticker 38s linear infinite",
        pulse:       "pulse 1.8s ease-in-out infinite",
      },

      // ── Grid ─────────────────────────────────────────────────────────────────
      gridTemplateColumns: {
        "layout": "repeat(12, minmax(0, 1fr))",
      },

      // ── Min-height ───────────────────────────────────────────────────────────
      minHeight: {
        nav: "56px",
      },

      // ── Background (dot-grid overlay via bg-grid) ────────────────────────────
      backgroundImage: {
        "grid-coral": `
          linear-gradient(to right,  #FF573309 1px, transparent 1px),
          linear-gradient(to bottom, #FF573309 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        grid: "80px 80px",
      },

    },
  },

  // ── Plugins ──────────────────────────────────────────────────────────────────
  plugins: [

    // Adds `writing-mode` utilities:  .writing-vertical-rl  .writing-horizontal
    ({ addUtilities }) => {
      addUtilities({
        ".writing-vertical-rl":  { writingMode: "vertical-rl"  },
        ".writing-horizontal":   { writingMode: "horizontal-tb" },
      });
    },

    // Adds webkit-text-stroke utilities: .stroke-ink-2  .stroke-coral-2
    ({ addUtilities }) => {
      addUtilities({
        ".stroke-ink-1":   { WebkitTextStroke: "1px #1A1A1A" },
        ".stroke-ink-2":   { WebkitTextStroke: "2px #1A1A1A" },
        ".stroke-coral-1": { WebkitTextStroke: "1px #FF5733" },
        ".stroke-coral-2": { WebkitTextStroke: "2px #FF5733" },
        ".stroke-none":    { WebkitTextStroke: "0px"          },
      });
    },

    // Adds text-transparent utility for outline text effect
    ({ addUtilities }) => {
      addUtilities({
        ".text-transparent": { color: "transparent" },
      });
    },

    // Adds tabular-nums utility
    ({ addUtilities }) => {
      addUtilities({
        ".tabular-nums": { fontVariantNumeric: "tabular-nums" },
      });
    },

  ],
};