/**
 * Brain and Senses Lab — content (data only, no UI).
 * Written for curious children ages 5–8. Science is kept accurate:
 * many brain functions depend on networks of regions, not a single spot.
 * Needs expert review before publication.
 */

/* ---------------- shared helpers ---------------- */

export type Choice = { options: string[]; correctIndex: number };

/** Put the correct answer among distractors at a rotating position so it is not always first. */
export function rotateOptions(correct: string, distractors: string[], offset: number): Choice {
  const all = [...distractors];
  const pos = ((offset % (all.length + 1)) + (all.length + 1)) % (all.length + 1);
  all.splice(pos, 0, correct);
  return { options: all, correctIndex: pos };
}

/* ---------------- A. Brain Control Room ---------------- */

export type BrainRegionId = "cerebrum" | "cerebellum" | "brainstem" | "spinalCord";

export type BrainRegion = {
  id: BrainRegionId;
  name: string;
  emoji: string;
  discover: string;
  investigate: string;
  injury: string;
  mainRole: string;
  narration: string;
};

export const BRAIN_REGIONS: BrainRegion[] = [
  {
    id: "cerebrum",
    name: "Cerebrum",
    emoji: "🧠",
    discover:
      "The biggest part of the brain. It helps with thinking, language, memory, and moving your body on purpose.",
    investigate:
      "The cerebrum has two halves and several lobes. Areas toward the back work with what your eyes and skin sense. Areas toward the front help plan and make choices. Most tasks use several areas together.",
    injury:
      "If one part of the cerebrum is hurt, the brain can sometimes adapt, and doctors and therapists help the body learn new ways to do things with practice.",
    mainRole: "Thinking, senses, language, memory and planned movement",
    narration:
      "The cerebrum is the biggest part of your brain. It helps you think, talk, remember, and move on purpose.",
  },
  {
    id: "cerebellum",
    name: "Cerebellum",
    emoji: "🤸",
    discover:
      "A smaller part at the back of the brain, under the cerebrum. It helps you keep your balance and move smoothly.",
    investigate:
      "The cerebellum compares what your muscles and inner ears are doing and makes small corrections. This is why running, writing, and catching a ball can feel smooth.",
    injury:
      "If this area is hurt, balance and smooth movements can be harder for a while. Practice and therapy help many people learn new ways to move.",
    mainRole: "Balance and smooth, coordinated movement",
    narration:
      "The cerebellum sits at the back of your brain. It helps you balance and makes your movements smooth.",
  },
  {
    id: "brainstem",
    name: "Brainstem",
    emoji: "💓",
    discover:
      "The stalk at the bottom of the brain. It joins the brain to the spinal cord and helps control breathing and heartbeat without you thinking about them.",
    investigate:
      "Many nerve pathways pass through the brainstem. It helps set your breathing and heart rate, and it helps control sleeping and waking.",
    injury:
      "The brainstem does very important jobs, so any injury here needs urgent medical care straight away.",
    mainRole: "Breathing, heart rate and other automatic body jobs",
    narration:
      "The brainstem connects your brain to your spinal cord. It helps you breathe and keeps your heart beating.",
  },
  {
    id: "spinalCord",
    name: "Spinal cord",
    emoji: "🦴",
    discover:
      "A long bundle of nerves inside your spine. It carries messages between the brain and the rest of your body.",
    investigate:
      "Touch messages travel up it, and movement messages travel down it. Some reflex circuits are coordinated right inside the spinal cord, before the brain has finished deciding anything.",
    injury:
      "The bones of the spine protect the spinal cord. This is why we take care when we play and move.",
    mainRole: "Messages between the brain and the body, and reflex circuits",
    narration:
      "Your spinal cord is a long bundle of nerves inside your back. It carries messages between your brain and your body.",
  },
];

export const BRAIN_NETWORK_NOTE =
  "Many brain jobs need networks. Several regions work together, so one area rarely does a whole job alone.";

