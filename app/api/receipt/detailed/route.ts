import { pool } from "@/lib/db"; //to connect  to out db

/*
HTTP Status Codes

200 - OK (success)
201 - Created (new resource created)
400 - Bad Request (invalid input)
401 - Unauthorized (not logged in)
403 - Forbidden (no permission)
404 - Not Found (resource doesn’t exist)
500 - Server Error (something broke)
*/

/*
HTTP Methods

GET    - Read data
POST   - Create new data
PUT    - Replace entire resource
PATCH  - Update part of resource
DELETE - Remove data
*/

// will return all table lines the match the parameter enetered,
// searches by any of the attributes of the receipt table
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
      return Response.json([]);
    }

    const result = await pool.query(
      `
      SELECT f.name AS item_name,
           f.price AS price,
           ftr.modifiers AS details
    FROM food_to_receipt ftr
    JOIN food f ON ftr.food_id = f.id
    WHERE ftr.receipt_id = $1

    UNION ALL

    SELECT d.name AS item_name,
           d.price AS price,
           CONCAT(
               'Ice: ', dtr.ice,
               ', Sweetness: ', dtr.sweetness,
               ', Milk: ', dtr.milk,
               ', Boba: ', dtr.boba,
               ', Popping: ', dtr.popping_boba
           ) AS details
    FROM drink_to_receipt dtr
    JOIN drink d ON dtr.drink_id = d.id
    WHERE dtr.receipt_id = $1
      `,
      [q],
    );

    return Response.json(result.rows);
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Failed to search receipts" },
      { status: 500 },
    );
  }
}
