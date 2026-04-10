import type { Metadata } from "next";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col gap-3">
      <h1 className="">Manager Page</h1>
      <div>
        <Link href="/Manager/Reports">Report Page</Link>
      </div>
      {children}
    </main>
  );
}
