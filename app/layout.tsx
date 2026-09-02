import type { Metadata } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "@fontsource-variable/archivo/standard.css";
import frauncesLatin from "@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2?url";
import frauncesLatinItalic from "@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2?url";
import archivoLatin from "@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2?url";
import "./globals.css";
import "./overrides.css";

const base = new URL("https://patrick-dawson.com");
const description = "A New York-based design practice spanning architecture, fabrication, experiential systems, and independent AI products.";
const preview = new URL("/blank-preview.png", base).toString();

export const metadata: Metadata = {
  metadataBase: base,
  title: "Pat Dawson · Corpus",
  description,
  icons: {
    icon: [{ url: "/blank-icon.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/blank-icon.png",
    apple: "/blank-icon.png",
  },
  openGraph: {
    title: "Pat Dawson · Corpus",
    description,
    type: "website",
    images: [{ url: preview, width: 970, height: 656, alt: "" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pat Dawson · Corpus",
    description,
    images: [preview],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/idaf-regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href={frauncesLatin} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href={frauncesLatinItalic} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href={archivoLatin} as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
