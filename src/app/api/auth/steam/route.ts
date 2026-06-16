import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://skinmaze.gg';
  const returnTo = `${baseUrl}/api/auth/steam/callback`;

  const cookieStore = await cookies();
  cookieStore.set('steam_pending', JSON.stringify({ name, email }), {
    httpOnly: true, maxAge: 300, path: '/', sameSite: 'lax',
  });

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnTo,
    'openid.realm': baseUrl,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  return NextResponse.redirect(`https://steamcommunity.com/openid/login?${params}`);
}
