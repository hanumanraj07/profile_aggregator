/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0D1117",
        card: "#161B22",
        line: "#30363D",
        accentGreen: "#238636",
        accentBlue: "#1F6FEB",
        accentPurple: "#8957E5",
        accentOrange: "#F78166"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      boxShadow: {
        glowBlue: "0 0 30px rgba(31, 111, 235, 0.35)",
        glowGreen: "0 0 30px rgba(35, 134, 54, 0.35)",
        glowPurple: "0 0 30px rgba(137, 87, 229, 0.35)",
        glowOrange: "0 0 30px rgba(247, 129, 102, 0.35)"
      }
    }
  },
  plugins: []
};
