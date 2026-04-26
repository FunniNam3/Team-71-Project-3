import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface ItemSalesData {
  name: string;
  quantity: number;
  total_sales: number;
}

interface SalesReportData {
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

export interface SalesReportResponse {
  success: boolean;
  timestamp: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  data: {
    summary: SalesReportData;
    items: ItemSalesData[];
    paymentMethods: PaymentSummaryData[];
  };
}

async function getFoodAndDrinkSales(
  startDate: Date,
  endDate: Date,
): Promise<ItemSalesData[]> {
  const query = `
    SELECT
        name,
        SUM(qty) AS quantity,
        SUM(total_price) AS total_sales
    FROM (
        SELECT
            d.name,
            COUNT(dtr.drink_id) AS qty,
            SUM(d.price) AS total_price
        FROM
            drink d
        INNER JOIN
            drink_to_receipt dtr
        ON 
            d.id = dtr.drink_id
        INNER JOIN
            receipt r
        ON
            r.id = dtr.receipt_id
        WHERE
            r.purchase_date >= $1
            AND r.purchase_date < $2
        GROUP BY
            d.name,
            d.price
        UNION ALL
        SELECT
            f.name,
            COUNT(ftr.food_id) AS qty,
            SUM(f.price) AS total_price
        FROM
            food f
        INNER JOIN
            food_to_receipt ftr
        ON
            f.id = ftr.food_id
        INNER JOIN
            receipt r
        ON
            r.id = ftr.receipt_id
        WHERE
            r.purchase_date >= $3
            AND r.purchase_date < $4
        GROUP BY
            f.name, f.price
        )
    AS
        combined
    GROUP BY
        name
    ORDER BY
        name
  `;

  try {
    const result = await pool.query(query, [
      startDate,
      endDate,
      startDate,
      endDate,
    ]);
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to fetch food and drink sales: ${error}`);
  }
}

async function getSalesData(
  startDate: Date,
  endDate: Date,
): Promise<SalesReportData> {
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
        WHERE r.purchase_date >= $1
        AND r.purchase_date < $2
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

    FROM receipt_totals
  `;

  try {
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Failed to fetch sales report data: ${error}`);
  }
}

async function getPaymentSummary(
  startDate: Date,
  endDate: Date,
): Promise<PaymentSummaryData[]> {
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
        WHERE r.purchase_date >= $1
        AND r.purchase_date < $2
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
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to fetch sales report payment summary: ${error}`);
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Default to today if no dates provided
    const now = new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
        },
        { status: 400 },
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Start date must be before end date",
        },
        { status: 400 },
      );
    }

    const [summary, items, paymentMethods] = await Promise.all([
      getSalesData(startDate, endDate),
      getFoodAndDrinkSales(startDate, endDate),
      getPaymentSummary(startDate, endDate),
    ]);

    const response: SalesReportResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      dateRange: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      data: {
        summary,
        items,
        paymentMethods,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Sales Report API Error:", error);

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
