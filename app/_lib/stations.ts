import type { LatLng } from "../KakaoMap";
import { lineColor, type KakaoStation } from "../kakao-places";
import { t, type Locale, type Localized } from "./i18n";

export { t, type Locale, type Localized } from "./i18n";
export type CategoryId =
  | "pharmacy"
  | "oliveyoung"
  | "daiso"
  | "cafe"
  | "convenience";
export type StationId = "hongdae" | "gangnam" | "seoul" | "irwon" | "dapsimni";
export type Zone = "inside" | "outside" | "unpaid" | "nearby";
export type Place = {
  id: string;
  category: CategoryId;
  zone: Zone;
  name: Localized;
  walk: Localized;
  walkMinutes: number;
  status: Localized;
  note: Localized;
  x: number;
  y: number;
  badge?: number;
};

export type Exit = {
  id: string;
  label: Localized;
  x: number;
  y: number;
};

export type Station = {
  id: StationId;
  name: Localized;
  aliases: string[];
  lines: Localized;
  insidePaid: Localized;
  center: LatLng;
  color: string;
  exits: Exit[];
  places: Place[];
};

export type StationOption = {
  key: string;
  name: Localized;
  lines: Localized;
  center: LatLng;
  color: string;
  curated?: Station;
};

export const STATIONS: Station[] = [
  {
    id: "hongdae",
    name: { ko: "홍대입구역", en: "Hongik Univ.", zh: "弘大入口站", ja: "弘大入口駅" },
    aliases: ["홍대", "홍대입구", "홍대입구역", "hongdae", "hongik", "弘大"],
    lines: {
      ko: "2호선 · 경의·중앙선",
      en: "Line 2 · Gyeongui–Jungang",
      zh: "2号线 · 京义·中央线",
      ja: "2号線 · 京義·中央線",
    },
    insidePaid: {
      ko: "홍대입구역 역사 내(개찰구 안)",
      en: "Inside station (paid area)",
    },
    center: { lat: 37.5575, lng: 126.9245 },
    color: "#2fba4e",
    exits: [
      { id: "e9a", label: { ko: "9번 출구", en: "Exit 9" }, x: 39, y: 24 },
      { id: "e2", label: { ko: "2번 출구", en: "Exit 2" }, x: 18, y: 34 },
      { id: "e1b", label: { ko: "1번 출구", en: "Exit 1" }, x: 78, y: 29 },
      { id: "e3", label: { ko: "3번 출구", en: "Exit 3" }, x: 72, y: 43 },
      { id: "e1a", label: { ko: "1번 출구", en: "Exit 1" }, x: 14, y: 52 },
      { id: "e9b", label: { ko: "9번 출구", en: "Exit 9" }, x: 27, y: 58 },
      { id: "e7", label: { ko: "7번 출구", en: "Exit 7" }, x: 43, y: 59 },
      { id: "e4", label: { ko: "4번 출구", en: "Exit 4" }, x: 55, y: 54 },
    ],
    places: [
      {
        id: "hongdae-ph-1",
        category: "pharmacy",
        zone: "inside",
        name: {
          ko: "홍대입구역 내 약국 (개찰구 안, 지하 1층)",
          en: "In-station pharmacy (paid area, B1)",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "2호선 개찰구 안쪽에 있어요",
          en: "Located inside the Line 2 fare gate",
        },
        x: 46,
        y: 36,
        badge: 1,
      },
      {
        id: "hongdae-ph-2",
        category: "pharmacy",
        zone: "outside",
        name: {
          ko: "지하철역 9번 출구 앞 약국 (역외)",
          en: "Pharmacy by Exit 9 (outside)",
        },
        walk: { ko: "도보 3분", en: "3 min on foot" },
        walkMinutes: 3,
        status: { ko: "영업중", en: "Open" },
        note: {
          ko: "9번 출구로 나가서 바로 앞",
          en: "Right outside Exit 9",
        },
        x: 35,
        y: 29,
      },
      {
        id: "hongdae-ph-3",
        category: "pharmacy",
        zone: "outside",
        name: {
          ko: "3번 출구 인근 온누리약국",
          en: "Onnuri Pharmacy near Exit 3",
        },
        walk: { ko: "도보 4분", en: "4 min on foot" },
        walkMinutes: 4,
        status: { ko: "영업중 (~21:30)", en: "Open (~21:30)" },
        note: {
          ko: "3번 출구로 나와 횡단보도 건너편",
          en: "Across the street from Exit 3",
        },
        x: 60,
        y: 46,
      },
      {
        id: "hongdae-oy-1",
        category: "oliveyoung",
        zone: "outside",
        name: {
          ko: "올리브영 홍대입구역점",
          en: "Olive Young Hongik Univ. Station",
        },
        walk: { ko: "현재 역에서 도보 2분", en: "2 min on foot from here" },
        walkMinutes: 2,
        status: { ko: "영업중 (~23:00)", en: "Open (~23:00)" },
        note: {
          ko: "1번 출구 앞 대로변에 있어요",
          en: "On the main street by Exit 1",
        },
        x: 75,
        y: 33,
        badge: 1,
      },
      {
        id: "hongdae-oy-2",
        category: "oliveyoung",
        zone: "outside",
        name: { ko: "올리브영 홍대거리점", en: "Olive Young Hongdae Street" },
        walk: { ko: "도보 6분", en: "6 min on foot" },
        walkMinutes: 6,
        status: { ko: "영업중 (~24:00)", en: "Open (~24:00)" },
        note: {
          ko: "홍대 걷고싶은거리 초입",
          en: "At the start of Hongdae walking street",
        },
        x: 24,
        y: 48,
      },
      {
        id: "hongdae-ds-1",
        category: "daiso",
        zone: "outside",
        name: { ko: "다이소 홍대점", en: "Daiso Hongdae" },
        walk: { ko: "도보 5분", en: "5 min on foot" },
        walkMinutes: 5,
        status: { ko: "영업중 (~23:00)", en: "Open (~23:00)" },
        note: {
          ko: "2번 출구에서 홍대거리 방향",
          en: "From Exit 2 toward Hongdae street",
        },
        x: 20,
        y: 42,
        badge: 1,
      },
      {
        id: "hongdae-ds-2",
        category: "daiso",
        zone: "outside",
        name: { ko: "다이소 서교점", en: "Daiso Seogyo" },
        walk: { ko: "도보 7분", en: "7 min on foot" },
        walkMinutes: 7,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "9번 출구로 나와 와우산로 쪽",
          en: "Out Exit 9, toward Wausan-ro",
        },
        x: 28,
        y: 56,
      },
      {
        id: "hongdae-cf-1",
        category: "cafe",
        zone: "unpaid",
        name: {
          ko: "역사 내 커피빈 (개찰구 밖)",
          en: "Coffee Bean (unpaid concourse)",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "대합실 상가 쪽에 있어요",
          en: "In the concourse shopping area",
        },
        x: 51,
        y: 32,
        badge: 1,
      },
      {
        id: "hongdae-cf-2",
        category: "cafe",
        zone: "outside",
        name: { ko: "9번 출구 앞 카페", en: "Cafe by Exit 9" },
        walk: { ko: "도보 3분", en: "3 min on foot" },
        walkMinutes: 3,
        status: { ko: "영업중", en: "Open" },
        note: {
          ko: "테이크아웃 동선이 가장 짧아요",
          en: "Shortest takeout detour from the gate",
        },
        x: 31,
        y: 56,
      },
      {
        id: "hongdae-cv-1",
        category: "convenience",
        zone: "inside",
        name: {
          ko: "GS25 홍대입구역점 (개찰구 안)",
          en: "GS25 inside fare gates",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (24시간)", en: "Open 24h" },
        note: {
          ko: "2호선 승강장 연결 통로에 있어요",
          en: "On the Line 2 platform corridor",
        },
        x: 48,
        y: 38,
        badge: 1,
      },
      {
        id: "hongdae-cv-2",
        category: "convenience",
        zone: "outside",
        name: { ko: "CU 홍대9번출구점", en: "CU Hongdae Exit 9" },
        walk: { ko: "도보 2분", en: "2 min on foot" },
        walkMinutes: 2,
        status: { ko: "영업중 (24시간)", en: "Open 24h" },
        note: {
          ko: "9번 출구 나와서 좌측에 있어요",
          en: "Turn left right after Exit 9",
        },
        x: 30,
        y: 26,
      },
    ],
  },
  {
    id: "gangnam",
    name: { ko: "강남역", en: "Gangnam", zh: "江南站", ja: "江南駅" },
    aliases: ["강남", "강남역", "gangnam"],
    lines: {
      ko: "2호선 · 신분당선",
      en: "Line 2 · Shinbundang",
      zh: "2号线 · 新盆唐线",
      ja: "2号線 · 新盆唐線",
    },
    insidePaid: {
      ko: "강남역 역사 내(개찰구 안)",
      en: "Inside Gangnam station (paid area)",
    },
    center: { lat: 37.4979, lng: 127.0276 },
    color: "#2fba4e",
    exits: [
      { id: "g11", label: { ko: "11번 출구", en: "Exit 11" }, x: 18, y: 28 },
      { id: "g10", label: { ko: "10번 출구", en: "Exit 10" }, x: 32, y: 22 },
      { id: "g5", label: { ko: "5번 출구", en: "Exit 5" }, x: 72, y: 26 },
      { id: "g2", label: { ko: "2번 출구", en: "Exit 2" }, x: 78, y: 44 },
      { id: "g1", label: { ko: "1번 출구", en: "Exit 1" }, x: 16, y: 50 },
      { id: "g4", label: { ko: "4번 출구", en: "Exit 4" }, x: 54, y: 56 },
    ],
    places: [
      {
        id: "gangnam-ph-1",
        category: "pharmacy",
        zone: "inside",
        name: {
          ko: "강남역 지하상가 약국 (개찰구 안)",
          en: "Gangnam underground pharmacy (paid area)",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "2호선 개찰구 안쪽 지하상가에 있어요",
          en: "Located inside the Line 2 fare gate",
        },
        x: 48,
        y: 36,
        badge: 1,
      },
      {
        id: "gangnam-ph-2",
        category: "pharmacy",
        zone: "outside",
        name: {
          ko: "11번 출구 앞 온누리약국 (역외)",
          en: "Onnuri Pharmacy by Exit 11 (outside)",
        },
        walk: { ko: "도보 2분", en: "2 min on foot" },
        walkMinutes: 2,
        status: { ko: "영업중 (~23:00)", en: "Open (~23:00)" },
        note: {
          ko: "11번 출구로 나가 강남대로 방향",
          en: "Out Exit 11 toward Gangnam-daero",
        },
        x: 26,
        y: 30,
      },
      {
        id: "gangnam-ph-3",
        category: "pharmacy",
        zone: "outside",
        name: {
          ko: "5번 출구 맞은편 약국",
          en: "Pharmacy across from Exit 5",
        },
        walk: { ko: "도보 4분", en: "4 min on foot" },
        walkMinutes: 4,
        status: { ko: "영업중 (~21:30)", en: "Open (~21:30)" },
        note: {
          ko: "5번 출구 나와 횡단보도만 건너면 돼요",
          en: "Cross one street after Exit 5",
        },
        x: 70,
        y: 32,
      },
      {
        id: "gangnam-oy-1",
        category: "oliveyoung",
        zone: "unpaid",
        name: {
          ko: "올리브영 강남역점 (개찰구 밖 대합실)",
          en: "Olive Young Gangnam concourse",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (~23:30)", en: "Open (~23:30)" },
        note: {
          ko: "신분당선 개찰구 밖 연결통로에 있어요",
          en: "On the unpaid Shinbundang transfer corridor",
        },
        x: 52,
        y: 30,
        badge: 1,
      },
      {
        id: "gangnam-oy-2",
        category: "oliveyoung",
        zone: "outside",
        name: { ko: "올리브영 강남대로점", en: "Olive Young Gangnam-daero" },
        walk: { ko: "도보 5분", en: "5 min on foot" },
        walkMinutes: 5,
        status: { ko: "영업중 (~24:00)", en: "Open (~24:00)" },
        note: {
          ko: "10번 출구로 나와 테헤란로 초입",
          en: "Out Exit 10 at the start of Teheran-ro",
        },
        x: 34,
        y: 48,
      },
      {
        id: "gangnam-ds-1",
        category: "daiso",
        zone: "outside",
        name: { ko: "다이소 강남역점", en: "Daiso Gangnam Station" },
        walk: { ko: "도보 4분", en: "4 min on foot" },
        walkMinutes: 4,
        status: { ko: "영업중 (~23:00)", en: "Open (~23:00)" },
        note: {
          ko: "2번 출구에서 강남대로를 따라가요",
          en: "Follow Gangnam-daero from Exit 2",
        },
        x: 76,
        y: 50,
        badge: 1,
      },
      {
        id: "gangnam-ds-2",
        category: "daiso",
        zone: "outside",
        name: { ko: "다이소 역삼점", en: "Daiso Yeoksam" },
        walk: { ko: "도보 8분", en: "8 min on foot" },
        walkMinutes: 8,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "5번 출구에서 역삼역 방향으로 조금 더",
          en: "From Exit 5, a bit toward Yeoksam",
        },
        x: 82,
        y: 28,
      },
      {
        id: "gangnam-cf-1",
        category: "cafe",
        zone: "unpaid",
        name: {
          ko: "스타벅스 강남역점 (개찰구 밖)",
          en: "Starbucks Gangnam (unpaid area)",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (~22:30)", en: "Open (~22:30)" },
        note: {
          ko: "2호선 대합실에서 바로 보여요",
          en: "Visible from the Line 2 concourse",
        },
        x: 44,
        y: 40,
        badge: 1,
      },
      {
        id: "gangnam-cf-2",
        category: "cafe",
        zone: "outside",
        name: { ko: "11번 출구 앞 카페", en: "Cafe by Exit 11" },
        walk: { ko: "도보 3분", en: "3 min on foot" },
        walkMinutes: 3,
        status: { ko: "영업중", en: "Open" },
        note: {
          ko: "출근 동선에서 테이크아웃하기 좋아요",
          en: "Easy takeout stop on the commute path",
        },
        x: 22,
        y: 36,
      },
      {
        id: "gangnam-cv-1",
        category: "convenience",
        zone: "inside",
        name: {
          ko: "세븐일레븐 강남역점 (개찰구 안)",
          en: "7-Eleven inside fare gates",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (24시간)", en: "Open 24h" },
        note: {
          ko: "2호선 승강장 끝 연결 통로에 있어요",
          en: "At the end of the Line 2 platform corridor",
        },
        x: 50,
        y: 38,
        badge: 1,
      },
      {
        id: "gangnam-cv-2",
        category: "convenience",
        zone: "outside",
        name: { ko: "GS25 강남10번출구점", en: "GS25 Gangnam Exit 10" },
        walk: { ko: "도보 2분", en: "2 min on foot" },
        walkMinutes: 2,
        status: { ko: "영업중 (24시간)", en: "Open 24h" },
        note: {
          ko: "10번 출구 나와서 바로 우측",
          en: "Immediately to the right of Exit 10",
        },
        x: 36,
        y: 24,
      },
    ],
  },
  {
    id: "seoul",
    name: { ko: "서울역", en: "Seoul Station", zh: "首尔站", ja: "ソウル駅" },
    aliases: ["서울", "서울역", "seoul", "seoul station", "首尔", "ソウル"],
    lines: {
      ko: "1호선 · 4호선 · 경의·중앙선",
      en: "Line 1 · Line 4 · Gyeongui–Jungang",
      zh: "1号线 · 4号线 · 京义·中央线",
      ja: "1号線 · 4号線 · 京義·中央線",
    },
    insidePaid: {
      ko: "서울역 역사 내(개찰구 안)",
      en: "Inside Seoul Station (paid area)",
    },
    center: { lat: 37.5547, lng: 126.9707 },
    color: "#0032a0",
    exits: [
      { id: "s1", label: { ko: "1번 출구", en: "Exit 1" }, x: 20, y: 30 },
      { id: "s3", label: { ko: "3번 출구", en: "Exit 3" }, x: 38, y: 22 },
      { id: "s4", label: { ko: "4번 출구", en: "Exit 4" }, x: 72, y: 28 },
      { id: "s9", label: { ko: "9번 출구", en: "Exit 9" }, x: 78, y: 48 },
      { id: "s15", label: { ko: "15번 출구", en: "Exit 15" }, x: 18, y: 54 },
      { id: "s8", label: { ko: "8번 출구", en: "Exit 8" }, x: 50, y: 58 },
    ],
    places: [
      {
        id: "seoul-ph-1",
        category: "pharmacy",
        zone: "inside",
        name: {
          ko: "서울역 내 약국 (개찰구 안, 1호선)",
          en: "Seoul Station pharmacy (paid area, Line 1)",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (~21:00)", en: "Open (~21:00)" },
        note: {
          ko: "1호선 개찰구 안쪽에 있어요",
          en: "Located inside the Line 1 fare gate",
        },
        x: 46,
        y: 36,
        badge: 1,
      },
      {
        id: "seoul-ph-2",
        category: "pharmacy",
        zone: "outside",
        name: {
          ko: "3번 출구 앞 서울역약국 (역외)",
          en: "Seoul Station Pharmacy by Exit 3",
        },
        walk: { ko: "도보 3분", en: "3 min on foot" },
        walkMinutes: 3,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "3번 출구로 나와 남대문 방향",
          en: "Out Exit 3 toward Namdaemun",
        },
        x: 34,
        y: 26,
      },
      {
        id: "seoul-ph-3",
        category: "pharmacy",
        zone: "outside",
        name: {
          ko: "9번 출구 인근 온누리약국",
          en: "Onnuri Pharmacy near Exit 9",
        },
        walk: { ko: "도보 5분", en: "5 min on foot" },
        walkMinutes: 5,
        status: { ko: "영업중 (~20:30)", en: "Open (~20:30)" },
        note: {
          ko: "4호선 쪽으로 빠져 나오면 가까워요",
          en: "Closest if you exit toward Line 4",
        },
        x: 74,
        y: 50,
      },
      {
        id: "seoul-oy-1",
        category: "oliveyoung",
        zone: "unpaid",
        name: {
          ko: "올리브영 서울역점 (대합실)",
          en: "Olive Young Seoul Station concourse",
        },
        walk: { ko: "현재 역에서 도보 2분", en: "2 min on foot from here" },
        walkMinutes: 2,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "KTX 대합실 개찰구 밖에 있어요",
          en: "In the unpaid KTX concourse",
        },
        x: 54,
        y: 32,
        badge: 1,
      },
      {
        id: "seoul-oy-2",
        category: "oliveyoung",
        zone: "outside",
        name: { ko: "올리브영 남대문점", en: "Olive Young Namdaemun" },
        walk: { ko: "도보 7분", en: "7 min on foot" },
        walkMinutes: 7,
        status: { ko: "영업중 (~21:30)", en: "Open (~21:30)" },
        note: {
          ko: "1번 출구에서 남대문시장 방향",
          en: "From Exit 1 toward Namdaemun Market",
        },
        x: 18,
        y: 36,
      },
      {
        id: "seoul-ds-1",
        category: "daiso",
        zone: "outside",
        name: { ko: "다이소 서울역점", en: "Daiso Seoul Station" },
        walk: { ko: "도보 4분", en: "4 min on foot" },
        walkMinutes: 4,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "4번 출구로 나와 서울로7017 방향",
          en: "Out Exit 4 toward Seoullo 7017",
        },
        x: 70,
        y: 30,
        badge: 1,
      },
      {
        id: "seoul-ds-2",
        category: "daiso",
        zone: "outside",
        name: { ko: "다이소 회현점", en: "Daiso Hoehyeon" },
        walk: { ko: "도보 8분", en: "8 min on foot" },
        walkMinutes: 8,
        status: { ko: "영업중 (~21:00)", en: "Open (~21:00)" },
        note: {
          ko: "8번 출구에서 회현역 쪽으로 조금 더",
          en: "From Exit 8, a bit toward Hoehyeon",
        },
        x: 56,
        y: 56,
      },
      {
        id: "seoul-cf-1",
        category: "cafe",
        zone: "unpaid",
        name: {
          ko: "역사 내 투썸플레이스 (개찰구 밖)",
          en: "A Twosome Place (unpaid area)",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "1호선·4호선 환승 대합실에 있어요",
          en: "In the Line 1–4 transfer concourse",
        },
        x: 48,
        y: 40,
        badge: 1,
      },
      {
        id: "seoul-cf-2",
        category: "cafe",
        zone: "outside",
        name: { ko: "15번 출구 앞 카페", en: "Cafe by Exit 15" },
        walk: { ko: "도보 3분", en: "3 min on foot" },
        walkMinutes: 3,
        status: { ko: "영업중", en: "Open" },
        note: {
          ko: "공항철도 방면 출구에서 제일 가까워요",
          en: "Closest if you exit toward AREX",
        },
        x: 22,
        y: 52,
      },
      {
        id: "seoul-cv-1",
        category: "convenience",
        zone: "inside",
        name: {
          ko: "CU 서울역점 (개찰구 안)",
          en: "CU inside Seoul Station fare gates",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (24시간)", en: "Open 24h" },
        note: {
          ko: "1호선 승강장 연결 통로에 있어요",
          en: "On the Line 1 platform corridor",
        },
        x: 50,
        y: 38,
        badge: 1,
      },
      {
        id: "seoul-cv-2",
        category: "convenience",
        zone: "outside",
        name: { ko: "GS25 서울역3번출구점", en: "GS25 Seoul Station Exit 3" },
        walk: { ko: "도보 2분", en: "2 min on foot" },
        walkMinutes: 2,
        status: { ko: "영업중 (24시간)", en: "Open 24h" },
        note: {
          ko: "3번 출구 나와서 바로 앞",
          en: "Right in front after Exit 3",
        },
        x: 40,
        y: 24,
      },
    ],
  },
  {
    id: "irwon",
    name: { ko: "일원역", en: "Irwon", zh: "逸院站", ja: "逸院駅" },
    aliases: ["일원", "일원역", "irwon"],
    lines: { ko: "3호선", en: "Line 3", zh: "3号线", ja: "3号線" },
    insidePaid: {
      ko: "일원역 역사 내(개찰구 안)",
      en: "Inside Irwon station (paid area)",
    },
    center: { lat: 37.4837, lng: 127.0843 },
    color: "#ef7c1b",
    exits: [
      { id: "i1", label: { ko: "1번 출구", en: "Exit 1" }, x: 22, y: 32 },
      { id: "i2", label: { ko: "2번 출구", en: "Exit 2" }, x: 70, y: 28 },
      { id: "i3", label: { ko: "3번 출구", en: "Exit 3" }, x: 74, y: 50 },
      { id: "i4", label: { ko: "4번 출구", en: "Exit 4" }, x: 28, y: 54 },
    ],
    places: [
      {
        id: "irwon-ph-1",
        category: "pharmacy",
        zone: "inside",
        name: {
          ko: "일원역 내 약국 (개찰구 안)",
          en: "Irwon in-station pharmacy (paid area)",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (~21:00)", en: "Open (~21:00)" },
        note: {
          ko: "3호선 개찰구 안쪽에 있어요",
          en: "Located inside the Line 3 fare gate",
        },
        x: 48,
        y: 36,
        badge: 1,
      },
      {
        id: "irwon-ph-2",
        category: "pharmacy",
        zone: "outside",
        name: {
          ko: "2번 출구 앞 병원 약국 (역외)",
          en: "Hospital pharmacy by Exit 2 (outside)",
        },
        walk: { ko: "도보 3분", en: "3 min on foot" },
        walkMinutes: 3,
        status: { ko: "영업중 (~20:00)", en: "Open (~20:00)" },
        note: {
          ko: "2번 출구로 나와 삼성서울병원 방향",
          en: "Out Exit 2 toward Samsung Medical Center",
        },
        x: 68,
        y: 30,
      },
      {
        id: "irwon-ph-3",
        category: "pharmacy",
        zone: "outside",
        name: {
          ko: "4번 출구 인근 온누리약국",
          en: "Onnuri Pharmacy near Exit 4",
        },
        walk: { ko: "도보 4분", en: "4 min on foot" },
        walkMinutes: 4,
        status: { ko: "영업중 (~21:30)", en: "Open (~21:30)" },
        note: {
          ko: "4번 출구 나와 일원로를 따라가요",
          en: "Follow Irwon-ro from Exit 4",
        },
        x: 30,
        y: 52,
      },
      {
        id: "irwon-oy-1",
        category: "oliveyoung",
        zone: "outside",
        name: { ko: "올리브영 일원점", en: "Olive Young Irwon" },
        walk: { ko: "도보 6분", en: "6 min on foot" },
        walkMinutes: 6,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "1번 출구에서 일원본동 방면",
          en: "From Exit 1 toward Irwonbon-dong",
        },
        x: 24,
        y: 36,
        badge: 1,
      },
      {
        id: "irwon-oy-2",
        category: "oliveyoung",
        zone: "outside",
        name: {
          ko: "올리브영 삼성서울병원점",
          en: "Olive Young Samsung Hospital",
        },
        walk: { ko: "도보 8분", en: "8 min on foot" },
        walkMinutes: 8,
        status: { ko: "영업중 (~21:00)", en: "Open (~21:00)" },
        note: {
          ko: "2번 출구에서 병원 단지 안쪽",
          en: "Inside the hospital campus from Exit 2",
        },
        x: 78,
        y: 24,
      },
      {
        id: "irwon-ds-1",
        category: "daiso",
        zone: "outside",
        name: { ko: "다이소 일원점", en: "Daiso Irwon" },
        walk: { ko: "도보 7분", en: "7 min on foot" },
        walkMinutes: 7,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "3번 출구로 나와 상가 골목 안쪽",
          en: "Out Exit 3 into the local shopping alley",
        },
        x: 72,
        y: 52,
        badge: 1,
      },
      {
        id: "irwon-ds-2",
        category: "daiso",
        zone: "outside",
        name: { ko: "다이소 대청점", en: "Daiso Daecheong" },
        walk: { ko: "도보 10분", en: "10 min on foot" },
        walkMinutes: 10,
        status: { ko: "영업중 (~21:30)", en: "Open (~21:30)" },
        note: {
          ko: "4번 출구에서 대청역 방향으로 조금 더",
          en: "From Exit 4, a bit toward Daecheong",
        },
        x: 18,
        y: 56,
      },
      {
        id: "irwon-cf-1",
        category: "cafe",
        zone: "unpaid",
        name: {
          ko: "역사 내 이디야 (개찰구 밖)",
          en: "Ediya in concourse (unpaid area)",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (~21:00)", en: "Open (~21:00)" },
        note: {
          ko: "대합실 개찰구 바로 앞에 있어요",
          en: "Just in front of the unpaid gates",
        },
        x: 50,
        y: 32,
        badge: 1,
      },
      {
        id: "irwon-cf-2",
        category: "cafe",
        zone: "outside",
        name: { ko: "1번 출구 앞 카페", en: "Cafe by Exit 1" },
        walk: { ko: "도보 3분", en: "3 min on foot" },
        walkMinutes: 3,
        status: { ko: "영업중", en: "Open" },
        note: {
          ko: "병원 가는 동선에서 테이크아웃하기 좋아요",
          en: "Handy takeout stop on the hospital route",
        },
        x: 26,
        y: 28,
      },
      {
        id: "irwon-cv-1",
        category: "convenience",
        zone: "inside",
        name: {
          ko: "GS25 일원역점 (개찰구 안)",
          en: "GS25 inside Irwon fare gates",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (24시간)", en: "Open 24h" },
        note: {
          ko: "3호선 승강장 연결 통로에 있어요",
          en: "On the Line 3 platform corridor",
        },
        x: 48,
        y: 38,
        badge: 1,
      },
      {
        id: "irwon-cv-2",
        category: "convenience",
        zone: "outside",
        name: { ko: "CU 일원2번출구점", en: "CU Irwon Exit 2" },
        walk: { ko: "도보 2분", en: "2 min on foot" },
        walkMinutes: 2,
        status: { ko: "영업중 (24시간)", en: "Open 24h" },
        note: {
          ko: "2번 출구 나와서 병원 방향 바로 앞",
          en: "Right outside Exit 2 toward the hospital",
        },
        x: 66,
        y: 34,
      },
    ],
  },
  {
    id: "dapsimni",
    name: { ko: "답십리역", en: "Dapsimni", zh: "踏十里站", ja: "踏十里駅" },
    aliases: ["답십리", "답십리역", "dapsimni", "dapsipri"],
    lines: { ko: "5호선", en: "Line 5", zh: "5号线", ja: "5号線" },
    insidePaid: {
      ko: "답십리역 역사 내(개찰구 안)",
      en: "Inside Dapsimni station (paid area)",
    },
    center: { lat: 37.5667, lng: 127.0527 },
    color: "#996cac",
    exits: [
      { id: "d1", label: { ko: "1번 출구", en: "Exit 1" }, x: 24, y: 28 },
      { id: "d2", label: { ko: "2번 출구", en: "Exit 2" }, x: 72, y: 26 },
      { id: "d3", label: { ko: "3번 출구", en: "Exit 3" }, x: 76, y: 52 },
      { id: "d4", label: { ko: "4번 출구", en: "Exit 4" }, x: 22, y: 56 },
    ],
    places: [
      {
        id: "dapsimni-ph-1",
        category: "pharmacy",
        zone: "outside",
        name: {
          ko: "1번 출구 앞 약국 (역외)",
          en: "Pharmacy by Exit 1 (outside)",
        },
        walk: { ko: "도보 2분", en: "2 min on foot" },
        walkMinutes: 2,
        status: { ko: "영업중 (~21:00)", en: "Open (~21:00)" },
        note: {
          ko: "1번 출구로 나와 천호대로 쪽 바로 앞",
          en: "Right outside Exit 1 on Cheonho-daero",
        },
        x: 26,
        y: 24,
        badge: 1,
      },
      {
        id: "dapsimni-ph-2",
        category: "pharmacy",
        zone: "outside",
        name: {
          ko: "3번 출구 인근 온누리약국",
          en: "Onnuri Pharmacy near Exit 3",
        },
        walk: { ko: "도보 4분", en: "4 min on foot" },
        walkMinutes: 4,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "3번 출구로 나와 답십리 사거리 방향",
          en: "Out Exit 3 toward Dapsimni intersection",
        },
        x: 78,
        y: 56,
      },
      {
        id: "dapsimni-oy-1",
        category: "oliveyoung",
        zone: "outside",
        name: { ko: "올리브영 답십리점", en: "Olive Young Dapsimni" },
        walk: { ko: "도보 5분", en: "5 min on foot" },
        walkMinutes: 5,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "2번 출구에서 큰길 따라 직진",
          en: "Straight along the main road from Exit 2",
        },
        x: 74,
        y: 20,
        badge: 1,
      },
      {
        id: "dapsimni-ds-1",
        category: "daiso",
        zone: "outside",
        name: { ko: "다이소 답십리점", en: "Daiso Dapsimni" },
        walk: { ko: "도보 6분", en: "6 min on foot" },
        walkMinutes: 6,
        status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
        note: {
          ko: "4번 출구로 나와 시장 골목 안쪽",
          en: "Out Exit 4 into the market alley",
        },
        x: 18,
        y: 60,
        badge: 1,
      },
      {
        id: "dapsimni-cf-1",
        category: "cafe",
        zone: "unpaid",
        name: {
          ko: "역사 내 카페 (개찰구 밖)",
          en: "Concourse cafe (unpaid area)",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (~21:00)", en: "Open (~21:00)" },
        note: {
          ko: "대합실 개찰구 바로 앞에 있어요",
          en: "Just in front of the unpaid gates",
        },
        x: 50,
        y: 32,
        badge: 1,
      },
      {
        id: "dapsimni-cf-2",
        category: "cafe",
        zone: "outside",
        name: { ko: "2번 출구 앞 카페", en: "Cafe by Exit 2" },
        walk: { ko: "도보 2분", en: "2 min on foot" },
        walkMinutes: 2,
        status: { ko: "영업중", en: "Open" },
        note: {
          ko: "출근 동선에서 테이크아웃하기 좋아요",
          en: "Easy takeout stop on the commute path",
        },
        x: 68,
        y: 30,
      },
      {
        id: "dapsimni-cv-1",
        category: "convenience",
        zone: "inside",
        name: {
          ko: "답십리역 편의점 (개찰구 안)",
          en: "Convenience store inside Dapsimni fare gates",
        },
        walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
        walkMinutes: 1,
        status: { ko: "영업중 (~24:00)", en: "Open (~24:00)" },
        note: {
          ko: "5호선 개찰구 안쪽에 있어요",
          en: "Located inside the Line 5 fare gate",
        },
        x: 48,
        y: 38,
        badge: 1,
      },
      {
        id: "dapsimni-cv-2",
        category: "convenience",
        zone: "outside",
        name: { ko: "4번 출구 앞 편의점", en: "Store by Exit 4" },
        walk: { ko: "도보 2분", en: "2 min on foot" },
        walkMinutes: 2,
        status: { ko: "영업중 (24시간)", en: "Open 24h" },
        note: {
          ko: "4번 출구 나와서 바로 왼쪽",
          en: "Immediately left out of Exit 4",
        },
        x: 24,
        y: 52,
      },
    ],
  },
];

export function distanceMeters(a: LatLng, b: LatLng) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
}

