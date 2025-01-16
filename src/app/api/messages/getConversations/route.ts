
import pool from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    // Parse the URL to extract query parameters
    const url = new URL(req.url || '', 'http://localhost');
    const userId = url.searchParams.get('userId');


    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Database query
    const result = await pool.query(
      `WITH ConversationMessages AS (
    SELECT 
    m.message_id AS message_id,
        CASE
            WHEN m.sender_id = $1 THEN m.receiver_id
            ELSE m.sender_id
        END AS participant_id,
        m.sender_id,
        m.receiver_id,
        m.message_text,
        m.created_at
    FROM messages m
    WHERE m.sender_id = $1 OR m.receiver_id = $1
)
SELECT 
    cm.participant_id,
    u.name AS participant_name,
    u.photo AS participant_avatar,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', cm.message_id,
            'sender_id', cm.sender_id,
            'receiver_id', cm.receiver_id,
            'message_text', cm.message_text,
            'created_at', cm.created_at
        ) ORDER BY cm.created_at
    ) AS messages
FROM ConversationMessages cm
JOIN users u ON u.user_id = cm.participant_id
GROUP BY cm.participant_id, u.name, u.photo
ORDER BY MAX(cm.created_at) DESC;
`,
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
