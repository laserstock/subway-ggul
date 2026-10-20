import type { Messages } from "./ko";

const en: Messages = {
  app: {
    name: "Subway Tips",
    tagline: "Everything you need on the subway",
  },
  header: {
    home: "Home",
    openMenu: "Open menu",
    changeLanguage: "Change language",
  },
  nav: {
    home: "Home",
    search: "Search",
    station: "My Stn",
    report: "Report",
  },
  language: {
    title: "언어 선택 / Select Language",
    subtitle: "Choose the language for the app",
    close: "Close",
    names: { ko: "Korean", en: "English", zh: "Simplified Chinese", ja: "Japanese" },
  },
  drawer: {
    close: "Close menu",
    back: "Back",
    notices: "Notices & updates",
    myReports: "My reports",
    feedback: "Help / Send feedback",
    share: "Share with friends",
    shareCopied: "Link copied",
    shareFailed: "Couldn't share. Copy the link from the address bar",
    shareText: "Find restrooms, pharmacies and exit shops in 3 seconds on the subway",
    reset: "Reset to home screen",
    myReportsEmpty: "No reports yet. Post one from a station!",
    myReportsNote: "Beta: reports are saved on this device only",
    delete: "Delete",
    feedbackIntro: "Tell us what's inconvenient or what you'd like. We read everything.",
    feedbackPlaceholder: "e.g. Please add Line 2 transfer tips",
    feedbackSend: "Send",
    feedbackDone: "Thanks for your feedback!",
    feedbackNote: "Beta: feedback is stored on this device until the server is ready",
  },
};

export default en;
