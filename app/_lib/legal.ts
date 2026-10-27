import type { Localized } from "./i18n";

/** Shown in the privacy policy and terms; null until the operator sets a public contact address. */
export const CONTACT_EMAIL: string | null = "lukoco1000@gmail.com";

export const LEGAL_UPDATED = "2026-10-27";

export type LegalSection = { title: Localized; body: Localized[] };

export const PRIVACY_TITLE: Localized = {
  ko: "개인정보처리방침",
  en: "Privacy Policy",
  zh: "隐私政策",
  ja: "プライバシーポリシー",
};

export const TERMS_TITLE: Localized = {
  ko: "이용약관 · 커뮤니티 가이드라인",
  en: "Terms of Use & Community Guidelines",
  zh: "使用条款 · 社区准则",
  ja: "利用規約・コミュニティガイドライン",
};

const contact: Localized = CONTACT_EMAIL
  ? {
      ko: `앱의 [메뉴 → 의견 보내기] 또는 이메일(${CONTACT_EMAIL})로 문의할 수 있어요.`,
      en: `Contact us through Menu → Send feedback in the app, or by email at ${CONTACT_EMAIL}.`,
    }
  : {
      ko: "앱의 [메뉴 → 의견 보내기]로 문의할 수 있어요. 남겨 주신 내용은 운영자에게 바로 전달돼요.",
      en: "Contact us through Menu → Send feedback in the app; messages go straight to the operator.",
    };

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: { ko: "1. 수집하는 정보", en: "1. Information we collect" },
    body: [
      {
        ko: "회원가입 없이 이용할 수 있으며, 이름·전화번호·이메일 같은 개인 식별 정보는 수집하지 않아요.",
        en: "The app works without sign-up. We do not collect names, phone numbers or email addresses.",
      },
      {
        ko: "기기별 익명 계정 ID: 제보·글·댓글·투표를 내 것으로 관리하기 위해 기기마다 무작위 익명 ID가 자동으로 만들어져요.",
        en: "Anonymous account ID: a random ID is created per device so your reports, posts, comments and votes can be managed as yours.",
      },
      {
        ko: "직접 올린 내용: 역 제보, 꿀스팟 글·댓글, 닉네임·캐릭터, 시설 투표, 의견 보내기 내용.",
        en: "Content you post: station reports, plaza posts and comments, nickname and character, facility votes and feedback.",
      },
      {
        ko: "위치 정보: 가까운 역 찾기와 하차 알림을 위해 기기의 위치를 사용해요. 위치는 기기 안에서만 처리되며 서버에 저장하거나 전송하지 않아요.",
        en: "Location: used on your device to find the nearest station and for arrival alerts. It is processed on the device only and never stored on or sent to our servers.",
      },
      {
        ko: "기기 저장소: 내 역, 언어·테마 설정, 최근 본 역 등은 기기(브라우저 저장소)에만 저장돼요.",
        en: "On-device storage: saved stations, language and theme settings and recently viewed stations stay on your device.",
      },
    ],
  },
  {
    title: { ko: "2. 이용 목적", en: "2. How we use it" },
    body: [
      {
        ko: "가까운 역·시설 안내, 하차 알림, 실시간 제보와 커뮤니티 기능 제공, 서비스 개선과 부정 이용 방지에만 사용해요. 광고나 마케팅 목적으로 쓰거나 제3자에게 판매하지 않아요.",
        en: "Only to show nearby stations and facilities, send arrival alerts, run live reports and the community, improve the service and prevent abuse. We never use it for advertising or sell it to third parties.",
      },
    ],
  },
  {
    title: { ko: "3. 백그라운드 위치 사용 (앱)", en: "3. Background location (app)" },
    body: [
      {
        ko: "하차 알림을 켠 동안에만, 화면이 꺼져 있거나 다른 앱을 쓰는 중에도 도착역에 가까워졌는지 확인하기 위해 위치를 사용해요. 이때 알림 표시줄에 위치 사용 중 알림이 계속 표시되며, 하차 알림을 끄거나 도착하면 즉시 중단돼요.",
        en: "Only while an arrival alert is on, the app keeps checking your location with the screen off or while you use other apps, to tell when you near your stop. An ongoing notification is shown the whole time, and tracking stops as soon as you turn the alert off or arrive.",
      },
    ],
  },
  {
    title: { ko: "4. 보관 기간과 삭제", en: "4. Retention and deletion" },
    body: [
      {
        ko: "역 제보는 최대 24시간 동안만 피드에 사용되며, 글·댓글은 직접 삭제하거나 계정을 삭제할 때까지 보관돼요.",
        en: "Station reports are used in feeds for at most 24 hours; posts and comments are kept until you delete them or your account.",
      },
      {
        ko: "[마이 → 내 데이터 모두 삭제]를 누르면 익명 계정과 그 계정으로 올린 제보·글·댓글·투표·의견이 서버에서 즉시 영구 삭제돼요. 기기에 저장된 설정도 함께 지워져요.",
        en: "Tap My → Delete all my data to permanently delete your anonymous account and every report, post, comment, vote and feedback message it made. Settings stored on the device are cleared too.",
      },
    ],
  },
  {
    title: { ko: "5. 처리 위탁과 외부 서비스", en: "5. Processors and third-party services" },
    body: [
      {
        ko: "Supabase(데이터베이스·익명 인증), Vercel(웹 호스팅), Kakao(지도·장소 검색), 번역 API(번역 버튼을 누른 글만 전송)를 이용해요. 각 서비스는 해당 기능을 제공하는 데 필요한 범위에서만 정보를 처리해요.",
        en: "We use Supabase (database and anonymous sign-in), Vercel (hosting), Kakao (maps and place search) and a translation API (only text you choose to translate). Each processes data only as needed for its function.",
      },
    ],
  },
  {
    title: { ko: "6. 아동의 이용", en: "6. Children" },
    body: [
      {
        ko: "만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를 알면서 수집하지 않아요.",
        en: "The service is not directed at children under 14 and we do not knowingly collect their personal data.",
      },
    ],
  },
  {
    title: { ko: "7. 문의와 권리 행사", en: "7. Contact and your rights" },
    body: [
      contact,
      {
        ko: "언제든지 내 정보의 열람·삭제를 요청할 수 있으며, 앱 안에서 직접 삭제할 수도 있어요.",
        en: "You may ask to see or delete your data at any time, or delete it yourself in the app.",
      },
    ],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: { ko: "1. 서비스", en: "1. The service" },
    body: [
      {
        ko: "지하철꿀정보는 역 시설·환승·경로 정보와 이용자 제보를 제공해요. 소요시간·시설 정보는 공공데이터와 이용자 제보를 바탕으로 한 참고 정보이며, 실제와 다를 수 있어요.",
        en: "Subway Ggul provides station facilities, transfer and route information and rider reports. Times and facility details are guidance based on open data and reports and may differ from reality.",
      },
    ],
  },
  {
    title: { ko: "2. 커뮤니티 가이드라인", en: "2. Community guidelines" },
    body: [
      {
        ko: "다음 내용은 올릴 수 없어요: 욕설·혐오·차별·괴롭힘, 음란물, 폭력·불법 행위 조장, 광고·스팸, 타인의 개인정보(사진·연락처·차량번호 등) 노출, 허위 제보.",
        en: "Not allowed: abuse, hate, discrimination or harassment; sexual content; promoting violence or illegal acts; ads or spam; exposing anyone's personal information (photos, contacts, plates, etc.); false reports.",
      },
      {
        ko: "부적절한 글·댓글·제보는 [신고] 버튼으로 알려 주세요. 여러 명이 신고한 콘텐츠는 자동으로 숨겨지고, 운영자가 확인 후 삭제해요. [차단]을 누르면 그 사용자의 콘텐츠가 더 이상 보이지 않아요.",
        en: "Use Report on any inappropriate post, comment or report. Content reported by several people is hidden automatically and reviewed by the operator. Block hides everything from that user.",
      },
      {
        ko: "가이드라인을 어긴 콘텐츠는 예고 없이 삭제될 수 있고, 반복해서 어기면 이용이 제한될 수 있어요.",
        en: "Content that breaks these rules may be removed without notice, and repeated violations may lead to restrictions.",
      },
    ],
  },
  {
    title: { ko: "3. 게시물의 권리와 책임", en: "3. Your content" },
    body: [
      {
        ko: "올린 내용의 책임은 작성자에게 있으며, 서비스 안에서 다른 이용자에게 보여주고 번역하는 데 필요한 범위에서 사용할 수 있도록 허락하는 것으로 봐요. 내 글은 언제든 직접 삭제할 수 있어요.",
        en: "You are responsible for what you post and allow us to display and translate it within the service. You can delete your posts at any time.",
      },
    ],
  },
  {
    title: { ko: "4. 면책", en: "4. Disclaimer" },
    body: [
      {
        ko: "열차 운행 상황, 시설 고장, 위치 오차 등으로 정보·알림이 늦거나 틀릴 수 있어요. 중요한 일정은 공식 안내도 함께 확인해 주세요.",
        en: "Information and alerts can be late or wrong due to service changes, facility outages or location errors. Check official sources for anything important.",
      },
    ],
  },
  {
    title: { ko: "5. 문의", en: "5. Contact" },
    body: [contact],
  },
];
