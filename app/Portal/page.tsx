import Link from "next/link";

export default function Portal() {
  const LinkStyle =
    "flex gap-2 text-white m-auto bg-(--primary) h-fit w-fit px-6 py-3 rounded-full";
  return (
    <main className="flex flex-col gap-10">
      <h1 className="text-center text-5xl">Portal Page</h1>
      <div className="flex flex-col gap-5">
        <Link
          className={
            LinkStyle +
            " hover:scale-105 active:scale-95 transition-transform duration-300"
          }
          href="/"
        >
          Customer/Home Page
        </Link>
        <Link
          className={
            LinkStyle +
            " hover:scale-105 active:scale-95 transition-transform duration-300"
          }
          href="/Manager"
        >
          Manager Page
        </Link>
        <Link
          className={
            LinkStyle +
            " hover:scale-105 active:scale-95 transition-transform duration-300"
          }
          href="/CashierPOS"
        >
          Cashier Page
        </Link>
      </div>
    </main>
  );
}
