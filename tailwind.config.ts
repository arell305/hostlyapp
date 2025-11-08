import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // if you still use /pages
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // if you have a /components root
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "white-glow": "0 0 20px rgba(255, 255, 255, 0.1)",
      },
      colors: {
        dropdownBackground: "#18181b",
        dropdownBorder: "#2a2a2d",
        backgroundBlack: "#0C0C0F",
        cardBackground: "#0F0F13",
        cardBackgroundHover: "#1f2937",
        borderGray: "#1B1C20",
        focusRing: "#1B1C20",
        whiteText: "#F9FAFA",
        grayText: "#A2A5AD",
        primaryBlue: "#0D69B4",
        altBlack: "#343434",
        altGray: "#EFEFEF",
        altRed: "#C62828",
        customLightGray: "#EFEFEF",
        customLightBlue: "#BFE9FF",
        customRed: "#EFAEB2",
        customPrimaryBlue: "#6B9AE1",
        customSecondaryBlue: "#A0BAE1",
        customDarkBlue: "#324E78", // this one
        customDarkerBlue: "#A3C7F2",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
export default config;
