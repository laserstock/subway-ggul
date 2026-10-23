import { t, type Localized, type StationOption } from "../_lib/stations";

export const DASHBOARD_TITLE: Localized = {
  ko: "역 꿀정보",
  en: "Station tips",
  zh: "车站攻略",
  ja: "駅お役立ち情報",
};

/** "강남역 꿀정보" */
export function stationTitle(station: StationOption): Localized {
  return {
    ko: `${station.name.ko} 꿀정보`,
    en: `${station.name.en} tips`,
    zh: `${t(station.name, "zh")}攻略`,
    ja: `${t(station.name, "ja")}お役立ち情報`,
  };
}
