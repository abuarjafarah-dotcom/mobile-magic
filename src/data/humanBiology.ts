/**
 * Human Biology Lab — content model (data only, no rendering logic).
 * Engine: src/components/humanBiology/HumanBiologyLab.tsx
 * Hotspot geometry: src/data/humanBiologyBody.ts
 * Asset requirements: src/assets/human-biology/ASSET-MANIFEST.md
 *
 * Source notes: content is general school-level and undergraduate physiology.
 * It was NOT extracted from any book. It should get expert review before
 * publication, and book-derived material can be added later as new fields or entries.
 */

export type OrganId = "brain" | "heart" | "lungs" | "stomach" | "smallIntestine" | "skeleton";

export type OrganEntry = {
  id: OrganId;
  name: string;
  emoji: string;
  category: string;
  /** Anatomical location, in plain words. */
  location: string;
  /** Short Discover explanation for younger children. */
  discover: string;
  /** Deeper Investigate explanation. Accurate, not dumbed down. */
  investigate: string;
  /** One short phrase describing the function, used as a challenge answer. */
  functionShort: string;
  /** Related body systems. */
  systems: string[];
  /** A question or activity connected to the structure. */
  activity: string;
  /** Hint shown after a wrong answer in the find challenge. */
  hint: string;
  /** Spoken narration text (English device voice). */
  narration: string;
  /** Optional animation filename in src/assets/human-biology/. Missing files are ignored. */
  animation?: string;
  sourceNotes: string;
};

export const ORGANS: OrganEntry[] = [
  {
    id: "brain",
    name: "Brain",
    emoji: "🧠",
    category: "Nervous system",
    location: "Inside the skull, protected by the bones of the head.",
    discover:
      "Your brain is the control center of your body. It takes in messages from your eyes, ears, skin and other organs, and it sends out messages that help you think, move and feel.",
    investigate:
      "The brain is made of billions of nerve cells called neurons. Each neuron passes signals along as tiny electrical changes, then releases chemical messengers at junctions called synapses. Different brain regions work together to coordinate movement, breathing, heart rate, hunger and thirst, and conscious thought. Much of this control happens automatically, without you deciding it.",
    functionShort: "Processes information and coordinates many body functions",
    systems: ["Nervous system", "Senses", "Muscular system"],
    activity:
      "Close your eyes and touch your nose. Your brain planned that movement in a fraction of a second.",
    hint: "Look at the top of the head, inside the skull.",
    narration:
      "This is your brain. It is the control center of your body. It receives messages from your senses and sends messages to your muscles and organs.",
    sourceNotes: "General physiology: neurons, synapses, automatic control. Needs expert review.",
  },
  {
    id: "heart",
    name: "Heart",
    emoji: "❤️",
    category: "Circulatory system",
    location: "In the middle of the chest, slightly to the left, between the lungs.",
    discover:
      "Your heart is a strong muscle that pumps blood all day and night. It has four rooms: two upper rooms called atria, and two lower rooms called ventricles.",
    investigate:
      "The right side receives blood that has delivered its oxygen and pumps it to the lungs. This is the pulmonary circulation. Oxygen-rich blood returns from the lungs to the left side, which pumps it out through the aorta to the rest of the body. This is the systemic circulation. Heart muscle contracts on its own rhythm, which is set by a small cluster of cells called the sinoatrial node.",
    functionShort: "Pumps blood through the lungs and around the body",
    systems: ["Circulatory system", "Respiratory system"],
    activity:
      "Put your hand on your chest and count your heartbeats for 15 seconds. Multiply by four to get beats per minute.",
    hint: "Look slightly left of the middle of the chest.",
    narration:
      "This is your heart. It has four rooms and pumps blood to your lungs and to every part of your body.",
    sourceNotes:
      "Standard cardiovascular physiology: four chambers, pulmonary and systemic circuits, sinoatrial node. Needs expert review.",
  },
  {
    id: "lungs",
    name: "Lungs",
    emoji: "🫁",
    category: "Respiratory system",
    location: "In the chest on either side of the heart, protected by the ribcage.",
    discover:
      "You have two lungs. When you breathe in, air goes into them, and oxygen moves from the air into your blood. When you breathe out, carbon dioxide, a waste gas, leaves your body.",
    investigate:
      "Air reaches tiny air sacs called alveoli. Each alveolus is wrapped in a dense network of capillaries. Oxygen diffuses across the very thin walls into the blood, and carbon dioxide diffuses out to be breathed away. In red blood cells, oxygen binds to hemoglobin and is carried to the body's tissues.",
    functionShort: "Moves oxygen into the blood and carbon dioxide out of it",
    systems: ["Respiratory system", "Circulatory system"],
    activity:
      "Breathe in slowly for 4 counts, then out for 4 counts. Notice your chest rise and fall.",
    hint: "Look for the two large shapes on each side of the chest.",
    narration:
      "These are your lungs. Oxygen from the air you breathe moves into your blood here, and carbon dioxide moves out.",
    sourceNotes:
      "Standard respiratory physiology: alveolar gas exchange, hemoglobin transport. Needs expert review.",
  },
  {
    id: "stomach",
    name: "Stomach",
    emoji: "🫃",
    category: "Digestive system",
    location: "In the upper left part of the belly, below the diaphragm.",
    discover:
      "Your stomach is a stretchy bag in the upper left part of your belly. It squeezes and mixes food, and it makes juices that help break the food down.",
    investigate:
      "The stomach churns food with strong muscle contractions and mixes it with gastric juice. The juice contains hydrochloric acid, which activates digestive enzymes and kills many germs, and pepsin, an enzyme that begins breaking proteins into smaller pieces. The stomach absorbs very little. Most nutrients are absorbed later, in the small intestine.",
    functionShort: "Mixes food and starts breaking it down with juices",
    systems: ["Digestive system"],
    activity:
      "Chew a bite of food slowly. Digestion starts in your mouth before the food ever reaches your stomach.",
    hint: "Look in the upper left of the belly, under the heart and lungs.",
    narration: "This is your stomach. It mixes food with juices that help start breaking it down.",
    sourceNotes:
      "Standard digestive physiology: gastric mixing, HCl, pepsin, limited absorption. Needs expert review.",
  },
  {
    id: "smallIntestine",
    name: "Small intestine",
    emoji: "🪱",
    category: "Digestive system",
    location: "In the middle and lower belly, below the stomach.",
    discover:
      "Your small intestine is a very long, coiled tube. It finishes breaking down food, and it takes the useful nutrients from the food into your blood.",
    investigate:
      "In an adult, the small intestine is about six metres long. Enzymes from the pancreas and bile from the liver finish digesting food. Its inner wall is covered in millions of tiny finger-like villi, and their microvilli increase the surface area. Sugars and amino acids pass into the blood capillaries, while most fats are taken up into lymph vessels called lacteals.",
    functionShort: "Finishes digesting food and absorbs most nutrients",
    systems: ["Digestive system", "Circulatory system", "Lymphatic system"],
    activity:
      "Your small intestine is longer than a car. Can you think of something else that long?",
    hint: "Look in the middle of the belly, below the stomach.",
    narration:
      "This is your small intestine. It is very long, and it absorbs the nutrients from your food into your blood.",
    sourceNotes:
      "Standard digestive physiology: pancreatic enzymes, bile, villi and absorption routes. Needs expert review.",
  },
  {
    id: "skeleton",
    name: "Skeleton",
    emoji: "🦴",
    category: "Skeletal system",
    location: "Throughout the body: skull, spine, ribcage, pelvis, arms and legs.",
    discover:
      "Your skeleton is made of 206 bones. It holds your body up, protects organs such as your brain and heart, and works with your muscles so you can move.",
    investigate:
      "Bones meet at joints. Muscles pull on bones through tendons, and this turns muscle contraction into movement. Bone is living tissue that is constantly remodeled and repaired. Bone marrow inside some bones makes blood cells, and bones store minerals such as calcium.",
    functionShort: "Supports the body, protects organs and works with muscles to move",
    systems: ["Skeletal system", "Muscular system"],
    activity: "Tap your skull gently. The bone under your skin protects your brain.",
    hint: "Look for the bones drawn as thin lines. The spine runs down the middle.",
    narration:
      "This is your skeleton. Its two hundred six bones hold you up, protect your organs, and work with your muscles to help you move.",
    sourceNotes:
      "Standard skeletal anatomy: 206 adult bones, joints, tendons, bone remodeling and marrow. Needs expert review.",
  },
];

