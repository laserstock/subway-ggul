-- Seoul Metro last trains often use 24:xx / 25:xx (past midnight).
-- Postgres `time` rejects those; store as text HH:MM:SS instead.

alter table public.station_first_last
  alter column first_time type text;

alter table public.station_first_last
  alter column last_time type text;
