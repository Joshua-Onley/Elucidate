import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

interface RequestBody {
    liker_email: string;
    liked_email: string;
}

export async function POST(req: Request) {


    
        try {
            const { liker_email, liked_email }: RequestBody = await req.json()
            if (!liker_email || !liked_email) {
                console.error("missing a user email in the request body")
                return NextResponse.json({ error: "missing email addresss"}, { status: 400 })
            }

            const likerQuery = 'SELECT user_id FROM users WHERE user_id = $1';
            const likedQuery = 'SELECT user_id FROM users WHERE user_id = $1';

            const likerResult = await pool.query(likerQuery, [liker_email])
            const likedResult = await pool.query(likedQuery, [liked_email])

            if (likerResult.rows.length === 0 || likedResult.rows.length === 0) {
                return NextResponse.json({ error: "User(s) not found"}, { status: 404 })
            }

            const liker_id = likerResult.rows[0].user_id;
            const liked_id = likedResult.rows[0].user_id; 

            const insertQuery = `
            INSERT INTO likes (liker_id, liked_id, created_at)
            VALUES ($1, $2, NOW())
            RETURNING id;
            `

            const insertResult = await pool.query(insertQuery, [liker_id, liked_id])

            return NextResponse.json({
                message: "Like successfully recorded",
                like_id: insertResult.rows[0].id,
            })

        } catch (error) {
            console.error("error handling post request: ", error)
            return NextResponse.json({ error: "internal server error"}, { status: 500 })
        }

}