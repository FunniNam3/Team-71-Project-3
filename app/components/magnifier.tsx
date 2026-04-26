"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function LensProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sourceRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cursor tracking
  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  if (!mounted) return <div ref={sourceRef}>{children}</div>;

  return (
    <>
      {/* Accessibility toggle */}
      <button
        onClick={() => setEnabled((v) => !v)}
        className={`fixed top-4 left-4 z-9999 ${enabled ? "bg-(--accent)" : "bg-(--primary)"} text-white p-4 rounded-full hover:scale-110 transition`}
        aria-label={
          enabled ? "Disable magnifying glass" : "Enable magnifying glass"
        }
        title="Press to toggle magnifying glass for accessibility"
      >
        <Image
          src="/Magnify.svg"
          alt="Magnifying Glass"
          width={20}
          height={20}
        />
      </button>

      {/* SOURCE DOM */}
      <div ref={sourceRef}>{children}</div>

      {/* LENS MIRROR */}
      {enabled && <LensMirror sourceRef={sourceRef} mouse={mouse} />}
    </>
  );
}

function LensMirror({
  sourceRef,
  mouse,
}: {
  sourceRef: React.RefObject<HTMLDivElement | null>;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const zoom = 2;
  const lensRadius = 120;
  const lensRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  // Sync mirror DOM
  useEffect(() => {
    if (!sourceRef.current || !mirrorRef.current) return;

    const sync = () => {
      const clone = sourceRef.current!.cloneNode(true) as HTMLElement;
      mirrorRef.current!.innerHTML = "";
      mirrorRef.current!.appendChild(clone);
    };

    sync();

    let timeout: NodeJS.Timeout;

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(sync, 100);
    });

    observer.observe(sourceRef.current, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true, // Catch text changes
    });

    // ✅ Also sync on input/change events (for form values)
    const handleInputChange = () => {
      clearTimeout(timeout);
      timeout = setTimeout(sync, 50);
    };

    sourceRef.current.addEventListener("input", handleInputChange, true);
    sourceRef.current.addEventListener("change", handleInputChange, true);
    sourceRef.current.addEventListener("click", handleInputChange, true);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      sourceRef.current?.removeEventListener("input", handleInputChange, true);
      sourceRef.current?.removeEventListener("change", handleInputChange, true);
      sourceRef.current?.removeEventListener("click", handleInputChange, true);
    };
  }, [sourceRef]);

  // RAF lens position update
  useEffect(() => {
    let frameId: number;

    const update = () => {
      if (!lensRef.current || !mirrorRef.current) return;

      const x = mouse.current.x;
      const y = mouse.current.y;

      lensRef.current.style.maskImage = `radial-gradient(circle ${lensRadius}px at ${x}px ${y}px, black 100%, transparent 100%)`;
      lensRef.current.style.webkitMaskImage = `radial-gradient(circle ${lensRadius}px at ${x}px ${y}px, black 100%, transparent 100%)`;

      mirrorRef.current.style.transform = `scale(${zoom})`;
      mirrorRef.current.style.transformOrigin = `${x}px ${y}px`;

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frameId);
  }, [zoom, lensRadius]);

  return (
    <div
      className="fixed inset-0 z-9998 pointer-events-none overflow-hidden"
      role="complementary"
      aria-label="Magnifying glass overlay"
      style={{
        maskImage:
          "radial-gradient(circle 0px at 0px 0px, black 100%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(circle 0px at 0px 0px, black 100%, transparent 100%)",
      }}
      ref={lensRef}
    >
      <div
        ref={mirrorRef}
        className="absolute inset-0 bg-(--secondary)"
        style={{
          transformOrigin: "0 0",
        }}
      />
    </div>
  );
}
