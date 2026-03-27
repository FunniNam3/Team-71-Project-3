import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const auth0Id = searchParams.get("auth0Id");

    if (!auth0Id) {
      return NextResponse.json(
        { error: "Missing auth0Id" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT id, auth0_user_id, email, name, role
      FROM users
      WHERE auth0_user_id = $1
      `,
      [auth0Id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching user by auth0 id:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}