"use client";

import { useRef, useState } from "react";

type Props = {
  /** Korean station name with 역, e.g. "강남역". */
  name: string;
  exits: string[];
  copy: { button: string; hint: string; pickExit: string; close: string };
  /** What the Korean sentence means in the reader's language; `exit` has an {exit} placeholder. */
  meaning: { lang: string; station: string; exit: string };
};

/** Full-screen Korean card (station, exit, "please take me here") for travelers to show a local or a taxi driver. */
export default function ShowKorean({ name, exits, copy, meaning }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [exit, setExit] = useState<string | null>(null);
  // Every name ends in 역 (final consonant), so it takes 으로; 출구 takes 로.
  const phrase = exit ? `${name} ${exit}번 출구로 가 주세요` : `${name}으로 가 주세요`;
  const translation = exit ? meaning.exit.replace("{exit}", exit) : meaning.station;
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-3 text-[15px] font-bold text-white transition active:scale-[0.98]"
      >
        <span aria-hidden>🗣️</span>
        {copy.button}
      </button>
      <dialog
        ref={dialog}
        aria-label={copy.button}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-white p-0 text-neutral-950 backdrop:bg-black/60"
      >
        <div className="mx-auto flex h-full max-w-[760px] flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
          <div className="flex items-start justify-between gap-3">
            <p className="pt-2 text-[14px] font-semibold text-neutral-500">{copy.hint}</p>
            <button
              type="button"
              onClick={close}
              className="shrink-0 rounded-full bg-neutral-100 px-4 py-2 text-[14px] font-bold text-neutral-800 active:scale-95"
            >
              {copy.close}
            </button>
          </div>

          <div lang="ko" className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
            <p className="break-keep text-[clamp(52px,17vw,104px)] font-black leading-[1.05] tracking-tight">{name}</p>
            {exit ? (
              <p className="mt-5 rounded-3xl bg-[#f5b800] px-7 py-3 text-[clamp(44px,14vw,88px)] font-black leading-none">
                {exit}번 출구
              </p>
            ) : null}
            <p className="mt-7 break-keep text-[clamp(24px,6.5vw,36px)] font-bold leading-snug text-neutral-800">{phrase}</p>
            <p lang={meaning.lang} className="mt-3 max-w-[520px] text-[15px] font-semibold leading-snug text-neutral-500">
              {translation}
            </p>
          </div>

          {exits.length ? (
            <div className="shrink-0 border-t border-neutral-200 pt-3">
              <p className="text-[13px] font-bold text-neutral-500">{copy.pickExit}</p>
              <div className="mt-2 flex max-h-[24vh] flex-wrap gap-2 overflow-y-auto">
                {exits.map((label) => {
                  const active = label === exit;
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setExit(active ? null : label)}
                      className={`h-11 min-w-11 rounded-xl px-3 text-[16px] font-black transition active:scale-95 ${
                        active ? "bg-neutral-900 text-white" : "bg-[#fff4c2] text-neutral-900"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
