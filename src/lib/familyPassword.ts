// Shared family password for password-locked sections (Library, Neighborhood).
// Only a salted SHA-256 hash of the password is stored here, never the password itself.
// The unlock is kept for the browser session, so one unlock covers every locked section.
const SALT = "990e308b1535e0f0df03ede680480f7a";
const HASH = "e95c842b4bf20615c327ccd1989739187ca8710d9477dcf866e5e1179a16da42";
export const FAMILY_UNLOCK_KEY = "library-unlock-v1";

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function readFamilyUnlocked(): boolean {
  try {
    return sessionStorage.getItem(FAMILY_UNLOCK_KEY) === "yes";
  } catch {
    return false;
  }
}

export function writeFamilyUnlocked(): void {
  try {
    sessionStorage.setItem(FAMILY_UNLOCK_KEY, "yes");
  } catch {
    /* private mode: the section simply asks again next time */
  }
}

/** Resolves true when the password matches. Throws if this browser cannot run SHA-256 (non-https). */
export async function checkFamilyPassword(password: string): Promise<boolean> {
  return (await sha256Hex(SALT + password)) === HASH;
}
