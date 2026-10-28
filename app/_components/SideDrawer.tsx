"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { saveFeedback } from "../_lib/feedback";
import { requestHomeReset } from "../_lib/homeReset";
import { t, type Localized } from "../_lib/i18n";
import { PRIVACY_TITLE } from "../_lib/legal";
import { useLocale, useMessages } from "../_lib/locale";
import { deleteReport, formatRelativeTime, useMyReports, useNow } from "../_lib/reports";
import { clearSelectedStation, setDestinationStation } from "../_lib/selectedStation";
import { HomeIcon, TrainLogo } from "./icons";
import ThemePicker from "./ThemePicker";

export const APP_VERSION = "1.0.0";

type DrawerView = "menu" | "notices" | "myReports" | "feedback";
type ShareStatus = "copied" | "failed" | null;

type MenuId = Exclude<DrawerView, "menu"> | "share";

const MENU: { id: MenuId; emoji: string; tint: string; accent: string }[] = [
  { id: "notices", emoji: "📢", tint: "#fff1d6", accent: "#f5a700" },
  { id: "myReports", emoji: "✏️", tint: "#e5efff", accent: "#3b7cf6" },
  { id: "feedback", emoji: "💬", tint: "#e6f5e9", accent: "#22a559" },
  { id: "share", emoji: "🔗", tint: "#f3e8ff", accent: "#a855f7" },
];

const TERMS_LINK: Localized = { ko: "이용약관", en: "Terms", zh: "使用条款", ja: "利用規約" };

const UPDATE_TAG: Localized = { ko: "업데이트", en: "Update", zh: "更新", ja: "アップデート" };
const NEW_TAG: Localized = { ko: "신규", en: "New", zh: "新功能", ja: "新機能" };

const NOTICES: { date: string; tag: Localized; title: Localized; body: Localized }[] = [
  {
    date: "2026.10.20",
    tag: NEW_TAG,
    title: {
      ko: "한국어 · English · 中文 · 日本語 지원",
      en: "Now in Korean · English · Chinese · Japanese",
      zh: "支持韩语 · 英语 · 中文 · 日语",
      ja: "韓国語 · 英語 · 中国語 · 日本語に対応",
    },
    body: {
      ko: "상단 🌐 버튼에서 언어를 바꿀 수 있어요. 일부 화면은 순차적으로 번역 중이에요.",
      en: "Switch languages with the 🌐 button. Some screens are still being translated.",
      zh: "点击顶部 🌐 按钮即可切换语言。部分页面正在陆续翻译中。",
      ja: "上部の 🌐 ボタンで言語を切り替えられます。一部の画面は順次翻訳中です。",
    },
  },
  {
    date: "2026.10.20",
    tag: UPDATE_TAG,
    title: {
      ko: "출구 매장에 '스마트 점핑 안내' 추가",
      en: "Smart station jump for exit shops",
      zh: "出口商店新增“智能跳站提示”",
      ja: "出口ショップに「スマート駅ジャンプ案内」を追加",
    },
    body: {
      ko: "현재 역에 원하는 매장이 없으면 같은 노선 앞뒤 역의 매장을 추천해 드려요.",
      en: "If your station lacks the store you want, we suggest one on a nearby stop.",
      zh: "当前车站没有想要的商店时，为您推荐同一线路前后站的商店。",
      ja: "今いる駅に目的の店舗がない場合、同じ路線の前後の駅の店舗をおすすめします。",
    },
  },
  {
    date: "2026.10.20",
    tag: NEW_TAG,
    title: {
      ko: "긴급 화장실 · 약국 · 병원 3초 비교",
      en: "Urgent restroom · pharmacy · clinic compare",
      zh: "紧急卫生间 · 药店 · 医院 3秒比较",
      ja: "緊急トイレ · 薬局 · 病院を3秒比較",
    },
    body: {
      ko: "지금 지나는 역과 다음 역의 개찰구 안/밖 시설을 한눈에 비교해요.",
      en: "Compare facilities inside/outside the gate at this stop and the next.",
      zh: "一眼比较当前车站和下一站闸机内/外的设施。",
      ja: "今の駅と次の駅の改札内・外の施設をひと目で比較します。",
    },
  },
  {
    date: "2026.10.20",
    tag: NEW_TAG,
    title: {
      ko: "새 홈 화면 & 실시간 현장 제보",
      en: "New home & live station reports",
      zh: "全新首页 & 实时现场上报",
      ja: "新しいホーム画面 & リアルタイム現場投稿",
    },
    body: {
      ko: "가장 가까운 역을 자동으로 찾고, 역 소식을 1초 만에 제보할 수 있어요.",
      en: "We find your nearest station automatically and you can report in a second.",
      zh: "自动查找最近的车站，1秒即可上报车站消息。",
      ja: "最寄り駅を自動で探し、駅の情報を1秒で投稿できます。",
    },
  },
];

