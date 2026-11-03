"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { KAKAO_APP_KEY } from "../kakao-sdk";

const KAKAO_SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js";
const KAKAO_SDK_INTEGRITY = "sha384-BGX7Wb16GmRFagri4bLJV2DgipVZaU2AI812GZtHtHzzDQJnfHasDXN5houxv45w";

type KakaoSdk = {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (template: {
      objectType: "feed";
      content: {
        title: string;
        description: string;
        imageUrl: string;
        imageWidth?: number;
        imageHeight?: number;
        link: { mobileWebUrl: string; webUrl: string };
      };
      buttons: { title: string; link: { mobileWebUrl: string; webUrl: string } }[];
    }) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

let kakaoLoading: Promise<KakaoSdk> | null = null;

function loadKakao(): Promise<KakaoSdk> {
  if (!KAKAO_APP_KEY) return Promise.reject(new Error("NEXT_PUBLIC_KAKAO_MAP_KEY is not set"));
  kakaoLoading ??= new Promise<KakaoSdk>((resolve, reject) => {
    const ready = () => {
      const sdk = window.Kakao;
      if (!sdk) return reject(new Error("Kakao SDK missing"));
      if (!sdk.isInitialized()) sdk.init(KAKAO_APP_KEY!);
      resolve(sdk);
    };
    if (window.Kakao) return ready();
    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.integrity = KAKAO_SDK_INTEGRITY;
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = ready;
    script.onerror = () => {
      kakaoLoading = null;
      script.remove();
      reject(new Error("Failed to load Kakao SDK"));
    };
    document.head.appendChild(script);
  });
  return kakaoLoading;
}

type Props = {
  /** Canonical page URL (the production domain, which Kakao requires to be registered). */
  url: string;
  /** One-line message sent with the link. */
  text: string;
  labels: { title: string; copy: string; copied: string; bookmark: string; bookmarkHint: string };
  /** Korean pages share to KakaoTalk; everyone else gets WhatsApp, Reddit and a bookmark tip. */
  kakao?: { label: string; button: string; description: string; imageUrl: string };
};

const BUTTON_CLASS =
  "flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-bold transition active:scale-[0.97]";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      {children}
    </svg>
  );
}

const ChatIcon = (
  <Icon>
    <path
      d="M12 3.5c-4.7 0-8.5 3-8.5 6.8 0 2.4 1.6 4.6 4 5.8l-.9 3.4 3.9-2.6c.5.1 1 .1 1.5.1 4.7 0 8.5-3 8.5-6.7S16.7 3.5 12 3.5z"
      fill="currentColor"
    />
  </Icon>
);

const LinkIcon = (
  <Icon>
    <path
      d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </Icon>
);

const BookmarkIcon = (
  <Icon>
    <path d="M6.5 3.5h11v17l-5.5-4-5.5 4z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
  </Icon>
);

const RedditIcon = (
  <Icon>
    <circle cx="12" cy="13.5" r="7.5" fill="currentColor" />
    <circle cx="9.2" cy="13" r="1.3" fill="#ff4500" />
    <circle cx="14.8" cy="13" r="1.3" fill="#ff4500" />
    <path d="M9 16.3c1.7 1.1 4.3 1.1 6 0" stroke="#ff4500" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M12 6l1.2-3.2 3.3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="17.3" cy="3.8" r="1.4" fill="currentColor" />
  </Icon>
);

/** One-tap share bar for a station guide. */
export default function ShareButtons({ url, text, labels, kakao }: Props) {
  const [copied, setCopied] = useState(false);
  const [showBookmarkHint, setShowBookmarkHint] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (kakao) loadKakao().catch(() => {});
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, [kakao]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt(labels.copy, url);
    }
  }

  async function shareKakao() {
    if (!kakao) return;
    const link = { mobileWebUrl: url, webUrl: url };
    try {
      const sdk = await loadKakao();
      sdk.Share.sendDefault({
        objectType: "feed",
        content: {
          title: text,
          description: kakao.description,
          imageUrl: kakao.imageUrl,
          imageWidth: 1200,
          imageHeight: 630,
          link,
        },
        buttons: [{ title: kakao.button, link }],
      });
    } catch {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: text, url }).catch(() => {});
      } else {
        await copyLink();
      }
    }
  }

  const copyButton = (
    <button
      type="button"
      onClick={copyLink}
      className={`${BUTTON_CLASS} border border-line bg-surface text-ink`}
    >
      {LinkIcon}
      {copied ? labels.copied : labels.copy}
    </button>
  );

  return (
    <section aria-labelledby="share-title" className="rounded-3xl border border-line bg-surface-muted p-4">
      <h2 id="share-title" className="text-[15px] font-extrabold text-ink">
        {labels.title}
      </h2>
      {kakao ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={shareKakao} className={`${BUTTON_CLASS} bg-[#fee500] text-[#191919]`}>
            {ChatIcon}
            {kakao.label}
          </button>
          {copyButton}
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
            target="_blank"
            rel="noopener"
            className={`${BUTTON_CLASS} bg-[#25d366] text-white`}
          >
            {ChatIcon}
            WhatsApp
          </a>
          <a
            href={`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener"
            className={`${BUTTON_CLASS} bg-[#ff4500] text-white`}
          >
            {RedditIcon}
            Reddit
          </a>
          {copyButton}
          <button
            type="button"
            onClick={() => setShowBookmarkHint((shown) => !shown)}
            aria-expanded={showBookmarkHint}
            aria-controls="bookmark-hint"
            className={`${BUTTON_CLASS} border border-line bg-surface text-ink`}
          >
            {BookmarkIcon}
            {labels.bookmark}
          </button>
        </div>
      )}
      {!kakao ? (
        <p
          id="bookmark-hint"
          hidden={!showBookmarkHint}
          className="mt-2.5 rounded-xl bg-surface px-3 py-2.5 text-[13px] leading-relaxed text-ink-muted"
        >
          {labels.bookmarkHint}
        </p>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {copied ? labels.copied : ""}
      </p>
    </section>
  );
}
