// TODO Make this drink selection// src/app/POS/Order/page.tsx
'use client'; // Required for use of state and event handlers

import { useState, useEffect } from 'react';
import ProductCard from '../../components/DrinkCard';
// You would also need a CustomizationModal component (not built here)

/*const menuItems = [
  { id: 1, name: 'Brown Sugar Milk Tea', description: 'Our signature boba with...', price: 5.50, imageUrl: '/Template image.svg', category: 'Milk Tea' },
  { id: 2, name: 'Chicken Wings', description: 'Crispy fried wings...', price: 8.99, imageUrl: '/Template image.svg', category: 'Food' },
  // ... add more mock items to fill the 3x3 grid from image_1.png
];*/

// For demonstration, let's create some mock data



export default function OrderPage() {
  // 1. Create the state (default to 'Most Ordered' or 'All')
  const [menuItems, setMenuItems] = useState<any[]>([]); // This will hold all menu items
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    // Simulate fetching data from an API
    fetch('/api/menu') // You would replace this with your actual API endpoint
      .then(response => response.json())
      .then(data => {
        setMenuItems(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching menu items:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center mt-20 text-gray-500">Loading menu...</div>;
  }
  
  const [activeTab, setActiveTab] = useState('Most Ordered');

  // 2. Define your categories exactly as they appear in your data
  const categories = ['Most Ordered', 'Milk Tea', 'Fruit Tea', 'Specialty Tea', 'Food'];

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // 3. Filter the items based on the activeTab
  const filteredItems = activeTab === 'Most Ordered' 
    ? menuItems // Show everything (or a specific "featured" list)
    : menuItems.filter(item => item.category === activeTab);

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
          <div key={item.id} className="bg-white p-4 rounded-2xl border-2 border-[#00A67E]">
            {/* Your Product Card Content */
            <ProductCard
            key={item.id}
            {...item}
            onCustomize={() => setSelectedProduct(item)} // This opens the modal
          />}
          </div>
        ))}
      </div>
    </main>
  );
}
