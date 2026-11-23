-- K-SUB catalog hub (additive). Safe to re-run.
-- Does NOT replace UGC tables in supabase/schema.sql (reports / spot_* / facility_votes).
-- Catalog writes are service_role only; anon/authenticated get SELECT.

-- ───────────────────────── Shared helpers ─────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

-- ───────────────────────── stations (hub) ─────────────────────────
-- One row per line × place. Example station_uid: 02_239 (Line 2 Hongik Univ.).
-- place_key groups transfer hubs (e.g. hongik-univ for 2호선 + AREX + 경의중앙).

create table if not exists public.stations (
  station_uid text primary key
    check (char_length(station_uid) between 3 and 40),
  place_key text not null
    check (char_length(place_key) between 2 and 80),
  line_code text not null
    check (char_length(line_code) between 1 and 16),
  line_name_ko text not null
    check (char_length(line_name_ko) between 1 and 40),
  name_i18n jsonb not null
    check (
      jsonb_typeof(name_i18n) = 'object'
      and char_length(coalesce(name_i18n ->> 'ko', '')) between 1 and 80
    ),
  slug text
    check (slug is null or char_length(slug) between 1 and 80),
  lat double precision
    check (lat is null or lat between -90 and 90),
  lng double precision
    check (lng is null or lng between -180 and 180),
  highlights jsonb not null default '[]'::jsonb
    check (jsonb_typeof(highlights) = 'array'),
  external_ids jsonb not null default '{}'::jsonb
    check (jsonb_typeof(external_ids) = 'object'),
  data_source text not null default 'manual'
    check (data_source in ('public_csv', 'seoul_api', 'kakao_api', 'manual', 'user', 'gemini')),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stations_place_line_uidx unique (place_key, line_code)
);

create index if not exists stations_place_key_idx on public.stations (place_key);
create index if not exists stations_line_code_idx on public.stations (line_code);
create index if not exists stations_slug_idx on public.stations (slug);
create index if not exists stations_name_i18n_gin on public.stations using gin (name_i18n);
create index if not exists stations_metadata_gin on public.stations using gin (metadata);
create index if not exists stations_highlights_gin on public.stations using gin (highlights);

drop trigger if exists stations_set_updated_at on public.stations;
create trigger stations_set_updated_at
  before update on public.stations
  for each row execute function public.set_updated_at();

-- ───────────────────────── station_facilities ─────────────────────────

create table if not exists public.station_facilities (
  id uuid primary key default gen_random_uuid(),
  station_uid text not null references public.stations (station_uid) on delete cascade,
  facility_type text not null
    check (facility_type in (
      'toilet', 'elevator', 'escalator', 'locker', 'nursing', 'wheelchair', 'other'
    )),
  -- Required semantics for toilets; other types may leave null.
  is_inside_gate boolean,
  is_onestop_ground boolean,
  exit_no text
    check (exit_no is null or char_length(exit_no) <= 40),
  floor text
    check (floor is null or char_length(floor) <= 40),
  detail_i18n jsonb not null default '{}'::jsonb
    check (jsonb_typeof(detail_i18n) = 'object'),
  -- Stable upsert key within (station_uid, facility_type), e.g. "outside|8|B1".
  natural_key text not null
    check (char_length(natural_key) between 1 and 160),
  data_source text not null default 'manual'
    check (data_source in ('public_csv', 'seoul_api', 'kakao_api', 'manual', 'user', 'gemini')),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint station_facilities_toilet_gate_chk
    check (facility_type <> 'toilet' or is_inside_gate is not null),
  constraint station_facilities_natural_uidx unique (station_uid, facility_type, natural_key)
);

create index if not exists station_facilities_station_idx
  on public.station_facilities (station_uid);
create index if not exists station_facilities_type_idx
  on public.station_facilities (facility_type);
create index if not exists station_facilities_inside_gate_idx
  on public.station_facilities (is_inside_gate)
  where is_inside_gate is not null;
