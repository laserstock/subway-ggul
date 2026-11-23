# Supabase

## Layout

| File | Role |
|------|------|
| `schema.sql` | Existing UGC (reports, 꿀스팟, facility votes, RLS, Realtime). Run once / keep as source of truth for social features. |
| `migrations/20261123_catalog_hub.sql` | **Additive** catalog hub: `stations`, facilities, transfers, POIs, AI cache + `reports.expires_at` / `station_uid`. |

## Apply catalog migration

1. Set server env: `SUPABASE_SERVICE_ROLE_KEY` (never `NEXT_PUBLIC_`)
2. Supabase Dashboard → SQL Editor → run in order (safe to re-run):
   - `migrations/20261123_catalog_hub.sql`
   - `migrations/20261123_service_role_grants.sql`  
     (needed so `sb_secret_*` can read/write; RLS bypass alone is not enough)
3. Optional one-shot seed (tables + grants + 799 stations): `seed/seoul_line_stations.sql`

## Load Seoul Metro line-station CSV

Source CSV (EUC-KR) → UTF-8 copy at `data/raw/seoul-metro-stations-by-line.utf8.csv`.

```bash
node scripts/load-seoul-line-stations.mjs
```

Maps each row to `stations.station_uid` like `02_239`, keeps raw CSV fields in `metadata.raw`, `data_source = public_csv`.

## Load first / last train CSV

1. SQL Editor → `migrations/20261123_station_first_last.sql`
2. Then:

```bash
node scripts/load-seoul-first-last.mjs
```

UTF-8 source: `data/raw/seoul-metro-first-last.utf8.csv` → table `station_first_last` (linked to `stations` when possible).

## Loaders

- Chunked UPSERT: `app/_lib/db/safeUpsert.ts`
- Graceful reads: `app/_lib/db/safeFetch.ts`
- Template script: `scripts/db_loader_template.ts`

App screens still use static TS + existing UGC until a later dual-read phase.
