// Family settings set by a parent: calm mode and a daily play-time limit.
// The settings are shared by all children; the minutes played are per child.

const CALM_KEY = "calm-mode-v1";
const LIMIT_KEY = "play-limit-v1";
const TIME_KEY = "play-time-v1";

export const LIMIT_CHOICES = [0, 10, 15, 20, 30] as const;
const dayKey = () => new Date().toDateString();

export function isCalm(): boolean {
  try {
    return window.localStorage.getItem(CALM_KEY) === "on";
  } catch {
    return false;
  }
}
export function setCalm(on: boolean) {
  try {
    window.localStorage.setItem(CALM_KEY, on ? "on" : "off");
  } catch {
    /* storage blocked */
  }
  applyCalm(on);
}
/** Calm mode switches off animations and transitions everywhere (see styles.css). */
export function applyCalm(on = isCalm()) {
  if (typeof document === "undefined") return;
  if (on) document.documentElement.dataset.calm = "on";
  else delete document.documentElement.dataset.calm;
}

/** Minutes of play allowed per child per day; 0 means no limit. */
export function getLimitMinutes(): number {
  try {
    const n = Number(window.localStorage.getItem(LIMIT_KEY));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}
export function setLimitMinutes(minutes: number) {
  try {
    window.localStorage.setItem(LIMIT_KEY, String(minutes));
  } catch {
    /* storage blocked */
  }
}

type PlayTime = { day: string; sec: number; extra: number };
function loadTime(): PlayTime {
  try {
    const t = JSON.parse(window.localStorage.getItem(TIME_KEY) ?? "null") as PlayTime | null;
    if (t && t.day === dayKey()) return { day: t.day, sec: t.sec || 0, extra: t.extra || 0 };
  } catch {
    /* fall through */
  }
  return { day: dayKey(), sec: 0, extra: 0 };
}
function saveTime(t: PlayTime) {
  try {
    window.localStorage.setItem(TIME_KEY, JSON.stringify(t));
  } catch {
    /* storage blocked */
  }
}
/** Add played seconds for today; returns true when today's limit is used up. */
export function addPlaySeconds(sec: number): boolean {
  const t = loadTime();
  t.sec += sec;
  saveTime(t);
  return isTimeUp();
}
export function isTimeUp(): boolean {
  const limit = getLimitMinutes();
  if (!limit) return false;
  const t = loadTime();
  return t.sec >= (limit + t.extra) * 60;
}
/** A parent grants a few more minutes for today. */
export function addExtraMinutes(minutes: number) {
  const t = loadTime();
  // Count from now, so "5 more minutes" always means five real minutes.
  t.extra = Math.max(0, Math.ceil(t.sec / 60) - getLimitMinutes()) + minutes;
  saveTime(t);
}
