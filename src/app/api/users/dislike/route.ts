import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

interface RequestBody {
    likerEmail: string;
    likedId: number;
}

export async function POST(req: Request) {


    
        try {
            const { likerEmail, likedId }: RequestBody = await req.json()
            console.log(likerEmail, likedId)
            if (!likerEmail || !likedId) {
                console.error("missing a user email/id in the request body")
                return NextResponse.json({ error: "missing email addresss"}, { status: 400 })
            }

            const likerQuery = 'SELECT user_id FROM users WHERE email = $1';
            

            const likerResult = await pool.query(likerQuery, [likerEmail])
            

            if (likerResult.rows.length === 0) {
                return NextResponse.json({ error: "User not found"}, { status: 404 })
            }

            const liker_id = likerResult.rows[0].user_id;
            

            const insertQuery = `
            INSERT INTO dislikes (disliker_id, disliked_id, created_at)
            VALUES ($1, $2, NOW())
            RETURNING id;
            `

            const insertResult = await pool.query(insertQuery, [liker_id, likedId])

            return NextResponse.json({
                message: "dislike successfully recorded",
                like_id: insertResult.rows[0].id,
            })

        } catch (error) {
            console.error("error handling post request: ", error)
            return NextResponse.json({ error: "internal server error"}, { status: 500 })
        }

}