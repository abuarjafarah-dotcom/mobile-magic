import { lazy, type ComponentType } from "react";

/**
 * Each screen's code is a separate hashed file. After a new deploy the old
 * files are gone, so a tab opened before the deploy gets a 404 when the child
 * opens a screen. Instead of showing the error page, reload once to pick up
 * the new version. A short-lived flag stops a reload loop if the file is
 * genuinely broken.
 */
const KEY = "chunk-reload-at";

export function isChunkLoadError(err: unknown) {
  const msg = String((err as Error)?.message ?? err);
  return /dynamically imported module|Importing a module script failed|Failed to fetch|error loading dynamically|ChunkLoadError|Unable to preload CSS/i.test(msg);
}

export function reloadForNewVersion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < 30_000) return false; // already tried just now
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch { /* storage unavailable: still try once */ }
  window.location.reload();
  return true;
}

export function lazyReload<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(() =>
    load().catch((err) => {
      if (isChunkLoadError(err) && reloadForNewVersion()) {
        return new Promise<{ default: T }>(() => {}); // page is reloading
      }
      throw err;
    }),
  );
}
