-- Seoul Metro first/last train timetable (Lines 1–9).
-- Source: 서울교통공사_지하철 호선별 첫차와 막차 정보(전철역코드,외부코드).csv
-- Safe to re-run.

create table if not exists public.station_first_last (
  id uuid primary key default gen_random_uuid(),
  station_uid text references public.stations (station_uid) on delete set null,
  line_code text not null
    check (char_length(line_code) between 1 and 16),
  line_name_ko text not null
    check (char_length(line_name_ko) between 1 and 40),
  -- CSV 상/하행선: 1=상행, 2=하행 (서울교통공사 코드)
  direction text not null
    check (direction in ('1', '2')),
  direction_label text not null
    check (direction_label in ('상행', '하행')),
  -- CSV 요일: 1=평일, 2=토요일, 3=공휴일
  day_type text not null
    check (day_type in ('1', '2', '3')),
  day_label text not null
    check (day_label in ('평일', '토요일', '공휴일')),
  station_code text not null
    check (char_length(station_code) between 1 and 20),
  external_code text not null
    check (char_length(external_code) between 1 and 20),
  station_name_ko text not null
    check (char_length(station_name_ko) between 1 and 40),
  -- Clock time (00–23). CSV 24:xx/25:xx is normalized to next-day 00:xx; see metadata.*_display / *_past_midnight.
  first_time time,
  first_from_code text,
  first_to_code text,
  first_from_name text,
  first_to_name text,
  last_time time,
  last_from_code text,
  last_to_code text,
  last_from_name text,
  last_to_name text,
  -- line_code|external_code|direction|day_type
  natural_key text not null
    check (char_length(natural_key) between 3 and 80),
  data_source text not null default 'public_csv'
    check (data_source in ('public_csv', 'seoul_api', 'kakao_api', 'manual', 'user', 'gemini')),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint station_first_last_natural_uidx unique (natural_key)
);

create index if not exists station_first_last_station_uid_idx
  on public.station_first_last (station_uid)
  where station_uid is not null;
create index if not exists station_first_last_line_day_idx
  on public.station_first_last (line_code, day_type, direction);
create index if not exists station_first_last_external_idx
  on public.station_first_last (external_code, line_code);
create index if not exists station_first_last_metadata_gin
  on public.station_first_last using gin (metadata);

drop trigger if exists station_first_last_set_updated_at on public.station_first_last;
create trigger station_first_last_set_updated_at
  before update on public.station_first_last
  for each row execute function public.set_updated_at();

revoke all on public.station_first_last from anon, authenticated;
grant select on public.station_first_last to anon, authenticated;
grant all on public.station_first_last to service_role;

alter table public.station_first_last enable row level security;

drop policy if exists "station_first_last are readable" on public.station_first_last;
create policy "station_first_last are readable" on public.station_first_last
  for select to anon, authenticated
  using (true);