/** Distractor roles for the match challenge, one per region. */
export const BRAIN_ROLE_DISTRACTORS: Record<BrainRegionId, string[]> = {
  // Each wrong option is another region's exact role, so the choices are clearly different.
  cerebrum: [
    "Balance and smooth, coordinated movement",
    "Breathing, heart rate and other automatic body jobs",
  ],
  cerebellum: [
    "Thinking, senses, language, memory and planned movement",
    "Breathing, heart rate and other automatic body jobs",
  ],
  brainstem: [
    "Thinking, senses, language, memory and planned movement",
    "Balance and smooth, coordinated movement",
  ],
  spinalCord: [
    "Thinking, senses, language, memory and planned movement",
    "Balance and smooth, coordinated movement",
  ],
};

/* ---------------- B. Follow a Signal ---------------- */

export type SignalStage = {
  title: string;
  text: string;
  stop: "skin" | "nerve" | "spine" | "brain" | "muscle";
};

export const TOUCH_JOURNEY: SignalStage[] = [
  {
    title: "Skin notices",
    text: "Receptors in your skin detect the cold. Each receptor is tuned to a kind of feeling.",
    stop: "skin",
  },
  {
    title: "Nerves carry it",
    text: "Sensory nerves carry an electrical signal up the arm toward the spinal cord.",
    stop: "nerve",
  },
  {
    title: "Spinal cord passes it on",
    text: "The spinal cord and brainstem pass the message up toward the brain, and the nervous system begins sorting the information.",
    stop: "spine",
  },
  {
    title: "Brain interprets",
    text: "The brain helps you understand the sensation: “This feels cold.”",
    stop: "brain",
  },
  {
    title: "Body may respond",
    text: "Motor signals travel down to muscles, which can pull your hand away. Some of this quick response can start in the spinal cord before the brain has finished interpreting the feeling.",
    stop: "muscle",
  },
];

export const VISION_JOURNEY: SignalStage[] = [
  {
    title: "Light enters the eye",
    text: "Light passes through the cornea and the pupil, and the lens focuses it onto the back of the eye.",
    stop: "skin",
  },
  {
    title: "Retina detects light",
    text: "The retina is a layer of light-sensitive cells at the back of the eye. It turns light into electrical signals.",
    stop: "nerve",
  },
  {
    title: "Optic nerve carries signals",
    text: "The optic nerve carries these signals to the back of the brain. It carries signals, not a finished picture.",
    stop: "spine",
  },
  {
    title: "Brain processes what you see",
    text: "The brain interprets the signals. The eye does not see a complete picture the way a camera does. The brain builds what you experience.",
    stop: "brain",
  },
];

/* ---------------- C. The Five Senses ---------------- */

export type SenseStructure = { name: string; text: string };

export type SenseStation = {
  id: "vision" | "hearing" | "smell" | "taste" | "touch";
  name: string;
  emoji: string;
  discover: string;
  investigate: string;
  structures: SenseStructure[];
  narration: string;
  question: { prompt: string; choice: Choice; explanation: string };
};

