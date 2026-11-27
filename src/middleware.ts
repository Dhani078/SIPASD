import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED_PATHS = ['/dashboard', '/arsip-masuk', '/arsip-keluar', '/master', '/laporan'];

async function hasValidSession(token?: string): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' || process.env.CI ? 'ci_build_test_secret_key_minimum_32_characters' : '');
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected) {
    const token = request.cookies.get('sipasd_session')?.value;
    const valid = await hasValidSession(token);
    if (!valid) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const res = NextResponse.redirect(loginUrl);
      if (token) res.cookies.delete('sipasd_session');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/arsip-masuk/:path*', '/arsip-keluar/:path*', '/master/:path*', '/laporan/:path*'],
};
