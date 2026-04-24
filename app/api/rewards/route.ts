import { pool } from "@/lib/db";
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

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

// GET /api/rewards
// Returns all reward items sorted by type, then by points
export async function GET() {
  try {
    const result = await pool.query(
      `
      SELECT id, item, points, type, image
      FROM rewards
      ORDER BY type, points, item
      `
    );

    return NextResponse.json(
      {
        message: "GET rewards success",
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET rewards error:", error);

    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}