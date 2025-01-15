import pool from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
      const { senderId, receiverId, messageText } = await req.json();
      
      // Ensure senderId, receiverId, and messageText are not null
      if (!senderId || !receiverId || !messageText) {
        return NextResponse.json(
          { message: 'Sender ID, Receiver ID, and Message Text are required' },
          { status: 400 }
        );
      }
  
      // Get the current timestamp
      const createdAt = new Date().toISOString();
  
      // Insert the new message into the database
      const result = await pool.query(
        'INSERT INTO messages (sender_id, receiver_id, message_text, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [senderId, receiverId, messageText, createdAt]
      );
      
      // Return the inserted message data in the response
      return NextResponse.json(result.rows[0], { status: 201 });
  
    } catch (error) {
      console.error('Error inserting message:', error);
      return NextResponse.json(
        { message: 'Failed to send message' },
        { status: 500 }
      );
    }
  }