#!/usr/bin/env node
/**
 * Generate Arabic voice-over clips with ElevenLabs.
 *
 * Reads scripts/audio/arabic-phrases.txt (one phrase per line, exact voweled text),
 * writes one MP3 per phrase to public/audio/ar/ and a manifest.json that maps
 * each exact phrase to its file. Existing clips are skipped, so re-runs are safe.
 *
 * Usage (from the repo root):
 *   export ELEVENLABS_API_KEY="your-key"     # never commit this
 *   node scripts/generate-arabic-audio.mjs --dry-run      # count only, no API calls
 *   node scripts/generate-arabic-audio.mjs --limit 5      # test a few first
 *   node scripts/generate-arabic-audio.mjs                # all phrases
 *
 * Optional: ELEVENLABS_VOICE_ID overrides the default voice below.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PHRASES = join(ROOT, "scripts/audio/arabic-phrases.txt");
const OUT_DIR = join(ROOT, "public/audio/ar");
const MANIFEST = join(OUT_DIR, "manifest.json");

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "4wf10lgibMnboGJGCLrP";
const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128";
const CONCURRENCY = 3;

const args = new Set(process.argv.slice(2));
const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;
const DRY_RUN = args.has("--dry-run");

const phrases = [...new Set(
  readFileSync(PHRASES, "utf8").split("\n").map((l) => l.trim()).filter(Boolean),
)].slice(0, LIMIT);

const fileFor = (text) => `${createHash("sha1").update(text).digest("hex").slice(0, 16)}.mp3`;

mkdirSync(OUT_DIR, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};

const todo = phrases.filter((t) => !existsSync(join(OUT_DIR, fileFor(t))));
console.log(`Phrases: ${phrases.length} · already done: ${phrases.length - todo.length} · to generate: ${todo.length}`);
console.log(`Voice: ${VOICE_ID} · model: ${MODEL_ID}`);

if (DRY_RUN) process.exit(0);

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Missing ELEVENLABS_API_KEY. Set it in your terminal first (see the instructions).");
  process.exit(1);
}

async function speak(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=${OUTPUT_FORMAT}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "content-type": "application/json", accept: "audio/mpeg" },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt === 4) {
      throw new Error(`HTTP ${res.status} for "${text}": ${(await res.text()).slice(0, 200)}`);
    }
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
}

let done = 0;
let failed = 0;
async function worker(queue) {
  while (queue.length) {
    const text = queue.shift();
    try {
      const file = fileFor(text);
      writeFileSync(join(OUT_DIR, file), await speak(text));
      manifest[text] = `/audio/ar/${file}`;
      done++;
    } catch (err) {
      failed++;
      console.error(err.message);
    }
    if ((done + failed) % 50 === 0) {
      writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
      console.log(`… ${done + failed}/${todo.length}`);
    }
  }
}

const queue = [...todo];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`Finished. Generated ${done}, failed ${failed}. Manifest: public/audio/ar/manifest.json`);