export const SENSE_STATIONS: SenseStation[] = [
  {
    id: "vision",
    name: "Vision",
    emoji: "👁️",
    discover:
      "Your eyes respond to light. Light goes in, and signals travel to your brain so you can see.",
    investigate:
      "Light is focused by the cornea and lens onto the retina. Light-sensitive cells in the retina send signals through the optic nerve. The brain then processes those signals into what you see.",
    structures: [
      { name: "Cornea", text: "The clear front window. It bends light as it enters the eye." },
      {
        name: "Pupil",
        text: "The dark opening that lets light in. It gets bigger in dim light and smaller in bright light.",
      },
      { name: "Lens", text: "Changes shape to help focus light, near or far." },
      {
        name: "Retina",
        text: "The light-sensitive layer at the back of the eye. It turns light into signals.",
      },
      { name: "Optic nerve", text: "Carries the signals from the eye to the brain." },
    ],
    narration:
      "Light enters your eye through the cornea and pupil. The retina detects it, and your optic nerve carries signals to your brain.",
    question: {
      prompt: "Which part of the eye detects light?",
      choice: rotateOptions("Retina", ["Eyelid", "Eardrum"], 0),
      explanation: "The retina is the light-sensitive layer at the back of the eye.",
    },
  },
  {
    id: "hearing",
    name: "Hearing",
    emoji: "👂",
    discover:
      "Sound is made of tiny air vibrations. Your ears collect them and turn them into signals your brain can hear.",
    investigate:
      "Vibrations move the eardrum and three tiny bones in the middle ear. The cochlea turns these vibrations into nerve signals, and the auditory nerve carries them to the brain.",
    structures: [
      { name: "Outer ear", text: "Collects sound vibrations from the air and guides them inward." },
      { name: "Eardrum", text: "A thin membrane that vibrates when sound reaches it." },
      {
        name: "Tiny middle-ear bones",
        text: "Three small bones that pass the vibrations along to the inner ear.",
      },
      {
        name: "Cochlea",
        text: "A snail-shaped part of the inner ear that turns vibrations into nerve signals.",
      },
      { name: "Auditory nerve", text: "Carries the signals from the cochlea to the brain." },
    ],
    narration:
      "Sound is made of tiny air vibrations. Your ear turns them into signals, and the brain works out what you hear.",
    question: {
      prompt: "Where do sound vibrations become nerve signals?",
      choice: rotateOptions("Cochlea", ["Nostril", "Tongue"], 1),
      explanation:
        "The cochlea, in the inner ear, turns vibrations into signals the brain can use.",
    },
  },
  {
    id: "smell",
    name: "Smell",
    emoji: "👃",
    discover:
      "Tiny smell molecules float into your nose and reach special receptors high inside it.",
    investigate:
      "Smell receptors send signals along nerves to the brain. Smell is a big part of flavour, which is why food can taste dull when your nose is blocked.",
    structures: [
      { name: "Nose", text: "Lets air and smell molecules in." },
      {
        name: "Smell receptors",
        text: "Cells high inside the nose that react to smell molecules.",
      },
      { name: "Olfactory nerve", text: "Carries smell signals from the nose toward the brain." },
    ],
    narration:
      "Smell molecules float into your nose and reach receptors. Those receptors send signals to your brain.",
    question: {
      prompt: "What do smell molecules interact with inside the nose?",
      choice: rotateOptions("Smell receptors", ["Teeth", "Bones"], 2),
      explanation: "Smell molecules interact with receptors, and those send signals to the brain.",
    },
  },
  {
    id: "taste",
    name: "Taste",
    emoji: "👅",
    discover:
      "Taste buds on your tongue detect five basic tastes: sweet, sour, salty, bitter and umami.",
    investigate:
      "Taste is only one part of flavour. Smell, texture, temperature and even how food looks all add to the flavour you experience.",
    structures: [
      { name: "Taste buds", text: "Groups of cells on the tongue that react to tastes." },
      { name: "Sweet and sour", text: "Two of the five basic tastes." },
      {
        name: "Salty, bitter and umami",
        text: "Three more of the five basic tastes. Umami is a savoury taste, found in foods like cooked meat and mushrooms.",
      },
    ],
    narration:
      "Taste buds detect five basic tastes. Flavour is more than taste, because smell adds a lot too.",
    question: {
      prompt: "Which of these is one of the five basic tastes?",
      choice: rotateOptions("Umami", ["Loudness", "Warmth"], 0),
      explanation:
        "Umami is one of the five basic tastes. Warmth is temperature, and loudness is about sound.",
    },
  },
  {
    id: "touch",
    name: "Touch",
    emoji: "✋",
    discover:
      "Your skin has many kinds of receptors. Some feel light touch, some feel pressure, some feel temperature, and some feel pain.",
    investigate:
      "Different receptors and nerve pathways respond to different stimuli. There is not one single receptor that feels everything.",
    structures: [
      { name: "Touch receptors", text: "Respond to light touch and to movement across the skin." },
      { name: "Pressure receptors", text: "Respond when skin is pushed or squeezed." },
      { name: "Temperature receptors", text: "Respond to warm and cold." },
      {
        name: "Pain receptors",
        text: "Respond to things that could harm the skin, and send a warning signal.",
      },
    ],
    narration:
      "Your skin has many different receptors. Some feel touch, some feel pressure, some feel temperature, and some feel pain.",
    question: {
      prompt: "What do different skin receptors respond to?",
      choice: rotateOptions(
        "Different kinds of touch, pressure and temperature",
        ["Only colours", "Only sounds"],
        1,
      ),
      explanation:
        "Different receptors respond to different stimuli. There is no single universal receptor.",
    },
  },
];

