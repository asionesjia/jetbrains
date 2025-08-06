import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      overflow: ['hover'],
      backgroundImage: {
        'radial-gradient': 'radial-gradient(closest-side circle, rgba(129, 140, 248, 1) 0%, transparent)',
      },
      animation: {
        'auto-scroll': 'scrollText 10s linear infinite',
      }
    },
  },
  plugins: [],
};
export default config;
