import { NextResponse } from "next/server";
import { pool } from "@/lib/db"; 

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { cart, payment_method, total, tax, discount, customer_id, points } = body;

    await client.query("BEGIN");

    // 1. Insert into receipt table
    // Using customer_id || null allows guests to checkout without breaking FK constraints
    const receiptRes = await client.query(
      `INSERT INTO receipt (customer_id, cashier_id, tax, discount, payment_method, total, purchase_date)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE) RETURNING id`,
      [customer_id || null, 1, tax, discount || 0, payment_method, total]
    );
    
    const receiptId = receiptRes.rows[0].id;

    // 2. Insert items into bridging tables
    for (const item of cart) {
      /**
       * CHANGE: Normalize category to lowercase.
       * This prevents "French fries" from failing if the category is "Food" instead of "food".
       */
      const itemCategory = item.category?.toLowerCase();

      if (itemCategory === "food") {
        // Find the ID in the food table based on the name
        const foodLookup = await client.query("SELECT id FROM food WHERE name = $1", [item.name]);
        const foodId = foodLookup.rows[0]?.id;

        if (foodId) {
          /**
           * CHANGE: Column name alignment.
           * Updated from 'notes' to 'modifiers' to match your 'food_to_receipt' table schema.
           */
          await client.query(
            `INSERT INTO food_to_receipt (receipt_id, food_id, modifiers, quantity)
             VALUES ($1, $2, $3, $4)`,
            [
              receiptId, 
              foodId, 
              item.customizations.notes || "", 
              1
            ]
          );
        }
      } else {
        // Drink logic
        const drinkLookup = await client.query("SELECT id FROM drink WHERE name = $1", [item.name]);
        const drinkId = drinkLookup.rows[0]?.id;

        if (drinkId) {
          // Convert sugar string (e.g., "100%") to integer (100)
          const sweetnessInt = parseInt(item.customizations.sugar || "100", 10);
          
          await client.query(
            `INSERT INTO drink_to_receipt (receipt_id, drink_id, ice_level, sweetness, boba, quantity)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              receiptId, 
              drinkId, 
              item.customizations.ice || "Regular", 
              isNaN(sweetnessInt) ? 100 : sweetnessInt, 
              item.customizations.toppings?.includes("Boba") || false, 
              1
            ]
          );
        }
      }
    }

    /**
     * CHANGE: Added check for customer_id.
     * Only attempts to update points if a valid user ID is present (skips for guests).
     */
    if (points && customer_id) {
      await client.query(
        "UPDATE users SET points = points + $1 WHERE id = $2",
        [points, customer_id]
      );
    }

    await client.query("COMMIT");
    return Response.json({ id: receiptId });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DATABASE ERROR:", err);
    return Response.json({ error: "Database transaction failed" }, { status: 500 });
  } finally {
    client.release();
  }
}