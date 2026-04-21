import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/nav";
import { LensClient } from "./components/magnifier";

export const metadata: Metadata = {
  title: "Team 71 App",
  description: "Super cool app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <NavBar />
        <LensClient>{children}</LensClient>

        {/* Elfsight Website Translator | Untitled Website Translator */}
        <script src="https://elfsightcdn.com/platform.js" async></script>
        <div
          className="elfsight-app-72f9bd91-2a62-4d73-b116-1de5d755fd57"
          data-elfsight-app-lazy
        ></div>
      </body>
    </html>
  );
}