export const ORGAN_IDS: OrganId[] = ORGANS.map((o) => o.id);

export function organById(id: OrganId): OrganEntry {
  const found = ORGANS.find((o) => o.id === id);
  if (!found) throw new Error(`Unknown organ id: ${id}`);
  return found;
}

/** Deterministic multiple-choice options for the match-function challenge. The correct answer is rotated so it is not always first. */
export function matchOptions(index: number): { options: string[]; correctIndex: number } {
  const n = ORGANS.length;
  const correct = ORGANS[index % n];
  const distractors = [ORGANS[(index + 1) % n], ORGANS[(index + 3) % n]].map(
    (o) => o.functionShort,
  );
  const ordered = [correct.functionShort, ...distractors];
  const shift = index % 3;
  const options = [...ordered.slice(shift), ...ordered.slice(0, shift)];
  return { options, correctIndex: options.indexOf(correct.functionShort) };
}

export type LabStatus = "ready" | "coming-soon";

export type LabEntry = {
  id: string;
  title: string;
  detail: string;
  emoji: string;
  status: LabStatus;
};

/** The six laboratory destinations. Only Anatomy Atlas is built. The rest are visible as planned and do not block anything. */
export const LABS: LabEntry[] = [
  {
    id: "anatomy",
    title: "Anatomy Atlas",
    detail: "Find the organs and learn what they do",
    emoji: "🫀",
    status: "ready",
  },
  {
    id: "digestion",
    title: "Digestion Lab",
    detail: "Follow food through the body",
    emoji: "🍎",
    status: "coming-soon",
  },
  {
    id: "oxygen",
    title: "Oxygen and Blood Lab",
    detail: "Follow oxygen and blood",
    emoji: "🩸",
    status: "coming-soon",
  },
  {
    id: "brain",
    title: "Brain and Senses Lab",
    detail: "Signals, eyes and ears",
    emoji: "👁️",
    status: "ready",
  },
  {
    id: "movement",
    title: "Movement Lab",
    detail: "Bones, joints and muscles",
    emoji: "💪",
    status: "coming-soon",
  },
  {
    id: "cells",
    title: "Cells and Experiments",
    detail: "Tiny parts and simple tests",
    emoji: "🔬",
    status: "coming-soon",
  },
];
