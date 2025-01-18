import { deleteSession } from '@/app/lib/session'; // Adjust the import path based on your structure
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await deleteSession(); // Call your session deletion function
    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ message: 'Failed to log out' }, { status: 500 });
  }
}
