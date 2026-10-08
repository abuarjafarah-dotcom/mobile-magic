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
  | "review"; // spaced-repetition mix of earlier and current items

export type Difficulty = 1 | 2 | 3;

/** How a unit's "build" activity assembles an item. Unit 1: a letter body + its dots. */
export type BuildSpec = {
  base: string; // dotless body shown to the child (e.g. ٮ for ب ت ث)
  dots: 0 | 1 | 2 | 3;
  place: "above" | "below" | "none";
};

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
};

export type ActivitySpec = {
  type: ActivityType;
  rounds: number;
  difficulty: Difficulty;
  choices?: 2 | 3 | 4;
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
};

export type NooraniLevel = {
  level: number;
  ar: string;
  en: string;
  lessons: number[]; // Qaida lesson numbers this level covers
  unitIds: string[]; // empty = not built yet
};

export type Phrase = { ar: string; say: string; clip?: string };
