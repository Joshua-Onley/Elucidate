import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { SessionPayload } from '@/app/lib/definitions'
import { cookies } from 'next/headers'
 
const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
 
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}
 
export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.error('Failed to verify session', error)
  }
}


export async function createSession(userId: number) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week expiration
    const sessionData = {
        userId,
        expiresAt: expiresAt.toISOString(), // Store the expiration time as an ISO string
    };
    
    // Encrypt the session data
    const session = await encrypt(sessionData);

    // Get the cookie store
    const cookieStore = await cookies();

    // Set the encrypted session data in the cookie
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: true, // Ensure it's secure in production
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}

  export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
  }

  export async function getUserFromSession() {
    const cookieStore = await cookies(); // Ensure this is awaited
    const sessionToken = cookieStore.get('session')?.value;
  
    if (!sessionToken) {
      throw new Error('No session cookie found');
    }
  
    try {
      // Verify and decode the JWT using the correct method from `jose`
      const { payload } = await jwtVerify(sessionToken, encodedKey, {
        algorithms: ['HS256'],
      });
  
      // Return the payload containing userId and other data
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired session token');
    }
  }
  