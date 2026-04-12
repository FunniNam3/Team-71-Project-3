"use client";
import Image from "next/image";
import { useState, useEffect } from 'react';
import MenuCard from '@components/menucard';

const ITEMS_PER_PAGE = 6; // How many items fit on one screen

export default function DigitalMenuBoard() {
  const [currentPage, setCurrentPage] = useState(0);
     const [foodItems, setFoodItems] = useState<any[]>([]); // This will hold all menu items
   const [drinkItems, setDrinkItems] = useState<any[]>([]);
   const menuItems = [
  ...foodItems.map(item => ({ ...item, type: 'Food' })),
  ...drinkItems.map(item => ({ ...item, type: 'Drink' }))
];
   const [loading, setLoading] = useState(true);
   const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // 1. Calculate how many pages you have total
  const totalPages = Math.ceil(menuItems.length / ITEMS_PER_PAGE);

  // 2. The "Auto-Shift" Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 8000); // 8000ms = Shifts every 8 seconds

    return () => clearInterval(timer); // Clean up on unmount
  }, [totalPages]);

  // 3. Slice the data to show only the current "bulk"
  const displayItems = menuItems.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );
  useEffect(() => {
    setLoading(true);

    // 1. Fetch from your team's endpoint
    fetch("/api/drinks?allDrinks=true")
      .then((response) => response.json())
      .then((res) => {
        // 2. Check if the data exists and is an array
        if (res.data && Array.isArray(res.data)) {
          // 3. ADD THE IMAGE HERE:
          // We transform the data to include your placeholder image path
          const itemsWithPlaceholder = res.data.map((item: any) => ({
            ...item,
            imageUrl: "/Template Image.png", // This must match your public folder filename exactly
          }));

          setDrinkItems(itemsWithPlaceholder);
        } else {
          console.error("Received something that isn't an array:", res);
          setDrinkItems([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setLoading(false);
      });
    fetch("/api/foods?allFoods=true")
      .then((response) => response.json())
      .then((res) => {
        // 2. Check if the data exists and is an array
        if (res.data && Array.isArray(res.data)) {
          // 3. ADD THE IMAGE HERE:
          // We transform the data to include your placeholder image path
          const itemsWithPlaceholder = res.data.map((item: any) => ({
            ...item,
            imageUrl: "/Template Image.png", // This must match your public folder filename exactly
          }));

          setFoodItems(itemsWithPlaceholder);
        } else {
          console.error("Received something that isn't an array:", res);
          setFoodItems([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setLoading(false);
      });  
  }, []);
  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-500">Loading menu...</div>
    );
  }

  return (
    <div className="h-screen w-full bg-black text-white p-10 overflow-hidden">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-5xl font-bold uppercase tracking-widest">Current Specials</h1>
        <div className="text-xl text-gray-400">
          Page {currentPage + 1} of {totalPages}
        </div>
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-3 gap-10">
        {displayItems.map((item) => (
          <MenuCard key={item.id} 
          { ...item}
          onCustomize={() => selectedProduct(item)} />
        ))}
      </div>

      {/* Progress Bar (Visual flair) */}
      <div className="absolute bottom-0 left-0 h-2 bg-orange-500 transition-all duration-[8000ms] ease-linear"
           style={{ width: '100%' }}
           key={currentPage} />
    </div>
  );
}