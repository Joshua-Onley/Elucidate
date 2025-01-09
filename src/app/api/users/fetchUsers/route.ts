import { NextResponse } from 'next/server';
import pool from '@/app/lib/db'; // Adjust the import path to match your project structure

// Define interfaces for user, question, and option
interface Option {
  id: number;
  option: string;
}

interface Question {
  id: number;
  question: string;
  correctAnswer: string;
  options: Option[];
}

interface User {
  id: number;
  name: string;
  photo: string;
  questions: Question[];
}

// asynchronous function that handles a http GET request
export async function GET() {
    try {

        // Query to fetch users along with their questions and options
        const query = `
            SELECT
                u.user_id AS id, u.name, u.photo,
                q.id AS question_id, q.question_text AS question, q.correct_answer,
                o.id AS option_id, o.option_text AS option
            FROM users u
            INNER JOIN questions q ON u.user_id = q.user_id
            INNER JOIN options o ON q.id = o.question_id;
        `;
        
        const result = await pool.query(query);

        // Group data by user
        const users = result.rows.reduce<User[]>((acc, row) => {
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
