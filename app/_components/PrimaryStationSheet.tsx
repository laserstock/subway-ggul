"use client";

import { useState } from "react";
import { t, type Locale, type Localized } from "../_lib/i18n";
import { setPrimaryStation } from "../_lib/profile";
import type { StationOption } from "../_lib/stations";
import BottomSheet from "./BottomSheet";
import StationSearch from "./StationSearch";

const COPY = {
  title: { ko: "나의 주 사용 역", en: "My home station", zh: "我的常用车站", ja: "よく使う駅" },
  hint: {
    ko: "꿀스팟에서 닉네임 앞에 표시돼요 (예: 장한평역 · 꿀벌)",
    en: "Shown before your nickname in Honey Spot (e.g. Janghanpyeong · Bee)",
    zh: "在蜜点中显示在昵称前（例：长汉坪站 · 蜜蜂）",
    ja: "ハニースポットでニックネームの前に表示されます（例：長漢坪駅 · ミツバチ）",
  },
  useHere: { ko: "📍 지금 {station}로 설정", en: "📍 Use {station}", zh: "📍 设为当前 {station}", ja: "📍 今の{station}に設定" },
  search: { ko: "역 이름 검색 (예: 장한평역)", en: "Search a station", zh: "搜索车站", ja: "駅名で検索" },
} satisfies Record<string, Localized>;

/** Station search in a bottom sheet; saves the pick as the profile's primary station. */
export default function PrimaryStationSheet({
  locale,
  here,
  current,
  notice,
  onClose,
  onPicked,
}: {
  locale: Locale;
  /** Offered as a one-tap choice, e.g. the station the user is at. */
  here: StationOption | null;
  current: StationOption | null;
  /** Shown above the search instead of the hint, e.g. why the sheet opened. */
  notice?: string;
  onClose: () => void;
  onPicked: (station: StationOption) => void;
}) {
  const [query, setQuery] = useState("");

  function pick(station: StationOption) {
    setPrimaryStation(station);
    onPicked(station);
  }

  return (
    <BottomSheet title={t(COPY.title, locale)} onClose={onClose}>
      <div className="min-h-[440px] px-5">
        {notice ? (
          <p className="mt-3 rounded-2xl bg-honey-soft px-3.5 py-3 text-[14px] font-extrabold text-honey-strong">
            📍 {notice}
          </p>
        ) : (
          <p className="mt-1 text-[12px] text-ink-muted">{t(COPY.hint, locale)}</p>
        )}
        {here && here.key !== current?.key ? (
          <button
            type="button"
            onClick={() => pick(here)}
            className="mt-3 rounded-full bg-honey-soft px-3 py-1.5 text-[12px] font-bold text-honey-strong active:scale-95"
          >
            {t(COPY.useHere, locale).replace("{station}", t(here.name, locale))}
          </button>
        ) : null}
        <StationSearch
          locale={locale}
          query={query}
          onQueryChange={setQuery}
          onSelect={pick}
          currentKey={current?.key ?? null}
          placeholder={t(COPY.search, locale)}
          near={here?.center ?? current?.center ?? null}
          className="mt-3"
          inputClassName="rounded-xl border border-line bg-surface px-3 py-2.5"
        />
      </div>
    </BottomSheet>
  );
}
