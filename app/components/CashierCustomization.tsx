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
  itemType: "drink" | "food";
  selectedSize?: string;
  selectedIce?: string;
  selectedSweetness?: string;
  selectedMilk?: string;
  selectedBoba?: string[];
  selectedPoppingBoba?: string[];
  selectedJelly?: string[];
  selectedOther?: string[];
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
  const [selectedSize, setSelectedSize] = useState("Regular");
  const [selectedIce, setSelectedIce] = useState("Normal");
  const [selectedSweetness, setSelectedSweetness] = useState("100%");
  const [selectedMilk, setSelectedMilk] = useState("Cow");
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
    setSelectedIce("Normal");
    setSelectedSweetness("100%");
    setSelectedMilk("Cow");
    setSelectedBoba([]);
    setSelectedPoppingBoba([]);
    setSelectedJelly([]);
    setSelectedOther([]);
    setQuantity(1);
    setNotes("");
  }, [item]);

  if (!isOpen || !item) return null;

  const getSizeSurcharge = () => {
    if (selectedSize === "Small") return -0.75;
    if (selectedSize === "Large") return 0.75;
    if (selectedSize === "Extra Large") return 1.5;
    return 0;
  };

  const price =
    item.price +
    getSizeSurcharge() +
    (selectedBoba.length + selectedJelly.length) * 0.5 +
    selectedPoppingBoba.length * 0.75 +
    selectedOther.length;

  function handleAdd() {
    if (!item) return;

    const customizedItem: CustomizedCartItem = {
      id: item.id,
      name: item.name,
      price,
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
      <div className="w-full max-w-3xl rounded-xl max-h-3/4 overflow-y-auto bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-(--gray)">{item.name}</h2>
            <p className="text-lg text-(--gray)">
              ${(price * quantity).toFixed(2)}
            </p>
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
            Toppings:{" "}
            <span className={`${topLen >= 5 && "text-(--accent)"}`}>
              {topLen} / 5
            </span>
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
                      ${selected ? "bg-(--primary) border-(--primary) text-white" : "bg-(--gray)/10"}
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
                      ${selected ? "bg-(--primary) border-(--primary) text-white" : "bg-(--gray)/10"}
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
                      ${selected ? "bg-(--primary) border-(--primary) text-white" : "bg-(--gray)/10"}
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
                      ${selected ? "bg-(--primary) border-(--primary) text-white" : "bg-(--gray)/10"}
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
            Notes
          </label>
          <textarea
            className="w-full border border-gray-200 rounded p-3 text-gray-700 focus:ring-2 focus:ring-(--primary) outline-none"
            rows={3}
            placeholder="No onions, extra napkins, etc..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
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

type FoodItem = {
  id: number;
  name: string;
  price: number;
  notes: string;
};

type FoodCustomizationProps = {
  item: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customizedItem: CustomizedCartItem) => void;
};

export function FoodCustomization({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: FoodCustomizationProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!item) return;
    setQuantity(1);
    setNotes("");
  }, [item]);

  if (!isOpen || !item) return null;
  function handleAdd() {
    if (!item) return;

    const customizedItem: CustomizedCartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      itemType: "food",
      notes,
    };

    onAddToCart(customizedItem);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-xl max-h-3/4 overflow-y-auto bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-(--gray)">{item.name}</h2>
            <p className="text-lg text-(--gray)">
              ${(item.price * quantity).toFixed(2)}
            </p>
          </div>
        </div>

        <label className="mb-1 block text-lg font-medium text-gray-500">
          Notes
        </label>
        <textarea
          className="w-full border border-gray-200 rounded p-3 text-gray-700 focus:ring-2 focus:ring-(--primary) outline-none"
          rows={3}
          placeholder="No onions, extra napkins, etc..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
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