create index if not exists station_facilities_onestop_idx
  on public.station_facilities (is_onestop_ground)
  where is_onestop_ground is true;
create index if not exists station_facilities_detail_gin
  on public.station_facilities using gin (detail_i18n);
create index if not exists station_facilities_metadata_gin
  on public.station_facilities using gin (metadata);

drop trigger if exists station_facilities_set_updated_at on public.station_facilities;
create trigger station_facilities_set_updated_at
  before update on public.station_facilities
  for each row execute function public.set_updated_at();

-- ───────────────────────── station_transfers ─────────────────────────

create table if not exists public.station_transfers (
  id uuid primary key default gen_random_uuid(),
  station_uid text not null references public.stations (station_uid) on delete cascade,
  from_line text not null check (char_length(from_line) between 1 and 40),
  to_line text not null check (char_length(to_line) between 1 and 40),
  from_toward text check (from_toward is null or char_length(from_toward) <= 80),
  to_toward text check (to_toward is null or char_length(to_toward) <= 80),
  fast_car_door text check (fast_car_door is null or char_length(fast_car_door) <= 20),
  board_car_door text check (board_car_door is null or char_length(board_car_door) <= 20),
  walk_seconds integer check (walk_seconds is null or walk_seconds between 0 and 3600),
  difficulty smallint check (difficulty is null or difficulty between 1 and 5),
  elevator_tip_i18n jsonb not null default '{}'::jsonb
    check (jsonb_typeof(elevator_tip_i18n) = 'object'),
  -- Deterministic upsert key, e.g. "2호선|신분당선|역삼|양재|5-2".
  natural_key text not null
    check (char_length(natural_key) between 1 and 200),
  data_source text not null default 'public_csv'
    check (data_source in ('public_csv', 'seoul_api', 'kakao_api', 'manual', 'user', 'gemini')),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint station_transfers_natural_uidx unique (station_uid, natural_key)
);

create index if not exists station_transfers_station_idx
  on public.station_transfers (station_uid);
create index if not exists station_transfers_lines_idx
  on public.station_transfers (from_line, to_line);
create index if not exists station_transfers_difficulty_idx
  on public.station_transfers (difficulty)
  where difficulty is not null;
create index if not exists station_transfers_metadata_gin
  on public.station_transfers using gin (metadata);

drop trigger if exists station_transfers_set_updated_at on public.station_transfers;
create trigger station_transfers_set_updated_at
  before update on public.station_transfers
  for each row execute function public.set_updated_at();

-- ───────────────────────── station_pois (Kakao etc., place-scoped) ─────────────────────────
-- place_key matches stations.place_key (300m radius around the hub).
-- station_uid is an optional primary-line anchor that must belong to the same place_key.

create table if not exists public.station_pois (
  id uuid primary key default gen_random_uuid(),
  place_key text not null
    check (char_length(place_key) between 2 and 80),
  station_uid text references public.stations (station_uid) on delete set null,
  external_place_id text not null
    check (char_length(external_place_id) between 1 and 80),
  category text not null
    check (char_length(category) between 1 and 40),
  name text not null
    check (char_length(name) between 1 and 120),
  name_i18n jsonb not null default '{}'::jsonb
    check (jsonb_typeof(name_i18n) = 'object'),
  exit_hint text
    check (exit_hint is null or char_length(exit_hint) <= 40),
  distance_m integer
    check (distance_m is null or distance_m between 0 and 5000),
  rating numeric(3, 2)
    check (rating is null or rating between 0 and 5),
  map_url text
    check (map_url is null or char_length(map_url) <= 500),
  lat double precision
    check (lat is null or lat between -90 and 90),
  lng double precision
    check (lng is null or lng between -180 and 180),
  -- Soft TTL so stale Kakao snapshots can be filtered without deleting history.
  expires_at timestamptz,
  data_source text not null default 'kakao_api'
    check (data_source in ('public_csv', 'seoul_api', 'kakao_api', 'manual', 'user', 'gemini')),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint station_pois_external_uidx unique (place_key, external_place_id)
);

