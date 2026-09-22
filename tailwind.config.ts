import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          // Surface depth layers
          bg:          "#0d1526",   // page body
          surface:     "#111d30",   // panels, sidebars
          card:        "#172338",   // raised cards
          cardHover:   "#1c2e4a",   // card hover / selected
          inset:       "#0a1120",   // inputs, code, inner sections
          // Borders
          border:      "#1e3151",   // subtle dividers
          borderS:     "#2a4166",   // card edges, focused elements
          borderX:     "#3d5a84",   // strong accent borders
          // Brand accents
          cyan:        "#0ea5e9",   // primary accent
          cyanL:       "#38bdf8",   // text on dark, hover
          cyanD:       "#0284c7",   // button pressed
          cyanGlow:    "rgba(14, 165, 233, 0.12)",
          // Status semantic
          amber:       "#f59e0b",
          amberL:      "#fcd34d",
          rose:        "#ef4444",
          roseL:       "#fca5a5",
          emerald:     "#22c55e",
          emeraldL:    "#86efac",
          indigo:      "#818cf8",
          indigoL:     "#c7d2fe",
          // Text
          textPrimary:   "#f1f5f9",
          textSecondary: "#94a3b8",
          textMuted:     "#64748b",
          textDisabled:  "#334155",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs:   ["12px", { lineHeight: "16px" }],
        sm:   ["13px", { lineHeight: "20px" }],
        base: ["14px", { lineHeight: "22px" }],
        md:   ["15px", { lineHeight: "24px" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "shimmer":    "shimmer 1.6s infinite linear",
        "beacon":     "beacon-pulse 2s cubic-bezier(0.2, 0.6, 0.35, 1) infinite",
        "slide-up":   "slide-up 0.22s ease-out forwards",
        "fade-in":    "fade-in 0.18s ease-out forwards",
        "slide-left": "slide-in-left 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "spin-slow":  "spin 3s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "beacon-pulse": {
          "0%":   { transform: "scale(0.8)", opacity: "0.9" },
          "70%":  { transform: "scale(2.0)", opacity: "0" },
          "100%": { transform: "scale(2.0)", opacity: "0" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-100%)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
      },
      backgroundImage: {
        "circuit-grid": `
          linear-gradient(to right,  rgba(30, 49, 81, 0.25) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(30, 49, 81, 0.25) 1px, transparent 1px)
        `,
        "circuit-fine": `
          linear-gradient(90deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px),
          linear-gradient(0deg, rgba(14, 165, 233, 0.04) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        "grid-48": "48px 48px",
        "grid-32": "32px 32px",
        "grid-80": "80px 80px",
      },
      boxShadow: {
        "card":    "0 2px 8px rgba(0, 0, 0, 0.3)",
        "panel":   "0 4px 20px rgba(0, 0, 0, 0.4)",
        "modal":   "0 20px 60px rgba(0, 0, 0, 0.7)",
        "cyan-sm": "0 0 12px rgba(14, 165, 233, 0.2)",
        "cyan-md": "0 0 24px rgba(14, 165, 233, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;