"use client";

import { useMessages } from "../_lib/locale";
import { setTheme, THEME_READY, THEMES, useTheme } from "../_lib/theme";

export default function ThemePicker() {
  const m = useMessages();
  const theme = useTheme();
  return (
    <div role="radiogroup" aria-label={m.drawer.theme} className="grid grid-cols-2 gap-2">
      {THEMES.map((option) => {
        const active = theme === option;
        const ready = THEME_READY[option];
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={!ready}
            onClick={() => setTheme(option)}
            className={`flex flex-col items-center gap-0.5 rounded-xl border py-2.5 text-[13px] font-bold transition-colors ${
              active
                ? "border-honey bg-honey-soft text-honey-strong"
                : "border-line bg-surface text-ink disabled:text-neutral-400"
            }`}
          >
            <span aria-hidden>{option === "light" ? "☀️" : "🌙"}</span>
            {option === "light" ? m.drawer.themeLight : m.drawer.themeDark}
            {!ready ? <span className="text-[10px] font-semibold text-neutral-400">{m.drawer.themeSoon}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
