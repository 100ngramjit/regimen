import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Regimen — The Energy Architecture Atelier",
  description: "Where precision meets intention. Bespoke training protocols, architected for those who accept nothing less than exacting.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${spaceGrotesk.variable} dark`} suppressHydrationWarning>
      <body className="antialiased font-sans bg-background text-foreground overflow-x-hidden">
        <Header />
        {children}
      </body>
    </html>
  );
}
