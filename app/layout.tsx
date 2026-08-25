import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/martian-mono";
import "./globals.css";
import "./overrides.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const description = "Patrick Dawson is a New York-based designer and product lead working across architecture, fabrication, experiential systems, and independent AI products.";
  const preview = new URL("/og-mobile.png", base).toString();

  return {
    metadataBase: base,
    title: "Pat Dawson · Corpus",
    description,
    icons: { icon: "/icon.png", shortcut: "/icon.png" },
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
}

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
