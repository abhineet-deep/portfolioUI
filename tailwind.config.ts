import type { Config } from "tailwindcss";

const channel = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: channel("bg"),
        surface: channel("surface"),
        line: channel("line"),
        ink: channel("ink"),
        muted: channel("muted"),
        teal: channel("teal"),
        amber: channel("amber"),
        coral: channel("coral"),
        iris: channel("iris"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        panel: "1.5rem",
        card: "1.25rem",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
