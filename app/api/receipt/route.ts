import { pool } from "@/lib/db";

interface CartItem {
  instanceId: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
  quantity: number;
  inventoryImpact?: number[]; // Added this to match frontend
  customizations: {
    size?: string;
    ice?: string;
    sugar?: string;
    milk?: string;
    notes?: string;
    toppings?: {
      boba: string[];
      popping: string[];
      jelly: string[];
      other: string[];
    };
  };
}

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const {
      cart,
      payment_method,
      total,
      tax,
      discount,
      customer_id,
      points,
      cashier_id,
    } = body;

    await client.query("BEGIN");

    // 1. Insert into receipt table
    const receiptRes = await client.query(
      `INSERT INTO receipt (customer_id, cashier_id, tax, discount, payment_method, total)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        customer_id || null,
        cashier_id || 1,
        tax,
        discount || 0,
        payment_method,
        total,
      ],
    );

    const receiptId = receiptRes.rows[0].id;

    // 2. Insert items into bridging tables AND update inventory
    if (Array.isArray(cart)) {
      const newCart: CartItem[] = cart;
      for (const item of newCart) {
        
        // --- NEW: INVENTORY UPDATE LOGIC ---
        // For every ID in inventoryImpact, decrease the stock by 1
        if (item.inventoryImpact && Array.isArray(item.inventoryImpact)) {
          for (const invId of item.inventoryImpact) {
            await client.query(
              "UPDATE inventory SET amount = amount - 1 WHERE id = $1",
              [invId]
            );
          }
        }

        const itemCategory = String(item.category || "").toLowerCase();

        if (itemCategory === "food") {
          const foodLookup = await client.query(
            "SELECT id FROM food WHERE name = $1",
            [item.name],
          );
          const foodId = foodLookup.rows[0]?.id;

          if (foodId) {
            await client.query(
              `INSERT INTO food_to_receipt (receipt_id, food_id, modifiers, quantity)
               VALUES ($1, $2, $3, $4)`,
              [
                receiptId,
                foodId,
                item.customizations.notes || "",
                item.quantity || 1,
              ],
            );
          }
        } else {
          // Drink logic
          const drinkLookup = await client.query(
            "SELECT id FROM drink WHERE name = $1",
            [item.name],
          );

          if (drinkLookup.rows.length !== 0) {
            const drinkId = drinkLookup.rows[0]?.id;
            const sweetnessInt = parseInt(
              item.customizations.sugar || "100",
              10,
            );

            await client.query(
              `INSERT INTO drink_to_receipt (receipt_id, drink_id, size, ice, sweetness, milk, boba, popping_boba, jelly, other, quantity, special)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
              [
                receiptId,
                drinkId,
                item.customizations.size,
                item.customizations.ice || "Regular",
                isNaN(sweetnessInt) ? 100 : sweetnessInt,
                item.customizations.milk,
                item.customizations.toppings?.boba.join(),
                item.customizations.toppings?.popping.join(),
                item.customizations.toppings?.jelly.join(),
                item.customizations.toppings?.other.join(),
                item.quantity || 1,
                item.customizations.notes,
              ],
            );
          } else {
            throw new Error("Cannot find Drink");
          }
        }
      }
    }

    if (points && customer_id) {
      await client.query(
        "UPDATE users SET points = points + $1 WHERE id = $2",
        [points, customer_id],
      );
    }

    await client.query("COMMIT");
    return Response.json({ id: receiptId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DATABASE ERROR:", err);
    return Response.json(
      { error: "Database transaction failed" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}