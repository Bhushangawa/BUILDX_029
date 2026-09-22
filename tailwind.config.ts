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
        sentinel: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          900: "#14532d",
        },
        navy: {
          800: "#0f172a",
          850: "#0b1329",
          900: "#080e1e",
          950: "#040711",
        },
        accent: {
          blue: "#38bdf8",
          amber: "#f59e0b",
          red: "#ef4444",
          purple: "#a855f7",
          emerald: "#10b981",
        }
      },
    },
  },
  plugins: [],
};
export default config;
