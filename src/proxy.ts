import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') || '';
  if (host.startsWith('admin.')) {
    const url = request.nextUrl.clone();
    // Don't rewrite API routes or public static files (images, fonts, etc.)
    if (url.pathname.startsWith('/api/')) return NextResponse.next();
    if (/\.[a-z0-9]+$/i.test(url.pathname)) return NextResponse.next();
    const suffix = url.pathname === '/' ? '' : url.pathname;
    url.pathname = '/admin' + suffix;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
