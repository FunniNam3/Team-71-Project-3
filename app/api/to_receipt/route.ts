import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type CartItem = {
  id: number;
  quantity: number;
  itemType: "drink" | "food";
  selectedIce?: string;
  selectedSweetness?: string;
  selectedMilk?: string;
  selectedBoba?: string;
  selectedPoppingBoba?: string;
};

function parseSweetness(value: string | undefined) {
  if (!value) return null;

  const numberOnly = value.replace("%", "").trim();
  const parsed = Number(numberOnly);

  return Number.isNaN(parsed) ? null : parsed;
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();

    const { receipt_id, items } = body;

    if (!receipt_id) {
      return NextResponse.json(
        { error: "receipt_id is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items must be a non-empty array" },
        { status: 400 },
      );
    }

    await client.query("BEGIN");

    for (const item of items as CartItem[]) {
      if (item.itemType === "food") {
        await client.query(
          `
          INSERT INTO food_to_receipt
            (food_id, receipt_id, modifiers, quantity)
          VALUES
            ($1, $2, $3, $4)
          `,
          [
            item.id,
            receipt_id,
            null,
            item.quantity ?? 1,
          ],
        );
      }

      if (item.itemType === "drink") {
        await client.query(
            `
            INSERT INTO drink_to_receipt
                (receipt_id, drink_id, ice, sweetness, milk, boba, popping_boba, quantity)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [
                receipt_id,
                item.id,
                item.selectedIce ?? null,
                parseSweetness(item.selectedSweetness),
                item.selectedMilk ?? null,
                item.selectedBoba ? true : false,
                item.selectedPoppingBoba ? true : false,
                item.quantity ?? 1,
            ],
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Receipt items added successfully",
      receipt_id,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Failed to add receipt items:", error);

    return NextResponse.json(
      { error: "Failed to add receipt items" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}