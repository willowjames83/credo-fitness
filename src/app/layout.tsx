import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Credo — Train for Longevity",
  description:
    "Strength, stability, cardio, and nutrition. One app, one score. Built for people who want to be strong, active, and metabolically healthy at 80.",
  openGraph: {
    title: "Credo — Train for Longevity",
    description:
      "Strength, stability, cardio, and nutrition in one app. One score for every dimension of exercise that matters for longevity.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Credo — Train for Longevity",
    description:
      "Strength, stability, cardio, and nutrition in one app. One score for every dimension of exercise that matters for longevity.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSans.variable} ${dmSerifDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
