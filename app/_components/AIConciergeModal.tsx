"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "../_lib/locale";
import { t, type Localized } from "../_lib/stations";
import BottomSheet from "./BottomSheet";
import DragScroll from "./DragScroll";
import { SparkleIcon } from "./icons";

type Card = {
  station: string;
  toilet?: string;
  elevator?: string;
  transferCar?: string;
  tip?: string;
};

type Turn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  cards?: Card[];
  cached?: boolean;
};

const COPY = {
  title: {
    ko: "AI 상황별 해결사",
    en: "AI situation helper",
    zh: "AI 情境解決助手",
    ja: "AIシチュエーション助手",
  },
  close: { ko: "닫기", en: "Close", zh: "關閉", ja: "閉じる" },
  placeholder: {
    ko: "예: 성수역 캐리어 끌고 화장실 들렀다 공항 가는 법",
    en: "e.g. Seongsu with luggage, toilet, then airport",
    zh: "例：聖水站拖行李上廁所再去機場",
    ja: "例：聖水駅で荷物・トイレ経由で空港へ",
  },
  send: { ko: "전송", en: "Send", zh: "傳送", ja: "送信" },
  thinking: { ko: "현장 데이터 확인 중…", en: "Checking station facts…", zh: "正在核對車站資料…", ja: "駅データを確認中…" },
  empty: {
    ko: "상황을 고르거나 아래에 적어 주세요. 확인된 역 시설 데이터만 근거로 답해요.",
    en: "Pick a situation or type below. Answers stick to verified station facts.",
    zh: "選擇情境或在下方輸入。只根據已核實的車站資料回答。",
    ja: "状況を選ぶか下に入力してください。確認済みの駅データだけを根拠に答えます。",
  },
  rateLimited: {
    ko: "오늘 AI 이용 횟수(5회)를 모두 썼어요. 내일 다시 시도해 주세요.",
    en: "Daily AI limit reached (5/day). Try again tomorrow.",
    zh: "今日 AI 次數已用完（每天 5 次）。請明天再試。",
    ja: "本日のAI利用上限（5回）に達しました。明日またお試しください。",
  },
  failed: {
    ko: "잠시 후 다시 시도해 주세요.",
    en: "Please try again in a moment.",
    zh: "請稍後再試。",
    ja: "しばらくしてからもう一度お試しください。",
  },
  unconfigured: {
    ko: "AI 키가 아직 설정되지 않았어요.",
    en: "AI is not configured yet.",
    zh: "尚未設定 AI 金鑰。",
    ja: "AIキーがまだ設定されていません。",
  },
  cached: { ko: "캐시 응답", en: "Cached", zh: "快取回覆", ja: "キャッシュ応答" },
  remaining: {
    ko: "오늘 남은 횟수 {n}회",
    en: "{n} left today",
    zh: "今日剩餘 {n} 次",
    ja: "本日残り {n} 回",
  },
  toilet: { ko: "화장실", en: "Restroom", zh: "洗手間", ja: "トイレ" },
  elevator: { ko: "엘리베이터", en: "Elevator", zh: "電梯", ja: "エレベーター" },
  transfer: { ko: "빠른 환승", en: "Fast transfer", zh: "快速轉乘", ja: "快速乗換" },
  tip: { ko: "팁", en: "Tip", zh: "提示", ja: "ヒント" },
} satisfies Record<string, Localized>;

const CHIPS: { id: string; label: Localized; query: Localized }[] = [
  {
    id: "luggage",
    label: {
      ko: "🧳 캐리어/짐 많음 (계단 Zero)",
      en: "🧳 Lots of luggage (zero stairs)",
      zh: "🧳 行李多（少爬樓梯）",
      ja: "🧳 荷物多い（階段ゼロ）",
    },
    query: {
      ko: "캐리어·짐 많을 때 계단 없이 환승·출구 가는 법",
      en: "How to transfer and exit with heavy luggage without stairs",
      zh: "行李多時如何少爬樓梯完成轉乘與出口",
      ja: "荷物が多いとき階段なしで乗換・出口まで",
    },
  },
  {
    id: "toilet",
    label: {
      ko: "🚻 개찰구 안 급한 화장실",
      en: "🚻 Urgent toilet inside gates",
      zh: "🚻 閘機內緊急洗手間",
      ja: "🚻 改札内の急ぎトイレ",
    },
    query: {
      ko: "개찰구 안에서 급할 때 쓸 수 있는 화장실 위치",
      en: "Inside-gate restrooms when I'm in a hurry",
      zh: "閘機內緊急可使用的洗手間位置",
      ja: "改札内ですぐ使えるトイレの位置",
    },
  },
  {
    id: "rain",
    label: {
      ko: "☔ 비 오는 날 실내 동선",
      en: "☔ Indoor route when raining",
      zh: "☔ 下雨日室內動線",
      ja: "☔ 雨の日の屋内ルート",
    },
    query: {
      ko: "비 오는 날 최대한 실내로만 이동하는 동선",
      en: "Stay indoors as much as possible when it rains",
      zh: "下雨時盡量走室內動線",
      ja: "雨の日はできるだけ屋内だけで移動",
    },
  },
  {
    id: "last",
    label: {
      ko: "⏰ 막차·막장환승 피하기",
      en: "⏰ Avoid last train / brutal transfers",
      zh: "⏰ 避開末班車與超長轉乘",
      ja: "⏰ 終電・激ムズ乗換を避ける",
    },
    query: {
      ko: "막차 놓치지 않고 막장 환승 피하는 방법",
      en: "Catch the last train and avoid brutal transfers",
      zh: "如何趕上末班車並避開超長轉乘",
      ja: "終電に間に合わせ激ムズ乗換を避ける方法",
    },
  },
];

