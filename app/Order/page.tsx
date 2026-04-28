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
  customizations?: any;
  instanceId?: string;
}

export default function OrderPage() {
  const { user } = useUser();
  const [dbUserId, setDbUserId] = useState<number | null>(null);
  const [foodItems, setFoodItems] = useState<MenuItem[]>([]);
  const [drinkItems, setDrinkItems] = useState<MenuItem[]>([]);
  
  // Weather states
  const [tempF, setTempF] = useState<number | null>(null);
  const [isDay, setIsDay] = useState<boolean>(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recommended");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  const menuItems = useMemo(
    () => [
      ...foodItems.map((item) => ({ ...item, type: "Food" as const })),
      ...drinkItems.map((item) => ({ ...item, type: "Drink" as const })),
    ],
    [foodItems, drinkItems],
  );

  // 1. USE YOUR WEATHER ROUTE
  useEffect(() => {
    async function fetchWeather() {
      try {
        // Using College Station coordinates as default (matching your route's intent)
        const lat = "30.62";
        const long = "-96.33";
        const res = await fetch(`/api/weather?latitude=${lat}&longitude=${long}`);
        const json = await res.json();
        
        if (json.data) {
          setTempF(json.data.current.temperature_2m);
          setIsDay(json.data.current.is_day === 1);
          }
    fetchWeather();
  }, []);

  // Auth0 User Mapping
  useEffect(() => {
    const userSub = user?.sub;
    if (userSub) {
      fetch("/api/users")
        .then(res => res.json())
        .then(json => {
          const matched = (json.data || []).find((u: any) => u.auth0_user_id === userSub);
          if (matched) setDbUserId(matched.id);
        });
    }
  }, [user]);

  // --- Cart Management ---
  const handleAddToCart = (customizedItem: any) => {
    const cartItem: CartItem = {
      instanceId: customizedItem.instanceId || `item-${Date.now()}`,
          
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
      } catch (err) {
        console.error("Internal Weather Route failed", err);
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
      quantity: customizedItem.quantity || 1,
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

  // --- Initial Menu Load ---
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
      .finally(() => setLoading(false));
  }, []);

  // 2. RECOMMENDATION LOGIC (Fahrenheit Based)
  const recommendedItems = useMemo(() => {
    if (tempF === null) return menuItems.slice(0, 4);

    // If it's hot (> 80°F) or Sunny
    if (tempF > 80) {
      return menuItems.filter(item => 
        item.category.includes("fruit") || item.category.includes("specialty")
      );
    } 
    // If it's nighttime or cool (< 65°F)
    else if (tempF < 65 || !isDay) {
      return menuItems.filter(item => 
        item.type === "Food" || item.category.includes("milk tea")
      );
    }
    return menuItems.slice(0, 4);
  }, [menuItems, tempF, isDay]);

  const categories = ["recommended", "most ordered", "milk tea", "fruit tea", "specialty tea", "food"];

  const filteredItems = useMemo(() => {
    if (activeTab === "recommended") return recommendedItems;
    if (activeTab === "most ordered") return menuItems;
    return menuItems.filter((item) => item.category?.includes(activeTab));
  }, [activeTab, menuItems, recommendedItems]);

  if (loading) return <div className="text-center mt-20 text-gray-500 font-bold">Loading menu...</div>;

  return (
    <main className="p-8 pb-36">
      <div className="text-center mb-6">
        {tempF !== null && (
          <div className="inline-block bg-gray-100 px-4 py-2 rounded-2xl border border-gray-200">
            <p className="text-sm font-bold text-gray-700">
              {isDay ? "☀️" : "🌙"} {Math.round(tempF)}°F in College Station
            </p>
            <p className="text-xs text-[#00A67E] font-medium">Chef's Picks for this weather</p>
          </div>
        )}
      </div>

      <nav className="flex justify-center gap-8 mb-12 border-b border-gray-300 overflow-x-auto">
        {categories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-lg whitespace-nowrap transition-all capitalize ${
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
        <Modal item={selectedProduct} onClose={() => setSelectedProduct(null)} onConfirm={handleAddToCart} />
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

      {isCartOpen && <CartModal cart={cart} onClose={() => setIsCartOpen(false)} setCart={setCart} userId={dbUserId} />}
    </main>
  );
}