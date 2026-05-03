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
  selectedSize: string;
  selectedIce: string;
  selectedSweetness: string;
  selectedMilk: string;
  selectedBoba: string[];
  selectedPoppingBoba: string[];
  selectedJelly: string[];
  selectedOther: string[];
  notes: string;
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
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedIce, setSelectedIce] = useState("");
  const [selectedSweetness, setSelectedSweetness] = useState("");
  const [selectedMilk, setSelectedMilk] = useState("");
  const [selectedBoba, setSelectedBoba] = useState<string[]>([]);
  const [selectedPoppingBoba, setSelectedPoppingBoba] = useState<string[]>([]);
  const [selectedJelly, setSelectedJelly] = useState<string[]>([]);
  const [selectedOther, setSelectedOther] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const sizeOptions = ["Small", "Regular", "Large", "Extra Large"];
  const iceOptions = ["Hot Drink", "No Ice", "Less Ice", "Normal", "Extra Ice"];
  const milkOptions = ["Cow", "Oat", "Almond", "Soy"];

  useEffect(() => {
    if (!item) return;

    setSelectedSize("Regular");
    setSelectedIce(item.ice || "Normal");
    setSelectedSweetness("100%");
    setSelectedMilk(item.milk || "Cow");
    setSelectedBoba([]);
    setSelectedPoppingBoba([]);
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
      selectedSize,
      selectedIce,
      selectedSweetness,
      selectedMilk,
      selectedBoba,
      selectedPoppingBoba,
      selectedJelly,
      selectedOther,
      notes,
    };

    onAddToCart(customizedItem);
    onClose();
  }

  const topLen =
    selectedBoba.length +
    selectedPoppingBoba.length +
    selectedJelly.length +
    selectedOther.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-(--gray)">{item.name}</h2>
            <p className="text-sm text-(--gray)">${item.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4 my-4">
          <div>
            <label className="mb-1 block text-lg font-medium text-(--gray)">
              Size
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full rounded border p-2 text-(--gray)"
            >
              {sizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-lg font-medium text-(--gray)">
              Ice
            </label>
            <select
              value={selectedIce}
              onChange={(e) => setSelectedIce(e.target.value)}
              className="w-full rounded border p-2 text-(--gray)"
            >
              {iceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-lg font-medium text-(--gray)">
              Sweetness
            </label>
            <select
              value={selectedSweetness}
              onChange={(e) => setSelectedSweetness(e.target.value)}
              className="w-full rounded border p-2 text-(--gray)"
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
            <label className="mb-1 block text-lg font-medium text-(--gray)">
              Milk
            </label>
            <select
              value={selectedMilk}
              onChange={(e) => setSelectedMilk(e.target.value)}
              className="w-full rounded border p-2 text-(--gray)"
            >
              {milkOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <h3 className="mb-1 block text-lg font-medium text-(--gray)">
            Toppings: {topLen} / 5
          </h3>

          <div>
            <label className="mb-1 block font-medium text-(--gray)">Boba</label>
            <div className="flex flex-wrap gap-3">
              {[
                "Tapioca",
                "Brown Sugar",
                "Honey",
                "Golden Tapioca",
                "Mini Tapioca",
                "Crystal",
                "Matcha",
                "Taro",
              ].map((item) => {
                const selected = selectedBoba.includes(item);
                const disabled = !selected && topLen >= 5;
                return (
                  <button
                    onClick={() => {
                      if (selectedBoba.includes(item)) {
                        setSelectedBoba((prev) =>
                          prev.filter((i) => i !== item),
                        );
                      } else {
                        if (topLen >= 5) return;
                        setSelectedBoba((prev) => [...prev, item]);
                      }
                    }}
                    className={`border rounded px-2 py-1
                      ${selected ? "bg-(--primary) border-(--primary) text-white" : "bg-(--gray)/20"}
                      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      `}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium text-(--gray)">
              Popping Boba
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                "Strawberry",
                "Mango",
                "Honey",
                "Lychee",
                "Passion Fruit",
                "Blueberry",
                "Green Apple",
                "Peach",
                "Pomegranate",
                "Watermelon",
              ].map((item) => {
                const selected = selectedPoppingBoba.includes(item);
                const disabled = !selected && topLen >= 5;
                return (
                  <button
                    onClick={() => {
                      if (selectedPoppingBoba.includes(item)) {
                        setSelectedPoppingBoba((prev) =>
                          prev.filter((i) => i !== item),
                        );
                      } else {
                        if (topLen >= 5) return;
                        setSelectedPoppingBoba((prev) => [...prev, item]);
                      }
                    }}
                    className={`border rounded px-2 py-1
                      ${selected ? "bg-(--primary) border-(--primary) text-white" : "bg-(--gray)/20"}
                      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      `}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium text-(--gray)">
              Jelly
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                "Grass",
                "Coconut",
                "Lychee",
                "Mango",
                "Rainbow",
                "Coffee",
                "Aloe Vera",
                "Strawberry",
              ].map((item) => {
                const selected = selectedJelly.includes(item);
                const disabled = !selected && topLen >= 5;
                return (
                  <button
                    onClick={() => {
                      if (selectedJelly.includes(item)) {
                        setSelectedJelly((prev) =>
                          prev.filter((i) => i !== item),
                        );
                      } else {
                        if (topLen >= 5) return;
                        setSelectedJelly((prev) => [...prev, item]);
                      }
                    }}
                    className={`border rounded px-2 py-1
                      ${selected ? "bg-(--primary) border-(--primary) text-white" : "bg-(--gray)/20"}
                      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      `}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium text-(--gray)">
              Other
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                "Egg Pudding",
                "Cheese Foam",
                "Red Bean",
                "Whipped Cream",
                "Taro Paste",
                "Matcha Foam",
                "Oreo Crumbles",
                "Brown Sugar Syrup",
                "Vanilla Ice Cream",
                "Matcha Ice Cream",
              ].map((item) => {
                const selected = selectedOther.includes(item);
                const disabled = !selected && topLen >= 5;
                return (
                  <button
                    onClick={() => {
                      if (selectedOther.includes(item)) {
                        setSelectedOther((prev) =>
                          prev.filter((i) => i !== item),
                        );
                      } else {
                        if (topLen >= 5) return;
                        setSelectedOther((prev) => [...prev, item]);
                      }
                    }}
                    className={`border rounded px-2 py-1
                      ${selected ? "bg-(--primary) border-(--primary) text-white" : "bg-(--gray)/20"}
                      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      `}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-lg font-medium text-gray-500">
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
            className="rounded border px-4 py-2 hover:bg-gray-100 text-(--gray)"
          >
            Cancel
          </button>

          <button
            onClick={handleAdd}
            className="rounded bg-(--primary) px-4 py-2 text-white hover:scale-105 active:scale-95"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
