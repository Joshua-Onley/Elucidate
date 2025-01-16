import pool from '@/app/lib/db';

export async function GET(req: Request) {
    const url = new URL(req.url || '', 'http://localhost');
    const userId = url.searchParams.get('userId');

    // Validate that userId is provided
    if (!userId) {
        return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        // Query the database for the user's photo filename
        const result = await pool.query('SELECT photo FROM users WHERE user_id = $1', [userId]);

        // Check if the user was found and has a photo
        if (result.rows.length === 0) {
            return new Response(
                JSON.stringify({ error: 'User not found or no photo available' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const photo = result.rows[0].photo;

        // Return the photo filename or a default if not available
        return new Response(
            JSON.stringify({ photo: photo || '/default-avatar.jpg' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching user photo:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch user photo' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
