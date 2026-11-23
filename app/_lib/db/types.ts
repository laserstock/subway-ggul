/** Catalog + cache row shapes for Supabase upsert/fetch helpers. */

export type DataSource = "public_csv" | "seoul_api" | "kakao_api" | "manual" | "user" | "gemini";

export type NameI18n = {
  ko: string;
  en?: string;
  zh?: string;
  ja?: string;
};

export type StationRow = {
  station_uid: string;
  place_key: string;
  line_code: string;
  line_name_ko: string;
  name_i18n: NameI18n;
  slug?: string | null;
  lat?: number | null;
  lng?: number | null;
  highlights?: unknown[];
  external_ids?: Record<string, unknown>;
  data_source?: DataSource;
  metadata?: Record<string, unknown>;
};

export type FacilityType =
  | "toilet"
  | "elevator"
  | "escalator"
  | "locker"
  | "nursing"
  | "wheelchair"
  | "other";

export type StationFacilityRow = {
  station_uid: string;
  facility_type: FacilityType;
  natural_key: string;
  is_inside_gate?: boolean | null;
  is_onestop_ground?: boolean | null;
  exit_no?: string | null;
  floor?: string | null;
  detail_i18n?: NameI18n | Record<string, string>;
  data_source?: DataSource;
  metadata?: Record<string, unknown>;
};

export type StationTransferRow = {
  station_uid: string;
  natural_key: string;
  from_line: string;
  to_line: string;
  from_toward?: string | null;
  to_toward?: string | null;
  fast_car_door?: string | null;
  board_car_door?: string | null;
  walk_seconds?: number | null;
  difficulty?: number | null;
  elevator_tip_i18n?: NameI18n | Record<string, string>;
  data_source?: DataSource;
  metadata?: Record<string, unknown>;
};

export type StationPoiRow = {
  place_key: string;
  external_place_id: string;
  category: string;
  name: string;
  station_uid?: string | null;
  name_i18n?: NameI18n | Record<string, string>;
  exit_hint?: string | null;
  distance_m?: number | null;
  rating?: number | null;
  map_url?: string | null;
  lat?: number | null;
  lng?: number | null;
  expires_at?: string | null;
  data_source?: DataSource;
  metadata?: Record<string, unknown>;
};

export type AiCacheRow = {
  cache_key: string;
  locale: "ko" | "en" | "zh" | "zh-tw" | "ja";
  response: Record<string, unknown> | string;
  prompt_fingerprint?: string | null;
  expires_at?: string | null;
  hit_count?: number;
  data_source?: DataSource;
  metadata?: Record<string, unknown>;
};

/** Unique conflict targets used by safeUpsert for catalog tables. */
export const CATALOG_CONFLICT = {
  stations: "station_uid",
  station_facilities: "station_uid,facility_type,natural_key",
  station_transfers: "station_uid,natural_key",
  station_pois: "place_key,external_place_id",
  ai_response_cache: "cache_key,locale",
} as const;

export type CatalogTable = keyof typeof CATALOG_CONFLICT;
