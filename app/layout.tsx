import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/app/components/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Traffic / Intelligence — WIUT Hackathon 2026 CV Track",
  description:
    "Traffic event detection and accident anticipation from a fixed road camera. Explore 14 official event channels, their implementation status, and the live pipeline.",
  keywords: ["traffic analytics", "computer vision", "event detection", "accident anticipation", "WIUT Hackathon"],
  openGraph: {
    title: "Traffic / Intelligence",
    description:
      "Fourteen traffic event channels, one causal computer-vision pipeline.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-background text-foreground">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}