import pool from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { senderId, receiverId, messageText } = await req.json();

    if (!senderId || !receiverId || !messageText) {
      return NextResponse.json(
        { message: "Sender ID, Receiver ID, and Message Text are required" },
        { status: 400 },
      );
    }

    const createdAt = new Date().toISOString();

    const result = await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, message_text, created_at) VALUES ($1, $2, $3, $4) RETURNING *",
      [senderId, receiverId, messageText, createdAt],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error inserting message:", error);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 },
    );
  }
}
