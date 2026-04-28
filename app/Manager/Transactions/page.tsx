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
  details: string;
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
  const [total, setTotal] = useState(0);

  async function showReceipt(id: number) {
    setOpenSelected(true);
    setCurrent(-1);
    setTotal(0);
    window.scrollTo(0, 0);
    await fetch(`/api/receipt/detailed?q=${id}`)
      .then((res) => res.json())
      .then((result) => {
        setCurrent(id);
        setSelectedReceipt(result);
        let curr = 0;
        for (let i = 0; i < result.length; i++) {
          curr += result[i].price;
        }
        setTotal(curr);
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
                {selectedReceipt &&
                  selectedReceipt.map((item, index) => {
                    if (!item.details) {
                      return (
                        <li key={index}>
                          <div className="flex justify-between">
                            <p className="font-semibold text-xl">
                              {item.item_name} ${item.price}
                            </p>
                            <p className="font-semibold text-right text-xl">
                              {" "}
                              x{item.quantity}
                            </p>
                          </div>
                        </li>
                      );
                    }
                    const details = item.details.split(", ");
                    return (
                      <li key={index}>
                        <div className="flex justify-between">
                          <p className="font-semibold text-xl">
                            {item.item_name} ${item.price}
                          </p>
                          <p className="font-semibold text-right text-xl">
                            {" "}
                            x{item.quantity}
                          </p>
                        </div>
                        <ul className="w-fit ml-5">
                          {details.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
              </ul>
              <h2 className="text-left font-bold">Total Price: ${total}</h2>
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
