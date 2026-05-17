import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const ibmPlexSerif = IBM_Plex_Serif({
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
    <html lang="en" className={`${ibmPlexSans.variable} ${ibmPlexSerif.variable} dark`} suppressHydrationWarning>
      <body className="antialiased font-sans bg-background text-foreground overflow-x-hidden">
        <Header />
        {children}
      </body>
    </html>
  );
}
