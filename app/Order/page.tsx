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
}

interface MenuItem {
  id: string | number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  type: 'Food' | 'Drink';
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

  const menuItems = useMemo(() => [
    ...foodItems.map(item => ({ ...item, type: 'Food' as const })),
    ...drinkItems.map(item => ({ ...item, type: 'Drink' as const }))
  ], [foodItems, drinkItems]);

  // Handle finding the numeric ID (Alli Qayyum -> 10)
  // FIX: Using a local variable 'userSub' to satisfy TypeScript and handle guest logic
  useEffect(() => {
    const userSub = user?.sub; 

    if (userSub) {
      async function fetchMyId() {
        try {
          const res = await fetch("/api/users");
          const json = await res.json();
          const allUsers = json.data || [];
          
          // Match Auth0 sub to auth0_user_id in DB using the captured userSub
          const matchedUser = allUsers.find((u: any) => u.auth0_user_id === userSub);
          
          if (matchedUser) {
            setDbUserId(matchedUser.id);
          }
        } catch (err) {
          console.error("Failed to find user ID", err);
        }
      }
      fetchMyId();
    } else {
      // If user logs out or isn't logged in, reset to null for Guest Mode
      setDbUserId(null);
    }
  }, [user]);

  const handleAddToCart = (customizedItem: MenuItem) => {
    const customizations = customizedItem.customizations || { ice: '', sugar: '', toppings: [] };
    const cartItem: CartItem = {
      instanceId: customizedItem.instanceId || `item-${Date.now()}-${Math.random()}`,
      name: customizedItem.name,
      price: customizedItem.price,
      imageUrl: customizedItem.imageUrl,
      customizations: {
        ice: customizations.ice,
        sugar: customizations.sugar,
        toppings: customizations.toppings,
      },
    };
    setCart((prev) => [...prev, cartItem]);
    setSelectedProduct(null); 
  };

  useEffect(() => {
    setLoading(true);
    const fetchDrinks = fetch("/api/drinks?allDrinks=true").then(res => res.json());
    const fetchFoods = fetch("/api/foods?allFoods=true").then(res => res.json());

    Promise.all([fetchDrinks, fetchFoods])
      .then(([drinksRes, foodsRes]) => {
        if (drinksRes.data) {
            setDrinkItems(drinksRes.data.map((item: any, index: number) => ({
           ...item,
            id: item.id || item._id || `drink-${index}`,
            imageUrl: "/Template Image.png",
            category: item.category || "milk tea",
          })));
        }
        if (foodsRes.data) {
          setFoodItems(foodsRes.data.map((item: any, index: number) => ({
            ...item,
            id: item.id || item._id || `food-${index}`,
            imageUrl: "/Template Image.png",
            category: "food",
          })));
        }
      })
      .catch((error) => console.error("Fetch error:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-500 font-bold">Loading menu...</div>;

  const categories = ["most ordered", "milk tea", "fruit tea", "specialty tea", "food"];

  const filteredItems = activeTab === "most ordered"
      ? menuItems
      : menuItems.filter((item) => item.category?.includes(activeTab));

  return (
    <main className="p-8">
      <nav className="flex justify-center gap-8 mb-12 border-b border-gray-300">
        {categories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-lg transition-all ${
              activeTab === tab ? "text-[#00A67E] font-bold border-b-4 border-[#00A67E]" : "text-gray-600 hover:text-black"
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
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 bg-[#00A67E] text-white p-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform z-40"
        >
          <div className="bg-white text-[#00A67E] w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">
            {cart.length}
          </div>
          <span className="font-bold">Check Out</span>
        </button>
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