/**
 * Template: load CSV / API rows into the catalog hub via chunked UPSERT.
 *
 * Usage (after setting env):
 *   npx tsx scripts/db_loader_template.ts
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Replace `buildStationRows()` with real parsers. Re-running is idempotent.
 */

import { upsertCatalog } from "../app/_lib/db/safeUpsert";
import type { StationFacilityRow, StationRow } from "../app/_lib/db/types";

function buildStationRows(): StationRow[] {
  // Example only — replace with CSV / Seoul API mapping.
  return [
    {
      station_uid: "02_239",
      place_key: "hongik-univ",
      line_code: "02",
      line_name_ko: "2호선",
      name_i18n: {
        ko: "홍대입구역",
        en: "Hongik Univ.",
        zh: "弘大入口站",
        ja: "弘大入口駅",
      },
      slug: "hongik-university",
      lat: 37.557192,
      lng: 126.925381,
      highlights: ["개찰구 밖 화장실", "8번 출구 엘베"],
      external_ids: { seoul_fr_code: "239" },
      data_source: "manual",
      metadata: {},
    },
  ];
}

function buildFacilityRows(): StationFacilityRow[] {
  return [
    {
      station_uid: "02_239",
      facility_type: "toilet",
      natural_key: "outside|2|B1",
      is_inside_gate: false,
      exit_no: "2",
      floor: "B1",
      detail_i18n: {
        ko: "2·3번 출구 방향 대합실(개찰구 밖)",
        en: "Concourse toward Exits 2·3 (outside gates)",
      },
      data_source: "manual",
      metadata: {},
    },
  ];
}

async function main() {
  const stations = await upsertCatalog("stations", buildStationRows());
  console.log("stations", stations);

  const facilities = await upsertCatalog("station_facilities", buildFacilityRows());
  console.log("facilities", facilities);

  if (stations.failedChunks.length || facilities.failedChunks.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
