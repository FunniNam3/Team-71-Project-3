"use client"; // Required for use of state and event handlers

import { useState, useEffect, useMemo } from "react";
import ProductCard from "@components/ProductCard";

export default function OrderPage() {
  // 1. Create the state (default to 'Most Ordered' or 'All')
  /* 
    TODO CHANGE THIS FROM ANY TO AN ACTUAL STRUCT
    Figure out what it is returning 
  */
  const [foodItems, setFoodItems] = useState<any[]>([]); // This will hold all menu items
   const [drinkItems, setDrinkItems] = useState<any[]>([]);
   const menuItems = useMemo(() => [
    ...foodItems.map(item => ({ ...item, type: 'Food' })),
    ...drinkItems.map(item => ({ ...item, type: 'Drink' }))
  ], [foodItems, drinkItems])
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("most ordered");
  /* 
    TODO CHANGE THIS FROM ANY TO AN ACTUAL STRUCT
    Figure out what it is returning 
  */
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

 useEffect(() => {
    setLoading(true);

    // Define both fetch operations
    const fetchDrinks = fetch("/api/drinks?allDrinks=true").then(res => res.json());
    const fetchFoods = fetch("/api/drinks?allFoods=true").then(res => res.json());

    // Execute both and wait for completion
    Promise.all([fetchDrinks, fetchFoods])
      .then(([drinksRes, foodsRes]) => {
        // Handle Drinks
        if (drinksRes.data && Array.isArray(drinksRes.data)) {
          setDrinkItems(drinksRes.data.map((item: any) => ({
            ...item,
            imageUrl: "/Template Image.png",
            category: item.category || "milk tea", // Default for drinks
          })));
        }

        // Handle Foods (The table without categories)
        if (foodsRes.data && Array.isArray(foodsRes.data)) {
          setFoodItems(foodsRes.data.map((item: any) => ({
            ...item,
            imageUrl: "/Template Image.png",
            category: "food", // Force 'food' since it's missing in DB
          })));
        }
      })
      .catch((error) => console.error("Fetch error:", error))
      .finally(() => setLoading(false)); // Guaranteed to run last
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-500">Loading menu...</div>
    );
  }

  // 2. Define your categories exactly as they appear in your data
  const categories = [
    "most ordered",
    "milk tea",
    "fruit tea",
    "specialty tea",
    "food",
  ];

  // 3. Filter the items based on the activeTab
  const filteredItems =
    activeTab === "most ordered"
      ? menuItems
      : menuItems.filter((item) => item.category?.includes(activeTab));

  return (
    <main className="p-8 ]">
      {/* Navigation Tabs */}
      <nav className="flex justify-center gap-8 mb-12 border-b border-gray-300">
        {categories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)} // Change the category on click
            className={`pb-2 text-lg transition-all ${
              activeTab === tab
                ? "text-[#00A67E] font-bold border-b-4 border-[#00A67E]"
                : "text-gray-600 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Re-arranged Grid */}
      <div className="grid grid-cols-4 gap-2">
        {filteredItems.map((item) => (
          /* Your Product Card Content */
          // TODO Make all of the product cards the same size
          <ProductCard
            key={item.id}
            {...item}
            onCustomize={() => setSelectedProduct(item)} // This opens the modal
          />
        ))}
      </div>
    </main>
  );
}
