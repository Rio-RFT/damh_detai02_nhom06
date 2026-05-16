import { NextResponse } from 'next/server';
import { signJwt } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    // In a real app, you might save the customer to DB here
    const user = {
      id: Date.now(),
      name,
      phone,
      role: 'customer'
    };

    const token = signJwt(user);

    const response = NextResponse.json({ success: true, user });
    
    // Set token in an HTTP-only cookie for security
    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