function Chevron({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={direction === "right" ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SubHeader({ title, onBack, backLabel }: { title: string; onBack: () => void; backLabel: string }) {
  return (
    <div className="flex items-center gap-1 px-3 pb-2 pt-1">
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
      >
        <Chevron direction="left" />
      </button>
      <h3 className="text-[16px] font-extrabold text-neutral-900">{title}</h3>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>;
}

export default function SideDrawer({
  id,
  isOpen,
  onClose,
}: {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const locale = useLocale();
  const m = useMessages();
  const router = useRouter();
  const myReports = useMyReports();
  const now = useNow();
  const [view, setView] = useState<DrawerView>("menu");
  const [shareStatus, setShareStatus] = useState<ShareStatus>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  function resetInnerState() {
    setView("menu");
    setShareStatus(null);
    setFeedbackSent(false);
  }

  async function share() {
    const url = window.location.origin;
    const data = { title: m.app.name, text: m.drawer.shareText, url };
    try {
      if (typeof navigator.share === "function") {
        await navigator.share(data);
        setShareStatus(null);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("failed");
    }
  }

  function selectMenu(item: MenuId) {
    if (item === "share") {
      void share();
      return;
    }
    setShareStatus(null);
    setView(item);
  }

  function sendFeedback() {
    const text = feedback.trim();
    if (!text) return;
    void saveFeedback(text, locale);
    setFeedback("");
    setFeedbackSent(true);
  }

  function resetToHome() {
    clearSelectedStation();
    setDestinationStation(null);
    requestHomeReset();
    onClose();
    router.push("/");
  }

  return (
    <div
      id={id}
      className={`absolute inset-0 z-[90] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={m.drawer.close}
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-[3px] transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={m.app.name}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && !isOpen) resetInnerState();
        }}
        className={`absolute inset-y-0 left-0 flex w-[84%] max-w-[330px] flex-col rounded-r-[28px] bg-surface pt-[max(12px,env(safe-area-inset-top))] shadow-[8px_0_40px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+48px)]"
        }`}
      >
        <div className="flex items-start justify-between gap-2 px-5 pb-4 pt-2">
          <div className="flex min-w-0 items-center gap-3">
            <TrainLogo />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[17px] font-extrabold tracking-tight text-honey-strong">
                {m.app.name}
                <span className="rounded-full bg-neutral-100 px-2 py-[2px] text-[11px] font-bold text-neutral-500">
                  v{APP_VERSION}
                </span>
              </p>
              <p className="mt-0.5 break-words text-[12px] leading-snug text-neutral-500">{m.app.tagline}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={m.drawer.close}
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors active:bg-neutral-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mx-5 h-px bg-neutral-100" />

        {view === "menu" ? (
          <nav className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-2">
            <ul>
              {MENU.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectMenu(item.id)}
                    className="flex w-full items-center gap-3 rounded-2xl px-2 py-3.5 text-left transition-colors active:bg-neutral-100"
                  >
                    <span
                      className="tint-bg flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-[18px]"
                      style={{ "--tint": item.tint, "--tint-accent": item.accent } as CSSProperties}
                      aria-hidden
                    >
                      {item.emoji}
                    </span>
                    <span className="min-w-0 flex-1 text-[15px] font-bold text-neutral-900">
                      {m.drawer[item.id]}
                      {item.id === "myReports" && myReports.length > 0 ? (
                        <span className="ml-1.5 rounded-full bg-[#2563eb] px-1.5 py-[1px] text-[11px] font-bold text-white">
                          {myReports.length}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-neutral-300">
                      <Chevron />
                    </span>
                  </button>
                  {item.id === "share" && shareStatus ? (
                    <p
                      role="status"
                      className={`-mt-1 px-2 pb-2 pl-[60px] text-[12px] font-semibold ${
                        shareStatus === "copied" ? "text-[#16a34a]" : "text-amber-700"
                      }`}
                    >
                      {shareStatus === "copied" ? m.drawer.shareCopied : m.drawer.shareFailed}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="mx-2 mt-3 rounded-2xl bg-surface-muted p-3">
              <p className="mb-2 text-[12px] font-bold text-ink-muted">{m.drawer.theme}</p>
              <ThemePicker />
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-[12px] font-semibold text-neutral-400">
              <Link href="/privacy" onClick={onClose} className="px-1 py-1.5 underline-offset-2 active:underline">
                {t(PRIVACY_TITLE, locale)}
              </Link>
              <span aria-hidden>·</span>
              <Link href="/terms" onClick={onClose} className="px-1 py-1.5 underline-offset-2 active:underline">
                {t(TERMS_LINK, locale)}
              </Link>
            </p>
          </nav>
        ) : null}

        {view === "notices" ? (
          <>
            <SubHeader title={m.drawer.notices} onBack={() => setView("menu")} backLabel={m.drawer.back} />
            <Panel>
              <ul className="flex flex-col gap-2.5">
                {NOTICES.map((notice) => (
                  <li key={notice.title.ko} className="rounded-2xl bg-[#f7f8fa] px-4 py-3.5">
                    <p className="flex items-center gap-2 text-[11px] text-neutral-400">
                      <span className="rounded-full bg-[#2563eb]/10 px-1.5 py-[1px] font-bold text-[#2563eb]">
                        {t(notice.tag, locale)}
                      </span>
                      {notice.date}
                    </p>
                    <p className="mt-1.5 text-[14px] font-bold text-neutral-900">{t(notice.title, locale)}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">{t(notice.body, locale)}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        ) : null}

        {view === "myReports" ? (
          <>
            <SubHeader title={m.drawer.myReports} onBack={() => setView("menu")} backLabel={m.drawer.back} />
            <Panel>
              {myReports.length === 0 ? (
                <p className="rounded-2xl bg-[#f7f8fa] px-4 py-8 text-center text-[13px] text-neutral-500">
                  {m.drawer.myReportsEmpty}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {myReports.map((report) => (
                    <li key={report.id} className="flex items-start gap-3 rounded-2xl bg-[#f7f8fa] px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-[#2563eb]">
                          📍 {t(report.stationName, locale)}
                          {now !== null ? (
                            <span className="ml-1.5 font-medium text-neutral-400">
                              {formatRelativeTime(report.createdAt, now, locale)}
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-[13px] text-neutral-800">{t(report.text, locale)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteReport(report.id)}
                        className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold text-neutral-400 active:bg-neutral-200"
                      >
                        {m.drawer.delete}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11px] text-neutral-400">{m.drawer.myReportsNote}</p>
            </Panel>
          </>
        ) : null}

        {view === "feedback" ? (
          <>
            <SubHeader title={m.drawer.feedback} onBack={() => setView("menu")} backLabel={m.drawer.back} />
            <Panel>
              {feedbackSent ? (
                <div className="rounded-2xl bg-[#e6f5e9] px-4 py-8 text-center">
                  <p className="text-[28px]" aria-hidden>
                    💌
                  </p>
                  <p className="mt-2 text-[14px] font-bold text-[#15803d]">{m.drawer.feedbackDone}</p>
                </div>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendFeedback();
                  }}
                >
                  <p className="text-[13px] leading-relaxed text-neutral-600">{m.drawer.feedbackIntro}</p>
                  <textarea
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value.slice(0, 500))}
                    placeholder={m.drawer.feedbackPlaceholder}
                    rows={5}
                    className="mt-3 w-full resize-none rounded-2xl bg-[#f3f4f6] px-4 py-3 text-[14px] outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#2563eb]/30"
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>{feedback.length}/500</span>
                  </div>
                  <button
                    type="submit"
                    disabled={!feedback.trim()}
                    className="mt-3 w-full rounded-2xl bg-[#2563eb] py-3.5 text-[15px] font-bold text-white transition-colors disabled:bg-neutral-300"
                  >
                    {m.drawer.feedbackSend}
                  </button>
                </form>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">{m.drawer.feedbackNote}</p>
            </Panel>
          </>
        ) : null}

        <div className="px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={resetToHome}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#1e3a8a] py-3.5 text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(30,58,138,0.25)] transition-transform active:scale-[0.98]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white/15">
              <HomeIcon size={19} doorColor="var(--honey)" />
            </span>
            <span className="min-w-0 break-words">{m.drawer.reset}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
