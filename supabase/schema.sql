-- 지하철꿀정보 · Supabase schema
-- Run once in Supabase Dashboard → SQL Editor (safe to re-run).
-- Every visitor gets an anonymous per-device account (Authentication → Sign In / Providers → Anonymous sign-ins: ON).
-- The browser only ever holds the publishable/anon key; row level security below is what protects the data.

-- ───────────────────────── Live station reports ─────────────────────────

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  station_key text not null check (char_length(station_key) between 1 and 60),
  station_name jsonb not null check (jsonb_typeof(station_name) = 'object' and octet_length(station_name::text) <= 600),
  type text not null check (type in ('toilet_paper', 'escalator', 'crowd', 'general')),
  text jsonb not null check (
    jsonb_typeof(text) = 'object'
    and char_length(coalesce(text ->> 'ko', '')) between 1 and 60
    and octet_length(text::text) <= 1200
  ),
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  confirm_count integer not null default 0,
  last_confirmed_at timestamptz,
  resolve_count integer not null default 0,
  resolved_at timestamptz
);
create index if not exists reports_station_idx on public.reports (station_key, created_at desc);
create index if not exists reports_author_idx on public.reports (author_id, created_at desc);

-- "Still true" (+1 and restarts the TTL for everyone).
create table if not exists public.report_confirmations (
  report_id uuid not null references public.reports (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

-- "Resolved": hides the report for the voter; for everyone once the author or 2 people resolve it.
create table if not exists public.report_resolutions (
  report_id uuid not null references public.reports (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

create or replace function public.on_report_confirmation() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.reports
      set confirm_count = confirm_count + 1, last_confirmed_at = new.created_at
      where id = new.report_id;
  else
    update public.reports
      set confirm_count = greatest(confirm_count - 1, 0),
          last_confirmed_at = (
            select max(c.created_at) from public.report_confirmations c where c.report_id = old.report_id
          )
      where id = old.report_id;
  end if;
  return null;
end $$;

drop trigger if exists report_confirmation_count on public.report_confirmations;
create trigger report_confirmation_count after insert or delete on public.report_confirmations
  for each row execute function public.on_report_confirmation();

create or replace function public.on_report_resolution() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.reports r
    set resolve_count = r.resolve_count + 1,
        resolved_at = case
          when r.resolved_at is null and (r.author_id = new.user_id or r.resolve_count + 1 >= 2) then now()
          else r.resolved_at
        end
    where r.id = new.report_id;
  return null;
end $$;

drop trigger if exists report_resolution_count on public.report_resolutions;
create trigger report_resolution_count after insert on public.report_resolutions
  for each row execute function public.on_report_resolution();

-- ───────────────────────── 꿀스팟 (line plazas) ─────────────────────────

create table if not exists public.spot_posts (
  id uuid primary key default gen_random_uuid(),
  line text not null check (char_length(line) between 1 and 20),
  station text check (station is null or char_length(station) between 1 and 30),
  author text not null check (char_length(author) between 1 and 10),
  category text not null check (category in ('commute', 'food', 'lost', 'free')),
  title text not null check (char_length(btrim(title)) between 1 and 40),
  body text not null check (char_length(btrim(body)) between 1 and 300),
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  like_count integer not null default 0,
  comment_count integer not null default 0,
  view_count integer not null default 0
);
create index if not exists spot_posts_line_idx on public.spot_posts (line, created_at desc);
create index if not exists spot_posts_author_idx on public.spot_posts (author_id, created_at desc);

create table if not exists public.spot_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.spot_posts (id) on delete cascade,
  station text check (station is null or char_length(station) between 1 and 30),
  author text not null check (char_length(author) between 1 and 10),
  text text not null check (char_length(btrim(text)) between 1 and 150),
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists spot_comments_post_idx on public.spot_comments (post_id, created_at);
create index if not exists spot_comments_author_idx on public.spot_comments (author_id);

create table if not exists public.spot_likes (
  post_id uuid not null references public.spot_posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.spot_scraps (
  post_id uuid not null references public.spot_posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Keyed by a random per-device id so read-only visitors count without creating an account.
create table if not exists public.spot_views (
  post_id uuid not null references public.spot_posts (id) on delete cascade,
  viewer uuid not null,
  created_at timestamptz not null default now(),
  primary key (post_id, viewer)
);

-- Counter columns are written only by these triggers (clients have no UPDATE grant on spot_posts).
create or replace function public.on_spot_counter() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  delta integer;
  target uuid;
begin
  if tg_op = 'INSERT' then
    delta := 1;
    target := new.post_id;
  else
    delta := -1;
    target := old.post_id;
  end if;
  if tg_table_name = 'spot_likes' then
    update public.spot_posts set like_count = greatest(like_count + delta, 0) where id = target;
  elsif tg_table_name = 'spot_comments' then
    update public.spot_posts set comment_count = greatest(comment_count + delta, 0) where id = target;
  elsif tg_table_name = 'spot_views' then
    update public.spot_posts set view_count = greatest(view_count + delta, 0) where id = target;
  end if;
  return null;
end $$;

drop trigger if exists spot_like_count on public.spot_likes;
create trigger spot_like_count after insert or delete on public.spot_likes
  for each row execute function public.on_spot_counter();
drop trigger if exists spot_comment_count on public.spot_comments;
create trigger spot_comment_count after insert or delete on public.spot_comments
  for each row execute function public.on_spot_counter();
drop trigger if exists spot_view_count on public.spot_views;
create trigger spot_view_count after insert on public.spot_views
  for each row execute function public.on_spot_counter();

-- ───────────────────────── Facility "working now?" votes ─────────────────────────

create table if not exists public.facility_votes (
  facility_id text not null check (char_length(facility_id) between 1 and 120),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vote text not null check (vote in ('ok', 'broken')),
  updated_at timestamptz not null default now(),
  primary key (facility_id, user_id)
);
create index if not exists facility_votes_recent_idx on public.facility_votes (facility_id, updated_at desc);

create or replace function public.touch_facility_vote() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists facility_vote_touch on public.facility_votes;
create trigger facility_vote_touch before update on public.facility_votes
  for each row execute function public.touch_facility_vote();

-- Recent tallies without exposing who voted.
create or replace function public.facility_vote_counts(ids text[])
returns table (facility_id text, ok integer, broken integer)
language sql stable security definer set search_path = '' as $$
  select v.facility_id,
         count(*) filter (where v.vote = 'ok')::integer,
         count(*) filter (where v.vote = 'broken')::integer
  from public.facility_votes v
  where v.facility_id = any (ids[1:50]) and v.updated_at > now() - interval '24 hours'
  group by v.facility_id
$$;

-- ───────────────────────── Privileges ─────────────────────────
-- Column-level grants: clients can only write content columns; ids, authors, timestamps and counters come from defaults/triggers.

revoke all on public.reports, public.report_confirmations, public.report_resolutions,
  public.spot_posts, public.spot_comments, public.spot_likes, public.spot_scraps, public.spot_views,
  public.facility_votes from anon, authenticated;

grant select on public.reports, public.spot_posts, public.spot_comments to anon, authenticated;
grant select on public.report_confirmations, public.report_resolutions,
  public.spot_likes, public.spot_scraps, public.facility_votes to authenticated;

grant insert (station_key, station_name, type, text) on public.reports to authenticated;
grant insert (report_id) on public.report_confirmations, public.report_resolutions to authenticated;
grant insert (line, station, author, category, title, body) on public.spot_posts to authenticated;
grant insert (post_id, station, author, text) on public.spot_comments to authenticated;
grant insert (post_id) on public.spot_likes, public.spot_scraps to authenticated;
grant insert (post_id, viewer) on public.spot_views to anon, authenticated;
grant insert (facility_id, vote) on public.facility_votes to authenticated;
grant update (vote) on public.facility_votes to authenticated;

grant delete on public.reports, public.report_confirmations, public.spot_posts, public.spot_comments,
  public.spot_likes, public.spot_scraps, public.facility_votes to authenticated;

revoke all on function public.facility_vote_counts(text[]) from public;
grant execute on function public.facility_vote_counts(text[]) to anon, authenticated;
revoke all on function public.on_report_confirmation(), public.on_report_resolution(),
  public.on_spot_counter(), public.touch_facility_vote() from public, anon, authenticated;

-- ───────────────────────── Row level security ─────────────────────────

alter table public.reports enable row level security;
alter table public.report_confirmations enable row level security;
alter table public.report_resolutions enable row level security;
alter table public.spot_posts enable row level security;
alter table public.spot_comments enable row level security;
alter table public.spot_likes enable row level security;
alter table public.spot_scraps enable row level security;
alter table public.spot_views enable row level security;
alter table public.facility_votes enable row level security;

drop policy if exists "reports are public" on public.reports;
create policy "reports are public" on public.reports for select using (true);
drop policy if exists "post own reports, 10 per 10 min" on public.reports;
create policy "post own reports, 10 per 10 min" on public.reports for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (select count(*) from public.reports r
         where r.author_id = (select auth.uid()) and r.created_at > now() - interval '10 minutes') < 10
  );
drop policy if exists "delete own reports" on public.reports;
create policy "delete own reports" on public.reports for delete to authenticated
  using (author_id = (select auth.uid()));

drop policy if exists "own confirmations" on public.report_confirmations;
create policy "own confirmations" on public.report_confirmations for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "own resolutions" on public.report_resolutions;
create policy "own resolutions" on public.report_resolutions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "posts are public" on public.spot_posts;
create policy "posts are public" on public.spot_posts for select using (true);
drop policy if exists "write own posts, 5 per 10 min" on public.spot_posts;
create policy "write own posts, 5 per 10 min" on public.spot_posts for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (select count(*) from public.spot_posts p
         where p.author_id = (select auth.uid()) and p.created_at > now() - interval '10 minutes') < 5
  );
drop policy if exists "delete own posts" on public.spot_posts;
create policy "delete own posts" on public.spot_posts for delete to authenticated
  using (author_id = (select auth.uid()));

drop policy if exists "comments are public" on public.spot_comments;
create policy "comments are public" on public.spot_comments for select using (true);
drop policy if exists "write own comments, 20 per 10 min" on public.spot_comments;
create policy "write own comments, 20 per 10 min" on public.spot_comments for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (select count(*) from public.spot_comments c
         where c.author_id = (select auth.uid()) and c.created_at > now() - interval '10 minutes') < 20
  );
drop policy if exists "delete own comments" on public.spot_comments;
create policy "delete own comments" on public.spot_comments for delete to authenticated
  using (author_id = (select auth.uid()));

drop policy if exists "own likes" on public.spot_likes;
create policy "own likes" on public.spot_likes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "own scraps" on public.spot_scraps;
create policy "own scraps" on public.spot_scraps for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "own views" on public.spot_views;
drop policy if exists "anyone can record a view" on public.spot_views;
create policy "anyone can record a view" on public.spot_views for insert to anon, authenticated
  with check (true);

drop policy if exists "own facility votes" on public.facility_votes;
create policy "own facility votes" on public.facility_votes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ───────────────────────── Realtime ─────────────────────────

do $$
declare
  t text;
begin
  foreach t in array array['reports', 'spot_posts', 'spot_comments'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
