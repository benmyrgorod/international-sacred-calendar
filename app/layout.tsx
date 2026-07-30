import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "International Sacred Calendar",
  description:
    "Convert dates with the International Sacred Calendar, explore rotation anniversaries, and compare Hebrew, Gregorian, and tabular Islamic dates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
