import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sm_session')?.value;
  if (!token) return NextResponse.json(null);
  const user = verifySession(token);
  return NextResponse.json(user);
}
