import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/nav";
import LensProvider from "./components/magnifier";
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
        {/* 🔥 Lens wraps ONLY app UI */}
        <LensProvider>
          <NavBar />
          {children}
        </LensProvider>

        {/* 🔥 External scripts OUTSIDE capture scope */}
        <Script
          src="https://elfsightcdn.com/platform.js"
          strategy="afterInteractive"
        />

        <div
          className="elfsight-app-72f9bd91-2a62-4d73-b116-1de5d755fd57"
          data-elfsight-app-lazy
        />
      </body>
    </html>
  );
}
