import { NextRequest, NextResponse } from 'next/server';
import { pool } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'X' || type === 'Z') {
      // Using COALESCE to ensure we don't return null if the day is empty
      const result = await pool.query(`
        SELECT 
            COALESCE(SUM(total_price), SUM(price), 0) as gross_sales,
            COUNT(*) as total_transactions
        FROM receipt 
        WHERE CAST(timestamp AS DATE) = CURRENT_DATE;
      `);
      
      const data = result.rows[0];
      return NextResponse.json({
        gross_sales: data.gross_sales,
        total_transactions: data.total_transactions
      });
    }

    if (type === 'Sales') {
      // Aggregates counts from your item tables
      const result = await pool.query(`
        SELECT name, amount as count FROM inventory
        UNION ALL
        SELECT name, 0 as count FROM drinks
        ORDER BY count DESC;
      `);
      return NextResponse.json(result.rows);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

  } catch (error: any) {
    console.error('DATABASE ERROR:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}