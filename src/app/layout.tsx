import type { Metadata } from "next";
import { Alegreya_Sans } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const alegreyaSans = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "800", "900"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Regimen AI — Precision Training Protocols",
  description: "Generate hyper-personalized AI workout plans and complete weekly training programs. Free, fast, and tailored to your goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${alegreyaSans.variable} dark`} suppressHydrationWarning>
      <body className="antialiased font-sans bg-background text-foreground">
        <Header />
        {children}
      </body>
    </html>
  );
}
