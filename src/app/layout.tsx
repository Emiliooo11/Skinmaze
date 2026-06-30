import type { Metadata } from "next";
import { Funnel_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SkinMaze – CS2 Case Opening & Marketplace",
  description: "Your premier place for CS2 skins. Open cases, win skins, trade on the marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${funnelDisplay.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