const LINE_SUFFIX: Record<Locale, (joined: string) => string> = {
  ko: (joined) => `${joined}호선`,
  en: (joined) => `Line ${joined}`,
  zh: (joined) => `${joined}号线`,
  ja: (joined) => `${joined}号線`,
};

/** "5호선 · 7호선" → "5/7호선"; lines without a number are shown as-is. */
export function compactLines(station: StationOption, locale: Locale) {
  const lines = station.lines.ko.split(" · ").filter(Boolean);
  const numbers = lines.map((line) => line.match(/^(\d+)호선$/)?.[1]);
  if (lines.length > 0 && numbers.every(Boolean)) return LINE_SUFFIX[locale](numbers.join("/"));
  return t(station.lines, locale);
}

export function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function stationMatches(station: Station, query: string) {
  const q = normalize(query);
  if (!q) return true;
  const haystack = [
    ...Object.values(station.name),
    ...Object.values(station.lines),
    ...station.aliases,
  ]
    .map(normalize)
    .join(" ");
  return haystack.includes(q);
}

export function curatedOption(station: Station): StationOption {
  return {
    key: station.id,
    name: station.name,
    lines: station.lines,
    center: station.center,
    color: station.color,
    curated: station,
  };
}

export function kakaoOption(found: KakaoStation): StationOption {
  const curated = STATIONS.find((station) => station.name.ko === found.name);
  if (curated) return curatedOption(curated);
  return {
    key: `kakao:${found.name}`,
    name: { ko: found.name, en: found.name },
    lines: {
      ko: found.lines.join(" · "),
      en: found.lines.map((line) => line.replace(/^(\d+)호선$/, "Line $1")).join(" · "),
      zh: found.lines.map((line) => line.replace(/^(\d+)호선$/, "$1号线")).join(" · "),
      ja: found.lines.map((line) => line.replace(/^(\d+)호선$/, "$1号線")).join(" · "),
    },
    center: found.center,
    color: lineColor(found.lines),
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export function stationParams(station: StationOption) {
  return new URLSearchParams({
    station: station.name.ko,
    lat: String(station.center.lat),
    lng: String(station.center.lng),
    lines: station.lines.ko,
  });
}

export function stationFromParams(params: SearchParams): StationOption | null {
  const name = firstParam(params, "station");
  if (!name) return null;
  const curated = STATIONS.find((station) => station.name.ko === name);
  if (curated) return curatedOption(curated);
  const lat = Number(firstParam(params, "lat") || NaN);
  const lng = Number(firstParam(params, "lng") || NaN);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const lines = (firstParam(params, "lines") ?? "").split(" · ").filter(Boolean);
  return kakaoOption({ name, lines, center: { lat, lng } });
}
