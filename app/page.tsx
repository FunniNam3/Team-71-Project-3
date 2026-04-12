"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import MenuCard from "@components/menucard";

export default function Home() {
   const [foodItems, setFoodItems] = useState<any[]>([]); // This will hold all menu items
   const [drinkItems, setDrinkItems] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedProduct, setSelectedProduct] = useState<any>(null);


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
    <main className="min-h-screen text-black">
      {/* 2. Hero Title */}
      <header className="pt-32 pb-10 text-center">
        <h1 className="text-6xl font-serif">Boba shop</h1>
      </header>

      {/* 3. Content Sections */}
      <div className="max-w-5xl mx-auto px-8 space-y-24 pb-20">
        {/* Section: Who are we */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-4xl font-semibold mb-4">Who are we</h2>
            <p className="text-lg leading-relaxed text-gray-800">
              Lorem ipsum dolor sit amet consectetur. Hendrerit habitasse enim a
              condimentum malesuada nunc donec commodo felis. Scelerisque felis
              fringilla potenti tristique tellus at eu elementum ultricies.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/Template Image.png"
              alt="Boba tea"
              width={205}
              height={200}
              className="object-contain"
            />
          </div>
        </div>

        {/* Section: Location & Hours (Reversed) */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1">
            <h2 className="text-4xl font-semibold mb-4">Location & Hours</h2>
            <p className="text-lg leading-relaxed text-gray-800">
              Lorem ipsum dolor sit amet consectetur. Hendrerit habitasse enim a
              condimentum malesuada nunc donec commodo felis. Scelerisque felis
              fringilla potenti tristique tellus at eu elementum ultricies.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/Template Image.png"
              alt="Boba tea"
              width={205}
              height={200}
              className="object-contain"
            />
          </div>
        </div>

        {/* Section: Types of Products */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-4xl font-semibold mb-4">Types of Products</h2>
            <p className="text-lg leading-relaxed text-gray-800">
              Lorem ipsum dolor sit amet consectetur. Hendrerit habitasse enim a
              condimentum malesuada nunc donec commodo felis. Scelerisque felis
              fringilla potenti tristique tellus at eu elementum ultricies.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/Template Image.png"
              alt="Boba tea"
              width={205}
              height={200}
              className="object-contain"
            />
          </div>
        </div>
      </div>
      {/* menu table with 4 items per row*/}
      <div className="max-w-5xl mx-auto px-8 py-12 border-2 bg-white rounded-2xl">
        <h2 className="text-5xl font-semibold mb-8 text-center font-serif">
          Our Menu
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 border-2 rounded-2xl p-8">
          {foodItems.map((item) => (
                    /* Your Product Card Content */
                    // TODO Make all of the product cards the same size
                    <MenuCard
                      key={item.id}
                      {...item}
                      onCustomize={() => setSelectedProduct(item)}
                    /> 

                  ))}
          {drinkItems.map((item) => (
                    /* Your Product Card Content */
                    // TODO Make all of the product cards the same size
                    <MenuCard
                      key={item.id}
                      {...item}
                      onCustomize={() => setSelectedProduct(item)}
                    /> 

                  ))}
          </div>

      </div>
    </main>
  );
}
