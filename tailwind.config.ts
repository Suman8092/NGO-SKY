import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        forest: "rgb(var(--forest) / <alpha-value>)",
        moss: "rgb(var(--moss) / <alpha-value>)",
        ember: "rgb(var(--ember) / <alpha-value>)",
        mist: "rgb(var(--mist) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-jakarta)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(12, 53, 45, 0.10)",
        lift: "0 20px 50px rgba(10, 35, 30, 0.16)",
      },
      opacity: {
        7: "0.07",
        8: "0.08",
        9: "0.09",
        12: "0.12",
        14: "0.14",
        16: "0.16",
        18: "0.18",
        32: "0.32",
        38: "0.38",
        42: "0.42",
        43: "0.43",
        48: "0.48",
        52: "0.52",
        58: "0.58",
        62: "0.62",
        66: "0.66",
        68: "0.68",
        72: "0.72",
        76: "0.76",
        88: "0.88",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        pulseSoft: "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.08)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
