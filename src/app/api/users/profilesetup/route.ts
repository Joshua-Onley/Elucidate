import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';


interface RequestBody {
    id: number;
    name: string;
    photo: string;
    email: string;
    age: number;
    gender: 'male' | 'female';
    showUserProfileTo: 'men' | 'women';
    showToUser: 'men' | 'women';
    questions: Array<{
        question: string;
        options: string[];
        correctAnswer: string;
    }>;
}

export async function POST(req: Request) {
    const { id, name, photo, age, gender, showUserProfileTo, showToUser, questions }: RequestBody = await req.json();

    // Validate required fields
    if (!name || !photo || !age || !gender || !showUserProfileTo || !showToUser || !questions || !Array.isArray(questions)) {
        return NextResponse.json(
            { message: 'Name, photo, age, gender, preferences, and questions are required' },
            { status: 400 }
        );
    }

    try {
        await pool.query('BEGIN');

        // Check if the user already exists by email
        const userResult = await pool.query(
            `SELECT user_id FROM users WHERE user_id = $1`,
            [id]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { message: 'User does not exist' },
                { status: 400 }
            );
        }


        // Update the user's name, photo, age, gender, and preferences
        await pool.query(
            `UPDATE users 
             SET name = $1, photo = $2, age = $3, gender = $4, 
                 showUserProfileTo = $5, showToUser = $6 
             WHERE user_id = $7`,
            [
                name,
                photo,
                age,
                gender,
                showUserProfileTo,
                showToUser,
                id,
            ]
        );

        // Insert or update the user's questions
        for (const question of questions) {
            const { question: questionText, options, correctAnswer } = question;

            const questionResult = await pool.query(
                `INSERT INTO questions (user_id, question_text, correct_answer)
                 VALUES ($1, $2, $3)
                 RETURNING id`,
                [id, questionText, correctAnswer]
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
