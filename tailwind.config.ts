import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#F9F9F8",
          dark: "#09090B",
        },
        foreground: {
          light: "#111111",
          dark: "#FAFAFA",
        },
        muted: {
          light: "#666666",
          dark: "#A1A1AA",
        },
        border: {
          light: "#E5E5E0",
          dark: "#27272A",
        },
        status: {
          scale: "#10B981",    // Emerald
          hold: "#F59E0B",     // Amber
          pause: "#F43F5E",    // Rose
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
      },
      animation: {
        "status-pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