create index if not exists station_pois_place_category_idx
  on public.station_pois (place_key, category);
create index if not exists station_pois_station_idx
  on public.station_pois (station_uid)
  where station_uid is not null;
create index if not exists station_pois_expires_idx
  on public.station_pois (expires_at)
  where expires_at is not null;
create index if not exists station_pois_metadata_gin
  on public.station_pois using gin (metadata);

drop trigger if exists station_pois_set_updated_at on public.station_pois;
create trigger station_pois_set_updated_at
  before update on public.station_pois
  for each row execute function public.set_updated_at();

-- Keep station_uid aligned with place_key when both are set.
create or replace function public.station_pois_place_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  hub text;
begin
  if new.station_uid is null then
    return new;
  end if;
  select s.place_key into hub from public.stations s where s.station_uid = new.station_uid;
  if hub is null then
    raise exception 'station_pois.station_uid % not found', new.station_uid;
  end if;
  if hub <> new.place_key then
    raise exception 'station_pois place_key % does not match stations.place_key %', new.place_key, hub;
  end if;
  return new;
end;
$$;

drop trigger if exists station_pois_place_guard on public.station_pois;
create trigger station_pois_place_guard
  before insert or update on public.station_pois
  for each row execute function public.station_pois_place_guard();

revoke all on function public.station_pois_place_guard() from public, anon, authenticated;

-- ───────────────────────── ai_response_cache ─────────────────────────

create table if not exists public.ai_response_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null
    check (char_length(cache_key) between 8 and 128),
  locale text not null
    check (locale in ('ko', 'en', 'zh', 'zh-tw', 'ja')),
  prompt_fingerprint text
    check (prompt_fingerprint is null or char_length(prompt_fingerprint) <= 128),
  response jsonb not null
    check (jsonb_typeof(response) = 'object' or jsonb_typeof(response) = 'string'),
  hit_count integer not null default 0
    check (hit_count >= 0),
  expires_at timestamptz,
  data_source text not null default 'gemini'
    check (data_source in ('public_csv', 'seoul_api', 'kakao_api', 'manual', 'user', 'gemini')),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_response_cache_key_locale_uidx unique (cache_key, locale)
);

create index if not exists ai_response_cache_expires_idx
  on public.ai_response_cache (expires_at)
  where expires_at is not null;
create index if not exists ai_response_cache_metadata_gin
  on public.ai_response_cache using gin (metadata);

drop trigger if exists ai_response_cache_set_updated_at on public.ai_response_cache;
create trigger ai_response_cache_set_updated_at
  before update on public.ai_response_cache
  for each row execute function public.set_updated_at();

-- Atomic hit bump for cache reads (service_role / server routes).
create or replace function public.touch_ai_cache_hit(p_cache_key text, p_locale text)
returns public.ai_response_cache
language plpgsql
security definer
set search_path = ''
as $$
declare
  row public.ai_response_cache;
begin
  update public.ai_response_cache c
    set hit_count = c.hit_count + 1,
        updated_at = now()
    where c.cache_key = p_cache_key
      and c.locale = p_locale
      and (c.expires_at is null or c.expires_at > now())
    returning * into row;
  return row;
end;
$$;

revoke all on function public.touch_ai_cache_hit(text, text) from public, anon, authenticated;
-- Intentionally not granted to anon: call only with service_role from server code.

-- ───────────────────────── Existing reports: soft link + expires_at ─────────────────────────

alter table public.reports
  add column if not exists expires_at timestamptz;

alter table public.reports
  add column if not exists station_uid text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reports_station_uid_fkey'
  ) then
    alter table public.reports
      add constraint reports_station_uid_fkey
      foreign key (station_uid) references public.stations (station_uid)
      on delete set null;
  end if;
end $$;

