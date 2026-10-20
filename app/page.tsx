"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Image, { type StaticImageData } from "next/image";
import pharmacyIcon from "@/public/icons/pharmacy.png";
import oliveyoungIcon from "@/public/icons/oliveyoung.png";
import daisoIcon from "@/public/icons/daiso.png";
import cafeIcon from "@/public/icons/cafe.png";
import KakaoMap, { type LatLng, type MapOverlay } from "./KakaoMap";
import { useKakaoMaps } from "./kakao-sdk";
import {
  lineColor,
  searchNearby,
  searchStations,
  type KakaoStation,
  type NearbyPlace,
  type NearbyQuery,
} from "./kakao-places";

type Locale = "ko" | "en";
type Localized = { ko: string; en: string };
type CategoryId =
  | "pharmacy"
  | "oliveyoung"
  | "daiso"
  | "cafe"
  | "convenience";
type StationId = "hongdae" | "gangnam" | "seoul" | "irwon" | "dapsimni";
type Zone = "inside" | "outside" | "unpaid" | "nearby";
type Place = {
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

type Exit = {
  id: string;
  label: Localized;
  x: number;
  y: number;
};

type Station = {
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

type StationOption = {
  key: string;
  name: Localized;
  lines: Localized;
  center: LatLng;
  color: string;
  curated?: Station;
};

type ListItem = {
  id: string;
  category: CategoryId;
  zone: Zone;
  name: Localized;
  walk: Localized;
  walkMinutes: number;
  status?: Localized;
  note: Localized;
  position: LatLng;
  badge?: number;
  url?: string;
};

const COPY = {
  title: { ko: "지하철꿀정보", en: "Subway Tips" },
  search: {
    ko: "역 주변이나 동선 상의 시설을 찾아보세요 (예: 홍대입구역)",
    en: "Search nearby or along your route (e.g. Hongik Univ.)",
  },
  smartList: { ko: "스마트 추천 목록", en: "Smart picks" },
  sortHint: { ko: "현재 위치에서 가장 빠른 순", en: "Fastest from here" },
  empty: { ko: "조건에 맞는 장소가 없어요", en: "No matching places" },
  noStation: { ko: "일치하는 역이 없어요", en: "No matching stations" },
  searching: { ko: "역을 찾는 중…", en: "Searching stations…" },
  loading: { ko: "주변 장소를 불러오는 중…", en: "Loading nearby places…" },
  loadFailed: {
    ko: "주변 장소를 불러오지 못했어요",
    en: "Couldn't load nearby places",
  },
  gatePending: {
    ko: "이 역은 개찰구 안/밖 정보를 준비 중이에요",
    en: "Fare gate tips for this station are coming soon",
  },
  kakaoLink: { ko: "카카오맵에서 보기", en: "View on Kakao Map" },
  inside: { ko: "개찰구 안", en: "Inside fare gate" },
  outside: { ko: "역외", en: "Outside station" },
  unpaid: { ko: "개찰구 밖", en: "Unpaid area" },
  nearby: { ko: "역 주변", en: "Near station" },
};

const WALK_METERS_PER_MINUTE = 67;

const CATEGORIES: {
  id: CategoryId;
  name: Localized;
  emoji: string;
  icon?: StaticImageData;
  nearby: NearbyQuery;
}[] = [
  {
    id: "pharmacy",
    name: { ko: "약국", en: "Pharmacy" },
    emoji: "💊",
    icon: pharmacyIcon,
    nearby: { kind: "category", code: "PM9", radius: 700 },
  },
  {
    id: "oliveyoung",
    name: { ko: "올리브영", en: "Olive Young" },
    emoji: "💄",
    icon: oliveyoungIcon,
    nearby: { kind: "keyword", keyword: "올리브영", radius: 1500 },
  },
  {
    id: "daiso",
    name: { ko: "다이소", en: "Daiso" },
    emoji: "🛍️",
    icon: daisoIcon,
    nearby: { kind: "keyword", keyword: "다이소", radius: 1500 },
  },
  {
    id: "cafe",
    name: { ko: "카페", en: "Cafe" },
    emoji: "☕",
    icon: cafeIcon,
    nearby: { kind: "category", code: "CE7", radius: 500 },
  },
  {
    id: "convenience",
    name: { ko: "편의점", en: "Store" },
    emoji: "🏪",
    nearby: { kind: "category", code: "CS2", radius: 500 },
  },
];

const STATIONS: Station[] = [
  {
    id: "hongdae",
    name: { ko: "홍대입구역", en: "Hongik Univ." },
    aliases: ["홍대", "홍대입구", "홍대입구역", "hongdae", "hongik"],
    lines: { ko: "2호선 · 경의·중앙선", en: "Line 2 · Gyeongui–Jungang" },
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
    name: { ko: "강남역", en: "Gangnam" },
    aliases: ["강남", "강남역", "gangnam"],
    lines: { ko: "2호선 · 신분당선", en: "Line 2 · Shinbundang" },
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
    name: { ko: "서울역", en: "Seoul Station" },
    aliases: ["서울", "서울역", "seoul", "seoul station"],
    lines: {
      ko: "1호선 · 4호선 · 경의·중앙선",
      en: "Line 1 · Line 4 · Gyeongui–Jungang",
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
    name: { ko: "일원역", en: "Irwon" },
    aliases: ["일원", "일원역", "irwon"],
    lines: { ko: "3호선", en: "Line 3" },
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
    name: { ko: "답십리역", en: "Dapsimni" },
    aliases: ["답십리", "답십리역", "dapsimni", "dapsipri"],
    lines: { ko: "5호선", en: "Line 5" },
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

const LAYOUT_ORIGIN = { x: 50, y: 38 };
const LAYOUT_SPAN = { lat: 0.0045, lng: 0.0045 };

function layoutToLatLng(center: LatLng, x: number, y: number): LatLng {
  return {
    lat: center.lat - ((y - LAYOUT_ORIGIN.y) / 100) * LAYOUT_SPAN.lat,
    lng: center.lng + ((x - LAYOUT_ORIGIN.x) / 100) * LAYOUT_SPAN.lng,
  };
}

function t(value: Localized, locale: Locale) {
  return value[locale];
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function stationMatches(station: Station, query: string) {
  const q = normalize(query);
  if (!q) return true;
  const haystack = [
    station.name.ko,
    station.name.en,
    station.lines.ko,
    station.lines.en,
    ...station.aliases,
  ]
    .map(normalize)
    .join(" ");
  return haystack.includes(q);
}

function curatedOption(station: Station): StationOption {
  return {
    key: station.id,
    name: station.name,
    lines: station.lines,
    center: station.center,
    color: station.color,
    curated: station,
  };
}

function kakaoOption(found: KakaoStation): StationOption {
  const curated = STATIONS.find((station) => station.name.ko === found.name);
  if (curated) return curatedOption(curated);
  return {
    key: `kakao:${found.name}`,
    name: { ko: found.name, en: found.name },
    lines: {
      ko: found.lines.join(" · "),
      en: found.lines.map((line) => line.replace(/^(\d+)호선$/, "Line $1")).join(" · "),
    },
    center: found.center,
    color: lineColor(found.lines),
  };
}

function curatedItem(station: Station, place: Place): ListItem {
  return {
    id: place.id,
    category: place.category,
    zone: place.zone,
    name: place.name,
    walk: place.walk,
    walkMinutes: place.walkMinutes,
    status: place.status,
    note: place.note,
    position: layoutToLatLng(station.center, place.x, place.y),
    badge: place.badge,
  };
}

function nearbyItem(category: CategoryId, place: NearbyPlace): ListItem {
  const minutes = Math.max(1, Math.round(place.distance / WALK_METERS_PER_MINUTE));
  return {
    id: `kakao-${place.id}`,
    category,
    zone: "nearby",
    name: { ko: place.name, en: place.name },
    walk: {
      ko: `도보 ${minutes}분 · ${place.distance}m`,
      en: `${minutes} min on foot · ${place.distance} m`,
    },
    walkMinutes: minutes,
    note: { ko: place.address, en: place.address },
    position: place.position,
    url: place.url,
  };
}

function zoneLabel(zone: Zone) {
  if (zone === "inside") return COPY.inside;
  if (zone === "unpaid") return COPY.unpaid;
  if (zone === "nearby") return COPY.nearby;
  return COPY.outside;
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="#9ca3af" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 12h18M12 3c2.5 2.8 3.8 6 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-6-3.8-9s1.3-6.2 3.8-9z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TrainLogo() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#1e3a8a] text-white shadow-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2c-4.6 0-8 1.35-8 4.2V15c0 1.8 1.4 3.3 3.2 3.6V21h-1.4v1.5h5.1V21h2.2v1.5h5.1V21h-1.4v-2.4c1.8-.3 3.2-1.8 3.2-3.6V6.2C20 3.35 16.6 2 12 2zm-4.2 15.1a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7zm8.4 0a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7zM18 12.2H6V7.1h12v5.1z" />
      </svg>
    </div>
  );
}

function CategoryIcon({
  category,
  size,
}: {
  category: CategoryId;
  size: number;
}) {
  const item = CATEGORIES.find((entry) => entry.id === category);
  if (!item?.icon) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center leading-none"
        style={{ width: size, height: size, fontSize: size * 0.85 }}
        aria-hidden
      >
        {item?.emoji ?? "📍"}
      </span>
    );
  }
  return (
    <Image
      src={item.icon}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-[4px] object-contain"
      style={{ width: size, height: size }}
    />
  );
}

function PlacePin({
  category,
  selected,
}: {
  category: CategoryId;
  selected?: boolean;
}) {
  return (
    <div
      className={`flex h-[32px] w-[32px] items-center justify-center rounded-full border-[3px] bg-white shadow-md ${
        selected ? "scale-110 border-[#1d4ed8]" : "border-[#2f6bff]"
      }`}
    >
      <CategoryIcon category={category} size={20} />
    </div>
  );
}

function NumberBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#2f6bff] shadow">
      {n}
    </span>
  );
}

function YellowLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-[6px] bg-[#f1d24f] px-[7px] py-[3px] text-[11px] font-semibold leading-none text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.18)] ${className}`}
    >
      {children}
    </span>
  );
}

