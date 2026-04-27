import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/nav";
import AccessibilityProvider from "./components/Accessibility";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Team 71 App",
  description: "Super cool app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AccessibilityProvider>
          <NavBar />
          {children}
        </AccessibilityProvider>
        <Script
          src="https://elfsightcdn.com/platform.js"
          strategy="afterInteractive"
        />

        <Script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js" />
        <Script
          src="https://files.bpcontent.cloud/2026/04/26/11/20260426111339-NJH2HJYL.js"
          defer
        />

        <div
          className="elfsight-app-72f9bd91-2a62-4d73-b116-1de5d755fd57"
          data-elfsight-app-lazy
        />
      </body>
    </html>
  );
}
