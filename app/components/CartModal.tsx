"use client";

import { createPortal } from "react-dom";
import { Dispatch, SetStateAction, useState } from "react";

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

type ModalView = "cart" | "payment" | "receipt";

export default function CartModal({ cart, onClose, setCart }: CartModalProps) {
  const [view, setView] = useState<ModalView>("cart");
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [orderId, setOrderId] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal - discountAmount;
  const points = Math.floor(total) * 10;

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.instanceId !== id));
  };

  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === "SAVE10") {
      setDiscountAmount(subtotal * 0.1);
    }
  };

  const handleConfirmPayment = () => {
    setOrderId(`ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
    setView("receipt");
  };

  const handleFinish = () => {
    setCart([]); // Clear cart after successful purchase
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={view === "receipt" ? handleFinish : onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* VIEW 1: YOUR ORIGINAL CART */}
        {view === "cart" && (
          <>
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Your Order</h2>
                <p className="text-sm text-gray-500">{cart.length} items</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="text-2xl text-gray-400">x</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-12"><p className="text-gray-400 text-lg">Your cart is empty</p></div>
              ) : (
                cart.map((item) => (
                  <div key={item.instanceId} className="flex justify-between items-start gap-4 border-b border-gray-100 pb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                      <div className="text-sm text-gray-500 space-y-1 mt-1">
                        {item.category === "food" ? (
                          <>{item.customizations.notes && <p className="italic">"{item.customizations.notes}"</p>}</>
                        ) : (
                          <p>{item.customizations.ice} ice • {item.customizations.sugar} sugar</p>
                        )}
                        {item.customizations.toppings.length > 0 && (
                          <p className="text-[#00A67E]">+ {item.customizations.toppings.join(", ")}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold text-gray-900">${item.price.toFixed(2)}</span>
                      <button onClick={() => removeItem(item.instanceId)} className="text-red-500 text-xs font-semibold hover:bg-red-50 px-2 py-1 rounded">REMOVE</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600 font-medium">Total Amount</span>
                <span className="text-3xl font-bold text-[#00A67E]">${subtotal.toFixed(2)}</span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => setView("payment")}
                className="w-full bg-[#00A67E] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#008060] disabled:bg-gray-300 shadow-lg"
              >
                Confirm Order
              </button>
            </div>
          </>
        )}

        {/* VIEW 2: PAYMENT & DISCOUNTS */}
        {view === "payment" && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--dark)' }}>Checkout</h2>
            
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-500">PROMO CODE</p>
              <div className="flex gap-2">
                <input 
                  className="flex-1 border p-3 rounded-xl outline-none" 
                  placeholder="SAVE10"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button onClick={handleApplyDiscount} className="px-4 rounded-xl text-white font-bold" style={{ backgroundColor: 'var(--dark)' }}>Apply</button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-500">CARD INFORMATION</p>
              <input className="w-full border p-4 rounded-xl" placeholder="Card Number" />
              <div className="flex gap-2">
                <input className="w-1/2 border p-4 rounded-xl" placeholder="MM/YY" />
                <input className="w-1/2 border p-4 rounded-xl" placeholder="CVC" />
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <span className="font-bold text-gray-600">Total</span>
              <span className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setView("cart")} className="flex-1 py-4 font-bold text-gray-400">Back</button>
              <button onClick={handleConfirmPayment} className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg" style={{ backgroundColor: 'var(--primary)' }}>Pay Now</button>
            </div>
          </div>
        )}

        {/* VIEW 3: RECEIPT */}
        {view === "receipt" && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl text-white" style={{ backgroundColor: 'var(--primary)' }}>✓</div>
            <h2 className="text-2xl font-bold">Order Confirmed!</h2>
            
            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-left font-mono text-sm">
              <p className="text-center font-bold mb-4">RECEIPT: {orderId}</p>
              {cart.map(item => (
                <div key={item.instanceId} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="my-4 border-t border-gray-300"></div>
              <div className="flex justify-between font-bold">
                <span>TOTAL PAID</span>
                <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
              </div>
              <p className="mt-4 text-center text-xs text-gray-400">Points Earned: {points}</p>
            </div>

            <button onClick={handleFinish} className="w-full py-4 rounded-2xl font-bold text-white" style={{ backgroundColor: 'var(--dark)' }}>Done</button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}