import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import fs from 'fs';  // If saving files locally, or use a cloud storage API if necessary
import path from 'path';

export async function POST(req: Request) {
    // Parse form data
    const formData = await req.formData();
    
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const age = formData.get('age') as string;
    const gender = formData.get('gender') as string;
    const showUserProfileTo = formData.get('showUserProfileTo') as string;
    const showToUser = formData.get('showToUser') as string;
    const questionsJson = formData.get('questions') as string;
    
    const photo = formData.get('file') as File;

    // Validate required fields
    if (!id || !name || !photo || !age || !gender || !showUserProfileTo || !showToUser || !questionsJson) {
        return NextResponse.json(
            { message: 'Name, photo, age, gender, preferences, and questions are required' },
            { status: 400 }
        );
    }

    let questions;
    try {
        questions = JSON.parse(questionsJson);
    } catch (err) {
        console.error(err)
        return NextResponse.json(
            { message: 'Invalid questions format' },
            { status: 400 }
        );
    }

    try {
        await pool.query('BEGIN');

        // Check if the user exists by ID
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

        // Save the file (this is just an example, adapt as necessary)
        const uploadDir = path.join(process.cwd(), './public');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Save the photo and generate a relative URL
        const photoName = Date.now() + '-' + photo.name; // Ensure a unique name
        const photoPath = path.join(uploadDir, photoName);

        // Write the file to the disk
        await fs.promises.writeFile(photoPath, Buffer.from(await photo.arrayBuffer()));

        // Store the relative URL of the photo
        const relativePhotoUrl = `${photoName}`;

        // Update user profile with the relative photo URL
        await pool.query(
            `UPDATE users 
             SET name = $1, photo = $2, age = $3, gender = $4, 
                 showUserProfileTo = $5, showToUser = $6 
             WHERE user_id = $7`,
            [
                name,
                relativePhotoUrl, // Store the relative URL of the photo
                parseInt(age), // Convert age to number
                gender,
                showUserProfileTo,
                showToUser,
                parseInt(id), // Convert id to number
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
