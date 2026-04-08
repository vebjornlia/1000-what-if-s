import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import CursorGlow from "@/components/shared/CursorGlow";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "1000 What Ifs — Life-Changing Opportunities You'd Never Think to Pursue",
  description:
    "AI-powered cold outreach that writes itself. Get 1,000 personalized opportunities and swipe to send.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}
