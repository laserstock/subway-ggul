"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { saveFeedback } from "../_lib/feedback";
import { requestHomeReset } from "../_lib/homeReset";
import { useLocale } from "../_lib/locale";
import { deleteReport, formatAgo, useMyReports, useNow } from "../_lib/reports";
import { t, type Localized } from "../_lib/stations";
import { TrainLogo } from "./icons";

export const APP_VERSION = "1.0.0";

type DrawerView = "menu" | "notices" | "myReports" | "feedback";
type ShareStatus = "copied" | "failed" | null;

const COPY = {
  appName: { ko: "지하철꿀정보", en: "Subway Tips" },
  tagline: {
    ko: "지하철 탈 때 필요한 꿀정보를 한 번에",
    en: "Everything you need on the subway",
  },
  close: { ko: "메뉴 닫기", en: "Close menu" },
  back: { ko: "뒤로", en: "Back" },
  notices: { ko: "공지사항 & 업데이트", en: "Notices & updates" },
  myReports: { ko: "내가 남긴 제보 내역", en: "My reports" },
  feedback: { ko: "고객센터 / 피드백 보내기", en: "Help / Send feedback" },
  share: { ko: "앱 친구에게 공유하기", en: "Share with friends" },
  shareCopied: { ko: "링크를 복사했어요", en: "Link copied" },
  shareFailed: { ko: "공유하지 못했어요. 주소창의 링크를 복사해 주세요", en: "Couldn't share. Copy the link from the address bar" },
  shareText: {
    ko: "지하철 탈 때 화장실·약국·출구 매장을 3초 만에 찾는 앱, 지하철꿀정보",
    en: "Find restrooms, pharmacies and exit shops in 3 seconds on the subway",
  },
  reset: { ko: "메인 화면으로 리셋 (홈으로 이동)", en: "Reset to home screen" },
  myReportsEmpty: {
    ko: "아직 남긴 제보가 없어요. 역에서 1초 제보를 남겨 보세요!",
    en: "No reports yet. Post one from a station!",
  },
  myReportsNote: {
    ko: "베타: 제보는 이 기기에만 저장돼요",
    en: "Beta: reports are saved on this device only",
  },
  delete: { ko: "삭제", en: "Delete" },
  feedbackIntro: {
    ko: "불편한 점이나 바라는 기능을 알려 주세요. 꼼꼼히 읽고 반영할게요.",
    en: "Tell us what's inconvenient or what you'd like. We read everything.",
  },
  feedbackPlaceholder: { ko: "예: 2호선 환승 경로도 알려 주세요", en: "e.g. Please add Line 2 transfer tips" },
  feedbackSend: { ko: "보내기", en: "Send" },
  feedbackDone: { ko: "소중한 의견 고마워요!", en: "Thanks for your feedback!" },
  feedbackNote: {
    ko: "베타: 피드백은 현재 이 기기에 저장되며, 정식 버전에서 서버로 전송돼요",
    en: "Beta: feedback is stored on this device until the server is ready",
  },
};

const MENU: { id: Exclude<DrawerView, "menu"> | "share"; emoji: string; label: Localized; tint: string }[] = [
  { id: "notices", emoji: "📢", label: COPY.notices, tint: "#fff1d6" },
  { id: "myReports", emoji: "✏️", label: COPY.myReports, tint: "#e5efff" },
  { id: "feedback", emoji: "💬", label: COPY.feedback, tint: "#e6f5e9" },
  { id: "share", emoji: "🔗", label: COPY.share, tint: "#f3e8ff" },
];

