"use client";

import { createPortal } from "react-dom";
import { Dispatch, SetStateAction } from "react";

export interface CartItem {
  instanceId: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
  customizations: {
    ice?: string;
    sugar?: string;
    notes?: string;
    toppings: string[];
  };
}

interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
  setCart: Dispatch<SetStateAction<CartItem[]>>;
}

export default function CartModal({ cart, onClose, setCart }: CartModalProps) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.instanceId !== id));
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Order</h2>
            <p className="text-sm text-gray-500">{cart.length} items</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="text-2xl text-gray-400">x</span>
          </button>
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.instanceId}
                className="flex justify-between items-start gap-4 border-b border-gray-100 pb-4"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {item.name}
                  </h3>

                  {/* DYNAMIC CUSTOMIZATION DISPLAY */}
                  <div className="text-sm text-gray-500 space-y-1 mt-1">
                    {item.category === "food" ? (
                      <>
                        {item.customizations.notes && (
                          <p className="italic">
                            "{item.customizations.notes}"
                          </p>
                        )}
                      </>
                    ) : (
                      <p>
                        {item.customizations.ice} ice •{" "}
                        {item.customizations.sugar} sugar
                      </p>
                    )}

                    {item.customizations.toppings.length > 0 && (
                      <p className="text-[#00A67E]">
                        + {item.customizations.toppings.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-gray-900">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.instanceId)}
                    className="text-red-500 text-xs font-semibold hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 font-medium">Total Amount</span>
            <span className="text-3xl font-bold text-[#00A67E]">
              ${total.toFixed(2)}
            </span>
          </div>
          <button
            disabled={cart.length === 0}
            className="w-full bg-[#00A67E] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#008060] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
