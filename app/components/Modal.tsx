import { useState } from "react";
import { createPortal } from "react-dom";

// 1. Define the shape of a single topping
interface Topping {
  id: string;
  name: string;
  price: number;
}

// 2. Define the shape of the product item
interface ProductItem {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

// 3. Define the props the Modal expects
interface ModalProps {
  item: ProductItem;
  onClose: () => void;
  onConfirm: (customizedItem: any) => void; 
}

export default function Modal({ item, onClose, onConfirm }: ModalProps) {
  // Typical Boba States - TypeScript infers these types from default values
  const [ice, setIce] = useState<string>("Regular");
  const [sugar, setSugar] = useState<string>("100%");
  
  // Explicitly tell TS this is an array of strings
  const [toppings, setToppings] = useState<string[]>([]);

  const toppingOptions: Topping[] = [
    { id: 'boba', name: 'Boba', price: 0.50 },
    { id: 'jelly', name: 'Lychee Jelly', price: 0.50 },
    { id: 'pudding', name: 'Custard Pudding', price: 0.75 },
  ];

  const handleToppingToggle = (name: string) => {
    setToppings((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const handleConfirm = () => {
    onConfirm({
      ...item,
      customizations: { ice, sugar, toppings },
      // Generates a unique ID for this specific drink instance in the cart
      instanceId: Math.random().toString(36).substring(2, 9),
    });
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto text-left">
        <h2 className="text-2xl font-bold mb-1 text-gray-900">{item.name}</h2>
        <p className="text-gray-500 mb-6">{item.description}</p>

        {/* Ice Level Section */}
        <div className="mb-6">
          <h4 className="font-bold mb-2 text-gray-800">Ice Level</h4>
          <div className="flex gap-2">
            {["None", "Less", "Regular"].map((level) => (
              <button
                key={level}
                onClick={() => setIce(level)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  ice === level 
                    ? 'bg-[#00A67E] text-white border-[#00A67E]' 
                    : 'text-gray-600 border-gray-200 hover:border-[#00A67E]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Toppings Section */}
        <div className="mb-6">
          <h4 className="font-bold mb-2 text-gray-800">Add Toppings</h4>
          <div className="space-y-2">
            {toppingOptions.map((t) => (
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
                <span className="text-gray-400 text-sm">+${t.price.toFixed(2)}</span>
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