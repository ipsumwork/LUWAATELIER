import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE = 'editor_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

// Create a signed token that survives server restarts
function createToken(timestamp: number): string {
  const secret = process.env.EDITOR_SECRET || '';
  const data = `editor:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
  return `${data}:${signature}`;
}

// Verify token signature and expiry
function verifyToken(token: string): boolean {
  const secret = process.env.EDITOR_SECRET || '';
  const parts = token.split(':');
  if (parts.length !== 3) return false;

  const [prefix, timestamp, signature] = parts;
  if (prefix !== 'editor') return false;

  // Check expiry
  const tokenTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - tokenTime > SESSION_MAX_AGE) return false;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${prefix}:${timestamp}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// POST - Login with password
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Verify against environment variable
    if (password !== process.env.EDITOR_SECRET) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate signed session token
    const timestamp = Math.floor(Date.now() / 1000);
    const sessionToken = createToken(timestamp);

    // Set httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// GET - Check if authenticated
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (!session || !verifyToken(session.value)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

// DELETE - Logout
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ success: true });
}

// Helper to verify session (used by other API routes)
export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session ? verifyToken(session.value) : false;
}
