import type { Metadata } from "next";
import { Eczar, Mukta } from "next/font/google";
import "./globals.css";

const eczar = Eczar({
  variable: "--font-eczar",
  subsets: ["latin", "devanagari"],
  weight: ["500", "600", "700"],
});

const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Navaras — Dance, celebration and costume",
    template: "%s — Navaras",
  },
  description:
    "Dance, celebration and costume, rooted in the Natyashastra. Learn the art, celebrate your wedding with it, and dress for it.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${eczar.variable} ${mukta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
