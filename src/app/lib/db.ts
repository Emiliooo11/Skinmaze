import { supabase } from './supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DbCase {
  id: string;
  name: string;
  price: number;
  house_edge: number;
  image_url: string;
  created_at: string;
  skins?: DbSkin[];
}

export interface DbSkin {
  id: string;
  case_id: string;
  market_name: string;
  name: string;
  skin: string;
  image_url: string;
  rarity: string;
  color: string;
  price: number;
  drop_chance: number;
}

export interface DbHomeSection {
  id: string;
  title: string;
  icon: string;
  case_ids: string[];
}

export interface DbImageCollection {
  id: string;
  name: string;
  images: string[];
}

// ── Cases ─────────────────────────────────────────────────────────────────────

export async function fetchCases(): Promise<DbCase[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*, skins:case_skins(*)')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function upsertCase(c: {
  id?: string;
  name: string;
  price: number;
  house_edge: number;
  image_url: string;
  skins: Omit<DbSkin, 'id' | 'case_id'>[];
}): Promise<DbCase | null> {
  const caseId = c.id || crypto.randomUUID();

  const { data: caseRow, error: caseErr } = await supabase
    .from('cases')
    .upsert({ id: caseId, name: c.name, price: c.price, house_edge: c.house_edge, image_url: c.image_url })
    .select()
    .single();
  if (caseErr) { console.error(caseErr); return null; }

  // Replace skins
  await supabase.from('case_skins').delete().eq('case_id', caseId);
  if (c.skins.length > 0) {
    await supabase.from('case_skins').insert(c.skins.map(s => ({ ...s, case_id: caseId })));
  }

  return caseRow;
}

export async function deleteCase(id: string) {
  await supabase.from('cases').delete().eq('id', id);
}

// ── Home layout ───────────────────────────────────────────────────────────────

export async function fetchHomeLayout(): Promise<DbHomeSection[]> {
  const { data } = await supabase.from('home_layout').select('*').order('id');
  return data ?? [];
}

export async function saveHomeLayout(sections: DbHomeSection[]) {
  await supabase.from('home_layout').upsert(sections);
}

// ── Image collections ─────────────────────────────────────────────────────────

export async function fetchImageCollections(): Promise<DbImageCollection[]> {
  const { data } = await supabase.from('image_collections').select('*').order('name');
  return data ?? [];
}

export async function saveImageCollections(cols: DbImageCollection[]) {
  // Delete collections no longer present
  const ids = cols.map(c => c.id);
  if (ids.length > 0) {
    await supabase.from('image_collections').delete().not('id', 'in', `(${ids.map(id => `'${id}'`).join(',')})`);
  } else {
    await supabase.from('image_collections').delete().neq('id', '');
  }
  if (cols.length > 0) {
    const { error } = await supabase.from('image_collections').upsert(cols);
    if (error) { console.error('saveImageCollections error:', error); throw error; }
  }
}

export async function deleteImageCollection(id: string) {
  await supabase.from('image_collections').delete().eq('id', id);
}

// ── Players ───────────────────────────────────────────────────────────────────

export interface DbPlayer {
  id: string;
  username: string;
  email: string;
  steam_id: string;
  balance: number;
  total_wagered: number;
  cases_opened: number;
  status: string;
  created_at: string;
  last_active: string;
}

export async function fetchPlayers(): Promise<DbPlayer[]> {
  const { data } = await supabase.from('players').select('*').order('created_at', { ascending: false });
  return data ?? [];
}

