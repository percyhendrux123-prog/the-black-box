/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        bone: "#f5f1e8",
        canon: "#c9a961",
        "canon-warm": "#d4b46d",
        flare: "#ff5436",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        serif: ["Fraunces", "serif"],
      },
    },
  },
  plugins: [],
};
