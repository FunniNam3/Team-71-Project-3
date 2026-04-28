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
      const result = await pool.query(
        "SELECT id, r.customer_id, u.name, cashier_id, purchase_date, payment_method, z_closed, discount, tax FROM receipt r LEFT JOIN (SELECT name, id as customer_id FROM users) u ON r.customer_id = u.customer_id LIMIT 100",
      );

      return Response.json(result.rows);
    }

    const result = await pool.query(
      `
      SELECT id, r.customer_id, u.name, cashier_id, purchase_date, payment_method, z_closed, discount, tax FROM receipt r LEFT JOIN (SELECT name, id as customer_id FROM users) u ON r.customer_id = u.customer_id
      WHERE
        CAST(r.id AS TEXT) LIKE $2
        OR CAST(r.customer_id AS TEXT) LIKE $2
        OR CAST(u.name AS TEXT) LIKE $1
        OR CAST(r.cashier_id AS TEXT) LIKE $2
        OR CAST(r.purchase_date AS TEXT) LIKE $2
        OR r.payment_method LIKE $1
        OR CAST(r.z_closed AS TEXT) LIKE $1
      `,
      [`%${q}%`, q],
    );

    return Response.json(result.rows);
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Failed to search receipt table" },
      { status: 500 },
    );
  }
}