/** "Identify the sense" challenge: a scenario and the sense that picks it up. */
export const SENSE_SCENARIOS: { scenario: string; sense: SenseStation["id"] }[] = [
  { scenario: "A song is playing in the next room.", sense: "hearing" },
  { scenario: "A bright rainbow appears after the rain.", sense: "vision" },
  { scenario: "Warm bread is coming out of the oven.", sense: "smell" },
  { scenario: "A slice of lemon makes your mouth pucker.", sense: "taste" },
];

/* ---------------- D. Reflex Lab ---------------- */

export const REFLEX_STEPS: { title: string; text: string }[] = [
  {
    title: "Sensory signal",
    text: "A tap just below the knee stretches a sensor in the thigh muscle. This sends a signal into the nervous system.",
  },
  {
    title: "Spinal cord circuit",
    text: "The sensory nerve connects to the spinal cord, where a short circuit passes the message on to a motor nerve. The brain is not needed to make this quick link.",
  },
  {
    title: "Motor signal",
    text: "The motor nerve sends a signal to the thigh muscle, which tightens and makes the lower leg kick.",
  },
  {
    title: "The brain also hears about it",
    text: "The brain receives information about the tap too, so you can notice it. The kick happened before any decision was made.",
  },
];

export const REFLEX_NOTE =
  "This is a simple simulation. Real reflexes and voluntary movements involve more complicated circuits than this picture. Never tap your own knee hard to test it. Watch the simulation instead.";

export const REFLEX_COMPARE: { action: string; automatic: boolean; why: string }[] = [
  {
    action: "Pulling your hand away from a hot cup",
    automatic: true,
    why: "A fast reflex. A spinal circuit can start the response.",
  },
  {
    action: "Blinking when something flies towards your eye",
    automatic: true,
    why: "A quick protective reflex that does not wait for a plan.",
  },
  {
    action: "Choosing to lift your arm to wave",
    automatic: false,
    why: "A deliberate choice. The brain plans and starts the movement.",
  },
  {
    action: "Deciding which book to read next",
    automatic: false,
    why: "A choice that involves thinking and remembering what you like.",
  },
];

/* ---------------- E. Memory and Learning ---------------- */

export const MEMORY_FACTS: string[] = [
  "The brain can change as we learn and practise. This is called learning and adapting.",
  "Attention, repetition, meaningful connections and sleep can all help learning and memory.",
  "Different brain networks help with different kinds of memory. Remembering a song is not the same job as remembering where you left your shoes.",
  "Memories are not stored as tiny files in one folder in the brain. They are spread across connected networks.",
];

export const OBSERVATION_ITEMS = ["🍎", "🚲", "🐶", "🌳", "🎈", "⚽", "🐟", "🎸"];

/** Pick a deterministic observation question from a seed: one present item and one absent item. */
export function observationQuestion(scene: string[], seed: number): Choice & { answer: string } {
  const pool = OBSERVATION_ITEMS.filter((i) => !scene.includes(i));
  const answer = scene[seed % scene.length];
  const absent = pool[seed % pool.length];
  const distractor = pool.length > 1 ? pool[(seed + 1) % pool.length] : absent;
  const choice = rotateOptions(
    answer,
    [absent, distractor].filter((v, i, a) => v !== answer && a.indexOf(v) === i),
    seed,
  );
  return { ...choice, answer };
}

/** Compare a recalled pattern with the shown pattern. */
export function patternMatches(shown: number[], given: number[]): boolean {
  return shown.length === given.length && shown.every((v, i) => v === given[i]);
}

/** Deterministic pattern of tile indexes (0–8) of a given length. */
export function makePattern(length: number, seed: number): number[] {
  const out: number[] = [];
  let x = seed * 9973 + 17;
  for (let i = 0; i < length; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    out.push(x % 9);
  }
  return out;
}

/* ---------------- challenge ids (for progress) ---------------- */

export const CHALLENGE_IDS = [
  "control-match-cerebrum",
  "control-match-cerebellum",
  "control-match-brainstem",
  "signal-order",
  "signal-together",
  "senses-identify",
  ...SENSE_STATIONS.map((s) => `senses-${s.id}`),
  "reflex-compare",
  "memory-pattern",
  "memory-observation",
] as const;
export type ChallengeId = (typeof CHALLENGE_IDS)[number];
