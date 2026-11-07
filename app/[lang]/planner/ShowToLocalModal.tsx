"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PlanStation } from "../../_lib/planner";

/** Full-screen Korean card for a taxi driver or a passer-by: station, exit, "please take me here" and the road address. */
export default function ShowToLocalModal({ station, onClose }: { station: PlanStation | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [exit, setExit] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (station && !node.open) node.showModal();
    if (!station && node.open) node.close();
  }, [station]);

  const close = () => dialog.current?.close();
  // Every station name ends in 역 (final consonant), so it takes 으로; 출구 takes 로.
  const phrase = station ? (exit ? `${station.ko} ${exit}번 출구로 가 주세요` : `${station.ko}으로 가 주세요`) : "";
  const meaning = station ? (exit ? `“Please take me to Exit ${exit} of ${station.title}.”` : `“Please take me to ${station.title}.”`) : "";

  async function copyAddress() {
    if (!station?.address) return;
    try {
      await navigator.clipboard.writeText(station.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-label="Show to a local"
      onClose={() => {
        setExit(null);
        setCopied(false);
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-white p-0 text-neutral-950 backdrop:bg-black/60"
    >
      {station ? (
        <div className="mx-auto flex h-full max-w-[760px] flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
          <div className="flex items-start justify-between gap-3">
            <p className="pt-2 text-[14px] font-semibold text-neutral-500">Show this screen to a taxi driver or a local.</p>
            <button
              type="button"
              onClick={close}
              className="shrink-0 rounded-full bg-neutral-100 px-4 py-2 text-[14px] font-bold text-neutral-800 active:scale-95"
            >
              Close
            </button>
          </div>

          <div lang="ko" className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto py-4 text-center">
            <p className="break-keep text-[clamp(52px,17vw,104px)] font-black leading-[1.05] tracking-tight">{station.ko}</p>
            {exit ? (
              <p className="mt-5 rounded-3xl bg-[#f5b800] px-7 py-3 text-[clamp(44px,14vw,88px)] font-black leading-none">{exit}번 출구</p>
            ) : null}
            <p className="mt-7 break-keep text-[clamp(24px,6.5vw,36px)] font-bold leading-snug text-neutral-800">{phrase}</p>
            <p lang="en" className="mt-3 max-w-[520px] text-[15px] font-semibold leading-snug text-neutral-500">
              {meaning}
            </p>
            {station.address ? (
              <div className="mt-6 w-full max-w-[560px] rounded-2xl bg-neutral-100 px-4 py-3 text-left">
                <p className="text-[12px] font-bold text-neutral-500">
                  주소 <span lang="en">· Address for the driver&apos;s navigation</span>
                </p>
                <p className="mt-1 break-keep text-[clamp(17px,4.6vw,22px)] font-extrabold leading-snug text-neutral-900">{station.address}</p>
                <button
                  type="button"
                  lang="en"
                  onClick={copyAddress}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-bold text-neutral-700 active:scale-95"
                >
                  {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
                  {copied ? "Copied" : "Copy address"}
                </button>
              </div>
            ) : null}
          </div>

          {station.exits.length ? (
            <div className="shrink-0 border-t border-neutral-200 pt-3">
              <p className="text-[13px] font-bold text-neutral-500">Pick an exit (optional)</p>
              <div className="mt-2 flex max-h-[20vh] flex-wrap gap-2 overflow-y-auto">
                {station.exits.map((label) => {
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
      ) : null}
    </dialog>
  );
}
