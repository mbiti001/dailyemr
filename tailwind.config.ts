import type { Config } from "tailwindcss";

const config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          midnight: "#0B1B33",
          navy: "#102A43",
          blue: "#1D4ED8",
          sky: "#38BDF8",
          cloud: "#F8FBFF"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 40px -24px rgba(15, 23, 42, 0.45)"
      },
      backgroundImage: {
        "brand-radial": "radial-gradient(circle at top left, rgba(56,189,248,0.32), transparent 55%)",
        "brand-sheen": "linear-gradient(120deg, rgba(29,78,216,0.22), rgba(15,23,42,0.75))"
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
