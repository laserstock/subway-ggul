import { LANGUAGES } from "./i18n";
import { ADSENSE_SCRIPT_URL } from "./site";

export const THEME_STORAGE_KEY = "subway-ggul:theme";
export const LOCALE_STORAGE_KEY = "subway-ggul:locale";

export const THEME_COLORS = { light: "#ffffff", dark: "#14161c" } as const;

const HTML_LANGS = Object.fromEntries(Object.entries(LANGUAGES).map(([code, info]) => [code, info.htmlLang]));

/**
 * Runs before first paint: theme, <html lang>, and `data-platform="app"` for Capacitor / WebView /
 * TWA / ?platform=app so crawlable web-only blocks can be CSS-hidden without removing SSR HTML.
 */
export const BOOT_SCRIPT = `try{var d=document.documentElement;if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="dark")d.dataset.theme="dark";var m=${JSON.stringify(HTML_LANGS)},p=new URLSearchParams(location.search),q=p.get("lang"),l=m[q]?q:localStorage.getItem(${JSON.stringify(
  LOCALE_STORAGE_KEY,
)});if(m[l])d.lang=m[l];var app=false;try{if(sessionStorage.getItem("ksub_platform")==="app")app=true}catch(e){}if(!app&&(p.get("platform")==="app"||p.get("utm_source")==="app")){app=true;try{sessionStorage.setItem("ksub_platform","app")}catch(e){}}var C=window.Capacitor;if(C&&C.isNativePlatform&&C.isNativePlatform())app=true;if(window.ReactNativeWebView)app=true;var ua=navigator.userAgent||"";if(/\\bwv\\b/i.test(ua)||/WebView/i.test(ua))app=true;if(/Android/i.test(ua)&&/Version\\/[\\d.]+/i.test(ua)&&!/Chrome\\/[\\d.]+Mobile/i.test(ua))app=true;if(app)d.setAttribute("data-platform","app")}catch(e){}`;

/**
 * AdSense's head tag on every web page. Skipped inside the Play app (Capacitor injects window.Capacitor
 * before page scripts run), where AdSense isn't allowed.
 */
export const ADSENSE_LOADER = `try{var C=window.Capacitor;if(!(C&&C.isNativePlatform&&C.isNativePlatform())){var s=document.createElement("script");s.async=true;s.src=${JSON.stringify(
  ADSENSE_SCRIPT_URL,
)};s.crossOrigin="anonymous";document.head.appendChild(s)}}catch(e){}`;
