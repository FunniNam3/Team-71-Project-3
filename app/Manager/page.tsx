"use client";
import ReportModule from "./reportModule";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManagerDashboard() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/login")
      .then((result) => result.json())
      .then((res) => {
        if (res.role !== "manager") {
          router.push("/Portal");
        }
      });
  }, []);

  return (
    <main className="min-h-screen font-sans pb-20">
      <div className="max-w-4xl mx-auto px-4 mt-12 text-center">
        <h1 className="text-6xl font-medium text-white bg-(--header_bg) mb-16 drop-shadow-sm">
          Manager Dashboard
        </h1>

        <section className="grid grid-cols-2 items-center gap-10 text-white">
          <div className="w-full max-w-xl bg-white p-10 rounded-[45px] shadow-xl">
            <h2 className="text-3xl text-(--primary) font-semibold mb-2">
              Trends
            </h2>
            <p className="text-sm text-(--gray) opacity-80 mb-6 italic">
              Trends Page: View trends
            </p>
            <Link
              className="flex flex-col bg-(--primary) w-full p-6 rounded-lg justify-center shadow-lg"
              href="/Manager/Trends"
            >
              <span className="text-xl font-bold tracking-widest text-white">
                Open Trends Page
              </span>
              <span className="text-xs text-white mt-1">Trends over time</span>
            </Link>
          </div>

          <div className="w-full max-w-xl bg-white p-10 rounded-[45px] shadow-xl">
            <h2 className="text-3xl text-(--primary) font-semibold mb-2">
              Menu
            </h2>
            <p className="text-sm text-(--gray) opacity-80 mb-6 italic">
              Menu Page: Edit Menu Items
            </p>
            <Link
              className="flex flex-col bg-(--primary) w-full p-6 rounded-lg justify-center shadow-lg"
              href="/Manager/MenuEditing"
            >
              <span className="text-xl font-bold tracking-widest text-white">
                Open Menu Page
              </span>
              <span className="text-xs text-white mt-1">Edit Menu Items</span>
            </Link>
          </div>

          <div className="w-full max-w-xl bg-white p-10 rounded-[45px] shadow-xl">
            <h2 className="text-3xl text-(--primary) font-semibold mb-2">
              Inventory
            </h2>
            <p className="text-sm text-(--gray) opacity-80 mb-6 italic">
              Inventory Page: View Inventory
            </p>
            <Link
              className="flex flex-col bg-(--primary) w-full p-6 rounded-lg justify-center shadow-lg"
              href="/Manager/Inventory"
            >
              <span className="text-xl font-bold tracking-widest text-white">
                Open Inventory Page
              </span>
              <span className="text-xs text-white mt-1">
                View/Display Inventory
              </span>
            </Link>
          </div>

          <div className="w-full max-w-xl bg-white p-10 rounded-[45px] shadow-xl">
            <h2 className="text-3xl text-(--primary) font-semibold mb-2">
              Transactions
            </h2>
            <p className="text-sm text-(--gray) opacity-80 mb-6 italic">
              Transactions Page: View Transactions
            </p>
            <Link
              className="flex flex-col bg-(--primary) w-full p-6 rounded-lg justify-center shadow-lg"
              href="/Manager/Transactions"
            >
              <span className="text-xl font-bold tracking-widest text-white">
                Open Transactions Page
              </span>
              <span className="text-xs text-white mt-1">
                View/Display Transactions
              </span>
            </Link>
          </div>

          <div className="w-full max-w-xl bg-white p-10 rounded-[45px] shadow-xl">
            <h2 className="text-3xl text-(--primary) font-semibold mb-2">
              Daily Snapshots
            </h2>
            <p className="text-sm text-(--gray) opacity-80 mb-6 italic">
              X-Report: Real-time sales view
            </p>
            <ReportModule type="x" />
          </div>

          <div className="w-full max-w-xl bg-white p-10 rounded-[45px] shadow-xl">
            <h2 className="text-3xl text-(--primary) font-semibold mb-2">
              End of Shift
            </h2>
            <p className="text-sm text-(--gray) opacity-80 mb-6 italic">
              Z-Report: Close out registers
            </p>
            <ReportModule type="z" />
          </div>

          <div className="w-full max-w-xl bg-white p-10 rounded-[45px] shadow-xl">
            <h2 className="text-3xl text-(--primary) font-semibold mb-2">
              Sales Report
            </h2>
            <p className="text-sm text-(--gray) opacity-80 mb-6 italic">
              Inventory & Item tracking
            </p>
            <ReportModule type="sales" />
          </div>
        </section>
      </div>
    </main>
  );
}
