"use client";
import { useState } from "react";
import { createPortal } from "react-dom";

interface ProductItem {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string;
}

interface ModalProps {
  item: ProductItem;
  onClose: () => void;
  onConfirm: (customizedItem: any) => void;
}

export default function Modal({ item, onClose, onConfirm }: ModalProps) {
  const isFood = item.category === "food";

  // --- State ---
  const [size, setSize] = useState<string>("Regular");
  const [ice, setIce] = useState<string>("Regular");
  const [sugar, setSugar] = useState<string>("100%");
  const [quantity, setQuantity] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  // --- Price Logic ---
  // Calculates extra cost based on size
  const getSizeSurcharge = () => {
    if (isFood) return 0;
    if (size === "Large") return 0.75;
    if (size === "Extra Large") return 1.50;
    return 0;
  };

  const currentUnitPrice = item.price + getSizeSurcharge();

  const handleConfirm = () => {
    onConfirm({
      ...item,
      price: currentUnitPrice, // Send the price adjusted for size
      quantity: quantity,
      customizations: isFood
        ? { notes: specialInstructions, toppings: [] }
        : { 
            size, 
            ice, 
            sugar, 
            toppings: [] 
          },
      instanceId: Math.random().toString(36).substring(2, 9),
    });
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <span className="text-lg font-bold text-[#00A67E]">
            ${(currentUnitPrice * quantity).toFixed(2)}
          </span>
        </div>
        <p className="text-gray-500 mb-6">{item.description}</p>

        {/* --- DYNAMIC SECTION --- */}
        {isFood ? (
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
          <>
            {/* SIZE SELECTION */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800">Size</h4>
              <div className="flex flex-wrap gap-2">
                {["Regular", "Large", "Extra Large"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      size === s
                        ? "bg-[#00A67E] text-white border-[#00A67E]"
                        : "text-gray-600 border-gray-200 hover:border-[#00A67E]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ICE LEVEL - Added "Hot Drink" */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800">Ice Level</h4>
              <div className="flex flex-wrap gap-2">
                {["Hot Drink", "None", "Less", "Regular", "Extra"].map((level) => (
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

            {/* SUGAR LEVEL */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800">Sugar Level</h4>
              <div className="flex flex-wrap gap-2">
                {["0%", "25%", "50%", "75%", "100%", "125%"].map((level) => (
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

        {/* --- QUANTITY SECTION --- */}
        <div className="mb-6 border-t pt-4">
          <h4 className="font-bold mb-2 text-gray-800">Quantity</h4>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center font-bold text-xl hover:bg-gray-50"
             >-</button>
             <span className="text-xl font-bold w-8 text-center">{quantity}</span>
             <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center font-bold text-xl hover:bg-gray-50"
             >+</button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 py-3 text-gray-500 font-medium hover:text-gray-800">
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