"use client";

import { createPortal } from "react-dom";
import { Dispatch, SetStateAction, useState } from "react";

export interface CartItem {
  instanceId: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
  quantity: number; // Added for tracking quantity
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
  userId: number | null;
}

type ModalView = "cart" | "payment" | "receipt";
type PaymentMethod = "Payment Method" | "Card" | "Cash" | "Check";

export default function CartModal({
  cart,
  onClose,
  setCart,
  userId,
}: CartModalProps) {
  const [view, setView] = useState<ModalView>("cart");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Payment Method");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UPDATED: Calculate subtotal by multiplying price * quantity for each item
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;
  const points = Math.floor(total) * 10;

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.instanceId !== id));
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === "Payment Method") return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart, // This now sends the quantity field to your database
          payment_method: paymentMethod,
          tax: tax.toFixed(2),
          total: total.toFixed(2),
          points: points,
          customer_id: userId,
          discount: 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to save order");

      const savedReceipt = await response.json();
      setOrderId(savedReceipt.id);
      setView("receipt");
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Database error: Transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setCart([]);
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={view === "receipt" ? handleFinish : onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* VIEW 1: CART SUMMARY */}
        {view === "cart" && (
          <>
            <div className="p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">Your Order</h2>
              <button onClick={onClose} className="p-2 text-2xl text-black">
                x
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map((item) => (
                <div
                  key={item.instanceId}
                  className="flex justify-between items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-black">
                      {item.name} <span className="text-[#00A67E] ml-1">x{item.quantity}</span>
                    </h3>
                    <div className="text-sm text-gray-600">
                      {item.category === "food" ? (
                        <p>{item.customizations.notes || "No special instructions"}</p>
                      ) : (
                        <p>
                          {item.customizations.ice} ice • {item.customizations.sugar} sugar
                        </p>
                      )}
                      {item.customizations.toppings.length > 0 && (
                        <p className="text-xs italic text-gray-500">
                          + {item.customizations.toppings.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-black">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.instanceId)}
                      className="text-red-500 text-xs font-semibold mt-1 hover:underline"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 border-t">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Total Bill</p>
                  <p className="text-3xl font-bold text-black">${total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold">Points</p>
                  <p className="text-2xl font-bold text-[#00A67E]">+{points}</p>
                </div>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => setView("payment")}
                className="w-full bg-[#00A67E] text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 disabled:bg-gray-300"
              >
                Confirm Order
              </button>
            </div>
          </>
        )}

        {/* VIEW 2: PAYMENT */}
        {view === "payment" && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-black">Payment</h2>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none text-black bg-white font-medium"
            >
              <option value="Payment Method">Select Method...</option>
              <option value="Card">Credit Card</option>
              <option value="Cash">Cash at Counter</option>
              <option value="Check">Check</option>
            </select>

            <div className="min-h-[140px]">
              {paymentMethod === "Card" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <input className="w-full border-2 border-gray-200 p-3 rounded-lg text-black" placeholder="Card Number" />
                  <div className="flex gap-2">
                    <input className="w-1/2 border-2 border-gray-200 p-3 rounded-lg text-black" placeholder="MM/YY" />
                    <input className="w-1/2 border-2 border-gray-200 p-3 rounded-lg text-black" placeholder="CVC" />
                  </div>
                </div>
              )}
              {paymentMethod === "Cash" && (
                <p className="p-4 bg-gray-100 rounded-xl text-sm border text-black">
                  Please pay at the counter. Points will be added upon completion.
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setView("cart")} className="flex-1 py-3 font-bold text-black">
                Back
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={paymentMethod === "Payment Method" || isSubmitting}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-[#00A67E] disabled:bg-gray-300"
              >
                {isSubmitting ? "Processing..." : "Finish Purchase"}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: RECEIPT */}
        {view === "receipt" && (
          <div className="p-8 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-[#00A67E] text-white flex items-center justify-center mx-auto text-3xl font-bold">
              ✓
            </div>
            <h2 className="text-2xl font-bold uppercase text-black">Order Confirmed</h2>

            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-300 text-left font-mono text-sm text-black">
              <p className="text-center font-bold mb-4 border-b pb-2">OFFICIAL RECEIPT</p>
              <div className="flex justify-between mb-4">
                <span>RECEIPT ID:</span>
                <span className="font-bold">#{orderId}</span>
              </div>

              <div className="space-y-2 mb-4 border-b pb-4">
                {cart.map((item) => (
                  <div key={item.instanceId} className="flex justify-between text-black">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8.25%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>TOTAL BILL</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-gray-500">
                Added {points} Points to user #{userId}
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-xl font-bold text-white bg-black hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}