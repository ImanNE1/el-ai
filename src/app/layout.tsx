import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EL — Intelligent Assistant",
  description:
    "A modern AI chatbot powered by advanced language models. Get instant help with coding, writing, brainstorming, and more.",
  robots: "noindex, nofollow",
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
    <html lang="id" data-theme="light">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
