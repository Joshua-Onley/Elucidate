import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

interface RequestBody {
  likerId: number;
  likedId: number;
}

export async function POST(req: Request) {
  try {
    const { likerId, likedId }: RequestBody = await req.json();
    console.log(likerId, likedId);
    if (!likerId || !likedId) {
      console.error("missing a user id in the request body");
      return NextResponse.json({ error: "missing ID" }, { status: 400 });
    }

    const likerQuery = "SELECT user_id FROM users WHERE user_id = $1";

    const likerResult = await pool.query(likerQuery, [likerId]);

    if (likerResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const liker_id = likerResult.rows[0].user_id;

    const insertQuery = `
            INSERT INTO likes (liker_id, liked_id, created_at)
            VALUES ($1, $2, NOW())
            RETURNING id;
            `;

    const insertResult = await pool.query(insertQuery, [liker_id, likedId]);

    return NextResponse.json({
      message: "Like successfully recorded",
      like_id: insertResult.rows[0].id,
    });
  } catch (error) {
    console.error("error handling post request: ", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
