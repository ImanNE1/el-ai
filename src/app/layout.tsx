import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EL / AI — Intelligent Assistant & Autonomous Gateway",
  description:
    "Swiss Editorial precision meets advanced reasoning AI. Multi-model gateway, gem skill architectures, and automated document export engine (.docx, .pdf, .xlsx).",
  robots: "index, follow",
  icons: {
    icon: "/logo-brand.png",
    apple: "/logo-brand.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} data-theme="light">
      <body className="font-sans antialiased bg-[#F9F9F8] text-[#111111] selection:bg-[#111111] selection:text-[#F9F9F8]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

