"use client";

import { useEffect, useState } from "react";

type DrinkItem = {
  id: number;
  name: string;
  ice: string | null;
  sweetness: number | null;
  milk: string | null;
  boba: string | null;
  popping_boba: string | null;
  price: number;
  category: string[] | null;
};

type CustomizedCartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  itemType: "drink";
  selectedIce: string;
  selectedSweetness: string;
  selectedMilk: string;
  selectedBoba: string;
  selectedPoppingBoba: string;
};

type CashierCustomizationProps = {
  item: DrinkItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customizedItem: CustomizedCartItem) => void;
};

export default function CashierCustomization({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: CashierCustomizationProps) {
  const [selectedIce, setSelectedIce] = useState("");
  const [selectedSweetness, setSelectedSweetness] = useState("");
  const [selectedMilk, setSelectedMilk] = useState("");
  const [selectedBoba, setSelectedBoba] = useState("");
  const [selectedPoppingBoba, setSelectedPoppingBoba] = useState("");
  const [quantity, setQuantity] = useState(1);

  const iceOptions = ["No Ice", "Less Ice", "Normal", "Extra Ice"];
  const milkOptions = ["Cow", "Oat", "Almond", "Soy"];
  const yesNoOptions = ["True", "False"];

  useEffect(() => {
    if (!item) return;

    setSelectedIce(item.ice || "Normal");
    setSelectedSweetness("100%");
    setSelectedMilk(item.milk || "Cow");
    setSelectedBoba(item.boba || "False");
    setSelectedPoppingBoba(item.popping_boba || "False");
    setQuantity(1);
  }, [item]);

  if (!isOpen || !item) return null;

  function handleAdd() {
    if (!item) return;

    const customizedItem: CustomizedCartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      itemType: "drink",
      selectedIce,
      selectedSweetness,
      selectedMilk,
      selectedBoba,
      selectedPoppingBoba,
    };

    onAddToCart(customizedItem);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-500">{item.name}</h2>
            <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">Ice</label>
            <select
              value={selectedIce}
              onChange={(e) => setSelectedIce(e.target.value)}
              className="w-full rounded border p-2 text-gray-500"
            >
              {iceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">Sweetness</label>
            <select
              value={selectedSweetness}
              onChange={(e) => setSelectedSweetness(e.target.value)}
              className="w-full rounded border p-2 text-gray-500"
            >
              <option value="0%">0%</option>
              <option value="25%">25%</option>
              <option value="50%">50%</option>
              <option value="75%">75%</option>
              <option value="100%">100%</option>
              <option value="125%">125%</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">Milk</label>
            <select
              value={selectedMilk}
              onChange={(e) => setSelectedMilk(e.target.value)}
              className="w-full rounded border p-2 text-gray-500"
            >
              {milkOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">Boba</label>
            <select
              value={selectedBoba}
              onChange={(e) => setSelectedBoba(e.target.value)}
              className="w-full rounded border p-2 text-gray-500"
            >
              {yesNoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">
              Popping Boba
            </label>
            <select
              value={selectedPoppingBoba}
              onChange={(e) => setSelectedPoppingBoba(e.target.value)}
              className="w-full rounded border p-2 text-gray-500"
            >
              {yesNoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-500">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-full rounded border p-2 text-gray-500"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded border px-4 py-2 hover:bg-gray-100 text-gray-500"
          >
            Cancel
          </button>

          <button
            onClick={handleAdd}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}