export default function AIConciergeModal({
  onClose,
  initialQuery = "",
  stationHint = "",
}: {
  onClose: () => void;
  initialQuery?: string;
  /** Current dashboard station name to ground chip prompts. */
  stationHint?: string;
}) {
  const locale = useLocale();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(initialQuery);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bootRef = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  async function ask(raw: string) {
    const query = raw.trim();
    if (!query || busy) return;
    setError(null);
    setBusy(true);
    const userTurn: Turn = { id: `u-${Date.now()}`, role: "user", text: query };
    setTurns((prev) => [...prev, userTurn]);
    setDraft("");

    try {
      const response = await fetch("/api/ai-concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, locale }),
      });
      const data = (await response.json()) as {
        answer?: string;
        cards?: Card[];
        cached?: boolean;
        remaining?: number;
        error?: string;
        message?: string;
      };

      if (typeof data.remaining === "number") setRemaining(data.remaining);

      if (!response.ok) {
        const message =
          data.error === "rate_limited"
            ? data.message || t(COPY.rateLimited, locale)
            : data.error === "gemini_unconfigured"
              ? t(COPY.unconfigured, locale)
              : t(COPY.failed, locale);
        setError(message);
        return;
      }

      setTurns((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: data.answer ?? "",
          cards: data.cards,
          cached: data.cached,
        },
      ]);
    } catch {
      setError(t(COPY.failed, locale));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (bootRef.current) return;
    if (!initialQuery.trim()) return;
    bootRef.current = true;
    void ask(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on open with seed query
  }, [initialQuery]);

  function chipQuery(chip: (typeof CHIPS)[number]) {
    const base = t(chip.query, locale);
    return stationHint ? `${stationHint} ${base}` : base;
  }

  return (
    <BottomSheet
      title={
        <span className="inline-flex items-center gap-2" id={titleId}>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1E293B] text-[#FBBF24]">
            <SparkleIcon size={14} />
          </span>
          {t(COPY.title, locale)}
        </span>
      }
      onClose={onClose}
    >
      <div className="mt-1 flex items-center justify-between px-5">
        <p className="text-[12px] font-semibold text-ink-muted">
          {remaining != null ? t(COPY.remaining, locale).replace("{n}", String(remaining)) : "\u00a0"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2.5 py-1 text-[13px] font-bold text-ink-muted transition active:scale-95"
        >
          ✕ {t(COPY.close, locale)}
        </button>
      </div>

      <DragScroll className="mt-3 flex gap-2 px-5 pb-1">
        {CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            disabled={busy}
            onClick={() => void ask(chipQuery(chip))}
            className="shrink-0 rounded-full border border-line bg-surface-muted px-3 py-1.5 text-[12px] font-bold text-ink transition active:scale-95 disabled:opacity-50"
          >
            {t(chip.label, locale)}
          </button>
        ))}
      </DragScroll>

      <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-3">
        {turns.length === 0 && !busy ? (
          <p className="rounded-2xl bg-honey-soft/60 px-3.5 py-3 text-[13px] font-medium leading-relaxed text-ink-muted">
            {t(COPY.empty, locale)}
          </p>
        ) : null}

        {turns.map((turn) => (
          <div key={turn.id} className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                turn.role === "user"
                  ? "bg-[#1E293B] font-semibold text-white"
                  : "border border-line bg-surface text-ink shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
              }`}
            >
              <p className="whitespace-pre-wrap">{turn.text}</p>
              {turn.cached ? (
                <p className="mt-1 text-[11px] font-bold text-honey-strong">{t(COPY.cached, locale)}</p>
              ) : null}
              {turn.cards?.length ? (
                <ul className="mt-2 space-y-2">
                  {turn.cards.map((card, index) => (
                    <li
                      key={`${card.station}-${index}`}
                      className="rounded-xl border border-honey/25 bg-honey-soft/50 px-3 py-2"
                    >
                      <p className="text-[13px] font-extrabold text-ink">{card.station}</p>
                      {card.toilet ? (
                        <p className="mt-1 text-[12px] text-ink">
                          <span className="font-bold text-honey-strong">{t(COPY.toilet, locale)}</span> · {card.toilet}
                        </p>
                      ) : null}
                      {card.elevator ? (
                        <p className="mt-0.5 text-[12px] text-ink">
                          <span className="font-bold text-honey-strong">{t(COPY.elevator, locale)}</span> · {card.elevator}
                        </p>
                      ) : null}
                      {card.transferCar ? (
                        <p className="mt-0.5 text-[12px] text-ink">
                          <span className="font-bold text-honey-strong">{t(COPY.transfer, locale)}</span> · {card.transferCar}
                        </p>
                      ) : null}
                      {card.tip ? (
                        <p className="mt-0.5 text-[12px] text-ink-muted">
                          <span className="font-bold">{t(COPY.tip, locale)}</span> · {card.tip}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ))}

        {busy ? <p className="text-[12px] font-bold text-ink-muted">{t(COPY.thinking, locale)}</p> : null}
        {error ? <p className="rounded-xl bg-[#fdecec] px-3 py-2 text-[12px] font-bold text-[#dc2626]">{error}</p> : null}
      </div>

      <form
        className="flex shrink-0 items-center gap-2 border-t border-line px-4 pt-3"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(draft);
        }}
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t(COPY.placeholder, locale)}
          maxLength={400}
          disabled={busy}
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-neutral-400 focus:border-honey/50"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#1E293B] px-3.5 py-2.5 text-[13px] font-bold text-white transition active:scale-95 disabled:opacity-40"
        >
          <SparkleIcon size={13} className="text-[#FBBF24]" />
          {t(COPY.send, locale)}
        </button>
      </form>
    </BottomSheet>
  );
}
