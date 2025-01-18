import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `
      SELECT 
        CONCAT(LEAST(l1.liker_id, l1.liked_id), '-', GREATEST(l1.liker_id, l1.liked_id)) AS match_id, 
        u.user_id, 
        u.name, 
        u.photo AS "avatarUrl"
      FROM likes l1
      JOIN likes l2 
        ON l1.liker_id = l2.liked_id 
       AND l1.liked_id = l2.liker_id
      JOIN users u 
        ON u.user_id = l1.liked_id
      WHERE l1.liker_id = $1;
      `,
      [userId],
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
