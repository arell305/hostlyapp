import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { TITLE, DESC, META_DESC, WEBSITE } from "./constants";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
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
        url: "favicon_io/andrioid-chrome-512x512.png",
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
      <body className={` ${poppins.variable}`}>{children}</body>
    </html>
  );
}
