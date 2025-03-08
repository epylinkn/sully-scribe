import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/store/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Sully Assistant",
  description: "A real-time medical translation chat application for clinicians and patients",
  keywords: ["medical", "translation", "healthcare", "chat", "multilingual"],
  authors: [{ name: "epylinkn" }],
  themeColor: "#ffffff",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    title: "Sully Assistant",
    description: "Real-time medical translation for healthcare professionals",
    siteName: "Sully Assistant"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
