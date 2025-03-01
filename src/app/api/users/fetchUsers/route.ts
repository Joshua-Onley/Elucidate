import { NextResponse } from "next/server";
import pool from "@/app/lib/db"; 


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
  gender: "male" | "female";
  showUserProfileTo: "male" | "female";
  questions: Question[];
}

export async function GET(req: Request) {
  try {
    
    const authHeader = req.headers.get("Authorization");
    const currentUserId = authHeader?.replace("Bearer ", "").trim() || "";

    if (!currentUserId) {
      return NextResponse.json(
        { message: "Unauthorized request" },
        { status: 401 },
      );
    }
    
    const currentUserResult = await pool.query(
      `SELECT gender, showtouser FROM users WHERE user_id = $1`,
      [currentUserId],
    );

    if (currentUserResult.rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const currentUser = currentUserResult.rows[0];
    const { gender: currentUserGender, showtouser } = currentUser;

    const query = `
            SELECT
    u.user_id AS id, u.name, u.photo, u.gender, u.showuserprofileto,
    q.id AS question_id, q.question_text AS question, q.correct_answer,
    o.id AS option_id, o.option_text AS option
FROM users u
INNER JOIN questions q ON u.user_id = q.user_id
INNER JOIN options o ON q.id = o.question_id
WHERE u.user_id != $1
  AND u.showuserprofileto = $2
  AND u.gender = $3
  AND u.user_id NOT IN (
      SELECT liked_id FROM likes WHERE liker_id = $1
      UNION
      SELECT disliked_id FROM dislikes WHERE disliker_id = $1
  );

            
        `;

    
    const result = await pool.query(query, [
      currentUserId,
      currentUserGender,
      showtouser,
    ]);

    const users = result.rows.reduce<User[]>((acc, row) => {
      let user = acc.find((u) => u.id === row.id);
      if (!user) {
        user = {
          id: row.id,
          name: row.name,
          photo: row.photo,
          gender: row.gender,
          showUserProfileTo: row.showuserprofileto,
          questions: [],
        };
        acc.push(user);
      }

      const questionIndex = user.questions.findIndex(
        (q) => q.id === row.question_id,
      );
      if (questionIndex === -1) {
        user.questions.push({
          id: row.question_id,
          question: row.question,
          correctAnswer: row.correct_answer,
          options: [{ id: row.option_id, option: row.option }],
        });
      } else {
        user.questions[questionIndex].options.push({
          id: row.option_id,
          option: row.option,
        });
      }

      return acc;
    }, []);

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
