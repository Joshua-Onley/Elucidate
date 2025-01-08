import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

interface RequestBody {
    name: string;
    photo: string;
    email: string;  // Include email in the request
    questions: Array<{
        question: string;
        options: string[];
        correctAnswer: number;
    }>;
}

export async function POST(req: Request) {
    const { name, photo, email, questions }: RequestBody = await req.json();

    // Check if name, photo, email, and questions are provided
    if (!name || !photo || !email || !questions || !Array.isArray(questions)) {
        return NextResponse.json(
            { message: 'Name, photo, email, and questions are required' },
            { status: 400 }
        );
    }

    try {
        await pool.query('BEGIN');

        // Check if the user already exists by email
        const userResult = await pool.query(
            `SELECT user_id FROM users WHERE email = $1`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { message: 'User does not exist' },
                { status: 400 }
            );
        }

        // Get the user_id from the existing user
        const userId = userResult.rows[0].user_id;

        // Update the user's name and photo
        await pool.query(
            `UPDATE users SET name = $1, photo = $2 WHERE user_id = $3`,
            [name, photo, userId]
        );

        // Insert the user's questions
        for (const question of questions) {
            const { question: questionText, options, correctAnswer } = question;

            const questionResult = await pool.query(
                `INSERT INTO questions (user_id, question_text, correct_answer)
                 VALUES ($1, $2, $3)
                 RETURNING id`,
                [userId, questionText, correctAnswer]
            );

            const questionId = questionResult.rows[0].id;

            // Insert the options for the question
            for (const option of options) {
                await pool.query(
                    `INSERT INTO options (question_id, option_text)
                     VALUES ($1, $2)`,
                    [questionId, option]
                );
            }
        }

        await pool.query('COMMIT');

        return NextResponse.json({ message: 'Profile updated and questions added successfully' });
    } catch (err) {
        // Rollback the transaction in case of an error
        await pool.query('ROLLBACK');
        console.error(err);
        return NextResponse.json({ message: 'Error occurred while setting up profile' }, { status: 500 });
    }
}
