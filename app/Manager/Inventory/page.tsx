"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Item {
  id: Number;
  name: String;
  amount: Number;
  supplier_name: String;
  supplier_contact: String;
}

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[] | null>(null);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((response) => {
        setItems(response);
        setLoading(false);
      });
  }, []);

  async function handleSearch() {
    setLoading(true);
  }

  return (
    <main className="min-h-screen font-sans pb-20 max-w-7/8 mx-auto px-4 mt-12 text-center">
      <h1 className="text-6xl font-medium text-white bg-(--header_bg) mb-16 drop-shadow-sm">
        Inventory
      </h1>

      <div className="flex justify-between bg-white px-4 py-4 max-w-7/8 mx-auto rounded-full m-5">
        <input
          type="text"
          name="Item Search"
          placeholder="Search for Item(Id, Name, Supplier Name, Supplier Contact)..."
          className="bg-white mr-2 flex-1"
        />

        <button
          onClick={handleSearch}
          className="bg-(--primary) p-4 rounded-full hover:scale-105 active:scale-95"
        >
          <Image src="/Search.svg" alt="Search" width={20} height={20} />
        </button>
      </div>

      {loading ? (
        <h1 className="text-white bg-(--header_bg)">Loading Table... </h1>
      ) : (
        <div className="bg-white p-4 rounded-2xl">
          <table className="border-collapse border border-(--gray) w-full">
            <thead>
              <tr>
                <th className="border border-(--gray) p-2">Id</th>
                <th className="border border-(--gray) p-2">Name</th>
                <th className="border border-(--gray) p-2">Amount</th>
                <th className="border border-(--gray) p-2">Supplier Name</th>
                <th className="border border-(--gray) p-2">Supplier Contact</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item, index) => (
                <tr key={index}>
                  <td className="border border-(--gray) p-2">
                    {item?.id.toString()}
                  </td>
                  <td className="border border-(--gray) p-2">{item?.name}</td>
                  <td className="border border-(--gray) p-2">
                    {item?.amount.toString()}
                  </td>
                  <td className="border border-(--gray) p-2">
                    {item?.supplier_name}
                  </td>
                  <td className="border border-(--gray) p-2">
                    {item?.supplier_contact}
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
