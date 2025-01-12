// /app/api/users/fetchCurrentUser/route.ts

import { getUserFromSession } from '@/app/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getUserFromSession(); // Assuming this returns an object like { id: number }
    console.log(user);
    return NextResponse.json(user); // Respond with the user data as JSON
  } catch (error) {
    console.error("Error fetching user from session", error);
    return NextResponse.json({ error: 'Error fetching user from session' }, { status: 500 });
  }
}
