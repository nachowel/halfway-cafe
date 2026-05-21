/* Halfway Cafe — Tailwind CSS configuration */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
      extend: {
        colors: {
          bg: {
            DEFAULT: "var(--color-bg)",
            soft: "var(--color-bg-soft)",
            dark: "var(--color-bg-dark)",
          },
          text: {
            DEFAULT: "var(--color-text)",
            mid: "var(--color-text-mid)",
            light: "var(--color-text-light)",
          },
          parchment: {
            DEFAULT: "var(--color-bg)",
            dark: "var(--color-bg-soft)",
          },
          ink: {
            DEFAULT: "var(--color-text)",
            light: "var(--color-text-mid)",
          },
          accent: {
            DEFAULT: "var(--color-accent)",
            dark: "var(--color-accent-dark)",
          },
        red: {
          DEFAULT: "var(--color-accent)",
          dark: "var(--color-accent-dark)",
        },
          gold: {
            DEFAULT: "var(--color-yellow)",
            light: "var(--color-gold-light)",
          },
          yellow: {
            DEFAULT: "var(--color-yellow)",
            light: "var(--color-gold-light)",
          },
          border: "var(--color-border)",
          rule: {
            DEFAULT: "var(--color-rule)",
            strong: "var(--color-rule-strong)",
            light: "var(--color-rule-light)",
          },
          white: "var(--color-white)",
        },
        fontFamily: {
          playfair: ["var(--font-playfair)", "serif"],
          inter: ["var(--font-inter)", "sans-serif"],
          mono: ["var(--font-mono)", "monospace"],
          lora: ["var(--font-inter)", "sans-serif"],
          baskerville: ["var(--font-inter)", "sans-serif"],
        },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        marquee: "marquee 44s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
