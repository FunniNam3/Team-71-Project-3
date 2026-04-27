"use client";

import { useState } from "react";

type NewFoodItem = {
  name: string;
  price: number;
};

type AddFoodPopUpProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newFood: NewFoodItem) => void;
};

export default function AddFoodPopUp({
  isOpen,
  onClose,
  onAdd,
}: AddFoodPopUpProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  if (!isOpen) return null;

  function handleAdd() {
    if (!name.trim()) {
      alert("Please enter a food name.");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    onAdd({
      name,
      price: Number(price),
    });

    setName("");
    setPrice("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-700">Add Food</h2>

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
            onClick={handleAdd}
            className="rounded bg-[#21A179] px-4 py-2 text-white hover:bg-[#1b8a66]"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}