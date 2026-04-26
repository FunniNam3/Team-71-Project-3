import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface ZReportSalesData {
  total_transactions: number;
  valid_transactions: number;
  void_transactions: number;
  first_receipt: number;
  last_receipt: number;
  gross_sales: number;
  net_sales: number;
  void_amount: number;
}

interface PaymentSummaryData {
  payment_method: string;
  total_transactions: number;
  gross_sales: number;
  net_sales: number;
}

export interface ZReportResponse {
  success: boolean;
  timestamp: string;
  data: {
    summary: ZReportSalesData;
    paymentMethods: PaymentSummaryData[];
  };
}

export interface ZReportPostResponse {
  success: boolean;
  timestamp: string;
  recordsUpdated?: number;
  error?: string;
}

async function getSalesData(): Promise<ZReportSalesData> {
  const query = `
    WITH receipt_totals AS (
        SELECT 
            r.id,
            r.payment_method,

            COALESCE(SUM(f.price), 0) AS food_total,
            COALESCE(SUM(d.price), 0) AS drink_total

        FROM receipt r
        LEFT JOIN food_to_receipt ftr ON r.id = ftr.receipt_id
        LEFT JOIN food f ON ftr.food_id = f.id
        LEFT JOIN drink_to_receipt dtr ON r.id = dtr.receipt_id
        LEFT JOIN drink d ON dtr.drink_id = d.id
        WHERE r.z_closed = FALSE
        GROUP BY r.id, r.payment_method
    )

    SELECT
        COUNT(*) AS total_transactions,

        COUNT(CASE WHEN payment_method != 'Void' THEN 1 END)
            AS valid_transactions,

        COUNT(CASE WHEN payment_method = 'Void' THEN 1 END)
            AS void_transactions,

        MIN(id) AS first_receipt,
        MAX(id) AS last_receipt,

        SUM(food_total + drink_total) AS gross_sales,

        SUM(CASE WHEN payment_method != 'Void'
                 THEN food_total + drink_total
                 ELSE 0 END) AS net_sales,

        SUM(CASE WHEN payment_method = 'Void'
                 THEN food_total + drink_total
                 ELSE 0 END) AS void_amount

    FROM receipt_totals;
  `;

  try {
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Failed to fetch Z report sales data: ${error}`);
  }
}

async function getPaymentSummary(): Promise<PaymentSummaryData[]> {
  const query = `
    WITH receipt_totals AS (
        SELECT 
            r.id,
            r.payment_method,

            COALESCE(SUM(f.price), 0) +
            COALESCE(SUM(d.price), 0) AS receipt_total

        FROM receipt r
        LEFT JOIN food_to_receipt ftr ON r.id = ftr.receipt_id
        LEFT JOIN food f ON ftr.food_id = f.id
        LEFT JOIN drink_to_receipt dtr ON r.id = dtr.receipt_id
        LEFT JOIN drink d ON dtr.drink_id = d.id
        WHERE r.z_closed = FALSE
        GROUP BY r.id, r.payment_method
    )

    SELECT
        payment_method,
        COUNT(*) AS total_transactions,
        SUM(receipt_total) AS gross_sales,
        SUM(CASE WHEN payment_method != 'Void'
                    THEN receipt_total
                    ELSE 0 END) AS net_sales
    FROM receipt_totals
    GROUP BY payment_method
    ORDER BY gross_sales DESC;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to fetch Z report payment summary: ${error}`);
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const [summary, paymentMethods] = await Promise.all([
      getSalesData(),
      getPaymentSummary(),
    ]);

    const response: ZReportResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        summary,
        paymentMethods,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Z Report API Error:", error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const result = await pool.query(
      "UPDATE receipt SET z_closed = TRUE WHERE z_closed = FALSE",
    );

    const response: ZReportPostResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      recordsUpdated: result.rowCount || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Z Report POST API Error:", error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
