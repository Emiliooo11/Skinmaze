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