const NOTICES: { date: string; tag: Localized; title: Localized; body: Localized }[] = [
  {
    date: "2026.10.20",
    tag: { ko: "업데이트", en: "Update" },
    title: { ko: "출구 매장에 '스마트 점핑 안내' 추가", en: "Smart station jump for exit shops" },
    body: {
      ko: "현재 역에 원하는 매장이 없으면 같은 노선 앞뒤 역의 매장을 추천해 드려요.",
      en: "If your station lacks the store you want, we suggest one on a nearby stop.",
    },
  },
  {
    date: "2026.10.20",
    tag: { ko: "신규", en: "New" },
    title: { ko: "긴급 화장실 · 약국 · 병원 3초 비교", en: "Urgent restroom · pharmacy · clinic compare" },
    body: {
      ko: "지금 지나는 역과 다음 역의 개찰구 안/밖 시설을 한눈에 비교해요.",
      en: "Compare facilities inside/outside the gate at this stop and the next.",
    },
  },
  {
    date: "2026.10.20",
    tag: { ko: "신규", en: "New" },
    title: { ko: "새 홈 화면 & 실시간 현장 제보", en: "New home & live station reports" },
    body: {
      ko: "가장 가까운 역을 자동으로 찾고, 역 소식을 1초 만에 제보할 수 있어요.",
      en: "We find your nearest station automatically and you can report in a second.",
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
    const data = { title: t(COPY.appName, locale), text: t(COPY.shareText, locale), url };
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

  function selectMenu(item: (typeof MENU)[number]["id"]) {
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
    saveFeedback(text);
    setFeedback("");
    setFeedbackSent(true);
  }

  function resetToHome() {
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
        aria-label={t(COPY.close, locale)}
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-[3px] transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t(COPY.appName, locale)}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && !isOpen) resetInnerState();
        }}
        className={`absolute inset-y-0 left-0 flex w-[84%] max-w-[330px] flex-col rounded-r-[28px] bg-white pt-[max(12px,env(safe-area-inset-top))] shadow-[8px_0_40px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-2 px-5 pb-4 pt-2">
          <div className="flex min-w-0 items-center gap-3">
            <TrainLogo />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[17px] font-extrabold tracking-tight text-neutral-900">
                {t(COPY.appName, locale)}
                <span aria-hidden>🚇</span>
                <span className="rounded-full bg-neutral-100 px-2 py-[2px] text-[11px] font-bold text-neutral-500">
                  v{APP_VERSION}
                </span>
              </p>
              <p className="mt-0.5 truncate text-[12px] text-neutral-500">{t(COPY.tagline, locale)}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t(COPY.close, locale)}
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
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-[18px]"
                      style={{ backgroundColor: item.tint }}
                      aria-hidden
                    >
                      {item.emoji}
                    </span>
                    <span className="min-w-0 flex-1 text-[15px] font-bold text-neutral-900">
                      {t(item.label, locale)}
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
                      {t(shareStatus === "copied" ? COPY.shareCopied : COPY.shareFailed, locale)}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {view === "notices" ? (
          <>
            <SubHeader title={t(COPY.notices, locale)} onBack={() => setView("menu")} backLabel={t(COPY.back, locale)} />
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
            <SubHeader title={t(COPY.myReports, locale)} onBack={() => setView("menu")} backLabel={t(COPY.back, locale)} />
            <Panel>
              {myReports.length === 0 ? (
                <p className="rounded-2xl bg-[#f7f8fa] px-4 py-8 text-center text-[13px] text-neutral-500">
                  {t(COPY.myReportsEmpty, locale)}
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
                              {formatAgo(report.createdAt, now, locale)}
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
                        {t(COPY.delete, locale)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11px] text-neutral-400">{t(COPY.myReportsNote, locale)}</p>
            </Panel>
          </>
        ) : null}

        {view === "feedback" ? (
          <>
            <SubHeader title={t(COPY.feedback, locale)} onBack={() => setView("menu")} backLabel={t(COPY.back, locale)} />
            <Panel>
              {feedbackSent ? (
                <div className="rounded-2xl bg-[#e6f5e9] px-4 py-8 text-center">
                  <p className="text-[28px]" aria-hidden>
                    💌
                  </p>
                  <p className="mt-2 text-[14px] font-bold text-[#15803d]">{t(COPY.feedbackDone, locale)}</p>
                </div>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendFeedback();
                  }}
                >
                  <p className="text-[13px] leading-relaxed text-neutral-600">{t(COPY.feedbackIntro, locale)}</p>
                  <textarea
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value.slice(0, 500))}
                    placeholder={t(COPY.feedbackPlaceholder, locale)}
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
                    {t(COPY.feedbackSend, locale)}
                  </button>
                </form>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">{t(COPY.feedbackNote, locale)}</p>
            </Panel>
          </>
        ) : null}

        <div className="px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={resetToHome}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1e3a8a] py-4 text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(30,58,138,0.25)] transition-transform active:scale-[0.98]"
          >
            <span aria-hidden>🏠</span>
            {t(COPY.reset, locale)}
          </button>
        </div>
      </aside>
    </div>
  );
}
