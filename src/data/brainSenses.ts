/**
 * Brain and Senses Lab — content for children aged about 3 to 4½.
 * Short spoken lines, no reading needed, no quizzes. Each line is kept to one simple idea.
 * Grown-up notes hold the fuller science. They need expert review before publication.
 */

/* ---------------- Brain Parts ---------------- */

export type BrainRegionId = "cerebrum" | "cerebellum" | "brainstem" | "spinalCord";

export type BrainRegion = {
  id: BrainRegionId;
  name: string;
  emoji: string;
  say: string;
  grownUp: string;
};

export const BRAIN_REGIONS: BrainRegion[] = [
  {
    id: "cerebrum",
    name: "Big thinking part",
    emoji: "🧠",
    say: "This is your big thinking part! It helps you think, talk and remember.",
    grownUp:
      "The cerebrum handles thinking, language, memory and planned movement. Many jobs use several areas together.",
  },
  {
    id: "cerebellum",
    name: "Balance part",
    emoji: "🤸",
    say: "This part helps you balance, like standing on one foot!",
    grownUp:
      "The cerebellum helps coordinate movement and balance, so running and catching feel smooth.",
  },
  {
    id: "brainstem",
    name: "Breathing part",
    emoji: "💓",
    say: "This part helps you breathe, and keeps your heart beating.",
    grownUp:
      "The brainstem helps control breathing and heart rate. It connects the brain to the spinal cord. Any injury here needs urgent medical care.",
  },
  {
    id: "spinalCord",
    name: "Message cord",
    emoji: "🦴",
    say: "This long cord carries messages between your brain and your body.",
    grownUp:
      "The spinal cord carries messages up and down, and some reflexes are coordinated inside it. It is protected by the bones of the spine.",
  },
];

export const BRAIN_NOTE =
  "Many brain jobs use networks of connected parts. One part rarely does a whole job alone.";

/** Find-the-part rounds: a child taps the right part on the brain picture. */
export const BRAIN_FIND_ROUNDS: { target: BrainRegionId; ask: string }[] = [
  { target: "cerebellum", ask: "Find the balance part! Tap it." },
  { target: "brainstem", ask: "Find the breathing part! Tap it." },
  { target: "cerebrum", ask: "Find the thinking part! Tap it." },
];

/* ---------------- Send a Message (signals) ---------------- */

export const TOUCH_MESSAGE = {
  title: "Touch the ice",
  emoji: "🧊",
  say: "Brrr, that ice is cold! A message zooms up your arm to your brain.",
  after: "Brrr! Cold! Let's pull the hand away.",
  grownUp:
    "Receptors in the skin send a signal along sensory nerves to the spinal cord and brain. The brain helps you feel cold. The quick move away can start in the spinal cord.",
};

export const SEE_MESSAGE = {
  title: "See a red ball",
  emoji: "🔴",
  say: "Light goes into your eye. A message zooms to the back of your brain!",
  after: "I see the red ball!",
  grownUp:
    "Light is focused onto the retina. The optic nerve carries signals to the brain, which builds what you see. The eye does not send a finished picture.",
};

/* ---------------- Five Sense Friends ---------------- */

export type SenseFriendId = "eye" | "ear" | "nose" | "tongue" | "hand";

export const SENSE_FRIENDS: { id: SenseFriendId; emoji: string; say: string; grownUp: string }[] = [
  {
    id: "eye",
    emoji: "👀",
    say: "I see with my eyes! Light comes in through the pupil.",
    grownUp:
      "Cornea, pupil, lens, retina and optic nerve. The retina detects light and the brain interprets it. The pupil gets bigger in dim light and smaller in bright light.",
  },
  {
    id: "ear",
    emoji: "👂",
    say: "I hear with my ears! Sounds are tiny wiggles in the air.",
    grownUp:
      "Sound vibrates the eardrum and tiny bones. The cochlea turns vibrations into nerve signals, and the brain hears them.",
  },
  {
    id: "nose",
    emoji: "👃",
    say: "I smell with my nose! Tiny smell bits float up and tickle the smell cells.",
    grownUp:
      "Smell molecules react with receptors high in the nose, which send signals to the brain. Smell also adds to flavour.",
  },
  {
    id: "tongue",
    emoji: "👅",
    say: "I taste with my tongue! Sweet, sour, salty, bitter and yummy umami.",
    grownUp:
      "Taste buds detect five basic tastes. Flavour is more than taste, because smell, texture and temperature add to it.",
  },
  {
    id: "hand",
    emoji: "✋",
    say: "I feel with my hands! Some feel soft, some feel hot, and some feel pain.",
    grownUp:
      "Skin has many kinds of receptors for touch, pressure, temperature and pain. There is not one universal receptor.",
  },
];

/** Tap-the-friend rounds. */
export const SENSE_FIND_ROUNDS: { target: SenseFriendId; ask: string }[] = [
  { target: "ear", ask: "Who hears the music? Tap the ear!" },
  { target: "nose", ask: "Who can smell the cookies? Tap the nose!" },
  { target: "eye", ask: "Who sees the rainbow? Tap the eye!" },
];

/* ---------------- Knee Kick (reflex) ---------------- */

export const KNEE_SAY =
  "Kick! Your body did that by itself, very quickly, before you even thought about it.";
export const WAVE_SAY = "You chose to wave! Your brain decided to do that.";
export const KNEE_NOTE =
  "This is a simple simulation. Never tap your own knee hard. Real reflexes use more complex circuits than this picture.";

/* ---------------- Copy Me (memory) ---------------- */

export const PADS = [
  { name: "red", colour: "#e5484d", freq: 262 },
  { name: "yellow", colour: "#f4c430", freq: 330 },
  { name: "green", colour: "#3fa35b", freq: 392 },
  { name: "blue", colour: "#4a7fb0", freq: 523 },
] as const;

/** A deterministic sequence of pad indexes (0–3) for a given length and seed. */
export function makeSequence(length: number, seed: number): number[] {
  const out: number[] = [];
  let x = seed * 9973 + 17;
  for (let i = 0; i < length; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    out.push(x % PADS.length);
  }
  return out;
}

/** True when the child's taps match the sequence exactly. */
export function sequenceMatches(shown: number[], given: number[]): boolean {
  return shown.length === given.length && shown.every((v, i) => v === given[i]);
}

export const MEMORY_NOTE =
  "Brains get better at things with practice. Trying again is how learning works.";
