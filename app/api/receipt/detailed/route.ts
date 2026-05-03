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

interface ReceiptItems {
  item_name: string;
  price: number;
  quantity: number;
  size?: string;
  ice?: string;
  sweetness?: string;
  milk?: string;
  boba?: string;
  popping_boba?: string;
  jelly?: string;
  other?: string;
  notes: string;
}

// will return all table lines the match the parameter enetered,
// searches by any of the attributes of the receipt table
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
      return Response.json([]);
    }

    const food: ReceiptItems[] = (
      await pool.query(
        `
      SELECT f.name AS item_name,
           f.price AS price,
           ftr.quantity,
           ftr.modifiers AS notes
    FROM food_to_receipt ftr
    JOIN food f ON ftr.food_id = f.id
    WHERE ftr.receipt_id = $1
      `,
        [q],
      )
    ).rows;

    const drinks: ReceiptItems[] = (
      await pool.query(
        `
    SELECT d.name AS item_name,
          d.price AS price,
          dtr.quantity,
          dtr.size AS size,
          dtr.ice AS ice,
          dtr.sweetness AS sweetness,
          dtr.milk AS milk,
          dtr.boba AS boba,
          dtr.popping_boba AS popping_boba,
          dtr.jelly AS jelly,
          dtr.other AS other,
          dtr.special AS notes
    FROM drink_to_receipt dtr
    JOIN drink d ON dtr.drink_id = d.id
    WHERE dtr.receipt_id = $1
      `,
        [q],
      )
    ).rows;

    return Response.json([...food, ...drinks]);
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Failed to search receipts" },
      { status: 500 },
    );
  }
}
