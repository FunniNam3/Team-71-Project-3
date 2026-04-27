"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/login")
      .then((result) => result.json())
      .then((res) => {
        if (res.role !== "manager" && res.role !== "rev") {
          router.push("/Portal");
        }
      });
  }, []);
  return children;
}
