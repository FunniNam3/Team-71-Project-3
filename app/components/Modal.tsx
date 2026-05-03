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
  const [milk, setMilk] = useState<string>("Cow");
  const [boba, setBoba] = useState<string[]>([]);
  const [popping, setPopping] = useState<string[]>([]);
  const [jelly, setJelly] = useState<string[]>([]);
  const [other, setOther] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  // --- Price Logic ---
  // Calculates extra cost based on size
  const getSizeSurcharge = () => {
    if (isFood) return 0;
    if (size === "Small") return -0.75;
    if (size === "Large") return 0.75;
    if (size === "Extra Large") return 1.5;
    return 0;
  };

  const topLen = boba.length + popping.length + jelly.length + other.length;
  const currentUnitPrice =
    item.price +
    getSizeSurcharge() +
    (boba.length + jelly.length) * 0.5 +
    popping.length * 0.75 +
    other.length;

  const handleConfirm = () => {
    onConfirm({
      ...item,
      price: currentUnitPrice,
      quantity: quantity,
      customizations: isFood
        ? { notes: specialInstructions, toppings: [] }
        : {
            size,
            ice,
            sugar,
            milk,
            toppings: { boba, popping, jelly, other },
            notes: specialInstructions,
          },
      instanceId: Math.random().toString(36).substring(2, 9),
    });
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <span className="text-lg font-bold text-(--primary)">
            ${(currentUnitPrice * quantity).toFixed(2)}
          </span>
        </div>
        <p className="text-gray-500 mb-6">{item.description}</p>

        {/* --- DYNAMIC SECTION --- */}
        {!isFood && (
          <>
            {/* SIZE SELECTION */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800 text-xl">Size</h4>
              <div className="flex flex-wrap gap-2">
                {["Small", "Regular", "Large", "Extra Large"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      size === s
                        ? "bg-(--primary) text-white border-(--primary)"
                        : "text-gray-600 border-gray-200 hover:border-(--primary)"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ICE LEVEL - Added "Hot Drink" */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800 text-xl">
                Ice Level
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Hot Drink", "None", "Less", "Regular", "Extra"].map(
                  (level) => (
                    <button
                      key={level}
                      onClick={() => setIce(level)}
                      className={`px-4 py-2 rounded-full border transition-all ${
                        ice === level
                          ? "bg-(--primary) text-white border-(--primary)"
                          : "text-gray-600 border-gray-200 hover:border-(--primary)"
                      }`}
                    >
                      {level}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Milk */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800 text-xl">Milk</h4>
              <div className="flex flex-wrap gap-2">
                {["Cow", "Oat", "Almond", "Soy"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMilk(m)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      milk === m
                        ? "bg-(--primary) text-white border-(--primary)"
                        : "text-gray-600 border-gray-200 hover:border-(--primary)"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* SUGAR LEVEL */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800 text-xl">
                Sugar Level
              </h4>
              <div className="flex flex-wrap gap-2">
                {["0%", "25%", "50%", "75%", "100%", "125%", "150%"].map(
                  (level) => (
                    <button
                      key={level}
                      onClick={() => setSugar(level)}
                      className={`px-4 py-2 rounded-full border transition-all ${
                        sugar === level
                          ? "bg-(--primary) text-white border-(--primary)"
                          : "text-gray-600 border-gray-200 hover:border-(--primary)"
                      }`}
                    >
                      {level}
                    </button>
                  ),
                )}
              </div>
            </div>

            <h1 className="text-2xl mb-3 font-bold border-t pt-3">
              Toppings:{" "}
              <span className={`${topLen === 5 && "text-(--accent)"}`}>
                {topLen} / 5
              </span>
            </h1>

            {/* Boba */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800 text-xl">Boba</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Tapioca",
                  "Brown Sugar",
                  "Honey",
                  "Golden Tapioca",
                  "Mini Tapioca",
                  "Crystal",
                  "Matcha",
                  "Taro",
                ].map((b) => {
                  const selected = boba.includes(b); // or popping/jelly/etc
                  const disabled = !selected && topLen >= 5;
                  return (
                    <button
                      key={b}
                      onClick={() => {
                        if (boba.includes(b)) {
                          setBoba((prev) => prev.filter((item) => item !== b));
                        } else {
                          if (topLen >= 5) return;
                          setBoba((prev) => [...prev, b]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full border transition-all 
                        ${
                          selected
                            ? "bg-(--primary) text-white border-(--primary)"
                            : "text-gray-600 border-gray-200 hover:border-(--primary)"
                        }
                        ${disabled ? "opacity-40 cursor-not-allowed " : "cursor-pointer"}
                      `}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Popping */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800 text-xl">Popping</h4>
              <div className="flex flex-wrap gap-2">
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
                ].map((p) => {
                  const selected = popping.includes(p); // or popping/jelly/etc
                  const disabled = !selected && topLen >= 5;

                  return (
                    <button
                      key={p}
                      onClick={() => {
                        if (popping.includes(p)) {
                          setPopping((prev) =>
                            prev.filter((item) => item !== p),
                          );
                        } else {
                          if (topLen >= 5) return;
                          setPopping((prev) => [...prev, p]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full border transition-all 
                      ${
                        selected
                          ? "bg-(--primary) text-white border-(--primary)"
                          : "text-gray-600 border-gray-200 hover:border-(--primary)"
                      }
                    ${disabled ? "opacity-40 cursor-not-allowed " : "cursor-pointer"}
                    `}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jelly */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800 text-xl">Jelly</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Grass",
                  "Coconut",
                  "Lychee",
                  "Mango",
                  "Rainbow",
                  "Coffee",
                  "Aloe Vera",
                  "Strawberry",
                ].map((j) => {
                  const selected = jelly.includes(j); // or popping/jelly/etc
                  const disabled = !selected && topLen >= 5;
                  return (
                    <button
                      key={j}
                      onClick={() => {
                        if (jelly.includes(j)) {
                          setJelly((prev) => prev.filter((item) => item !== j));
                        } else {
                          if (topLen >= 5) return;
                          setJelly((prev) => [...prev, j]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full border transition-all 
                        ${
                          selected
                            ? "bg-(--primary) text-white border-(--primary)"
                            : "text-gray-600 border-gray-200 hover:border-(--primary)"
                        }
                      ${disabled ? "opacity-40 cursor-not-allowed " : "cursor-pointer"}
                      `}
                    >
                      {j}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Other */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 text-gray-800 text-xl">Other</h4>
              <div className="flex flex-wrap gap-2">
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
                ].map((o) => {
                  const selected = other.includes(o); // or popping/jelly/etc
                  const disabled = !selected && topLen >= 5;
                  return (
                    <button
                      key={o}
                      onClick={() => {
                        if (other.includes(o)) {
                          setOther((prev) => prev.filter((item) => item !== o));
                        } else {
                          if (topLen >= 5) return;
                          setOther((prev) => [...prev, o]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full border transition-all 
                      ${
                        selected
                          ? "bg-(--primary) text-white border-(--primary)"
                          : "text-gray-600 border-gray-200 hover:border-(--primary)"
                      }
                    ${disabled ? "opacity-40 cursor-not-allowed " : "cursor-pointer"}
                    `}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div className="mb-6">
          <h4 className="font-bold mb-2 text-gray-800 text-xl">
            Special Instructions
          </h4>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-(--primary) outline-none"
            rows={3}
            placeholder="No onions, extra napkins, etc..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
          />
        </div>

        {/* --- QUANTITY SECTION --- */}
        <div className="mb-6 border-t pt-4">
          <h4 className="font-bold mb-2 text-gray-800 text-xl">Quantity</h4>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center font-bold text-xl hover:bg-gray-50"
            >
              -
            </button>
            <span className="text-xl font-bold w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center font-bold text-xl hover:bg-gray-50"
            >
              +
            </button>
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
            className="flex-1 bg-(--primary) text-white py-3 rounded-xl font-bold hover:bg-[#008060] transition-transform active:scale-95"
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
