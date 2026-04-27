"use client";

import LensProvider from "@components/magnifier";
import { useState, useEffect } from "react";
import Image from "next/image";

type Theme = "original" | "highContrast";

export default function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scale, setScale] = useState(100);
  const [lens, setLens] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("original");

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
      root.style.setProperty("--header_bg", "transparent");
    } else {
      root.style.setProperty("--primary", "#0D6B4F");
      root.style.setProperty("--dark", "#0F0F0F");
      root.style.setProperty("--secondary", "#F5F5DC");
      root.style.setProperty("--accent", "#E63946");
      root.style.setProperty("--gray", "#000");
      root.style.setProperty("--header_bg", "#000");
    }
  };

  if (!mounted) return <>{children}</>;
  return (
    <>
      <div className="flex gap-2 bg-white flex-wrap w-40 rounded-[40] justify-between p-3 fixed top-5 right-4 z-9999 ">
        <button
          onClick={() => setLens((v) => !v)}
          className={`h-14 w-14 ${lens ? "bg-(--accent)" : "bg-(--primary)"} text-white p-3 rounded-full hover:scale-110 transition flex items-center justify-center`}
          aria-label={
            lens ? "Disable magnifying glass" : "Enable magnifying glass"
          }
          title="Press to toggle magnifying glass for accessibility"
        >
          <Image
            src="/Magnify.svg"
            alt="Magnifying Glass"
            width={20}
            height={20}
            className="w-full h-auto"
          />
        </button>
        <button
          onClick={toggleTheme}
          className="h-14 w-14 bg-(--primary) text-white p-3 rounded-full hover:scale-105 active:scale-95 flex items-center justify-center font-medium"
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
        <div className="flex py-3">
          <button
            onClick={() => {
              setScale(scale - 10);
            }}
            className="hover:scale-105 active:scale-95"
          >
            <Image
              src="/minus-icon.svg"
              alt="Smaller"
              width={20}
              height={20}
              className="w-full h-auto"
              priority
            />
          </button>
          <input
            className="w-full h-4 appearance-none bg-transparent p-0 hover:scale-110 transition [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 [&::-moz-range-thumb]:w-0 [&::-moz-range-thumb]:h-0 [&::-moz-range-thumb]:border-0"
            style={{
              background: `linear-gradient(to right, var(--gray) 0%, var(--gray) ${((scale - 10) / (1000 - 10)) * 100}%, var(--primary) ${((scale - 10) / (1000 - 10)) * 100}%, var(--primary) 100%)`,
            }}
            type="range"
            name="scale"
            min="10"
            max="1000"
            value={scale}
            onInput={(e) => {
              setScale(Number(e.currentTarget.value));
            }}
          />
          <button
            onClick={() => {
              setScale(scale + 10);
            }}
            className="hover:scale-105 active:scale-95"
          >
            <Image
              src="/plus-icon.svg"
              alt="Larger"
              width={20}
              height={20}
              className="w-full h-auto"
              priority
            />
          </button>
        </div>
        <button
          className="mx-auto bg-(--primary) rounded-full px-2 -mt-3 py-1 text-sm text-white"
          onClick={() => {
            setScale(100);
          }}
        >
          Reset
        </button>
      </div>
      <LensProvider enabled={lens}>
        <div
          className="origin-top-left top-0"
          style={{ transform: `scale(${scale / 100})` }}
        >
          {children}
        </div>
      </LensProvider>
    </>
  );
}
