import { pool } from "@/lib/db";

interface CartItem {
  instanceId: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
  quantity: number;
  customizations: {
    size?: string; // Added for drink sizing
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
    // Using customer_id || null allows guests to checkout without breaking FK constraints
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

    // 2. Insert items into bridging tables
    if (Array.isArray(cart)) {
      const newCart: CartItem[] = cart;
      for (const item of newCart) {
        /**
         * CHANGE: Normalize category to lowercase.
         * This prevents "French fries" from failing if the category is "Food" instead of "food".
         */
        // This ensures that even if category is missing or a number,
        // it becomes a string like "" or "1" before calling toLowerCase()
        const itemCategory = String(item.category || "").toLowerCase();

        if (itemCategory === "food") {
          // Find the ID in the food table based on the name
          const foodLookup = await client.query(
            "SELECT id FROM food WHERE name = $1",
            [item.name],
          );
          const foodId = foodLookup.rows[0]?.id;

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

          const checkRes = await client.query(
            `
            select count(*) from inventory i
            join food_recipe fr on i.id = fr.inventory_id
            where fr.food_id = $1 and (i.amount - fr.quantity_used) <= 0
            `,
            [foodId],
          );

          if (parseInt(checkRes.rows[0].count) > 0) {
            throw new Error("Insufficient inventory amount");
          }

          await client.query(
            `
            update inventory
            set amount = amount - fr.quantity_used
            from food_recipe fr
            where inventory.id = fr.inventory_id and fr.food_id = $1
            `,
            [foodId],
          );
        } else {
          // Drink logic
          const drinkLookup = await client.query(
            "SELECT id FROM drink WHERE name = $1",
            [item.name],
          );

          if (drinkLookup.rows.length !== 0) {
            const drinkId = drinkLookup.rows[0]?.id;
            // Convert sugar string (e.g., "100%") to integer (100)
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

            let checkRes = await client.query(
              `
              select count(*) from inventory i
              join drink_recipe dr on i.id = dr.inventory_id
              where dr.drink_id = $1 and (i.amount - dr.quantity_used) <= 0
              `,
              [drinkId],
            );

            if (parseInt(checkRes.rows[0].count) > 0) {
              throw new Error("Insufficient inventory amount");
            }

            await client.query(
              `
              update inventory
              set amount = amount - dr.quantity_used
              from drink_recipe dr
              where inventory.id = dr.inventory_id and dr.drink_id = $1
              `,
              [drinkId],
            );

            checkRes = await client.query(
              `
              select count(*) from inventory 
              where id = 32 and (amount - 1) <= 0
              `,
            );

            if (parseInt(checkRes.rows[0].count) > 0) {
              throw new Error("Insufficient inventory amount");
            }

            await client.query(
              `
              update inventory
              set amount = amount - 1
              where id = 32
              `,
            );

            checkRes = await client.query(
              `
              select count(*) from inventory 
              where id = 30 and (amount - 1) <= 0
              `,
            );

            if (parseInt(checkRes.rows[0].count) > 0) {
              throw new Error("Insufficient inventory amount");
            }

            await client.query(
              `
              update inventory
              set amount = amount - 1
              where id = 30
              `,
            );

            checkRes = await client.query(
              `
              select count(*) from inventory 
              where id = 29 and (amount - 1) <= 0
              `,
            );

            if (parseInt(checkRes.rows[0].count) > 0) {
              throw new Error("Insufficient inventory amount");
            }

            await client.query(
              `
              update inventory
              set amount = amount - 1
              where id = 29
              `,
            );

            if (item.customizations.toppings) {
              const toppingTypes = [
                {
                  toppings: item.customizations.toppings?.boba,
                  prefix: "Boba ",
                },
                {
                  toppings: item.customizations.toppings?.popping,
                  prefix: "Popping ",
                },
                {
                  toppings: item.customizations.toppings?.jelly,
                  prefix: "Jelly ",
                },
                { toppings: item.customizations.toppings?.other, prefix: "" },
              ];

              for (const type of toppingTypes) {
                for (const topping of type.toppings || []) {
                  const name = type.prefix + topping;

                  // Check inventory before update
                  const result = await client.query(
                    `SELECT amount FROM inventory WHERE name = $1`,
                    [name],
                  );

                  if (!result.rows[0] || result.rows[0].amount <= 0) {
                    throw new Error(`Insufficient inventory for ${name}`);
                  }

                  await client.query(
                    `UPDATE inventory SET amount = amount - 1 WHERE name = $1`,
                    [name],
                  );
                }
              }
            }
          } else {
            console.log("Cannot find Drink");
            throw new Error("Cannot find Drink");
          }
        }
      }
    }

    await client.query("UPDATE users SET points = points + $1 WHERE id = $2", [
      points,
      customer_id,
    ]);

    await client.query("COMMIT");
    return Response.json({ id: receiptId });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.log(err.toString());
    return Response.json(
      { error: err.toString().replace(/^Error: /, "") },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
