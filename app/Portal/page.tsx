import Link from "next/link";

export default function Portal() {
  const LinkStyle =
    "flex flex-col text-center gap-2 text-white m-auto bg-(--primary) h-fit w-fit px-6 py-3 rounded-full";
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
          Manager Page{" "}
          <small className="text-xs text-black">
            You have to be logged in to access
          </small>
        </Link>
        <Link
          className={
            LinkStyle +
            " hover:scale-105 active:scale-95 transition-transform duration-300"
          }
          href="/CashierPOS"
        >
          Cashier Page{" "}
          <small className="text-xs text-black">
            You have to be logged in to access
          </small>
        </Link>
      </div>
      <div className="flex flex-col gap-3 p-3 bg-(--primary) rounded-3xl w-fit mx-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Manager account</h1>
          <p>
            <span className="font-bold">Username:</span> managerACC@example.com{" "}
            <br />
            <span className="font-bold">Password:</span> M@nag3rs
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Cashier account</h1>
          <p>
            <span className="font-bold">Username:</span> cashier@example.com{" "}
            <br />
            <span className="font-bold">Password:</span> C@shi3rs
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Customer account</h1>
          <p>
            <span className="font-bold">Username:</span> customer@example.com{" "}
            <br />
            <span className="font-bold">Password:</span> Cu$t0mer
          </p>
        </div>
      </div>
    </main>
  );
}
