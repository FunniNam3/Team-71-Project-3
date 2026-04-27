// app/api/reports/check-open-receipts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export interface CheckOpenReceiptsResponse {
  hasOpenReceipts: boolean;
  count: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const query = `
      SELECT COUNT(*) as open_count
      FROM receipt
      WHERE z_closed = FALSE
    `;

    const result = await pool.query(query);
    const openCount = parseInt(result.rows[0].open_count);

    const response: CheckOpenReceiptsResponse = {
      hasOpenReceipts: openCount > 0,
      count: openCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Check Open Receipts Error:", error);

    return NextResponse.json(
      {
        hasOpenReceipts: false,
        count: 0,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
