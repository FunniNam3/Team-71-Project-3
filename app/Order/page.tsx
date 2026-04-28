"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import ProductCard from "@components/ProductCard";
import Modal from "@components/Modal";
import CartModal from "@components/CartModal";
import { CartItem } from "@components/CartModal";

// 1. THE "STRUCTS" (Interfaces)
interface Customizations {
  ice: string;
  sugar: string;
  toppings: string[];
  size?: string; // Added size support
}

interface MenuItem {
  id: string | number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  type: "Food" | "Drink";
  customizations?: Customizations;
  instanceId?: string;
}

export default function OrderPage() {
  const { user } = useUser();
  const [dbUserId, setDbUserId] = useState<number | null>(null);
  const [foodItems, setFoodItems] = useState<MenuItem[]>([]);
  const [drinkItems, setDrinkItems] = useState<MenuItem[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("most ordered");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  const menuItems = useMemo(
    () => [
      ...foodItems.map((item) => ({ ...item, type: "Food" as const })),
      ...drinkItems.map((item) => ({ ...item, type: "Drink" as const })),
    ],
    [foodItems, drinkItems],
  );

  // Handle finding the numeric ID
  useEffect(() => {
    const userSub = user?.sub;
    if (userSub) {
      async function fetchMyId() {
        try {
          const res = await fetch("/api/users");
          const json = await res.json();
          const allUsers = json.data || [];
          const matchedUser = allUsers.find(
            (u: any) => u.auth0_user_id === userSub,
          );
          if (matchedUser) {
            setDbUserId(matchedUser.id);
          }
        } catch (err) {
          console.error("Failed to find user ID", err);
        }
      }
      fetchMyId();
    } else {
      setDbUserId(null);
    }
  }, [user]);

  // --- UPDATED handleAddToCart ---
  const handleAddToCart = (customizedItem: any) => {
    // We explicitly ensure 'category' is passed so the API route 
    // knows whether to look in the 'food' or 'drinks' table.
    const cartItem: CartItem = {
      instanceId: customizedItem.instanceId || `item-${Date.now()}-${Math.random()}`,
      name: customizedItem.name,
      price: customizedItem.price, // Use the price returned (which includes size surcharges)
      imageUrl: customizedItem.imageUrl,
      category: customizedItem.category || (selectedProduct?.type === "Food" ? "food" : "drink"),
      quantity: customizedItem.quantity,
      customizations: {
        ice: customizedItem.customizations?.ice || "",
        sugar: customizedItem.customizations?.sugar || "",
        notes: customizedItem.customizations?.notes || "",
        toppings: customizedItem.customizations?.toppings || [],
        size: customizedItem.customizations?.size || "Regular", // Sync size
      },
    };
    setCart((prev) => [...prev, cartItem]);
    setSelectedProduct(null);
  };

  useEffect(() => {
    setLoading(true);
    const fetchDrinks = fetch("/api/drinks?allDrinks=true").then((res) => res.json());
    const fetchFoods = fetch("/api/foods?allFoods=true").then((res) => res.json());

    Promise.all([fetchDrinks, fetchFoods])
      .then(([drinksRes, foodsRes]) => {
        if (drinksRes.data) {
          setDrinkItems(
            drinksRes.data.map((item: any, index: number) => ({
              ...item,
              id: item.id || item._id || `drink-${index}`,
              imageUrl: "/menu/" + String(item.name).trim() + ".png",
              category: item.category || "milk tea",
            })),
          );
        }
        if (foodsRes.data) {
          setFoodItems(
            foodsRes.data.map((item: any, index: number) => ({
              ...item,
              id: item.id || item._id || `food-${index}`,
              imageUrl: "/menu/" + String(item.name).trim() + ".png",
              category: "food", // Ensure this matches what your API expects
            })),
          );
        }
      })
      .catch((error) => console.error("Fetch error:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-500 font-bold">
        Loading menu...
      </div>
    );

  const categories = ["most ordered", "milk tea", "fruit tea", "specialty tea", "food"];

  const filteredItems =
    activeTab === "most ordered"
      ? menuItems
      : menuItems.filter((item) => item.category?.includes(activeTab));

  return (
    <main className="p-8 pb-36">
      <nav className="flex justify-center gap-8 mb-12 border-b border-gray-300 overflow-x-auto">
        {categories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-lg whitespace-nowrap transition-all ${
              activeTab === tab
                ? "text-[#00A67E] font-bold border-b-4 border-[#00A67E]"
                : "text-gray-600 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <ProductCard
            key={`${item.type}-${item.id}`}
            {...item}
            onAddToCart={() => setSelectedProduct(item)}
            onCustomize={() => setSelectedProduct(item)}
          />
        ))}
      </div>

      {selectedProduct && (
        <Modal
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={handleAddToCart}
        />
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2">
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-[#00A67E] text-white px-12 py-5 rounded-full shadow-2xl flex items-center gap-4 hover:scale-105 transition-transform text-xl font-bold"
          >
            <div className="bg-white text-[#00A67E] w-9 h-9 rounded-full flex items-center justify-center font-bold text-base">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </div>
            <span>Check Out</span>
          </button>
        </div>
      )}

      {isCartOpen && (
        <CartModal
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          setCart={setCart}
          userId={dbUserId}
        />
      )}
    </main>
  );
}