import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') || '';
  if (host.startsWith('admin.')) {
    const url = request.nextUrl.clone();
    // Don't rewrite API routes — let them resolve normally
    if (url.pathname.startsWith('/api/')) return NextResponse.next();
    const suffix = url.pathname === '/' ? '' : url.pathname;
    url.pathname = '/admin' + suffix;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
