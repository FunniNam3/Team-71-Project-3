"use client";

import { useEffect, useState } from "react";

type FoodItem = {
  id: number;
  name: string;
  price: number;
};

type EditFoodPopUpProps = {
  isOpen: boolean;
  food: FoodItem | null;
  onClose: () => void;
  onSave: (updatedFood: FoodItem) => void;
};

export default function EditFoodPopUp({
  isOpen,
  food,
  onClose,
  onSave,
}: EditFoodPopUpProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (!food) return;

    setName(food.name);
    setPrice(String(food.price));
  }, [food]);

  if (!isOpen || !food) return null;

  function handleSave() {
    if (!food) return;
    onSave({
      id: food.id,
      name,
      price: Number(price),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-700">
            Edit Food: {food.name}
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