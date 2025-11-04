import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TITLE, DESC, META_DESC, WEBSITE } from "../shared/types/constants";
import { Providers } from "./providers";
import React, { Suspense } from "react";
import { Toaster } from "@/shared/ui/primitive/toaster";
import { Settings } from "luxon";
import RouteChangeProgress from "@/shared/ui/layout/Nprogress";

Settings.defaultZone = "America/Los_Angeles";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
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
        url: "/logo/Logo_Black.JPG",
        width: 1200,
        height: 630,
        alt: "Hostly Logo",
      },
    ],
  },
  metadataBase: new URL(WEBSITE),
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <Suspense fallback={null}>
            <RouteChangeProgress />
            {children}
          </Suspense>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
