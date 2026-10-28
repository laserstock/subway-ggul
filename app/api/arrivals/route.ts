// Real-time train arrivals from Seoul Open Data (swopenapi.seoul.go.kr).
// SEOUL_SUBWAY_API_KEY is the server-only "실시간 지하철" key from data.seoul.go.kr (never NEXT_PUBLIC_).

import type { Train } from "../../_lib/arrivals";

const LINES: Record<string, string> = {
  "1001": "1호선",
  "1002": "2호선",
  "1003": "3호선",
  "1004": "4호선",
  "1005": "5호선",
  "1006": "6호선",
  "1007": "7호선",
  "1008": "8호선",
  "1009": "9호선",
  "1061": "경의중앙선",
  "1063": "경의중앙선",
  "1065": "공항철도",
  "1067": "경춘선",
  "1075": "수인분당선",
  "1077": "신분당선",
  "1081": "경강선",
  "1092": "우이신설선",
  "1093": "서해선",
  "1094": "신림선",
  "1032": "GTX-A",
};

type RawArrival = {
  subwayId: string;
  updnLine: string;
  trainLineNm: string;
  bstatnNm: string;
  btrainSttus: string | null;
  barvlDt: string;
  arvlCd: string;
  arvlMsg3: string;
  ordkey: string;
  lstcarAt: string;
};

type Payload = { configured: boolean; trains: Train[]; fetchedAt: number };

/** One upstream call per station per window, shared by every reader of this instance. */
const TTL_MS = 15_000;
const memo = new Map<string, { at: number; payload: Promise<Payload> }>();
const MEMO_LIMIT = 500;

const bare = (name: string) => name.replace(/\(.*?\)/g, "").replace(/역$/, "").trim();

/** Beyond this the ordkey's stop count is noise (Line 2's loop trains report e.g. 38). */
const MAX_STOPS_AWAY = 30;
/** Arriving / arrived / departed codes; Seoul sometimes sends 1 for trains still several stops back. */
const AT_STATION_CODES = new Set([0, 1, 2]);

function toTrain(raw: RawArrival, station: string): Train | null {
  const line = LINES[raw.subwayId];
  if (!line) return null;
  const heading = bare((raw.trainLineNm.split(" - ")[1] ?? "").replace(/방면$/, ""));
  const away = Number(raw.ordkey.slice(2, 5));
  const at = bare(raw.arvlMsg3 ?? "");
  const code = Number(raw.arvlCd);
  return {
    line,
    direction: raw.updnLine,
    heading,
    terminal: bare(raw.bstatnNm),
    express: raw.btrainSttus && raw.btrainSttus !== "일반" ? raw.btrainSttus : null,
    seconds: Number(raw.barvlDt) || 0,
    code: AT_STATION_CODES.has(code) && at !== station ? 99 : code,
    stationsAway: Number.isFinite(away) && away <= MAX_STOPS_AWAY ? away : null,
    at,
    order: raw.ordkey,
    last: raw.lstcarAt === "1",
  };
}

/** Seoul answers ERROR-500 now and then when one key makes simultaneous calls; a moment later it succeeds. */
const RETRY_DELAY_MS = 400;

async function upstream(key: string, name: string, retried = false): Promise<Train[]> {
  const url = `http://swopenapi.seoul.go.kr/api/subway/${encodeURIComponent(key)}/json/realtimeStationArrival/0/40/${encodeURIComponent(name)}`;
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`seoul ${response.status}`);
  const data = (await response.json()) as {
    errorMessage?: { code?: string };
    code?: string;
    realtimeArrivalList?: RawArrival[];
  };
  const code = data.errorMessage?.code ?? data.code;
  if (code === "INFO-200") return [];
  if (code === "ERROR-500" && !retried) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return upstream(key, name, true);
  }
  if (code !== "INFO-000") throw new Error(`seoul ${code}`);
  return (data.realtimeArrivalList ?? []).flatMap((raw) => toTrain(raw, bare(name)) ?? []);
}

async function load(key: string, station: string): Promise<Payload> {
  // Seoul names drop 역 and most parentheses ("서울", "총신대입구"); try the plain name, then with parentheses.
  const names = [...new Set([bare(station), station.replace(/역$/, "").trim()])];
  for (const name of names) {
    const trains = await upstream(key, name);
    if (trains.length > 0) return { configured: true, trains, fetchedAt: Date.now() };
  }
  return { configured: true, trains: [], fetchedAt: Date.now() };
}

export async function GET(request: Request) {
  const station = new URL(request.url).searchParams.get("station")?.trim() ?? "";
  if (!station || station.length > 30) return Response.json({ error: "bad_request" }, { status: 400 });

  const key = process.env.SEOUL_SUBWAY_API_KEY;
  if (!key) {
    return Response.json({ configured: false, trains: [], fetchedAt: Date.now() } satisfies Payload, {
      headers: { "Cache-Control": "public, s-maxage=300" },
    });
  }

  const now = Date.now();
  let entry = memo.get(station);
  if (!entry || now - entry.at > TTL_MS) {
    if (memo.size >= MEMO_LIMIT) memo.delete(memo.keys().next().value as string);
    entry = { at: now, payload: load(key, station) };
    memo.set(station, entry);
  }
  try {
    return Response.json(await entry.payload, {
      headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=15" },
    });
  } catch {
    memo.delete(station);
    return Response.json({ error: "upstream_failed" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
