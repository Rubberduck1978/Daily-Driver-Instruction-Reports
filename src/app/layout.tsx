import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Driver Instruction Tracker",
  description: "Record and track instructions given to drivers with comprehensive reporting and management features",
  keywords: ["Driver Instruction", "Fleet Management", "Bus Operations", "Driver Management", "Instruction Tracking"],
  authors: [{ name: "Driver Instruction Tracker" }],
  openGraph: {
    title: "Driver Instruction Tracker",
    description: "Professional driver instruction tracking and management system",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Driver Instruction Tracker",
    description: "Professional driver instruction tracking and management system",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
