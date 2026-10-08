// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

// Uploaded media (audio, flags, character art, kitchen art…) lives on Lovable's asset CDN and is
// referenced as root-relative "/__l5e/assets-v1/…" URLs. Only Lovable hosting serves that path, so
// on any other host (Vercel) we point those URLs at the published Lovable site at build time.
// Lovable builds are untouched. Override the origin with LOVABLE_ASSET_ORIGIN if the site moves.
const ASSET_ORIGIN = process.env.LOVABLE_ASSET_ORIGIN ?? "https://quick-play-bloom.lovable.app";
const offLovable = Boolean(process.env.VERCEL || process.env.LOVABLE_ASSET_ORIGIN);

function lovableAssetOrigin(): Plugin {
  return {
    name: "lovable-asset-origin",
    enforce: "pre",
    transform(code, id) {
      if (!/\/src\/.*\.(tsx?|json)$/.test(id.split("?")[0]!) || !code.includes("/__l5e/")) return null;
      return { code: code.replace(/(["'`])\/__l5e\//g, `$1${ASSET_ORIGIN}/__l5e/`), map: null };
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: offLovable ? { plugins: [lovableAssetOrigin()] } : {},
});
