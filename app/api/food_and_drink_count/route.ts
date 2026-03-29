// This work is dedicated to the Holy Family. Jesus, I trust in You

import { NextResponse } from "next/server";
import { pool } from "@/lib/db"; //to connect to out db

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

// This function queries the database for the amount of each food and drink sold given a time frame,
// Uses Query parameter
// For use, please indicate the desired time frame using key value pairs for
// year (YYYY) month (MM) day (DD). (ex: .../food_and_drink_count/?year=2026&month=03&day=01)
export async function GET(request: Request) {
  try {

    const url = new URL(request.url);
    const singular = url.searchParams.get("singular");

    if (singular == "false") {
      // no drink id input. request and return all names of drinks
      const result = await pool.query("SELECT name, price FROM drink");

      return NextResponse.json(
        { message: "GET success", data: result.rows },
        { status: 200 },
      );
    }

    const drinkId = url.searchParams.get("id");

    // return full row of drink data for specified drink id
    const result = await pool.query("SELECT * FROM drink WHERE id = $1", [
      drinkId,
    ]);

    return NextResponse.json(
      { message: "GET success", data: result.rows[0] },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "GET failed" }, { status: 500 });
  }
}