export const THEME_STORAGE_KEY = "subway-ggul:theme";

export const THEME_COLORS = { light: "#ffffff", dark: "#14161c" } as const;

/**
 * Runs before first paint so a saved dark choice doesn't flash light.
 * Only an explicit "dark" choice switches; the phone's own dark mode is ignored.
 */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;
