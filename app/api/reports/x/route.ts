import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface SalesData {
  gross_sales: number;
  net_sales: number;
  total_transactions: number;
  total_food_sales: number;
  total_food_items: number;
  total_drink_sales: number;
  total_drink_items: number;
}

interface HourlySaleData {
  hour: number;
  total_transactions: number;
  valid_transactions: number;
  void_transactions: number;
  gross_sales: number;
  net_sales: number;
}

interface PaymentSummaryData {
  payment_method: string;
  total_transactions: number;
  gross_sales: number;
  net_sales: number;
}

export interface XReportResponse {
  success: boolean;
  timestamp: string;
  data: {
    summary: SalesData;
    hourly: HourlySaleData[];
    paymentMethods: PaymentSummaryData[];
  };
}

async function getSalesData(): Promise<SalesData> {
  const query = `
    WITH receipt_totals AS (
        SELECT 
            r.id,
            r.payment_method,

            COALESCE(SUM(f.price), 0) AS food_total,
            COUNT(f.id) AS food_items,

            COALESCE(SUM(d.price), 0) AS drink_total,
            COUNT(d.id) AS drink_items

        FROM receipt r
        LEFT JOIN food_to_receipt ftr ON r.id = ftr.receipt_id
        LEFT JOIN food f ON ftr.food_id = f.id
        LEFT JOIN drink_to_receipt dtr ON r.id = dtr.receipt_id
        LEFT JOIN drink d ON dtr.drink_id = d.id
        WHERE r.purchase_date::date = CURRENT_DATE
        AND r.z_closed = FALSE
        GROUP BY r.id, r.payment_method
    )

    SELECT
        COUNT(*) AS total_transactions,
        SUM(food_total + drink_total) AS gross_sales,
        SUM(CASE WHEN payment_method != 'Void'
                    THEN food_total + drink_total
                    ELSE 0 END) AS net_sales,
        SUM(food_total) AS total_food_sales,
        SUM(food_items) AS total_food_items,
        SUM(drink_total) AS total_drink_sales,
        SUM(drink_items) AS total_drink_items
    FROM receipt_totals;
    `;

  try {
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Failed to fetch sales data: ${error}`);
  }
}

async function getHourlySales(): Promise<HourlySaleData[]> {
  const query = `
    WITH receipt_totals AS (
        SELECT
            EXTRACT(HOUR FROM r.purchase_date) AS hour,
            r.payment_method,
            COALESCE(SUM(f.price),0) AS food_total,
            COALESCE(SUM(d.price),0) AS drink_total
        FROM receipt r
        LEFT JOIN food_to_receipt ftr ON r.id = ftr.receipt_id
        LEFT JOIN food f ON ftr.food_id = f.id
        LEFT JOIN drink_to_receipt dtr ON r.id = dtr.receipt_id
        LEFT JOIN drink d ON dtr.drink_id = d.id
        WHERE r.z_closed = FALSE
        GROUP BY r.id, r.payment_method
    )
    SELECT 
        hour,
        COUNT(*) AS total_transactions,
        COUNT(CASE WHEN payment_method != 'Void' THEN 1 END) AS valid_transactions,
        COUNT(CASE WHEN payment_method = 'Void' THEN 1 END) AS void_transactions,
        SUM(food_total + drink_total) AS gross_sales,
        SUM(CASE WHEN payment_method != 'Void' THEN food_total + drink_total ELSE 0 END) AS net_sales
    FROM receipt_totals
    GROUP BY hour
    ORDER BY hour
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to fetch hourly sales data: ${error}`);
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
        WHERE r.purchase_date::date = CURRENT_DATE
        AND r.z_closed = FALSE
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
    ORDER BY gross_sales DESC
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to fetch payment summary data: ${error}`);
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Fetch all three reports in parallel
    const [summary, hourly, paymentMethods] = await Promise.all([
      getSalesData(),
      getHourlySales(),
      getPaymentSummary(),
    ]);

    const response: XReportResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        summary,
        hourly,
        paymentMethods,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("XReport API Error:", error);

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
