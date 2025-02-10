// components/ThemeProviderWrapper.js
"use client"; // Mark this as a Client Component

import { Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react"; // Import React to use React.ReactNode

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: "var(--font-raleway), sans-serif", // Use the CSS variable
    },
  },
});

// Define the type for the props
interface ThemeProviderWrapperProps {
  children: React.ReactNode; // Explicitly type the `children` prop
}

export default function ThemeProviderWrapper({
  children,
}: ThemeProviderWrapperProps) {
  return (
    <ThemeProvider theme={theme}>
      {" "}
      <Typography sx={{ fontFamily: "Raleway, sans-serif" }}>
        {children}
      </Typography>
    </ThemeProvider>
  );
}
