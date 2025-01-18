import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "../../../lib/db";
import { createSession } from "@/app/lib/session";

interface RequestBody {
  email: string;
  password: string;
}

export async function POST(req: Request) {
  const { email, password }: RequestBody = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "email and password are required" },
      { status: 400 },
    );
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "invalid email or password" },
        { status: 401 },
      );
    }

    await createSession(user.user_id);

    return NextResponse.json({
      message: "Login successful",
      user: { email: user.email },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error occurred during login" },
      { status: 500 },
    );
  }
}
