import { NextResponse } from 'next/server';
import { signJwt } from '@/lib/jwt';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/hash';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Find user in DB
    const user = await db.account.findUnique({
      where: { username }
    });

    if (user && await verifyPassword(password, user.password)) {
      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      };

      const token = signJwt(payload);
      const response = NextResponse.json({ success: true, user: payload });
      
      response.cookies.set('staff_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
