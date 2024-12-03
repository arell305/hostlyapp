import type { Metadata } from "next";
import { Poppins, Playfair_Display, Raleway } from "next/font/google";
import "./globals.css";
import { TITLE, DESC, META_DESC, WEBSITE } from "./constants";
import { Providers } from "./providers";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Settings } from "luxon";

Settings.defaultZone = "America/Los_Angeles"; //

const playFairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-play-fair-display",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  icons: {
    icon: ["/favicon_io/favicon.ico"],
    apple: ["/favicon_io/apple-touch-icon.png"],
    shortcut: ["/favicon_io/apple-touch-icon.png"],
  },
  openGraph: {
    title: TITLE,
    description: META_DESC,
    url: WEBSITE,
    type: "website",
    images: [
      {
        url: "/favicon_io/android-chrome-512x512.png",
        width: 1200,
        height: 630,
        alt: "computer favicon",
      },
    ],
  },
  metadataBase: new URL(WEBSITE),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} ${playFairDisplay.variable} `}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
