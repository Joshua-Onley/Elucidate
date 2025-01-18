import pool from "@/app/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url || "", "http://localhost");
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await pool.query(
      "SELECT photo FROM users WHERE user_id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "User not found or no photo available" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const photo = result.rows[0].photo;
    return new Response(
      JSON.stringify({ photo: photo || "/default-avatar.jpg" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error fetching user photo:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user photo" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
