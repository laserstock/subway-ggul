import type { Localized } from "./stations";

/** Beta sample tips keyed by Korean station name; real tips will come from user reports. */
export const STATION_TIPS: Record<string, Localized> = {
  광화문역: {
    ko: "5번 출구 지하 연결통로 이용 시 스벅 바로 연결",
    en: "Take the Exit 5 underground passage straight to Starbucks",
    zh: "走5号出口地下通道可直达星巴克",
    ja: "5番出口の地下連絡通路からスタバに直結",
  },
  잠실역: {
    ko: "롯데월드몰까지 지하 연결통로로 비 안 맞고 이동 가능",
    en: "Walk to Lotte World Mall through the underground passage, no umbrella needed",
    zh: "可经地下通道直达乐天世界购物中心，不用淋雨",
    ja: "ロッテワールドモールまで地下通路で雨に濡れず移動可能",
  },
  강남역: {
    ko: "출퇴근 시간엔 2호선 승강장 양 끝 칸이 비교적 덜 붐벼요",
    en: "At rush hour, the cars at both ends of the Line 2 platform are less crowded",
    zh: "高峰时段2号线站台两端车厢相对不那么拥挤",
    ja: "ラッシュ時は2号線ホームの両端の車両が比較的空いています",
  },
  홍대입구역: {
    ko: "공항철도·경의중앙선 환승 통로가 길어요. 환승 시간은 5분 이상 여유 있게",
    en: "The transfer to AREX / Gyeongui–Jungang is long; allow 5+ minutes",
    zh: "换乘机场铁路·京义中央线通道较长，请预留5分钟以上",
    ja: "空港鉄道・京義中央線への乗り換え通路は長め。5分以上の余裕を",
  },
  서울역: {
    ko: "KTX 이용 시 짐이 많다면 엘리베이터 위치부터 확인하세요",
    en: "Heading to the KTX with luggage? Find the elevators first",
    zh: "乘坐KTX且行李多时，请先确认电梯位置",
    ja: "KTX利用で荷物が多いなら、まずエレベーターの位置を確認",
  },
};
