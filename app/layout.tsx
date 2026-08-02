import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "./service-worker";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15382d",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: "International Sacred Calendar",
  applicationName: "International Sacred Calendar",
  description:
    "Convert dates with the International Sacred Calendar and compare Hebrew, Gregorian, Julian, and tabular Islamic dates.",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ISC",
    statusBarStyle: "default",
  },
  other: {
    // Next emits only the standard mobile-web-app-capable; older iOS versions
    // still look for the prefixed name before running in standalone mode.
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