function buildOverlays({
  locale,
  station,
  items,
  activeId,
  onSelect,
}: {
  locale: Locale;
  station: StationOption;
  items: ListItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}): MapOverlay[] {
  const curated = station.curated;
  const labels: MapOverlay[] = curated
    ? [
        {
          key: `${curated.id}-paid-area`,
          position: layoutToLatLng(curated.center, 49, 47),
          zIndex: 1,
          content: <YellowLabel>{t(curated.insidePaid, locale)}</YellowLabel>,
        },
        ...curated.exits.map((exit) => ({
          key: `${curated.id}-${exit.id}`,
          position: layoutToLatLng(curated.center, exit.x, exit.y),
          zIndex: 1,
          content: <YellowLabel>{t(exit.label, locale)}</YellowLabel>,
        })),
      ]
    : [];
  return [
    ...labels,
    ...items.map((item) => ({
      key: item.id,
      position: item.position,
      zIndex: item.id === activeId ? 4 : 3,
      content: (
        <button
          type="button"
          onClick={() => onSelect(item.id)}
          aria-label={t(item.name, locale)}
        >
          <span className="relative inline-flex">
            <PlacePin category={item.category} selected={item.id === activeId} />
            {item.badge ? <NumberBadge n={item.badge} /> : null}
          </span>
        </button>
      ),
    })),
  ];
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("ko");
  const [category, setCategory] = useState<CategoryId>("pharmacy");
  const [station, setStation] = useState<StationOption>(() =>
    curatedOption(STATIONS[0]),
  );
  const [query, setQuery] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remote, setRemote] = useState<{ query: string; stations: StationOption[] }>({
    query: "",
    stations: [],
  });
  const [nearby, setNearby] = useState<{ key: string; items: ListItem[] | null }>({
    key: "",
    items: [],
  });
  const searchRef = useRef<HTMLDivElement>(null);
  const kakaoStatus = useKakaoMaps();

  const trimmedQuery = query.trim();
  const searchPending =
    kakaoStatus === "ready" && trimmedQuery !== "" && remote.query !== trimmedQuery;

  const suggestions = useMemo(() => {
    const local = STATIONS.filter((item) => stationMatches(item, query)).map(curatedOption);
    if (remote.query !== query.trim()) return local;
    const localKeys = new Set(local.map((item) => item.key));
    return [...local, ...remote.stations.filter((item) => !localKeys.has(item.key))].slice(0, 8);
  }, [query, remote]);

  useEffect(() => {
    if (kakaoStatus !== "ready" || !suggestOpen || !trimmedQuery) return;
    let alive = true;
    const timer = window.setTimeout(() => {
      searchStations(trimmedQuery).then((found) => {
        if (alive) setRemote({ query: trimmedQuery, stations: found.map(kakaoOption) });
      });
    }, 250);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [kakaoStatus, suggestOpen, trimmedQuery]);

  const nearbyKey = `${station.key}:${category}`;
  const { lat: centerLat, lng: centerLng } = station.center;
  useEffect(() => {
    if (kakaoStatus !== "ready") return;
    let alive = true;
    const nearbyQuery = CATEGORIES.find((item) => item.id === category)?.nearby;
    if (!nearbyQuery) return;
    searchNearby(nearbyQuery, { lat: centerLat, lng: centerLng }).then(
      (found) => {
        if (alive) {
          setNearby({ key: nearbyKey, items: found.map((place) => nearbyItem(category, place)) });
        }
      },
      () => {
        if (alive) setNearby({ key: nearbyKey, items: null });
      },
    );
    return () => {
      alive = false;
    };
  }, [kakaoStatus, nearbyKey, category, centerLat, centerLng]);

  const nearbyLoaded = nearby.key === nearbyKey;
  const nearbyFailed = kakaoStatus === "error" || (nearbyLoaded && nearby.items === null);
  const nearbyLoading = !nearbyFailed && !nearbyLoaded;
  const curated = station.curated;
  const items = [
    ...(curated
      ? curated.places
          .filter(
            (place) =>
              place.category === category && (nearbyFailed || place.zone !== "outside"),
          )
          .map((place) => curatedItem(curated, place))
      : []),
    ...(nearbyLoaded && nearby.items ? nearby.items : []),
  ].sort((a, b) => a.walkMinutes - b.walkMinutes);

  const selected = items.find((item) => item.id === selectedId) ?? null;
  const activeId = selected?.id ?? items[0]?.id ?? null;

  const overlays = buildOverlays({
    locale,
    station,
    items,
    activeId,
    onSelect: setSelectedId,
  });

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSuggestOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectStation(next: StationOption) {
    setStation(next);
    setQuery(t(next.name, locale));
    setSelectedId(null);
    setSuggestOpen(false);
  }

  function selectCategory(next: CategoryId) {
    setCategory(next);
    setSelectedId(null);
  }

  function toggleLocale() {
    const nextLocale: Locale = locale === "ko" ? "en" : "ko";
    if (query === t(station.name, locale)) {
      setQuery(t(station.name, nextLocale));
    }
    setLocale(nextLocale);
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!suggestOpen && ["ArrowDown", "Enter"].includes(event.key)) {
      setSuggestOpen(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((index) =>
        suggestions.length === 0 ? 0 : (index + 1) % suggestions.length,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((index) =>
        suggestions.length === 0
          ? 0
          : (index - 1 + suggestions.length) % suggestions.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const picked = suggestions[highlightIndex];
      if (picked) selectStation(picked);
    } else if (event.key === "Escape") {
      setSuggestOpen(false);
    }
  }

  return (
    <div className="flex min-h-dvh justify-center bg-[#e8eaed]">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-white shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <header className="flex items-center justify-between px-4 pb-2 pt-3">
          <div className="flex items-center gap-2">
            <TrainLogo />
            <h1 className="text-[18px] font-bold tracking-tight text-neutral-900">
              {t(COPY.title, locale)}
            </h1>
          </div>
          <button
            type="button"
            onClick={toggleLocale}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium"
            aria-label="Change language"
          >
            <GlobeIcon />
            <span className={locale === "ko" ? "font-bold text-[#2563eb]" : "text-neutral-400"}>
              KO
            </span>
            <span className="text-neutral-300">/</span>
            <span className={locale === "en" ? "font-bold text-[#2563eb]" : "text-neutral-400"}>
              EN
            </span>
          </button>
        </header>

        <div className="relative z-50 px-4" ref={searchRef}>
          <label className="flex items-center gap-2 rounded-full bg-[#f3f4f6] px-3.5 py-[11px]">
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSuggestOpen(true);
                setHighlightIndex(0);
              }}
              onFocus={() => {
                setSuggestOpen(true);
                setHighlightIndex(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder={t(COPY.search, locale)}
              className="w-full bg-transparent text-[13px] text-neutral-800 outline-none placeholder:text-neutral-400"
              role="combobox"
              aria-controls="station-suggestions"
              aria-expanded={suggestOpen}
              aria-autocomplete="list"
            />
          </label>

          {suggestOpen ? (
            <div
              className="absolute inset-x-4 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.14)]"
              id="station-suggestions"
              role="listbox"
            >
              {suggestions.length === 0 ? (
                <p className="px-4 py-3 text-[13px] text-neutral-400">
                  {t(searchPending ? COPY.searching : COPY.noStation, locale)}
                </p>
              ) : (
                suggestions.map((item, index) => {
                  const active = index === highlightIndex;
                  const current = item.key === station.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="option"
                      aria-selected={current}
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => selectStation(item)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left ${
                        active ? "bg-sky-50" : "bg-white"
                      }`}
                    >
                      <span>
                        <span className="block text-[14px] font-semibold text-neutral-900">
                          {t(item.name, locale)}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-neutral-400">
                          {t(item.lines, locale)}
                        </span>
                      </span>
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </button>
                  );
                })
              )}
            </div>
          ) : null}
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-3">
          {CATEGORIES.map((item) => {
            const selected = item.id === category;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectCategory(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-3.5 py-[7px] text-[13px] font-medium ${
                  selected
                    ? "border-[#3b82f6] text-neutral-900 shadow-[0_0_0_1px_#3b82f6]"
                    : "border-neutral-200 text-neutral-700"
                }`}
              >
                {t(item.name, locale)}
                <CategoryIcon category={item.id} size={18} />
              </button>
            );
          })}
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#eef1f3]">
          <div className="relative isolate min-h-0 flex-1">
            <KakaoMap
              center={station.center}
              focus={selected?.position}
              overlays={overlays}
            />
          </div>

          <section className="relative z-40 shrink-0 rounded-t-[22px] bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_28px_rgba(15,23,42,0.08)]">
            <div className="mb-3 flex justify-center">
              <span className="h-[4px] w-10 rounded-full bg-neutral-300" />
            </div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="text-[18px] font-bold text-neutral-900">
                {t(COPY.smartList, locale)}
              </h2>
              <p className="shrink-0 text-[12px] text-neutral-400">
                {t(COPY.sortHint, locale)}
              </p>
            </div>
            {curated ? null : (
              <p className="-mt-1.5 mb-2.5 text-[12px] text-neutral-400">
                {t(COPY.gatePending, locale)}
              </p>
            )}
            <div className="flex max-h-[188px] flex-col gap-2.5 overflow-y-auto pb-1">
              {items.length === 0 ? (
                <p className="rounded-2xl border border-neutral-100 px-4 py-8 text-center text-sm text-neutral-400">
                  {t(
                    nearbyLoading
                      ? COPY.loading
                      : nearbyFailed && !curated
                        ? COPY.loadFailed
                        : COPY.empty,
                    locale,
                  )}
                </p>
              ) : (
                items.map((item) => {
                  const active = item.id === activeId;
                  return (
                    <div
                      key={item.id}
                      className={`rounded-[18px] border bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
                        active ? "border-neutral-200" : "border-neutral-100"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className="block w-full text-left"
                      >
                        <p className="flex items-start gap-2 text-[15px] font-bold leading-snug text-neutral-900">
                          <span className="mt-[2px]">
                            <CategoryIcon category={item.category} size={18} />
                          </span>
                          {t(item.name, locale)}
                        </p>
                        <p className="mt-1.5 text-[13px] text-neutral-500">
                          {t(item.walk, locale)}
                          {item.status ? (
                            <>
                              <span className="mx-1.5 text-neutral-300">|</span>
                              {t(item.status, locale)}
                            </>
                          ) : null}
                        </p>
                        <p className="mt-1 text-[13px] text-neutral-400">
                          {t(item.note, locale)}
                        </p>
                      </button>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="inline-flex rounded-full bg-neutral-100 px-2 py-[3px] text-[11px] font-medium text-neutral-500">
                          {t(zoneLabel(item.zone), locale)}
                        </span>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[12px] font-medium text-[#2563eb]"
                          >
                            {t(COPY.kakaoLink, locale)} ›
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
