"use client";

import { useState } from "react";
import { useLocale } from "../_lib/locale";
import { addReport, type ReportType } from "../_lib/reports";
import { useDragToClose } from "../_lib/useSheetDrag";
import { t, type Localized, type StationOption } from "../_lib/stations";

export type QuickReport = { emoji: string; text: Localized; type?: ReportType };

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
    ko: "제보는 이 역을 보는 모든 이용자에게 실시간으로 공유돼요",
    en: "Reports are shared live with everyone viewing this station",
    zh: "上报会实时分享给所有查看此车站的用户",
    ja: "投稿はこの駅を見ているすべての利用者にリアルタイムで共有されます",
  },
  close: { ko: "닫기", en: "Close", zh: "关闭", ja: "閉じる" },
};

const QUICK_REPORTS: QuickReport[] = [
  {
    emoji: "🧻",
    type: "toilet_paper",
    text: { ko: "화장실 휴지 있어요", en: "Restroom has tissue", zh: "卫生间有纸巾", ja: "トイレにティッシュあり" },
  },
  {
    emoji: "🚧",
    type: "toilet_paper",
    text: {
      ko: "화장실 청소·고장 중",
      en: "Restroom closed for cleaning/repair",
      zh: "卫生间清洁·维修中",
      ja: "トイレ清掃・故障中",
    },
  },
  {
    emoji: "🛗",
    type: "escalator",
    text: { ko: "엘리베이터 정상 운행", en: "Elevator is working", zh: "电梯运行正常", ja: "エレベーター正常運転" },
  },
  {
    emoji: "⚠️",
    type: "escalator",
    text: { ko: "에스컬레이터 고장", en: "Escalator out of order", zh: "扶梯故障", ja: "エスカレーター故障" },
  },
  {
    emoji: "👥",
    type: "crowd",
    text: { ko: "지금 많이 붐벼요", en: "Very crowded right now", zh: "现在非常拥挤", ja: "今とても混雑しています" },
  },
  {
    emoji: "🧳",
    type: "general",
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
  quickReports?: QuickReport[];
  onClose: () => void;
  onPosted: () => void;
}) {
  const locale = useLocale();
  const [draft, setDraft] = useState("");
  const { sheetRef, sheetStyle, handleProps } = useDragToClose<HTMLDivElement>(onClose);

  function post(text: Localized, type?: ReportType) {
    if (!station) return;
    addReport(station, text, type);
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
      <div
        ref={sheetRef}
        style={sheetStyle}
        className="relative w-full rounded-t-3xl bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] transition-transform duration-200 ease-out"
      >
        <div {...handleProps} className="-mx-4 flex cursor-grab justify-center pb-3 pt-3 active:cursor-grabbing" aria-hidden>
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
                  onClick={() => post(item.text, item.type)}
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
