import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.get('session'); // Replace 'session' with your cookie name

  if (!isLoggedIn) {
    const loginUrl = new URL('/', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next(); // Allow the request to proceed
}

// Apply middleware to specific routes
export const config = {
  matcher: ['/home'], // Add all protected routes here
};
