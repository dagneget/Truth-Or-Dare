import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Spline_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: true,
});

const splineSans = Spline_Sans({
  variable: "--font-spline",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  preload: true,
});

export const metadata: Metadata = {
  title: "Truth or Dare — Party",
  description: "The ultimate party game. Real-time rooms, bottle spin, truths & dares.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Truth or Dare" },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "https://") || "https://truthdare.app"),
  openGraph: {
    title: "Truth or Dare — Party",
    description: "The ultimate party game. Real-time rooms, bottle spin, truths & dares.",
    type: "website",
    images: ["/icons/icon-512x512.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${splineSans.variable} h-full`}>
      <head>
        <link rel="preconnect" href={supabaseUrl} />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href={supabaseUrl} />
      </head>
      <body className="min-h-dvh antialiased">
        {children}
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
