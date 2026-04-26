"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Item {
  id: number;
  name: string;
  amount: number;
  supplier_name: string;
  supplier_contact: string;
}

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[] | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(-1);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [error, setError] = useState<any>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((response) => {
        setItems(response);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    if (search === "") {
      fetch("/api/inventory")
        .then((res) => res.json())
        .then((response) => {
          setItems(response);
        })
        .catch((error) => {
          console.error(error);
          setError(error);
        })
        .finally(() => {
          setLoading(false);
          setEditing(-1);
          setAdding(false);
        });
    } else {
      fetch(`/api/inventory/search/?q=${search}`)
        .then((res) => res.json())
        .then((response) => {
          setItems(response);
        })
        .catch((error) => {
          console.error(error);
          setError(error);
        })
        .finally(() => {
          setLoading(false);
          setEditing(-1);
          setAdding(false);
        });
    }
  }

  async function editItem(itemId: number) {
    try {
      setLoading(true);
      const response = await fetch(`/api/inventory`, {
        method: "PATCH",
        body: JSON.stringify({
          id: itemId,
          name,
          amount,
          supplier_name: supplierName,
          supplier_contact: supplierContact,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      const updatedItem = await response.json();

      // Update the items list with the updated item
      setItems(
        items?.map((item) => (item.id === itemId ? updatedItem : item)) || [],
      );

      // Reset editing state and clear form
      setEditing(-1);
      setName("");
      setAmount("");
      setSupplierName("");
      setSupplierContact("");

      console.log("Item updated successfully:", updatedItem);
    } catch (error) {
      console.error("Error updating item:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  async function addItem() {
    try {
      setLoading(true);

      // Validate inputs
      if (!name || !supplierName || !supplierContact) {
        throw new Error("Please fill in all required fields");
      }

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          amount,
          supplier_name: supplierName,
          supplier_contact: supplierContact,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      const newItem = await response.json();

      // Add the new item to the items list
      setItems([...(items || []), newItem]);

      // Clear form
      setName("");
      setAmount("");
      setSupplierName("");
      setSupplierContact("");
      setAdding(false);

      console.log("Item added successfully:", newItem);
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(itemId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/inventory`, {
        method: "DELETE",
        body: JSON.stringify({ id: itemId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      // Reset editing state and clear form
      setEditing(-1);
      setName("");
      setAmount("");
      setSupplierName("");
      setSupplierContact("");
      setSearch("");
      handleSearch();

      console.log("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen font-sans pb-20 max-w-7/8 mx-auto px-4 mt-12 text-center">
      <h1 className="text-6xl font-medium text-white bg-(--header_bg) mb-16 drop-shadow-sm">
        Inventory
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
        <button
          onClick={() => {
            setName("");
            setAmount("");
            setSupplierName("");
            setSupplierContact("");
            setAdding(!adding);
          }}
          className={`bg-(${adding ? "--accent" : "--primary"}) my-auto w-fit h-fit p-4 rounded-full hover:scale-105 active:scale-95`}
        >
          <Image
            src="/Add.svg"
            alt="Search"
            width={20}
            height={20}
            className={`${adding ? "rotate-45" : ""} duration-300`}
          />
        </button>
      </div>

      {error && (
        <div className="text-(--accent) bg-white w-fit p-2 mx-auto m-3 rounded-full">
          Error:
        </div>
      )}

      {loading ? (
        <h1 className="text-white bg-(--header_bg)">Loading Table... </h1>
      ) : (
        <div className="bg-white p-4 rounded-2xl overflow-x-auto">
          <table className="border-collapse border border-(--gray) w-full">
            <thead>
              <tr>
                <th className="border border-(--gray) p-2">Id</th>
                <th className="border border-(--gray) p-2">Name</th>
                <th className="border border-(--gray) p-2">Amount</th>
                <th className="border border-(--gray) p-2">Supplier Name</th>
                <th className="border border-(--gray) p-2">Supplier Contact</th>
                <th className="border border-(--gray) p-2">Edit Item</th>
                {editing !== -1 && (
                  <th className="border border-(--gray) p-2">Delete Item</th>
                )}
              </tr>
            </thead>
            <tbody>
              {adding && (
                <tr key={-1}>
                  <td>?</td>
                  <td className="border border-(--gray) p-2">
                    <input
                      type="text"
                      name="Item Name"
                      id="Item Name"
                      value={name}
                      placeholder="Name"
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                    />
                  </td>
                  <td className="border border-(--gray) p-2">
                    <input
                      type="text"
                      name="Item Amount"
                      id="Item Amount"
                      value={amount}
                      placeholder="Amount"
                      onChange={(e) => {
                        setAmount(e.target.value);
                      }}
                    />
                  </td>
                  <td className="border border-(--gray) p-2">
                    <input
                      type="text"
                      name="Item Supplier Name"
                      id="Item Supplier Name"
                      value={supplierName}
                      placeholder="Supplier Name"
                      onChange={(e) => {
                        setSupplierName(e.target.value);
                      }}
                    />
                  </td>
                  <td className="border border-(--gray) p-2">
                    <input
                      type="text"
                      name="Item Supplier Contact"
                      id="Item Supplier Contact"
                      value={supplierContact}
                      placeholder="Supplier Contact"
                      onChange={(e) => {
                        setSupplierContact(e.target.value);
                      }}
                    />
                  </td>
                  <td className="border border-(--gray) p-2">
                    <button
                      onClick={addItem}
                      className="bg-(--primary) px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition duration-300"
                    >
                      Save Item
                    </button>
                  </td>
                </tr>
              )}
              {items?.map((item, index) => (
                <tr key={index}>
                  {editing === item.id ? (
                    <>
                      <td className="border border-(--gray) p-2">
                        {item?.id.toString()}
                      </td>
                      <td className="border border-(--gray) p-2">
                        <input
                          type="text"
                          name="Item Name"
                          id="Item Name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                          }}
                        />
                      </td>
                      <td className="border border-(--gray) p-2">
                        <input
                          type="text"
                          name="Item Amount"
                          id="Item Amount"
                          value={amount}
                          onChange={(e) => {
                            setAmount(e.target.value);
                          }}
                        />
                      </td>
                      <td className="border border-(--gray) p-2">
                        <input
                          type="text"
                          name="Item Supplier Name"
                          id="Item Supplier Name"
                          value={supplierName}
                          onChange={(e) => {
                            setSupplierName(e.target.value);
                          }}
                        />
                      </td>
                      <td className="border border-(--gray) p-2">
                        <input
                          type="text"
                          name="Item Supplier Contact"
                          id="Item Supplier Contact"
                          value={supplierContact}
                          onChange={(e) => {
                            setSupplierContact(e.target.value);
                          }}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border border-(--gray) p-2">
                        {item?.id.toString()}
                      </td>
                      <td className="border border-(--gray) p-2">
                        {item?.name}
                      </td>
                      <td className="border border-(--gray) p-2">
                        {item?.amount.toString()}
                      </td>
                      <td className="border border-(--gray) p-2">
                        {item?.supplier_name}
                      </td>
                      <td className="border border-(--gray) p-2">
                        {item?.supplier_contact}
                      </td>
                    </>
                  )}
                  <td className="border border-(--gray) p-2">
                    {editing === item.id ? (
                      <button
                        onClick={() => editItem(item.id)}
                        className="bg-(--primary) px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition duration-300"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setName(item.name);
                          setAmount(item.amount.toString());
                          setSupplierName(item.supplier_name);
                          setSupplierContact(item.supplier_contact);
                          setEditing(item.id);
                        }}
                        className="bg-(--accent) px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition duration-300"
                      >
                        Edit Item
                      </button>
                    )}
                  </td>
                  {editing !== -1 && (
                    <td>
                      <button
                        onClick={() => {
                          deleteItem(item.id);
                        }}
                        className="bg-(--accent) px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition duration-300"
                      >
                        Delete Item
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
