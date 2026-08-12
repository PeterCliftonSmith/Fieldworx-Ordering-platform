import type { Metadata } from "next";
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fieldworx — Restaurant ordering from suppliers",
    template: "%s · Fieldworx",
  },
  description:
    "Fieldworx connects restaurateurs with suppliers so kitchens can order produce, seafood, meat, and pantry staples in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA">
      <body className={`${fraunces.variable} ${sora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
