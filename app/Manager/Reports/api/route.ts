import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    // --- CASE 1: ITEM SALES REPORT ---
    if (type === 'Sales') {
      const salesQuery = `
        SELECT name, SUM(quantity)::int as quantity, SUM(price * quantity)::float as total
        FROM (
          SELECT f.name, COUNT(ftr.food_id) as quantity, f.price
          FROM food f
          JOIN food_to_receipt ftr ON f.id = ftr.food_id
          JOIN receipt r ON ftr.receipt_id = r.id
          WHERE r.z_closed = FALSE
          GROUP BY f.name, f.price
          UNION ALL
          SELECT d.name, COUNT(dtr.drink_id) as quantity, d.price
          FROM drink d
          JOIN drink_to_receipt dtr ON d.id = dtr.drink_id
          JOIN receipt r ON dtr.receipt_id = r.id
          WHERE r.z_closed = FALSE
          GROUP BY d.name, d.price
        ) combined_sales
        GROUP BY name
        ORDER BY quantity DESC;
      `;
      const salesResult = await pool.query(salesQuery);
      return NextResponse.json({ 
        data: { items: salesResult.rows },
        timestamp: new Date().toISOString() 
      });
    }

    // --- CASE 2: X or Z REPORTS ---
    const reportQuery = `
      WITH current_receipts AS (
        SELECT r.id, r.payment_method, r.purchase_date
        FROM receipt r
        WHERE r.z_closed = FALSE 
        ${type === 'X' ? "AND r.purchase_date >= CURRENT_DATE" : ""}
      ),
      item_totals AS (
        SELECT 
            cr.id,
            cr.payment_method,
            COALESCE(SUM(f.price), 0) AS food_total,
            COALESCE(SUM(d.price), 0) AS drink_total
        FROM current_receipts cr
        LEFT JOIN food_to_receipt ftr ON cr.id = ftr.receipt_id
        LEFT JOIN food f ON ftr.food_id = f.id
        LEFT JOIN drink_to_receipt dtr ON cr.id = dtr.receipt_id
        LEFT JOIN drink d ON dtr.drink_id = d.id
        GROUP BY cr.id, cr.payment_method
      )
      SELECT 
        COUNT(*)::int AS total_transactions,
        COALESCE(SUM(food_total + drink_total), 0)::float AS gross_sales,
        COALESCE(SUM(food_total), 0)::float AS food_sales,
        COALESCE(SUM(drink_total), 0)::float AS drink_sales,
        COUNT(*) FILTER (WHERE payment_method = 'Card')::int AS card_count,
        COALESCE(SUM(food_total + drink_total) FILTER (WHERE payment_method = 'Card'), 0)::float AS card_sales,
        COUNT(*) FILTER (WHERE payment_method = 'Cash')::int AS cash_count,
        COALESCE(SUM(food_total + drink_total) FILTER (WHERE payment_method = 'Cash'), 0)::float AS cash_sales
      FROM item_totals;
    `;

    const result = await pool.query(reportQuery);

    // If it's a Z-Report, perform the "Close" action after calculating totals
    if (type === 'Z') {
      await pool.query('UPDATE receipt SET z_closed = TRUE WHERE z_closed = FALSE');
    }

    return NextResponse.json({
      reportType: type,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("DB Error:", err.message);
    return NextResponse.json({ error: "Database error", details: err.message }, { status: 500 });
  }
}