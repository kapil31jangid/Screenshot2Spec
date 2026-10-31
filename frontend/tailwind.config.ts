import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#14370D',
          hover: '#0E2709',
          light: '#1E4F14',
        },
        sage: {
          DEFAULT: '#738E6D',
          light: '#E9EFE8',
          border: '#CBD6C9',
          muted: '#52624F',
        },
        sand: {
          DEFAULT: '#E5CE82',
          light: '#F7EDCA',
        },
        butter: {
          DEFAULT: '#FEF3B5',
          light: '#FFFDEB',
        },
        cream: {
          DEFAULT: '#FAF9F1',
          card: '#FFFFFF',
          subtle: '#F4F6F2',
        },
        forestText: {
          DEFAULT: '#1C2B1B',
          muted: '#52624F',
        },
      },
    },
  },
  plugins: [],
};
export default config;
