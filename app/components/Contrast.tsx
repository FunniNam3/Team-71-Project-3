"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Theme = "original" | "highContrast";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("original");
  const [mounted, setMounted] = useState(false);

  // Load saved theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    } else {
      applyTheme("original");
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "original" ? "highContrast" : "original";
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;

    if (t === "original") {
      root.style.setProperty("--primary", "#21A179");
      root.style.setProperty("--dark", "#1E1E24");
      root.style.setProperty("--secondary", "#C4AF9A");
      root.style.setProperty("--accent", "#FB9F89");
      root.style.setProperty("--gray", "#6a7282");
    } else {
      root.style.setProperty("--primary", "#0D6B4F");
      root.style.setProperty("--dark", "#0F0F0F");
      root.style.setProperty("--secondary", "#F5F5DC");
      root.style.setProperty("--accent", "#E63946");
      root.style.setProperty("--gray", "#000");
    }
  };

  if (!mounted) return <>{children}</>;

  return (
    <>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-[9999] w-10 bg-(--primary) text-white p-2 rounded-full hover:scale-105 active:scale-95 flex items-center gap-2 font-medium"
        aria-label={`Switch to ${theme === "original" ? "high contrast" : "original"} theme`}
        title={`Current: ${theme === "original" ? "Original" : "High Contrast"} Theme`}
      >
        <Image
          src="/Contrast.svg"
          alt="Contrast"
          width={20}
          height={20}
          className="w-full h-auto"
        />
      </button>

      {children}
    </>
  );
}
