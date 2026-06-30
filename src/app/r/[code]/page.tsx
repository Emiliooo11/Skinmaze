import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  params: Promise<{ code: string }>;
}

export default async function ReferralPage({ params }: Props) {
  const { code } = await params;
  const upper = code.toUpperCase();

  // Verify code exists
  const { data: rc } = await supabase
    .from('referral_codes')
    .select('id')
    .eq('code', upper)
    .maybeSingle();

  if (rc) {
    // Fire-and-forget click increment
    try { await supabase.rpc('increment_referral_clicks', { p_code: upper }); } catch {}
  }

  // Set ref cookie (30 days) and redirect to homepage
  const cookieStore = await cookies();
  cookieStore.set('ref_code', upper, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
    secure: true,
  });

  redirect('/');
}
