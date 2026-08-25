import type { Metadata } from "next";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/martian-mono";
import "./globals.css";
import "./overrides.css";

const base = new URL("https://patrick-dawson.com");
const description = "Patrick Dawson is a New York-based designer and product lead working across architecture, fabrication, experiential systems, and independent AI products.";
const preview = new URL("/corpus-preview-20260825.png", base).toString();

export const metadata: Metadata = {
  metadataBase: base,
  title: "Pat Dawson · Corpus",
  description,
  icons: {
    icon: [{ url: "/corpus-icon-20260825.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/corpus-icon-20260825.png",
    apple: "/corpus-icon-20260825.png",
  },
  openGraph: {
    title: "Pat Dawson · Corpus",
    description,
    type: "website",
    images: [{ url: preview, width: 970, height: 656, alt: "Pat Dawson Corpus in blue." }],
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
      <body>{children}</body>
    </html>
  );
}
