import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth0 } from "@/lib/auth0";


// get auth id from active user and get cost of
//  item from rewards talbe the compaere point 
// value and subtract or send error
export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();

    if (!session?.user?.sub) {
      return NextResponse.json(
        { error: "Not logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rewardId } = body;

    if (!rewardId) {
      return NextResponse.json(
        { error: "Missing rewardId" },
        { status: 400 }
      );
    }

    const userResult = await pool.query(
      `
      SELECT id, auth0_user_id, name, points
      FROM users
      WHERE auth0_user_id = $1
      LIMIT 1
      `,
      [session.user.sub]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const rewardResult = await pool.query(
      `
      SELECT id, item, points, type, image
      FROM rewards
      WHERE id = $1
      LIMIT 1
      `,
      [rewardId]
    );

    if (rewardResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Reward not found" },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    const reward = rewardResult.rows[0];

    if (user.points < reward.points) {
      return NextResponse.json(
        {
          error: "Not enough points",
          currentPoints: user.points,
          rewardCost: reward.points,
        },
        { status: 400 }
      );
    }

    const newPoints = user.points - reward.points;

    const updateResult = await pool.query(
      `
      UPDATE users
      SET points = $1
      WHERE id = $2
      RETURNING id, name, points
      `,
      [newPoints, user.id]
    );

    return NextResponse.json(
      {
        message: `Reward redeemed. Go to cashier for prize.`,
        data: {
          reward,
          user: updateResult.rows[0],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST redeem reward error:", error);

    return NextResponse.json(
      { error: "Failed to redeem reward" },
      { status: 500 }
    );
  }
}