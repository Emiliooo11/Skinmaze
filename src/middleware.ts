import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';

  // admin.skinmaze.gg  →  rewrite to /admin (keeps subdomain in URL)
  if (host.startsWith('admin.')) {
    const url = req.nextUrl.clone();
    // Already on an /admin path — don't double-prefix
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = '/admin' + (url.pathname === '/' ? '' : url.pathname);
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on every path except static files and internal Next.js routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
