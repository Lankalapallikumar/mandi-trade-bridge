import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";
import { I18nProvider } from "../lib/i18n/context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "LocalTrade Bridge - AI-Powered Local Marketplace",
  description: "Connect with local vendors, negotiate fair prices with AI assistance, and discover quality products in your area. Support local businesses while getting the best deals on fresh produce.",
  keywords: "local marketplace, AI negotiation, fresh produce, local vendors, price negotiation, community trading",
  authors: [{ name: "LocalTrade Bridge Team" }],
  creator: "LocalTrade Bridge",
  publisher: "LocalTrade Bridge",
  robots: "index, follow",
  openGraph: {
    title: "LocalTrade Bridge - AI-Powered Local Marketplace",
    description: "Connect with local vendors and negotiate fair prices with AI assistance",
    type: "website",
    locale: "en_IN",
    siteName: "LocalTrade Bridge",
  },
  twitter: {
    card: "summary_large_image",
    title: "LocalTrade Bridge - AI-Powered Local Marketplace",
    description: "Connect with local vendors and negotiate fair prices with AI assistance",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LocalTrade Bridge" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <I18nProvider>
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-50"
          >
            Skip to main content
          </a>
          <Navigation />
          <main id="main-content" role="main">
            {children}
          </main>
          <noscript>
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 text-center">
              This application requires JavaScript to function properly. Please enable JavaScript in your browser.
            </div>
          </noscript>
        </I18nProvider>
      </body>
    </html>
  );
}
