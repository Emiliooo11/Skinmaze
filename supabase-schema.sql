-- Cases table
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) default 0,
  house_edge numeric(5,2) default 9,
  image_url text default '',
  created_at timestamptz default now()
);

-- Skins inside each case
create table if not exists case_skins (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id) on delete cascade,
  market_name text not null,
  name text,
  skin text,
  image_url text,
  rarity text,
  color text,
  price numeric(10,2) default 0,
  drop_chance numeric(8,4) default 0
);

-- Home layout (4 sections)
create table if not exists home_layout (
  id text primary key,   -- 'section1' .. 'section4'
  title text not null,
  icon text default '',
  case_ids text[] default '{}'
);

-- Image library collections
create table if not exists image_collections (
  id text primary key,
  name text not null,
  images text[] default '{}'
);

-- Players
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  email text,
  steam_id text,
  balance numeric(10,2) default 0,
  total_wagered numeric(12,2) default 0,
  cases_opened integer default 0,
  status text default 'active',
  created_at timestamptz default now(),
  last_active timestamptz default now()
);

-- Wagers (case openings)
create table if not exists wagers (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete set null,
  case_id uuid references cases(id) on delete set null,
  case_name text,
  amount numeric(10,2),
  won_item text,
  won_item_image text,
  won_item_color text,
  won_value numeric(10,2),
  profit numeric(10,2),
  player_name text,
  player_avatar text,
  created_at timestamptz default now()
);

-- Affiliates
create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  platform text default '',
  commission_pct numeric(5,2) default 5,
  notes text default '',
  created_at timestamptz default now()
);

-- Referral codes (one affiliate can have many)
create table if not exists referral_codes (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliates(id) on delete cascade,
  code text unique not null,
  created_at timestamptz default now()
);

-- Referral uses (when a player signs up or deposits using a code)
create table if not exists referral_uses (
  id uuid primary key default gen_random_uuid(),
  code_id uuid references referral_codes(id) on delete cascade,
  player_id uuid references players(id) on delete set null,
  wager_amount numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- Enable RLS on new tables
alter table players enable row level security;
alter table wagers enable row level security;
alter table affiliates enable row level security;
alter table referral_codes enable row level security;
alter table referral_uses enable row level security;

create policy "public read players" on players for select using (true);
create policy "public write players" on players for all using (true);
create policy "public read wagers" on wagers for select using (true);
create policy "public write wagers" on wagers for all using (true);
create policy "public read affiliates" on affiliates for select using (true);
create policy "public write affiliates" on affiliates for all using (true);
create policy "public read referral_codes" on referral_codes for select using (true);
create policy "public write referral_codes" on referral_codes for all using (true);
create policy "public read referral_uses" on referral_uses for select using (true);
create policy "public write referral_uses" on referral_uses for all using (true);

-- Insert default home layout rows
insert into home_layout (id, title, icon, case_ids) values
  ('section1', 'Knives Collection',      '🔪', '{}'),
  ('section2', 'Gloves Collection',      '🧤', '{}'),
  ('section3', 'Ruby Knifes Collection', '🍁', '{}'),
  ('section4', 'Best Sellers',           '⭐', '{}')
on conflict (id) do nothing;

-- Enable RLS but allow all for now (add auth later)
alter table cases enable row level security;
alter table case_skins enable row level security;
alter table home_layout enable row level security;
alter table image_collections enable row level security;

create policy "public read cases" on cases for select using (true);
create policy "public write cases" on cases for all using (true);
create policy "public read case_skins" on case_skins for select using (true);
create policy "public write case_skins" on case_skins for all using (true);
create policy "public read home_layout" on home_layout for select using (true);
create policy "public write home_layout" on home_layout for all using (true);
create policy "public read image_collections" on image_collections for select using (true);
create policy "public write image_collections" on image_collections for all using (true);

-- Storage bucket for cached images (skin images + case images)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "public read images" on storage.objects for select using (bucket_id = 'images');
create policy "public upload images" on storage.objects for insert with check (bucket_id = 'images');
create policy "public update images" on storage.objects for update using (bucket_id = 'images');
create policy "public delete images" on storage.objects for delete using (bucket_id = 'images');
