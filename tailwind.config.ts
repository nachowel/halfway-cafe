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
        parchment: {
          DEFAULT: "var(--color-parchment)",
          dark: "var(--color-parchment-dark)",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          light: "var(--color-ink-light)",
        },
        red: {
          DEFAULT: "var(--color-red)",
          dark: "var(--color-red-dark)",
        },
        gold: {
          DEFAULT: "var(--color-gold)",
          light: "var(--color-gold-light)",
        },
        border: "var(--color-border)",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        lora: ["var(--font-lora)", "serif"],
        baskerville: ["var(--font-baskerville)", "serif"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
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
      },
    },
  },
  plugins: [],
};

export default config;
