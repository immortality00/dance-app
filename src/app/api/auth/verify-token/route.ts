import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase-admin';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 400 }
      );
    }

    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token);

    // Return the user's role and other relevant information
    return NextResponse.json({
      uid: decodedToken.uid,
      role: decodedToken.role || 'user',
      email: decodedToken.email,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
} 