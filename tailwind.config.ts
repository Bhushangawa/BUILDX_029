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
          bg: "#0c1322",
          surface: "#111b2f",
          card: "#16233b",
          cardHover: "#1b2b48",
          cardLighter: "#203254",
          border: "#243656",
          borderLight: "#334973",
          cyan: "#0ea5e9",
          cyanLight: "#38bdf8",
          cyanMuted: "rgba(14, 165, 233, 0.15)",
          amber: "#f59e0b",
          rose: "#ef4444",
          emerald: "#10b981",
          purple: "#a855f7",
          textPrimary: "#f8fafc",
          textSecondary: "#94a3b8",
          textMuted: "#64748b",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
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
    },
  },
  plugins: [],
};
export default config;