"use client";

import { useEffect, useMemo, useState } from "react";
import CashierItemCard from "@components/CashierItemCard";
import CashierCustomization from "@components/CashierCustomization";
import DiscountPopUp from "@components/DiscountPopUp";
import PaymentMethodPopUp from "@components/PaymentMethodPopUp";
import { useRouter } from "next/navigation";

type DrinkItem = {
  id: number;
  name: string;
  ice: string | null;
  sweetness: number | null;
  milk: string | null;
  boba: string | null;
  popping_boba: string | null;
  price: number;
  category: string[] | null;
};

type FoodItem = {
  id: number;
  name: string;
  price: number;
};

type Customer = {
  id: number;
  auth0_user_id: string;
  name: string;
  role: string;
  points: number;
  cart: string | null;
};

type Discount = {
  id: number;
  type: string;
  amount: number;
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  itemType: "drink" | "food";
  selectedIce?: string;
  selectedSweetness?: string;
  selectedMilk?: string;
  selectedBoba?: string;
  selectedPoppingBoba?: string;
};

export default function CashierPOSPage() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/login")
      .then((result) => result.json())
      .then((res) => {
        if (res.role !== "cashier") {
          router.push("/Portal");
        }
      });
  }, []);

  const [drinks, setDrinks] = useState<DrinkItem[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  const [customerSearch, setCustomerSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedDrink, setSelectedDrink] = useState<DrinkItem | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null,
  );

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [showCustomization, setShowCustomization] = useState(false);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");

  const [cashierId, setCashierId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPageData() {
      try {
        setLoading(true);

        const [drinksRes, foodsRes, customersRes, discountsRes] =
          await Promise.all([
            fetch("/api/drinks?allDrinks=true"),
            fetch("/api/foods?allFoods=true"),
            fetch("/api/users"),
            fetch("/api/discounts"),
          ]);

        const drinksJson = await drinksRes.json();
        const foodsJson = await foodsRes.json();
        const customersJson = await customersRes.json();
        const discountsJson = await discountsRes.json();

        if (drinksJson.data && Array.isArray(drinksJson.data)) {
          setDrinks(drinksJson.data);
        } else {
          setDrinks([]);
        }

        if (foodsJson.data && Array.isArray(foodsJson.data)) {
          setFoods(foodsJson.data);
        } else {
          setFoods([]);
        }

        if (customersJson.data && Array.isArray(customersJson.data)) {
          setCustomers(customersJson.data);
        } else {
          setCustomers([]);
        }

        if (discountsJson.data && Array.isArray(discountsJson.data)) {
          setDiscounts(discountsJson.data);
        } else {
          setDiscounts([]);
        }

        // add logged in cashier ot receipt data
        const loginRes = await fetch("/api/login");
        const loginJson = await loginRes.json();
        setCashierId(loginJson.id);
      } catch (error) {
        console.error("Failed to load cashier POS data:", error);
        setDrinks([]);
        setFoods([]);
        setCustomers([]);
        setDiscounts([]);
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, []);

  const mostOrderedDrinks = useMemo(() => {
    return drinks.filter((drink) => drink.category?.includes("most ordered"));
  }, [drinks]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return [];
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()),
    );
  }, [customers, customerSearch]);

  const filteredDrinks = useMemo(() => {
    if (!itemSearch.trim()) return [];
    return drinks.filter((drink) =>
      drink.name.toLowerCase().includes(itemSearch.toLowerCase()),
    );
  }, [drinks, itemSearch]);

  const filteredFoods = useMemo(() => {
    if (!itemSearch.trim()) return [];
    return foods.filter((food) =>
      food.name.toLowerCase().includes(itemSearch.toLowerCase()),
    );
  }, [foods, itemSearch]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const discountAmount = selectedDiscount ? selectedDiscount.amount : 0;
  const taxRate = 0.0825;
  const tax = subtotal * taxRate;
  const total = Math.max(0, subtotal + tax - discountAmount);

  function handleSelectCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  }

  function handleSelectDrink(drink: DrinkItem) {
    setSelectedDrink(drink);
    setShowCustomization(true);
  }

  function handleAddFood(food: FoodItem) {
    const newFood: CartItem = {
      id: food.id,
      name: food.name,
      price: Number(food.price),
      quantity: 1,
      itemType: "food",
    };

    setCartItems((prev) => [...prev, newFood]);
    setItemSearch("");
  }

  function handleAddCustomizedDrink(customizedDrink: CartItem) {
    setCartItems((prev) => [...prev, customizedDrink]);
    setSelectedDrink(null);
    setShowCustomization(false);
    setItemSearch("");
  }

  function handleRemoveCartItem(indexToRemove: number) {
    setCartItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  function handleApplyDiscount(discount: Discount) {
    setSelectedDiscount(discount);
    setShowDiscountPopup(false);
  }

  async function handleCheckout(selectedMethod: string) {
    setPaymentMethod(selectedMethod);
    setShowPaymentPopup(false);

    if (!selectedCustomer) {
      alert("Please select a customer before checkout.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Please add at least one item before checkout.");
      return;
    }

    if (cashierId === null) {
      alert("Cashier ID is not loaded yet.");
      return;
    }

    const receiptPayload = {
      customer_id: selectedCustomer.id,
      cashier_id: cashierId,
      purchase_date: new Date().toISOString(),
      tax,
      discount: discountAmount,
      payment_method: selectedMethod,
      z_closed: false,
      total,
      items: cartItems,
      discount_id: selectedDiscount?.id ?? null,
    };

    const res = await fetch("/api/receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(receiptPayload),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error(json);
      alert("Checkout failed.");
      return;
    }

    alert(`${selectedMethod} transaction completed.`);

    setCartItems([]);
    setSelectedDiscount(null);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setItemSearch("");
    setPaymentMethod("");
  }

  if (loading) {
    return (
      <div className="mt-20 text-center text-gray-500">
        Loading cashier POS...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen bg-gray-50">
      <section className="w-[32%] min-w-85 border-r bg-white p-5">
        <h1 className="mb-6 text-2xl font-bold text-gray-500">Checkout</h1>

        <div className="mb-5 rounded-lg border p-4">
          <p className="text-sm font-semibold text-gray-500">Customer</p>
          <p className="mt-1 text-lg text-gray-500">
            {selectedCustomer ? selectedCustomer.name : "No customer selected"}
          </p>
          {selectedCustomer && (
            <p className="text-sm text-gray-500">
              Customer ID: {selectedCustomer.id}
            </p>
          )}
        </div>

        <div className="mb-5 rounded-lg border p-4">
          <p className="mb-3 text-sm font-semibold text-gray-500">
            Current Items
          </p>

          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-500">No items added yet.</p>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.itemType}-${item.id}-${index}`}
                  className="rounded border p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-500">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} x {item.quantity} = $
                        {(item.price * item.quantity).toFixed(2)}
                      </p>

                      {item.itemType === "drink" && (
                        <div className="mt-2 text-xs text-gray-500">
                          <p>Ice: {item.selectedIce}</p>
                          <p>Sweetness: {item.selectedSweetness}</p>
                          <p>Milk: {item.selectedMilk}</p>
                          <p>Boba: {item.selectedBoba}</p>
                          <p>Popping Boba: {item.selectedPoppingBoba}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemoveCartItem(index)}
                      className="rounded border px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-5 rounded-lg border p-4">
          <div className="mb-2 flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="mb-2 flex justify-between text-gray-500">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="mb-2 flex justify-between text-gray-500">
            <span>Discount</span>
            <span>- ${discountAmount.toFixed(2)}</span>
          </div>

          {selectedDiscount && (
            <div className="mb-3 text-sm text-gray-500">
              Applied: {selectedDiscount.type}
            </div>
          )}

          <div className="mt-4 flex justify-between border-t pt-3 text-lg font-bold text-gray-500">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowDiscountPopup(true)}
            className="w-full rounded-lg border px-4 py-3 font-semibold text-gray-500 hover:bg-gray-100"
          >
            Discount
          </button>

          <button
            onClick={() => setShowPaymentPopup(true)}
            className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
          >
            Checkout
          </button>
        </div>
      </section>

      <section className="flex-1 p-6">
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-gray-500">
            Customer Search
          </h2>
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="Search customer name..."
            className="w-full rounded-lg border border-gray-500 p-3 text-gray-800 placeholder-gray-400"
          />

          {customerSearch.trim() && (
            <div className="mt-3 max-h-52 overflow-y-auto rounded-lg border">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="block w-full border-b px-4 py-3 text-left hover:bg-gray-100 last:border-b-0"
                  >
                    <p className="font-medium text-gray-500">{customer.name}</p>
                    <p className="text-sm text-gray-500">ID: {customer.id}</p>
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-gray-500">
                  No customers found.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-gray-500">
            Product Search
          </h2>
          <input
            type="text"
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
            placeholder="Search drinks or foods..."
            className="w-full rounded-lg border border-gray-500 p-3 text-gray-800 placeholder-gray-400"
          />

          {itemSearch.trim() && (
            <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border">
              {filteredDrinks.length === 0 && filteredFoods.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">
                  No products found.
                </p>
              ) : (
                <>
                  {filteredDrinks.map((drink) => (
                    <button
                      key={`drink-${drink.id}`}
                      onClick={() => handleSelectDrink(drink)}
                      className="block w-full border-b px-4 py-3 text-left hover:bg-gray-100"
                    >
                      <p className="font-medium text-gray-500">{drink.name}</p>
                      <p className="text-sm text-gray-500">
                        Drink • ${Number(drink.price).toFixed(2)}
                      </p>
                    </button>
                  ))}

                  {filteredFoods.map((food) => (
                    <button
                      key={`food-${food.id}`}
                      onClick={() => handleAddFood(food)}
                      className="block w-full border-b px-4 py-3 text-left hover:bg-gray-100 last:border-b-0"
                    >
                      <p className="font-medium text-gray-500">{food.name}</p>
                      <p className="text-sm text-gray-500">
                        Food • ${Number(food.price).toFixed(2)}
                      </p>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-500">
            Most Ordered Drinks
          </h2>

          {mostOrderedDrinks.length === 0 ? (
            <p className="text-sm text-gray-500">
              No most ordered drinks found.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {mostOrderedDrinks.map((drink) => (
                <CashierItemCard
                  key={drink.id}
                  item={{
                    id: drink.id,
                    name: drink.name,
                    price: Number(drink.price),
                  }}
                  onSelect={() => handleSelectDrink(drink)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CashierCustomization
        item={selectedDrink}
        isOpen={showCustomization}
        onClose={() => {
          setShowCustomization(false);
          setSelectedDrink(null);
        }}
        onAddToCart={handleAddCustomizedDrink}
      />

      <DiscountPopUp
        isOpen={showDiscountPopup}
        discounts={discounts}
        onClose={() => setShowDiscountPopup(false)}
        onSelect={handleApplyDiscount}
      />

      <PaymentMethodPopUp
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
        onSelect={handleCheckout}
      />
    </main>
  );
}
