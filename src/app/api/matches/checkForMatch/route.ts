import pool from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // Parse JSON body from the request
    const { likerId, likedId } = body;

    if (!likerId || !likedId) {
      return NextResponse.json({ error: 'Missing likerId or likedId' }, { status: 400 });
    }

    // Query the database to check if there is a mutual like
    const query = `
      SELECT COUNT(*) AS match_count
      FROM likes
      WHERE (liker_id = $1 AND liked_id = $2)
         OR (liker_id = $2 AND liked_id = $1);
    `;
    const { rows } = await pool.query(query, [likerId, likedId]);
    const matchCount = parseInt(rows[0].match_count, 10);

    // A mutual match exists if both users have liked each other
    const isMutualMatch = matchCount === 2;

    return NextResponse.json({ isMutualMatch }, { status: 200 });
  } catch (error) {
    console.error('Error checking for mutual match:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
