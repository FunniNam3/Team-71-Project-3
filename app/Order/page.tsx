"use client";

import { useState, useEffect, useMemo } from "react";
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
  // These are added only when the item is in the cart
  customizations?: Customizations;
  instanceId?: string; 
}

export default function OrderPage() {
  const [foodItems, setFoodItems] = useState<MenuItem[]>([]);
  const [drinkItems, setDrinkItems] = useState<MenuItem[]>([]);
  
  // 2. THE CART STATE (The "Memory" for your checkout)
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("most ordered");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  const menuItems = useMemo(() => [
    ...foodItems.map(item => ({ ...item, type: 'Food' as const })),
    ...drinkItems.map(item => ({ ...item, type: 'Drink' as const }))
  ], [foodItems, drinkItems]);

  // 3. THE HANDLER (Saves the customized drink to the cart)
  // ...existing code...

// 3. THE HANDLER (Saves the customized drink to the cart)
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
  setSelectedProduct(null); // Close the customization modal
};

// ...existing code...
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
            id: item.id || item._id || `food-${index}`, // Ensure there's a unique ID
            imageUrl: "/Template Image.png",
            category: "food",
          })));
        }
      })
      .catch((error) => console.error("Fetch error:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading menu...</div>;

  const categories = ["most ordered", "milk tea", "fruit tea", "specialty tea", "food"];

  const filteredItems = activeTab === "most ordered"
      ? menuItems
      : menuItems.filter((item) => item.category?.includes(activeTab));
    console.log("Current Tab:", activeTab);
    console.log("All Items:", menuItems);
    console.log("Filtered Results:", filteredItems);

  return (
    <main className="p-8">
      {/* Navigation Tabs */}
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

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <ProductCard
            key={item.id}
            {...item}
            // Only open the modal. Do NOT call setCart here.
            onAddToCart={() => setSelectedProduct(item)} 
            onCustomize={() => setSelectedProduct(item)}
            />
        ))}
      </div>

      {/* ITEM CUSTOMIZATION MODAL */}
      {selectedProduct && (
        <Modal
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={handleAddToCart} // This is the connection!
        />
      )}

      {/* FLOATING CHECKOUT BUTTON */}
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

      {/* CHECKOUT LIST MODAL */}
      {isCartOpen && (
        <CartModal 
          cart={cart} 
          onClose={() => setIsCartOpen(false)} 
          setCart={setCart} 
        />
      )}
    </main>
  );
}