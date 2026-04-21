import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/nav";
import ThemeProvider from "@components/Contrast";
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
        <ThemeProvider>
          <NavBar />
          {children}
        </ThemeProvider>

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