create index if not exists reports_expires_at_idx
  on public.reports (expires_at)
  where expires_at is not null;
create index if not exists reports_station_uid_idx
  on public.reports (station_uid)
  where station_uid is not null;

-- Backfill expires_at from type TTL (matches app/_lib/freshness.ts) when missing.
update public.reports
set expires_at = coalesce(last_confirmed_at, created_at)
  + case type
      when 'toilet_paper' then interval '60 minutes'
      when 'escalator' then interval '120 minutes'
      when 'crowd' then interval '30 minutes'
      else interval '90 minutes'
    end
where expires_at is null;

-- Keep expires_at in sync on confirm / insert without breaking existing triggers.
create or replace function public.reports_set_expires_at()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  ttl interval;
  anchor timestamptz;
begin
  ttl := case new.type
    when 'toilet_paper' then interval '60 minutes'
    when 'escalator' then interval '120 minutes'
    when 'crowd' then interval '30 minutes'
    else interval '90 minutes'
  end;
  anchor := coalesce(new.last_confirmed_at, new.created_at, now());
  new.expires_at := anchor + ttl;
  return new;
end;
$$;

drop trigger if exists reports_set_expires_at on public.reports;
create trigger reports_set_expires_at
  before insert or update of type, last_confirmed_at, created_at on public.reports
  for each row execute function public.reports_set_expires_at();

revoke all on function public.reports_set_expires_at() from public, anon, authenticated;

-- ───────────────────────── Privileges (catalog) ─────────────────────────

revoke all on public.stations, public.station_facilities, public.station_transfers,
  public.station_pois, public.ai_response_cache
  from anon, authenticated;

grant select on public.stations, public.station_facilities, public.station_transfers,
  public.station_pois
  to anon, authenticated;

-- AI cache is server-only; no client SELECT grant.
revoke all on public.ai_response_cache from anon, authenticated;

-- New secret API keys authenticate as `service_role` but still need table GRANTs
-- (RLS bypass ≠ privilege bypass on this project).
grant all on public.stations, public.station_facilities, public.station_transfers,
  public.station_pois, public.ai_response_cache
  to service_role;
grant usage on schema public to service_role;

-- ───────────────────────── RLS (catalog = public read, no client writes) ─────────────────────────

alter table public.stations enable row level security;
alter table public.station_facilities enable row level security;
alter table public.station_transfers enable row level security;
alter table public.station_pois enable row level security;
alter table public.ai_response_cache enable row level security;

drop policy if exists "stations are readable" on public.stations;
create policy "stations are readable" on public.stations
  for select to anon, authenticated
  using (true);

drop policy if exists "station_facilities are readable" on public.station_facilities;
create policy "station_facilities are readable" on public.station_facilities
  for select to anon, authenticated
  using (true);

drop policy if exists "station_transfers are readable" on public.station_transfers;
create policy "station_transfers are readable" on public.station_transfers
  for select to anon, authenticated
  using (true);

drop policy if exists "station_pois are readable" on public.station_pois;
create policy "station_pois are readable" on public.station_pois
  for select to anon, authenticated
  using (expires_at is null or expires_at > now());

-- No SELECT/INSERT/UPDATE/DELETE policies on ai_response_cache for anon/authenticated.
-- service_role bypasses RLS for batch upsert and cache hits.

-- Active live reports helper (optional filter for feeds).
create or replace function public.active_reports_for_station(p_station_key text)
returns setof public.reports
language sql
stable
security definer
set search_path = ''
as $$
  select r.*
  from public.reports r
  where r.station_key = p_station_key
    and r.flag_count < 3
    and r.resolved_at is null
    and (r.expires_at is null or r.expires_at > now())
  order by coalesce(r.last_confirmed_at, r.created_at) desc
  limit 50;
$$;

revoke all on function public.active_reports_for_station(text) from public;
grant execute on function public.active_reports_for_station(text) to anon, authenticated;
