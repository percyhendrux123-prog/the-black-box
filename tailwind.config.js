/** @type {import('tailwindcss').Config} */
export default {
  // look-better 2026-05-01: tailwind migration — JIT scans these globs and
  // emits only the utility classes referenced by JSX/HTML. The visual system
  // now lives on JSX as Tailwind utilities; index.css holds only the rules
  // Tailwind can't express cleanly (gradients, masks, mix-blend, animations,
  // pseudos, attribute-selector overrides).
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
