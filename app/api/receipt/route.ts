import { NextResponse } from "next/server";
import { pool } from "@/lib/db"; 

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { cart, payment_method, total, tax, discount, customer_id, points } = body;

    await client.query("BEGIN");

    // 1. Insert into receipt table (Date only: YYYY-MM-DD)
    const receiptRes = await client.query(
      `INSERT INTO receipt (customer_id, cashier_id, tax, discount, payment_method, total, purchase_date)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE) RETURNING id`,
      [customer_id || null, 1, tax, discount || 0, payment_method, total]
    );
    
    const receiptId = receiptRes.rows[0].id;

    // 2. Insert items into bridging tables
    for (const item of cart) {
      if (item.category === "food") {
        const foodLookup = await client.query("SELECT id FROM food WHERE name = $1", [item.name]);
        const foodId = foodLookup.rows[0]?.id;

        if (foodId) {
          await client.query(
            `INSERT INTO food_to_receipt (receipt_id, food_id, notes, quantity)
             VALUES ($1, $2, $3, $4)`,
            [receiptId, foodId, item.customizations.notes, 1]
          );
        }
      } else {
        const drinkLookup = await client.query("SELECT id FROM drink WHERE name = $1", [item.name]);
        const drinkId = drinkLookup.rows[0]?.id;

        if (drinkId) {
          // CLEANING DATA: Convert "100%" (string) to 100 (int) for your DB column
          const sweetnessInt = parseInt(item.customizations.sugar || "100", 10);

          await client.query(
            `INSERT INTO drink_to_receipt (receipt_id, drink_id, ice_level, sweetness, boba, quantity)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              receiptId, 
              drinkId, 
              item.customizations.ice, 
              sweetnessInt, // Now an Integer
              item.customizations.toppings.includes("Boba"), 
              1
            ]
          );
        }
      }
    }

    // 3. Update the specific user's points
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