"use client";

import { useMessages } from "../_lib/locale";
import { setTheme, THEMES, useTheme } from "../_lib/theme";

export default function ThemePicker() {
  const m = useMessages();
  const theme = useTheme();
  return (
    <div role="radiogroup" aria-label={m.drawer.theme} className="grid grid-cols-2 gap-2">
      {THEMES.map((option) => {
        const active = theme === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(option)}
            className={`flex flex-col items-center gap-0.5 rounded-xl border py-2.5 text-[13px] font-bold transition-colors active:scale-[0.98] ${
              active ? "border-honey bg-honey-soft text-honey-strong" : "border-line bg-surface text-ink"
            }`}
          >
            <span aria-hidden>{option === "light" ? "☀️" : "🌙"}</span>
            {option === "light" ? m.drawer.themeLight : m.drawer.themeDark}
          </button>
        );
      })}
    </div>
  );
}
