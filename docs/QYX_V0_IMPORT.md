# v0 handoff — actual Vite source, no fictional package

Import this repository enhancement with its base application branch (dependency: PR #1). Preserve Vite 7, vanilla ES modules, HTML/CSS, static `dist/` output and the existing catalog. There is no `@qyx/ui` package, React requirement, Next.js route or OS desktop shell.

## Source/file mapping

1. `index.html` owns real landmarks, explorer shell, native product dialog and appearance dialog.
2. `src/main.js` owns catalog rendering, story navigation, native product deep links, search/filter, motion and mobile menu. `src/catalog.js` remains the sole product/destination model.
3. `src/design-system/editions.js` exports `editions`, `resolveAppearance`, `STORAGE_KEY`; JSON is the canonical edition manifest. Keep 15 IDs, 01–15; 09 Dark is only a variant.
4. `palettes.css` owns raw edition colors/fonts; `tokens.css` owns shared semantic/component/material behavior. Load palette CSS before the app module; default to Edition 10.
5. `appearance.js` exports `initAppearance`, `appearanceStrings` and attaches controls once. The synchronous `public/appearance-init.js` validates storage/URL before paint. Both must agree on ID validation and key version.
6. `brand.js` exports exact family/asset resolution helpers. Copy `public/brand/qyx` unchanged and retain `public/brand/asset-manifest.json`. The 51 user-supplied PNG hashes are authoritative for these bytes, not proof of legal registration.
7. Keep `public/fonts` including font licenses, and the `vercel.json` static output/security header configuration.

## Reproduction rules

Use one content/component tree; apply root `data-edition`/`data-variant` and semantic CSS properties, never rebuild the explorer to switch themes. Keep canonical light editions light, especially 09 and 14. Preserve search, category, selected story, open product, hash, keyboard focus and page scroll. Preview query overrides must not silently persist. Keep motion/transparency separate. OS reduced motion overrides saved playing; readable content may never depend on an animation finishing. Keep the original QYX assets opaque, uncropped, unstretched, unfiltered and unredrawn. Never substitute a product identity for the umbrella or another family.

Tokens comprise canvas, surface, elevated, text/muted-text, border, accent/accent-text/on-accent, focus, selected/hover/pressed/disabled, overlay/chrome/panel/card/control/status; material alpha/blur/shadow/grid are separate. Preserve solid-first progressive glass, OS/explicit transparency reduction and forced-colors overrides. Use the included local Inter/Orbitron/JetBrains fonts or documented fallbacks; never typeset replacement logo artwork.

`/?review=design-system` renders the real review samples, not a separate starter application. Open every edition, then test actual card/dialog/search/chip/empty/disabled/focus states. Run the included tests/build/browser script and repeat hosted checks on the exact PR head preview. Do not claim design approval, production promotion, financial functionality, full-site French localization or external destination verification from a successful build.

## Dependencies and open inputs

Runtime: browser ES modules, native dialog, local static assets. Build: Vite. Development verification: Node test runner, Playwright and axe-core. All are declared in the real package/lockfile; no external runtime API or secret is needed.

Outstanding content inputs: accessible copy of pinned upstream material-reference reference for direct comparison; higher-resolution provenanced logo masters if density requirements exceed supplied originals; confirmed artwork for unresolved families; any additional sourced legal wording. Do not fabricate these inputs. Final visual approval and production promotion are separate review decisions.
