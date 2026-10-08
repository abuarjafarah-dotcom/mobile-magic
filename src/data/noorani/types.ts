// Noorani Qaida learning model. Content is data; the activity engines in
// src/components/noorani/ render every unit from these types.

export type ActivityType =
  | "meet" // HEAR + SEE: meet each target once
  | "listenFind" // hear a target, tap it among 2–4 choices
  | "hearMatch" // tap sound bubbles, match each to its written form
  | "build" // drag components to construct the target
  | "different" // hear three sounds, find the one that is different
  | "readAloud" // child reads the target into the microphone
  | "characterGame" // same objective, played as a short Hamad/Talal game
  | "review" // spaced-repetition mix of earlier and current items
  | "contrast" // same letter, different harakah: tap each and hear the change
  | "readChoose" // tap-to-hear strip, then read with audio off and pick the matching sound
  | "challenge" // alternating text → sound and sound → text rounds
  | "blend" // watch/hear syllables move together into one continuous reading
  | "order"; // tap syllable cards in reading order (variants: together / first / listen)

export type Difficulty = 1 | 2 | 3;

export type Haraka = "fatha" | "kasra" | "damma";

/** How a unit's "build" activity assembles an item. */
export type BuildSpec =
  | {
      kind?: "dots"; // Unit 1: a letter body + its dots
      base: string; // dotless body shown to the child (e.g. ٮ for ب ت ث)
      dots: 0 | 1 | 2 | 3;
      place: "above" | "below" | "none";
    }
  | { kind: "mark"; base: string; mark: Haraka }; // Unit 2: a bare letter + its harakah

export type ItemAudio = {
  target?: string; // pronunciation clip for this item
  instruction?: string; // optional item-specific instruction
  success?: string;
  encourage?: string;
};

export type NooraniItem = {
  id: string;
  glyph: string; // exactly what the child sees
  say: string; // voweled Arabic that is spoken (and the TTS fallback text)
  en: string; // parent-facing label only
  audio?: ItemAudio;
  build?: BuildSpec;
  /** Ids of items that look or sound alike — preferred distractors. */
  confusable?: string[];
  /** Syllables (Level 2+): the bare letter and its harakah. */
  letter?: string;
  haraka?: Haraka;
  /** Blends (Level 3+): syllable item ids in reading order. `audio.target` is the whole reading. */
  segments?: string[];
};

export type ActivitySpec = {
  type: ActivityType;
  rounds: number;
  difficulty: Difficulty;
  choices?: 2 | 3 | 4;
  variant?: "together" | "first" | "listen";
  prompt?: string; // phrase id overriding the engine's default instruction
};

export type NooraniSkill = {
  id: string;
  ar: string;
  en: string;
  itemIds: string[];
  activities: ActivitySpec[];
};

export type NooraniSource = {
  book: "القاعدة النورانية";
  lesson: number;
  ar: string;
  en: string;
  note?: string;
};

export type NooraniUnit = {
  id: string;
  level: number;
  ar: string;
  en: string;
  source: NooraniSource;
  items: NooraniItem[];
  skills: NooraniSkill[];
  /** What the finish screen says the child learned. */
  completion?: { ar: string; en: string; glyphs?: string }[];
};

export type NooraniLevel = {
  level: number;
  ar: string;
  en: string;
  lessons: number[]; // Qaida lesson numbers this level covers
  unitIds: string[]; // empty = not built yet
};

export type Phrase = { ar: string; say: string; en?: string; clip?: string };
