import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
        className="font-sans antialiased bg-background text-foreground"
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
