import { t, type Localized, type StationOption } from "../_lib/stations";

export const DASHBOARD_TITLE: Localized = {
  ko: "역 꿀정보",
  en: "Station tips",
  zh: "车站攻略",
  ja: "駅お役立ち情報",
};

/** "강남역 꿀정보 4가지" */
export function tilesTitle(station: StationOption, count: number): Localized {
  return {
    ko: `${station.name.ko} 꿀정보 ${count}가지`,
    en: `${count} tips for ${station.name.en}`,
    zh: `${t(station.name, "zh")}的${count}个攻略`,
    ja: `${t(station.name, "ja")}のお役立ち情報${count}つ`,
  };
}
