
"use client";
import { on } from "events";
import { useState } from "react";
import { createPortal } from "react-dom";

interface ProductItem {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string; // We use this to switch layouts
}

interface ModalProps {
  item: ProductItem;
  onClose: () => void;
  onConfirm: (customizedItem: any) => void;
}

export default function Modal({ item, onClose, onConfirm }: ModalProps) {
  // 1. Determine type
  const isFood = item.category === "food";

  // 2. State for Drink Customizations
  const [ice, setIce] = useState<string>("Regular");
  const [sugar, setSugar] = useState<string>("100%");

  // 3. State for Food Customizations
  const [specialInstructions, setSpecialInstructions] = useState("");

  // 4. Shared Toppings/Extras State
  const [toppings, setToppings] = useState<string[]>([]);

  // 5. Dynamic Options based on type
  const drinkToppings = [
    { id: "boba", name: "Boba", price: 0.5 },
    { id: "jelly", name: "Lychee Jelly", price: 0.5 },
    { id: "pudding", name: "Custard Pudding", price: 0.75 },
  ];

  const foodExtras = [
    { id: "spicy", name: "Extra Spicy", price: 0.0 },
    { id: "sauce", name: "Side Sauce", price: 0.5 },
    { id: "cheese", name: "Extra Cheese", price: 1.0 },
  ];

  const currentOptions = isFood ? foodExtras : drinkToppings;

  const handleToppingToggle = (name: string) => {
    setToppings((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const handleConfirm = () => {
    onConfirm({
      ...item,
      customizations: isFood
        ? { notes: specialInstructions, toppings } // Food data
        : { ice, sugar, toppings },                // Drink data
      instanceId: Math.random().toString(36).substring(2, 9),
    });
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-1 text-gray-900">{item.name}</h2>
        <p className="text-gray-500 mb-6">{item.description}</p>

        {/* --- DYNAMIC SECTION --- */}
        {isFood ? (
          /* FOOD LAYOUT */
          <div className="mb-6">
            <h4 className="font-bold mb-2 text-gray-800">Special Instructions</h4>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-[#00A67E] outline-none"
              rows={3}
              placeholder="No onions, extra napkins, etc..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>
        ) : (
          /* DRINK LAYOUT */
          <>
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800">Ice Level</h4>
              <div className="flex gap-2">
                {["None", "Less", "Regular"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setIce(level)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      ice === level
                        ? "bg-[#00A67E] text-white border-[#00A67E]"
                        : "text-gray-600 border-gray-200 hover:border-[#00A67E]"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800">Sugar Level</h4>
              <div className="flex flex-wrap gap-2">
                {["0%", "50%", "100%"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSugar(level)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      sugar === level
                        ? "bg-[#00A67E] text-white border-[#00A67E]"
                        : "text-gray-600 border-gray-200 hover:border-[#00A67E]"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* --- SHARED TOPPINGS SECTION --- */}
        <div className="mb-6">
          <h4 className="font-bold mb-2 text-gray-800">
            {isFood ? "Add Extras" : "Add Toppings"}
          </h4>
          <div className="space-y-2">
            {currentOptions.map((t) => (
              <label
                key={t.id}
                className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={toppings.includes(t.name)}
                    onChange={() => handleToppingToggle(t.name)}
                    className="w-5 h-5 accent-[#00A67E]"
                  />
                  <span className="text-gray-700">{t.name}</span>
                </div>
                <span className="text-gray-400 text-sm">
                  +${t.price.toFixed(2)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-500 font-medium hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-[#00A67E] text-white py-3 rounded-xl font-bold hover:bg-[#008060] transition-transform active:scale-95"
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}