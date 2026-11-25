# QYX Ecosystem appearance proposal

This integration proposes a reviewable site appearance, not an approved brand standard. Production promotion and final design acceptance remain owner decisions.

## Base and scope

Verified November 25, 2026: PR #1 remains open/unmerged; `feat/quantumyield-explorer` at `772f83a90b5c6befe290ad32f7d82fc2617473d1` contains the application; `main` is README-only. Production and its existing preview both identify that application SHA. This enhancement branches from the application head and targets the application branch, not `main`. No other open motion-fix PR existed at inspection. Vite/vanilla JS, all 19 family IDs, 63 project memberships/destinations, native dialogs and explorer interactions remain intact. Display spelling is corrected separately from literal catalog identifiers.

## Files and exports

- `src/design-system/editions.json`: authoritative 15-edition manifest. Canonical names and source palettes v2.0.0; material, scheme, preview and asset mapping metadata. Source is the supplied specification's embedded token reference, not independently retrieved upstream JSON.
- `editions.js`: exports `editions`, `resolveAppearance`, `STORAGE_KEY`. Invalid IDs fall back to 10. Only 09 has a `dark` variant; the canonical 09 palette stays light.
- `palettes.css`: static source palettes and locally hosted fonts. It is linked before the main module; 10 is the CSS fallback.
- `tokens.css`: semantic/component roles, material treatments, accessibility overrides. One component tree, not fifteen copies of the explorer.
- `appearance.js`: `initAppearance`, `appearanceStrings`; native modal, native grouped radios, pre-existing explorer DOM preserved; separate explicit transparency control and OS handling.
- `public/appearance-init.js`: small synchronous, storage-safe pre-paint attribute initializer. Keep its supported IDs/key in sync with the registry (covered by review and tests).
- `brand.js`: `brandFamilies`, `assetVariant`, `updateBrands`, `brandArt`; exact identity matching only.
- `public/brand/asset-manifest.json`: 51 original PNGs with SHA-256, dimensions, alpha bounds (exclusive right/bottom), identity/variant and source provenance; unresolved families listed explicitly.

## Edition and material map

01 Monochrome Dark · satin graphite
02 Monochrome White · pearl
03 Silver Haze · metallic wash
04 Grayscale Editorial · flat, squared editorial hierarchy
05 Sepia Neutral · warm rounded surfaces
06 Institutionnel Gridline Clair · light structural grid
07 Institutionnel Gridline Sombre · dark structural grid
08 Blueprint Graphite · schematic graphite grid
09 Outline Minimal · light outlines, optional Dark project adaptation
10 Obsidian Platinum · satin obsidian frame, precise chrome, neutral glass
11 Champagne Soft · warm pearl fields
12 Cinematic Gold · controlled horizon light
13 Titanium Industrial · brushed construction
14 Glass Neutral · light frosted foundation
15 Architectural Matte · matte structural grid

All editions share anatomy/spacing/typography; distinction comes from coordinated surfaces, artwork variants, borders, radius, depth, light and grids, not a new content model. Edition 09 Dark and the Outline/Obsidian/Glass recipe are not editions 16/17.

## Tokens and site decisions

Foundations use a 4px spacing base, radii 12/18/28px; legacy layout measurements are retained where needed to preserve the explorer. Local, licensed Latin Inter 400 (body/control), Orbitron 500 (review headings only) and JetBrains Mono 400 (technical labels) are served with swap. Fallbacks are Arial/sans-serif and monospace. Fontsource packages supply the fonts; SIL OFL texts are shipped alongside. Non-Latin glyphs fall back to the user's installed fonts; Exo 2 is not required or synthesized. No font is used to reconstruct a logo.

Source `canvas/surface/text/accent` remain unchanged. Semantic adaptations: text is reused for selected controls/focus and accessible accent-text rather than assuming the palette accent meets AA. Muted text is a 78% text/surface mix; boundaries are a 62% text/surface mix. Roles include elevated, on-accent, hover, pressed, disabled, overlay, chrome, panel, card, control and status. Status meanings remain written labels, never a newly invented service-availability color.

The embedded reference's 62% chrome/78% panel/36% card recipes are deliberately strengthened: solid-first surfaces, 94% bounded chrome/cards (92% for Edition 14), 24px chrome and 12px satellite blur. This is a readability adaptation, not a claim of byte-identical upstream material implementation. Text and original artwork remain opaque. Light editions stay light. Reduced transparency removes every backdrop-filter, including pseudo/backdrop and prefixed properties; unsupported blur browsers retain solid surfaces. Forced colors uses system colors; preview swatches intentionally retain their identifying source colors.

The pinned upstream material reference commit `3d82cf1fd315a639d54c36e4d34e39d748cb5aac` could not be accessed through either the named repository or a linked project in this session. Only the reference values embedded in the supplied specification were available; direct source comparison remains a dependency, not completed verification.

## Behavior and review entry

- `?edition=01` through `?edition=15`, plus `?edition=09&variant=dark`, are validated preview overrides. They do not overwrite saved preferences.
- Explicit selection persists `{id,variant}` under `qyx-ecosystem:appearance:v1`; it removes only appearance URL parameters, preserving other queries and product hashes. Reset selects 10. Malformed/blocked storage never blocks exploration.
- Transparency uses `qyx-ecosystem:transparency:v1`; existing `qyx-motion` remains separate. OS reduced motion always wins over saved playing. The disabled motion button explains the OS requirement and re-enables when that requirement changes.
- Appearance updates root attributes/assets only. Search, category, story, open product and hashes are not rerendered. Native dialog returns focus without scrolling. A selector entry inside the product dialog allows changing appearance while that dialog remains open.
- Content is visible without entrance animations. Ambient loops stop independently in reduced/paused states, when the hero is offscreen and when the document is hidden. No stale transition timers are used.
- `/?review=design-system` is an actual Vite index entry/query (not a fabricated Next.js route). It displays all 15 scoped token/component samples, actual dialog launchers, search, chips, focus/selected/disabled/empty states, authentic artwork, header/footer samples and source palette values. Direct built access uses `dist/index.html`; no server rewrite is needed.
- Appearance strings are separated in `appearanceStrings` for English/French handoff. This is not a full-site French localization.

## Brand limitations

Original bytes, transparency, padding, lettering and embedded notation are retained with contain sizing and no CSS filters/crops/redrawing. White/black originals are selected by contrast; Edition 10 uses the supplied silver-metallic originals. Metallic/outline originals remain available in the manifest for art direction, but are not assumed to be legible at small sizes. Supplied source-specific header/next artwork is retained without assuming its intended universal placement.

The Q emblem is only ~183×82 and the QuantumYield wordmark ~183×33. Hero artwork is deliberately bounded rather than filling the entire orbital sphere. High-DPR captures do not create higher-resolution masters. A larger, provenanced original is still desirable for density-critical placements. Product families without confidently matching supplied originals use ordinary readable names, not invented emblems. QYXpass/QYXnext are not mapped to unrelated catalog families by guesswork. No registration, certification or new legal notice is asserted.

## Reproduce checks

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run preview -- --host 127.0.0.1
# another terminal
npm run test:browser
```

`QYX_EVIDENCE` changes the default external evidence directory; `QYX_BASE` may point to a locally served build. Do not mistake local Chromium output for hosted preview verification. The script uses Chromium/axe, covers interactions/state/motion/storage/reflow and emits actual desktop/mobile viewport crops for every edition plus selector/dialog examples. It does not test external product destinations, authentication, wallet or financial flows.
