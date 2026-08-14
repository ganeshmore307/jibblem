import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#f7770f",
          dark: "#d96407",
          light: "#fdeadb",
          faint: "#fff7f0",
        },
        ink: "#2b2b3c",
        muted: "#8b8b9e",
        line: "#e6e6ec",
        page: "#f4f4f6",
      },
      fontFamily: {
        sans: ["Nunito", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(35,35,60,0.08)",
        drawer: "-8px 0 24px rgba(35,35,60,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
