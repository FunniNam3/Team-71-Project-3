"use client";

import { useEffect, useState } from "react";
import EditDrinkPopUp from "@components/EditDrinkPopUp";
import EditFoodPopUp from "@components/EditFoodPopUp";
import AddDrinkPopUp from "@components/AddDrinkPopUp";
import AddFoodPopUp from "@components/AddFoodPopUp";
import RemoveItemPopUp from "@components/RemoveItemPopUp";
import { useRouter } from "next/navigation";

type DrinkItem = {
  id: number;
  name: string;
  price: number;
  category: string[] | null;
};

type FoodItem = {
  id: number;
  name: string;
  price: number;
};

type NewDrinkItem = {
  name: string;
  price: number;
  category: string[];
};

type NewFoodItem = {
  name: string;
  price: number;
};

export default function MenuEditPage() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/login")
      .then((result) => result.json())
      .then((res) => {
        if (res.role !== "manager" && res.role !== "rev") {
          router.push("/Portal");
        }
      });
  }, []);
  const [activeTab, setActiveTab] = useState<"drink" | "food">("drink");

  const [drinks, setDrinks] = useState<DrinkItem[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDrink, setSelectedDrink] = useState<DrinkItem | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const [showEditDrink, setShowEditDrink] = useState(false);
  const [showEditFood, setShowEditFood] = useState(false);
  const [showAddDrink, setShowAddDrink] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);

  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [removeItemType, setRemoveItemType] = useState<"drink" | "food" | "">(
    "",
  );

  useEffect(() => {
    loadMenuItems();
  }, []);

  async function loadMenuItems() {
    try {
      setLoading(true);

      const [drinksRes, foodsRes] = await Promise.all([
        fetch("/api/drinks?allDrinks=true"),
        fetch("/api/foods?allFoods=true"),
      ]);

      const drinksJson = await drinksRes.json();
      const foodsJson = await foodsRes.json();

      setDrinks(Array.isArray(drinksJson.data) ? drinksJson.data : []);
      setFoods(Array.isArray(foodsJson.data) ? foodsJson.data : []);
    } catch (error) {
      console.error("Failed to load menu items:", error);
      setDrinks([]);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }

  function openEditDrink(drink: DrinkItem) {
    setSelectedDrink(drink);
    setShowEditDrink(true);
  }

  function openEditFood(food: FoodItem) {
    setSelectedFood(food);
    setShowEditFood(true);
  }

  function openRemoveDrink(drink: DrinkItem) {
    setSelectedDrink(drink);
    setSelectedFood(null);
    setRemoveItemType("drink");
    setShowRemovePopup(true);
  }

  function openRemoveFood(food: FoodItem) {
    setSelectedFood(food);
    setSelectedDrink(null);
    setRemoveItemType("food");
    setShowRemovePopup(true);
  }

  async function handleSaveDrink(updatedDrink: DrinkItem) {
    const res = await fetch("/api/drinks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDrink),
    });

    if (!res.ok) {
      alert("Failed to update drink.");
      return;
    }

    setShowEditDrink(false);
    setSelectedDrink(null);
    await loadMenuItems();
  }

  async function handleSaveFood(updatedFood: FoodItem) {
    const res = await fetch("/api/foods", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFood),
    });

    if (!res.ok) {
      alert("Failed to update food.");
      return;
    }

    setShowEditFood(false);
    setSelectedFood(null);
    await loadMenuItems();
  }

  async function handleAddDrink(newDrink: NewDrinkItem) {
    const res = await fetch("/api/drinks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDrink),
    });

    if (!res.ok) {
      alert("Failed to add drink.");
      return;
    }

    setShowAddDrink(false);
    await loadMenuItems();
  }

  async function handleAddFood(newFood: NewFoodItem) {
    const res = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFood),
    });

    if (!res.ok) {
      alert("Failed to add food.");
      return;
    }

    setShowAddFood(false);
    await loadMenuItems();
  }

  async function handleRemoveItem() {
    if (removeItemType === "drink" && selectedDrink) {
      const res = await fetch(`/api/drinks?id=${selectedDrink.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to remove drink.");
        return;
      }
    }

    if (removeItemType === "food" && selectedFood) {
      const res = await fetch(`/api/foods?id=${selectedFood.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to remove food.");
        return;
      }
    }

    setShowRemovePopup(false);
    setSelectedDrink(null);
    setSelectedFood(null);
    setRemoveItemType("");
    await loadMenuItems();
  }

  if (loading) {
    return (
      <div className="mt-20 text-center text-gray-500">Loading menu...</div>
    );
  }

  return (
    <main className="min-h-screen bg-[--secondary] p-8">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-700">Menu Editing</h1>

        <div className="mb-6 flex border-b">
          <button
            onClick={() => setActiveTab("drink")}
            className={`px-6 py-3 font-semibold ${
              activeTab === "drink"
                ? "border-b-4 border-[#21A179] text-[#21A179]"
                : "text-gray-500"
            }`}
          >
            Drinks
          </button>

          <button
            onClick={() => setActiveTab("food")}
            className={`px-6 py-3 font-semibold ${
              activeTab === "food"
                ? "border-b-4 border-[#21A179] text-[#21A179]"
                : "text-gray-500"
            }`}
          >
            Food
          </button>
        </div>

        {activeTab === "drink" ? (
          <>
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-100 text-gray-700">
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {drinks.map((drink) => (
                  <tr key={drink.id} className="border-b text-gray-600">
                    <td className="p-3">{drink.id}</td>
                    <td className="p-3">{drink.name}</td>
                    <td className="p-3">${Number(drink.price).toFixed(2)}</td>
                    <td className="p-3">
                      {drink.category?.join(", ") || "None"}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditDrink(drink)}
                          className="rounded border px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openRemoveDrink(drink)}
                          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAddDrink(true)}
                className="rounded bg-(--primary) px-5 py-2 font-semibold text-white hover:bg-[#1b8a66]"
              >
                Add Drink
              </button>
            </div>
          </>
        ) : (
          <>
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-100 text-gray-700">
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {foods.map((food) => (
                  <tr key={food.id} className="border-b text-gray-600">
                    <td className="p-3">{food.id}</td>
                    <td className="p-3">{food.name}</td>
                    <td className="p-3">${Number(food.price).toFixed(2)}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditFood(food)}
                          className="rounded border px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openRemoveFood(food)}
                          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAddFood(true)}
                className="rounded bg-(--primary) px-5 py-2 font-semibold text-white hover:bg-[#1b8a66]"
              >
                Add Food
              </button>
            </div>
          </>
        )}
      </div>

      <EditDrinkPopUp
        isOpen={showEditDrink}
        drink={selectedDrink}
        onClose={() => {
          setShowEditDrink(false);
          setSelectedDrink(null);
        }}
        onSave={handleSaveDrink}
      />

      <EditFoodPopUp
        isOpen={showEditFood}
        food={selectedFood}
        onClose={() => {
          setShowEditFood(false);
          setSelectedFood(null);
        }}
        onSave={handleSaveFood}
      />

      <AddDrinkPopUp
        isOpen={showAddDrink}
        onClose={() => setShowAddDrink(false)}
        onAdd={handleAddDrink}
      />

      <AddFoodPopUp
        isOpen={showAddFood}
        onClose={() => setShowAddFood(false)}
        onAdd={handleAddFood}
      />

      <RemoveItemPopUp
        isOpen={showRemovePopup}
        itemName={
          removeItemType === "drink"
            ? (selectedDrink?.name ?? "")
            : (selectedFood?.name ?? "")
        }
        itemType={removeItemType}
        onClose={() => {
          setShowRemovePopup(false);
          setSelectedDrink(null);
          setSelectedFood(null);
          setRemoveItemType("");
        }}
        onRemove={handleRemoveItem}
      />
    </main>
  );
}