export async function upsertPlayer(p: Partial<DbPlayer> & { id?: string }): Promise<DbPlayer | null> {
  const { data, error } = await supabase.from('players').upsert({ id: p.id || crypto.randomUUID(), ...p }).select().single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function deletePlayer(id: string) {
  await supabase.from('players').delete().eq('id', id);
}

// ── Wagers ────────────────────────────────────────────────────────────────────

export interface DbWager {
  id: string;
  player_id: string;
  case_id: string;
  case_name: string;
  amount: number;
  won_item: string;
  won_value: number;
  profit: number;
  created_at: string;
}

export async function fetchWagers(limit = 500): Promise<DbWager[]> {
  const { data } = await supabase.from('wagers').select('*').order('created_at', { ascending: false }).limit(limit);
  return data ?? [];
}

export interface DashboardStats {
  totalPlayers: number;
  activePlayers24h: number;
  newRegistrations24h: number;
  newRegistrations7d: number;
  newRegistrations30d: number;
  casesOpened24h: number;
  casesOpened7d: number;
  casesOpened30d: number;
  wagerTotal24h: number;
  wagerTotal7d: number;
  wagerTotal30d: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const t24h = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
  const t7d  = new Date(now.getTime() - 7  * 86400 * 1000).toISOString();
  const t30d = new Date(now.getTime() - 30 * 86400 * 1000).toISOString();

  const [{ count: totalPlayers }, { count: active24h }, { count: reg24h }, { count: reg7d }, { count: reg30d },
         { count: cases24h }, { count: cases7d }, { count: cases30d },
         wagers24h, wagers7d, wagers30d] = await Promise.all([
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('players').select('*', { count: 'exact', head: true }).gte('last_active', t24h),
    supabase.from('players').select('*', { count: 'exact', head: true }).gte('created_at', t24h),
    supabase.from('players').select('*', { count: 'exact', head: true }).gte('created_at', t7d),
    supabase.from('players').select('*', { count: 'exact', head: true }).gte('created_at', t30d),
    supabase.from('wagers').select('*', { count: 'exact', head: true }).gte('created_at', t24h),
    supabase.from('wagers').select('*', { count: 'exact', head: true }).gte('created_at', t7d),
    supabase.from('wagers').select('*', { count: 'exact', head: true }).gte('created_at', t30d),
    supabase.from('wagers').select('amount').gte('created_at', t24h),
    supabase.from('wagers').select('amount').gte('created_at', t7d),
    supabase.from('wagers').select('amount').gte('created_at', t30d),
  ]);

  const sum = (rows: { data: { amount: number }[] | null }) =>
    (rows.data ?? []).reduce((a, r) => a + (r.amount || 0), 0);

  return {
    totalPlayers: totalPlayers ?? 0,
    activePlayers24h: active24h ?? 0,
    newRegistrations24h: reg24h ?? 0,
    newRegistrations7d:  reg7d  ?? 0,
    newRegistrations30d: reg30d ?? 0,
    casesOpened24h: cases24h ?? 0,
    casesOpened7d:  cases7d  ?? 0,
    casesOpened30d: cases30d ?? 0,
    wagerTotal24h: sum(wagers24h as any),
    wagerTotal7d:  sum(wagers7d  as any),
    wagerTotal30d: sum(wagers30d as any),
  };
}

// ── Affiliates ────────────────────────────────────────────────────────────────

export interface DbAffiliate {
  id: string;
  name: string;
  email: string;
  platform: string;
  commission_pct: number;
  notes: string;
  created_at: string;
}

export interface DbReferralCode {
  id: string;
  affiliate_id: string;
  code: string;
  created_at: string;
  // Extended rule fields
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  reward_type: 'coins' | 'free_cases' | 'deposit_bonus' | null;
  reward_value: number;
  clicks: number;
  description: string;
}

export interface DbReferralUse {
  id: string;
  code_id: string;
  player_id: string;
  wager_amount: number;
  created_at: string;
}

export async function fetchAffiliates(): Promise<DbAffiliate[]> {
  const { data } = await supabase.from('affiliates').select('*').order('created_at', { ascending: false });
  return data ?? [];
}

export async function upsertAffiliate(a: Partial<DbAffiliate>): Promise<DbAffiliate | null> {
  const { data, error } = await supabase.from('affiliates')
    .upsert({ id: a.id || crypto.randomUUID(), ...a }).select().single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function deleteAffiliate(id: string) {
  await supabase.from('affiliates').delete().eq('id', id);
}

export async function fetchReferralCodes(affiliateId: string): Promise<DbReferralCode[]> {
  const { data } = await supabase.from('referral_codes').select('*').eq('affiliate_id', affiliateId).order('created_at', { ascending: false });
  return data ?? [];
}

export async function createReferralCode(
  affiliateId: string,
  code: string,
  opts?: {
    max_uses?: number | null;
    expires_at?: string | null;
    reward_type?: DbReferralCode['reward_type'];
    reward_value?: number;
    description?: string;
  }
): Promise<DbReferralCode | null> {
  const { data, error } = await supabase.from('referral_codes')
    .insert({
      affiliate_id: affiliateId,
      code,
      max_uses: opts?.max_uses ?? null,
      expires_at: opts?.expires_at ?? null,
      reward_type: opts?.reward_type ?? null,
      reward_value: opts?.reward_value ?? 0,
      description: opts?.description ?? '',
      used_count: 0,
      clicks: 0,
    }).select().single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function updateReferralCode(
  id: string,
  updates: Partial<Pick<DbReferralCode, 'max_uses' | 'expires_at' | 'reward_type' | 'reward_value' | 'description'>>
): Promise<DbReferralCode | null> {
  const { data, error } = await supabase.from('referral_codes')
    .update(updates).eq('id', id).select().single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function incrementReferralClick(code: string): Promise<void> {
  await supabase.rpc('increment_referral_clicks', { p_code: code });
}

export async function fetchReferralCodeByCode(code: string): Promise<DbReferralCode | null> {
  const { data } = await supabase.from('referral_codes').select('*').eq('code', code).maybeSingle();
  return data ?? null;
}

export async function recordReferralUse(codeId: string, playerId: string): Promise<boolean> {
  const { error } = await supabase.from('referral_uses').insert({ code_id: codeId, player_id: playerId, wager_amount: 0 });
  if (error) { console.error(error); return false; }
  try { await supabase.rpc('increment_referral_used_count', { p_code_id: codeId }); } catch {}
  return true;
}

export async function deleteReferralCode(id: string) {
  await supabase.from('referral_codes').delete().eq('id', id);
}

export async function fetchReferralUses(codeId: string): Promise<DbReferralUse[]> {
  const { data } = await supabase.from('referral_uses').select('*').eq('code_id', codeId).order('created_at', { ascending: false });
  return data ?? [];
}

export async function fetchAllReferralUses(): Promise<(DbReferralUse & { code: string; affiliate_id: string })[]> {
  const { data } = await supabase
    .from('referral_uses')
    .select('*, referral_codes(code, affiliate_id)')
    .order('created_at', { ascending: false });
  return (data ?? []).map((r: any) => ({
    ...r,
    code: r.referral_codes?.code ?? '',
    affiliate_id: r.referral_codes?.affiliate_id ?? '',
  }));
}
