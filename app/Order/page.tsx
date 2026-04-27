"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@auth0/nextjs-auth0/client"; 
import ProductCard from "@components/ProductCard";
import Modal from "@components/Modal";
import CartModal from "@components/CartModal";
import { CartItem } from "@components/CartModal";

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

  // --- NEW WEATHER STATE ---
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);

  const menuItems = useMemo(() => [
    ...foodItems.map(item => ({ ...item, type: 'Food' as const })),
    ...drinkItems.map(item => ({ ...item, type: 'Drink' as const }))
  ], [foodItems, drinkItems]);

  // Handle Auth0 User Mapping
  useEffect(() => {
    const userSub = user?.sub; 
    if (userSub) {
      async function fetchMyId() {
        try {
          const res = await fetch("/api/users");
          const json = await res.json();
          const allUsers = json.data || [];
          const matchedUser = allUsers.find((u: any) => u.auth0_user_id === userSub);
          if (matchedUser) setDbUserId(matchedUser.id);
        } catch (err) {
          console.error("Failed to find user ID", err);
        }
      }
      fetchMyId();
    } else {
      setDbUserId(null);
    }
  }, [user]);

  // --- FETCH WEATHER DATA ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`/api/weather?latitude=${latitude}&longitude=${longitude}`);
          const json = await res.json();
          if (json.data) {
            setCurrentTemp(json.data.current.temperature_2m);
            // Optional: Automatically switch to recommended tab if weather is found
            setActiveTab("recommended");
          }
        } catch (err) {
          console.error("Weather fetch failed", err);
        }
      });
    }
  }, []);

  // --- RECOMMENDATION LOGIC ---
  const recommendedItems = useMemo(() => {
    if (currentTemp === null) return [];

    // Inside OrderPage.tsx -> recommendedItems useMemo
// Inside OrderPage.tsx -> recommendedItems useMemo
return menuItems.filter(item => {
  const name = item.name?.toLowerCase() || "";
  const desc = item.description?.toLowerCase() || "";
  
  // FIX: Convert the category to a searchable string regardless of if it is an Array or String
  const categorySearch = Array.isArray(item.category) 
    ? item.category.join(" ").toLowerCase() 
    : (item.category?.toLowerCase() || "");

  if (currentTemp < 65) {
    return (
      item.type === 'Food' || 
      name.includes("hot") || 
      name.includes("warm") || 
      desc.includes("hot")
    );
  } 
  else if (currentTemp > 80) {
    return (
      categorySearch.includes("fruit tea") || 
      categorySearch.includes("brewed tea") ||
      name.includes("iced") || 
      name.includes("cold") ||
      desc.includes("refreshing")
    );
  }
  return desc.includes("signature") || name.includes("special") || categorySearch.includes("most ordered");
});
  }, [menuItems, currentTemp]);

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
      .finally(() => setLoading(false));
  }, []);

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

  // Add "recommended" to the start of categories if weather is available
  const categories = [
    ...(currentTemp !== null ? ["recommended"] : []),
    "most ordered", 
    "milk tea", 
    "fruit tea", 
    "specialty tea", 
    "food"
  ];

  const filteredItems = activeTab === "recommended"
      ? recommendedItems
      : activeTab === "most ordered"
        ? menuItems
        : menuItems.filter((item) => item.category?.includes(activeTab));

  if (loading) return <div className="text-center mt-20 text-gray-500 font-bold">Loading menu...</div>;

  return (
    <main className="p-8">
      {/* Navigation Tabs */}
      <nav className="flex justify-center gap-8 mb-8 border-b border-gray-300">
        {categories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-lg transition-all capitalize ${
              activeTab === tab ? "text-[#00A67E] font-bold border-b-4 border-[#00A67E]" : "text-gray-600 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* --- WEATHER BANNER --- */}
      {activeTab === "recommended" && currentTemp !== null && (
        <div className="max-w-4xl mx-auto mb-10 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="text-3xl">
            {currentTemp > 80 ? "☀️" : currentTemp < 65 ? "❄️" : "🍃"}
          </div>
          <div>
            <h3 className="text-emerald-900 font-bold">Perfect for this weather!</h3>
            <p className="text-emerald-700 text-sm">
              It's {Math.round(currentTemp)}°F outside. We've curated these recommendations just for you.
            </p>
          </div>
        </div>
      )}

      {/* Product Grid */}
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

      {/* Empty State for Recommendations */}
      {activeTab === "recommended" && filteredItems.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No specific recommendations for right now. Try our most ordered!
        </div>
      )}

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