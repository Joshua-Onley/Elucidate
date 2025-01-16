import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db'; // Adjust the path based on your project structure

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderId, receiverId, messageText } = body;

    // Input validation
    if (!senderId || !receiverId || !messageText) {
      return NextResponse.json(
        { error: 'Missing senderId, receiverId, or messageText' },
        { status: 400 }
      );
    }

    // Insert the message into the database
    const query = `
      INSERT INTO messages (sender_id, receiver_id, message_text)
      VALUES ($1, $2, $3)
      RETURNING message_id, created_at;
    `;
    const values = [senderId, receiverId, messageText];
    const { rows } = await pool.query(query, values);
    const newMessage = rows[0];

    return NextResponse.json({
      message: 'Default message created successfully.',
      messageDetails: newMessage,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating default message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
