/** Web Speech / OS TTS for multi-leg alarm banners. Native apps use the same WebView speechSynthesis. */

let unlocked = false;

/** Call from the arming tap so browsers allow speech without a later gesture. */
export function unlockAlarmSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  unlocked = true;
  try {
    window.speechSynthesis.cancel();
    const probe = new SpeechSynthesisUtterance(" ");
    probe.volume = 0;
    probe.lang = "ko-KR";
    window.speechSynthesis.speak(probe);
    window.speechSynthesis.cancel();
  } catch {}
}

export function speakAlarm(text: string, muted: boolean) {
  if (muted || !text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 1.05;
    utterance.volume = unlocked ? 1 : 1;
    window.speechSynthesis.speak(utterance);
  } catch {}
}

export function stopAlarmSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {}
}
