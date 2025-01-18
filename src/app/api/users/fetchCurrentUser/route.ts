
import { getUserFromSession } from "@/app/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUserFromSession(); 

    return NextResponse.json(user); 
  } catch (error) {
    console.error("Error fetching user from session", error);
    return NextResponse.json(
      { error: "Error fetching user from session" },
      { status: 500 },
    );
  }
}
