import { NextResponse } from "next/server";
import { pool } from "@/lib/db"; //to connect  to out db
import { auth0 } from "@/lib/auth0";

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

// search functino for user table
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (q) {
      const result = await pool.query(
        `
        SELECT id, auth0_user_id, name, role, points, cart
        FROM users
        WHERE 
            CAST(id AS TEXT) ILIKE $1
            OR auth0_user_id ILIKE $1
            OR name ILIKE $1
        ORDER BY name
        `,
        [`%${q}%`]
      );

      return Response.json({ data: result.rows });
    }

    const result = await pool.query(
      `
      SELECT id, auth0_user_id, name, role, points, cart
      FROM users
      ORDER BY name
      `
    );

    return Response.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}