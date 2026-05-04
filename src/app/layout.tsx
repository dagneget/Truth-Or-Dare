import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Spline_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const splineSans = Spline_Sans({
  variable: "--font-spline",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Truth or Dare — Party",
  description: "The ultimate party game. Real-time rooms, bottle spin, truths & dares.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Truth or Dare" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${splineSans.variable} h-full`}>
      <body className="min-h-dvh antialiased">
        {children}
        {/* Force clear any stale PWA service workers that might be caching old broken code */}
        <Script
          id="clear-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && !localStorage.getItem('sw_cleared')) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  if (registrations.length > 0) {
                    Promise.all(registrations.map(r => r.unregister())).then(() => {
                      localStorage.setItem('sw_cleared', '1');
                      window.location.reload();
                    });
                  } else {
                    localStorage.setItem('sw_cleared', '1');
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
