import { NextResponse } from 'next/server';
import pool from '@/app/lib/db'; // Adjust the import path to match your project structure

export async function GET(request: Request) {
    try {
        // Extract query parameters for pagination
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '10');  // Default to 10 users per request
        const offset = parseInt(url.searchParams.get('offset') || '0'); // Default to start from the first user

        // Query to fetch users along with their questions and options
        const query = `
            SELECT
                u.user_id AS id, u.name, u.photo,
                q.id AS question_id, q.question_text AS question, q.correct_answer,
                o.id AS option_id, o.option_text AS option
            FROM users u
            LEFT JOIN questions q ON u.user_id = q.user_id
            LEFT JOIN options o ON q.id = o.question_id
            LIMIT $1 OFFSET $2;
        `;
        
        const result = await pool.query(query, [limit, offset]);

        // Group data by user
        const users = result.rows.reduce((acc: any[], row: any) => {
            let user = acc.find(u => u.id === row.id);
            if (!user) {
                user = {
                    id: row.id,
                    name: row.name,
                    photo: row.photo,
                    questions: []
                };
                acc.push(user);
            }
            
            const questionIndex = user.questions.findIndex(q => q.id === row.question_id);
            if (questionIndex === -1) {
                user.questions.push({
                    id: row.question_id,
                    question: row.question,
                    correctAnswer: row.correct_answer,
                    options: [{ id: row.option_id, option: row.option }]
                });
            } else {
                user.questions[questionIndex].options.push({ id: row.option_id, option: row.option });
            }

            return acc;
        }, []);

        return NextResponse.json(users);

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
