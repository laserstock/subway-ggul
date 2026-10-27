const ko = {
  app: {
    name: "지하철꿀정보",
    tagline: "지하철 탈 때 필요한 꿀정보를 한 번에",
  },
  header: {
    home: "홈으로",
    openMenu: "메뉴 열기",
    changeLanguage: "언어 변경",
  },
  nav: {
    home: "홈",
    spot: "꿀수다",
    station: "My 역",
    me: "마이",
  },
  language: {
    title: "언어 선택 / Select Language",
    subtitle: "앱에 표시할 언어를 골라 주세요",
    close: "닫기",
    names: { ko: "한국어", en: "영어", zh: "중국어 간체", ja: "일본어" },
  },
  drawer: {
    close: "메뉴 닫기",
    back: "뒤로",
    notices: "공지사항 & 업데이트",
    myReports: "내가 남긴 제보 내역",
    feedback: "고객센터 / 피드백 보내기",
    share: "앱 친구에게 공유하기",
    shareCopied: "링크를 복사했어요",
    shareFailed: "공유하지 못했어요. 주소창의 링크를 복사해 주세요",
    shareText: "지하철 탈 때 화장실·약국·출구 매장을 3초 만에 찾는 앱, 지하철꿀정보",
    reset: "메인 화면으로 리셋 (홈으로 이동)",
    myReportsEmpty: "아직 남긴 제보가 없어요. 역에서 1초 제보를 남겨 보세요!",
    myReportsNote: "내 제보는 이 기기의 익명 계정에 연결돼요 · 브라우저 데이터를 지우면 삭제 권한이 사라져요",
    delete: "삭제",
    feedbackIntro: "불편한 점이나 바라는 기능을 알려 주세요. 꼼꼼히 읽고 반영할게요.",
    feedbackPlaceholder: "예: 2호선 환승 경로도 알려 주세요",
    feedbackSend: "보내기",
    feedbackDone: "소중한 의견 고마워요!",
    feedbackNote: "보낸 의견은 운영자에게 바로 전달돼요. 개인정보(연락처 등)는 적지 말아 주세요.",
    theme: "화면 모드",
    themeLight: "밝게",
    themeDark: "어둡게",
    themeSoon: "준비 중",
  },
};

export type Messages = typeof ko;
export default ko;
