"use client";

import { useState } from "react";
import { useLocale } from "../_lib/locale";
import { addReport } from "../_lib/reports";
import { t, type Localized, type StationOption } from "../_lib/stations";

const COPY = {
  title: {
    ko: "에서 지금 무슨 일이 있나요?",
    en: ": what's happening now?",
    zh: "：现在有什么情况？",
    ja: "で今何が起きていますか？",
  },
  hint: { ko: "누르면 바로 등록돼요", en: "Tap to post instantly", zh: "点击即可发布", ja: "タップですぐ投稿" },
  placeholder: {
    ko: "직접 입력 (최대 60자)",
    en: "Write your own (max 60 chars)",
    zh: "直接输入（最多60字）",
    ja: "直接入力（最大60文字）",
  },
  submit: { ko: "등록", en: "Post", zh: "发布", ja: "投稿" },
  needStation: {
    ko: "위치를 허용하거나 역을 검색하면 제보할 수 있어요",
    en: "Allow location or search a station to report",
    zh: "允许定位或搜索车站后即可上报",
    ja: "位置情報を許可するか駅を検索すると投稿できます",
  },
  localNote: {
    ko: "베타: 제보는 이 기기에만 저장돼요",
    en: "Beta: reports are saved on this device only",
    zh: "测试版：上报仅保存在本设备",
    ja: "ベータ版：投稿はこの端末にのみ保存されます",
  },
  close: { ko: "닫기", en: "Close", zh: "关闭", ja: "閉じる" },
};

const QUICK_REPORTS: { emoji: string; text: Localized }[] = [
  {
    emoji: "🧻",
    text: { ko: "화장실 휴지 있어요", en: "Restroom has tissue", zh: "卫生间有纸巾", ja: "トイレにティッシュあり" },
  },
  {
    emoji: "🚧",
    text: {
      ko: "화장실 청소·고장 중",
      en: "Restroom closed for cleaning/repair",
      zh: "卫生间清洁·维修中",
      ja: "トイレ清掃・故障中",
    },
  },
  {
    emoji: "🛗",
    text: { ko: "엘리베이터 정상 운행", en: "Elevator is working", zh: "电梯运行正常", ja: "エレベーター正常運転" },
  },
  {
    emoji: "⚠️",
    text: { ko: "에스컬레이터 고장", en: "Escalator out of order", zh: "扶梯故障", ja: "エスカレーター故障" },
  },
  {
    emoji: "👥",
    text: { ko: "지금 많이 붐벼요", en: "Very crowded right now", zh: "现在非常拥挤", ja: "今とても混雑しています" },
  },
  {
    emoji: "🧳",
    text: {
      ko: "T-Locker 빈자리 있어요",
      en: "T-Locker has free space",
      zh: "T-Locker 有空位",
      ja: "T-Lockerに空きあり",
    },
  },
];

export default function ReportSheet({
  station,
  quickReports = QUICK_REPORTS,
  onClose,
  onPosted,
}: {
  station: StationOption | null;
  quickReports?: { emoji: string; text: Localized }[];
  onClose: () => void;
  onPosted: () => void;
}) {
  const locale = useLocale();
  const [draft, setDraft] = useState("");

  function post(text: Localized) {
    if (!station) return;
    addReport(station, text);
    setDraft("");
    onPosted();
  }

  return (
    <div className="absolute inset-0 z-[60] flex items-end bg-black/35" role="dialog" aria-modal>
      <button
        type="button"
        aria-label={t(COPY.close, locale)}
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-full rounded-t-3xl bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
        <div className="mb-3 flex justify-center">
          <span className="h-[4px] w-10 rounded-full bg-neutral-300" />
        </div>
        {station ? (
          <>
            <h2 className="text-[17px] font-extrabold text-neutral-900">
              {t(station.name, locale)}
              {t(COPY.title, locale)}
            </h2>
            <p className="mt-0.5 text-[12px] text-neutral-500">{t(COPY.hint, locale)}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {quickReports.map((item) => (
                <button
                  key={item.text.ko}
                  type="button"
                  onClick={() => post(item.text)}
                  className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2.5 text-left text-[13px] font-medium text-neutral-800 active:bg-neutral-50"
                >
                  <span aria-hidden>{item.emoji}</span>
                  {t(item.text, locale)}
                </button>
              ))}
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const text = draft.trim();
                if (text) post({ ko: text, en: text });
              }}
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, 60))}
                placeholder={t(COPY.placeholder, locale)}
                className="min-w-0 flex-1 rounded-xl bg-[#f3f4f6] px-3 py-2.5 text-[13px] outline-none placeholder:text-neutral-400"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="shrink-0 rounded-xl bg-[#1e3a8a] px-4 text-[13px] font-bold text-white disabled:bg-neutral-300"
              >
                {t(COPY.submit, locale)}
              </button>
            </form>
            <p className="mt-2 text-[11px] text-neutral-400">{t(COPY.localNote, locale)}</p>
          </>
        ) : (
          <p className="py-6 text-center text-[13px] text-neutral-500">{t(COPY.needStation, locale)}</p>
        )}
      </div>
    </div>
  );
}
