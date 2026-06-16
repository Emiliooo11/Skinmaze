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
  await supabase.from('image_collections').upsert(cols);
}

export async function deleteImageCollection(id: string) {
  await supabase.from('image_collections').delete().eq('id', id);
}
