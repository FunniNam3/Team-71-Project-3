"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Receipt {
  id: number;
  customer_id: number;
  cashier_id: number;
  discount: number;
  tax: number;
  name: string | null;
  purchase_date: string;
  payment_method: string;
  z_close: boolean;
}

interface ReceiptItems {
  item_name: string;
  price: number;
  quantity: number;
  size?: string;
  ice?: string;
  sweetness?: string;
  milk?: string;
  boba?: string;
  popping_boba?: string;
  jelly?: string;
  other?: string;
  notes: string;
}

export default function Inventory() {
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
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[] | null>(null);
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(1);
  const [tax, setTax] = useState(0);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItems[]>([]);
  const [openSelected, setOpenSelected] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [subtotal, setSubtotal] = useState(0);

  async function showReceipt(id: number) {
    setOpenSelected(true);
    setCurrent(-1);
    setSubtotal(0);
    window.scrollTo(0, 0);
    await fetch(`/api/receipt/detailed?q=${id}`)
      .then((res) => res.json())
      .then((result) => {
        setCurrent(id);
        setSelectedReceipt(result);
        let curr = 0;
        for (let i = 0; i < result.length; i++) {
          try {
            if (result[i].boba)
              result[i].price += result[i].boba.split(",").length * 0.5;
            if (result[i].popping_boba)
              result[i].price +=
                result[i].popping_boba.split(",").length * 0.75;
            if (result[i].jelly)
              result[i].price += result[i].jelly.split(",").length * 0.5;
            if (result[i].other)
              result[i].price += result[i].other.split(",").length;
          } catch (err) {}
          curr += result[i].price * result[i].quantity;
        }
        setSubtotal(curr);
      });
  }

  useEffect(() => {
    setLoading(true);
    fetch("/api/receipt/search")
      .then((res) => res.json())
      .then((response) => {
        setReceipts(response);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function handleSearch() {
    setLoading(true);
    if (search === "") {
      fetch("/api/receipt/search")
        .then((res) => res.json())
        .then((response) => {
          setReceipts(response);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      fetch(`/api/receipt/search/?q=${search}`)
        .then((res) => res.json())
        .then((response) => {
          setReceipts(response);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

  return (
    <main className="min-h-screen font-sans pb-20 max-w-7/8 mx-auto px-4 mt-12 text-center">
      <button
        onClick={() => {
          setOpenSelected(false);
        }}
        hidden={!openSelected}
        className="absolute w-dvw h-dvh bg-black/50 top-0 left-0 z-10"
      >
        <div className="m-auto w-fit h-fit max-h-5/7 gap-3 flex flex-col overflow-y-auto px-8 py-5 bg-white rounded-4xl text-black">
          {current == -1 ? (
            "Loading Receipt"
          ) : (
            <>
              <h1 className="font-bold text-4xl">Receipt #{current}</h1>
              <ul className="w-full flex flex-col text-left">
                {Array.isArray(selectedReceipt) &&
                  selectedReceipt.map((item, index) => {
                    return (
                      <li key={index}>
                        <div className="flex justify-between gap-10">
                          <p className="font-semibold text-xl">
                            {item.item_name} ${item.price} x {item.quantity}
                          </p>
                          <p className="font-semibold text-right text-xl">
                            ${item.price * item.quantity}
                          </p>
                        </div>
                        <ul className="w-fit ml-5">
                          {item.size && <li>Size: {item.size}</li>}
                          {item.ice && <li>Ice: {item.ice}</li>}
                          {item.sweetness != undefined && (
                            <li>Sweetness: {item.sweetness}%</li>
                          )}
                          {item.milk && <li>Milk: {item.milk}</li>}
                          {item.boba && (
                            <li>Boba: {item.boba?.split(",").join(", ")}</li>
                          )}
                          {item.popping_boba && (
                            <li>
                              Popping Boba:{" "}
                              {item.popping_boba?.split(",").join(", ")}
                            </li>
                          )}
                          {item.jelly && (
                            <li>Jelly: {item.jelly?.split(",").join(", ")}</li>
                          )}
                          {item.other && (
                            <li>Other: {item.other?.split(",").join(", ")}</li>
                          )}
                        </ul>
                        {item.notes && (
                          <p className="text-wrap max-w-md ml-5 break-all">
                            Notes: {item.notes}
                          </p>
                        )}
                      </li>
                    );
                  })}
              </ul>
              <div className="border-t mt-3 text-xl">
                <div className="flex font-semibold justify-between">
                  <h2>Subtotal Price:</h2>
                  <h2>${subtotal.toFixed(2)}</h2>
                </div>
                {discount > 0 && (
                  <div className="flex font-semibold justify-between">
                    <h2>Discount:</h2> <h2>-${discount.toFixed(2)}</h2>
                  </div>
                )}
                <div className="flex font-semibold justify-between">
                  <h2>Tax:</h2> <h2>${tax.toFixed(2)}</h2>
                </div>
                <div className="flex font-semibold justify-between border-t border-dashed">
                  <h2>Total Price:</h2>{" "}
                  <h2>${(subtotal - discount + tax).toFixed(2)}</h2>
                </div>
              </div>
            </>
          )}
        </div>
      </button>

      <h1 className="text-6xl font-medium text-white bg-(--header_bg) mb-16 drop-shadow-sm">
        Transactions
      </h1>

      <div className="flex w-full gap-5 align-center">
        <div className="flex flex-1 bg-white px-4 py-4 mx-auto rounded-full m-5">
          <input
            type="text"
            name="Item Search"
            placeholder="Search for Item(Id, Name, Supplier Name, Supplier Contact)..."
            className="bg-white mr-2 flex-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />

          <button
            onClick={handleSearch}
            className="bg-(--primary) p-4 rounded-full hover:scale-105 active:scale-95"
          >
            <Image src="/Search.svg" alt="Search" width={20} height={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <h1 className="text-white bg-(--header_bg)">Loading Table... </h1>
      ) : (
        <div className="bg-white p-4 rounded-2xl overflow-x-auto">
          <table className="border-collapse border border-(--gray) w-full">
            <thead>
              <tr>
                <th className="border border-(--gray) p-2">Id</th>
                <th className="border border-(--gray) p-2">Customer Name</th>
                <th className="border border-(--gray) p-2">Purchase Date</th>
                <th className="border border-(--gray) p-2">Payment Method</th>
                <th className="border border-(--gray) p-2">
                  View Full Receipt
                </th>
              </tr>
            </thead>
            <tbody>
              {receipts?.map((item, index) => (
                <tr key={index}>
                  <td className="border border-(--gray) p-2">
                    {String(item.id)}
                  </td>
                  <td className="border border-(--gray) p-2">{item.name}</td>
                  <td className="border border-(--gray) p-2">
                    {item.purchase_date}
                  </td>
                  <td className="border border-(--gray) p-2">
                    {item.payment_method}
                  </td>
                  <td className="border border-(--gray) p-2">
                    <button
                      onClick={() => {
                        setDiscount(item.discount);
                        setTax(item.tax);
                        showReceipt(item.id);
                      }}
                      className="bg-(--primary) text-white py-2 px-3 rounded-full hover:scale-105 active:scale-95"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
