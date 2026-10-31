/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  mode: "jit",
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#09090b",
        secondary: "#a1a1aa",
        tertiary: "#121216",
        "card-bg": "rgba(18, 18, 22, 0.75)",
        "card-border": "rgba(255, 255, 255, 0.08)",
        "black-100": "#101014",
        "black-200": "#09090b",
        "white-100": "#f4f4f5",
        acid: "#d4ff00",
        "acid-glow": "rgba(212, 255, 0, 0.15)",
        emerald: {
          glow: "rgba(52, 211, 153, 0.15)",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
        glow: "0 0 30px -5px rgba(212, 255, 0, 0.2)",
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      },
      screens: {
        xs: "450px",
      },
      backgroundImage: {
        "hero-pattern": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212, 255, 0, 0.06), rgba(255, 255, 255, 0))",
        "mesh-dark": "radial-gradient(at 0% 0%, rgba(255, 255, 255, 0.03) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(212, 255, 0, 0.02) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};

