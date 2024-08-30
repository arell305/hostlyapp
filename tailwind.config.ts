import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        customLightBlue: "#BFE9FF",
        customRed: "#EFAEB2",
        customPrimaryBlue: "#6B9AE1",
        customSecondaryBlue: "#A0BAE1",
        customDarkBlue: "#324E78",
        customDarkerBlue: "#A3C7F2",
      },
    },
  },
  plugins: [],
};
export default config;
