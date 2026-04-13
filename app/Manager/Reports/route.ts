// app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this is in your .env
  ssl: { rejectUnauthorized: false }
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'X' or 'Z'

  try {
    // 1. Fetch Sales Summary (Same logic as your Java getSalesData)
    const summaryQuery = `
      WITH receipt_totals AS (
        SELECT r.id, r.payment_method,
        COALESCE(SUM(f.price), 0) + COALESCE(SUM(d.price), 0) AS total
        FROM receipt r
        LEFT JOIN food_to_receipt ftr ON r.id = ftr.receipt_id
        LEFT JOIN food f ON ftr.food_id = f.id
        LEFT JOIN drink_to_receipt dtr ON r.id = dtr.receipt_id
        LEFT JOIN drink d ON dtr.drink_id = d.id
        WHERE r.z_closed = ${type === 'Z' ? 'FALSE' : 'FALSE'} 
        AND (r.purchase_date::date = CURRENT_DATE OR ${type === 'Z' ? 'TRUE' : 'FALSE'})
        GROUP BY r.id, r.payment_method
      )
      SELECT 
        COUNT(*) AS total_transactions,
        SUM(total) AS gross_sales,
        SUM(CASE WHEN payment_method != 'Void' THEN total ELSE 0 END) AS net_sales
      FROM receipt_totals;
    `;

    const result = await pool.query(summaryQuery);

    // 2. If it's a Z-Report, we perform the "Close" action
    if (type === 'Z') {
      await pool.query('UPDATE receipt SET z_closed = TRUE WHERE z_closed = FALSE');
    }

    return NextResponse.json({
      reportType: type,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}