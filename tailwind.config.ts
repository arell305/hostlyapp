import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
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
