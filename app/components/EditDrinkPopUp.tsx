"use client";

import { useEffect, useState } from "react";

type DrinkItem = {
  id: number;
  name: string;
  price: number;
  category: string[] | null;
};

type EditDrinkPopUpProps = {
  isOpen: boolean;
  drink: DrinkItem | null;
  onClose: () => void;
  onSave: (updatedDrink: DrinkItem) => void;
};

const categoryOptions = [
  "most ordered",
  "milk tea",
  "fruit tea",
  "specialty tea",
];

export default function EditDrinkPopUp({
  isOpen,
  drink,
  onClose,
  onSave,
}: EditDrinkPopUpProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!drink) return;

    setName(drink.name);
    setPrice(String(drink.price));
    setSelectedCategories(drink.category ?? []);
  }, [drink]);

  if (!isOpen || !drink) return null;

  function toggleCategory(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  }

  function handleSave() {
    if (!drink) return;
    onSave({
      id: drink.id,
      name,
      price: Number(price),
      category: selectedCategories,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-700">
            Edit Drink: {drink.name}
            </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-400 p-2 text-gray-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded border border-gray-400 p-2 text-gray-700"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">
              Categories
            </p>

            <div className="space-y-2">
              {categoryOptions.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded border px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded bg-[#21A179] px-4 py-2 text-white hover:bg-[#1b8a66]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}