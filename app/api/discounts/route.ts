import { NextResponse } from "next/server";
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

//returns all disocunts in talbe
export async function GET() {
  try {
    const result = await pool.query(
      `
      SELECT id, type, amount
      FROM discount
      ORDER BY type
      `
    );

    return NextResponse.json(
      {
        message: "GET discounts success",
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET discounts error:", error);

    return NextResponse.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}