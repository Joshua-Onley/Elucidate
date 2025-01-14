
import pool from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    // Parse the URL to extract query parameters
    const url = new URL(req.url || '', 'http://localhost'); // Base URL needed for parsing
    const userId = url.searchParams.get('userId'); // Extract userId from query string

    console.log('Received userId:', userId);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Database query
    const result = await pool.query(
      `SELECT DISTINCT 
          CASE
              WHEN m.sender_id = $1 THEN m.receiver_id
              ELSE m.sender_id
          END AS participant_id,
          u.name AS participant_name,
          u.photo AS participant_avatar,
          m.message_text AS last_message,
          m.created_at AS last_message_time
      FROM messages m
      JOIN users u ON u.user_id = 
          CASE 
              WHEN m.sender_id = $1 THEN m.receiver_id
              ELSE m.sender_id
          END
      WHERE (m.sender_id = $1 OR m.receiver_id = $1)
      ORDER BY m.created_at DESC;`,
      [userId]
    );

    const conversations = result.rows;

    return new Response(
      JSON.stringify(conversations),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch conversations' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
