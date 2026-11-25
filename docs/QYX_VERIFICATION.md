# Implementation evidence — local versus hosted

## Executed locally

- Lockfile install: `npm ci` passed; no audit vulnerabilities reported. Playwright/axe are development-only verification additions, not runtime UI dependencies.
- `npm test`: **8 passed** (5 original catalog/search tests + 3 registry/asset-integrity tests).
- `npm run build`: **passed**, Vite static `dist/` output. No lint/typecheck commands are configured; those checks were not invented or claimed.
- `npm run test:browser`: local Chromium against the production build. Thirteen verification groups cover default/invalid/storage-blocked appearance, all fifteen selections/persistence, native radio Arrow/Escape/focus, story Home/End, combined filters/search/reset, deep links/dialog navigation, state/hash/focus/scroll preservation through an appearance switch with a product modal open, paused/reduced-motion initialization and mid-session OS changes, Outline Dark/reset, explicit/OS transparency reduction, forced colors, responsive/large-text reflow, review entry and no uncaught errors.
- Viewports: 320×568, 390×844, 844×390, 768×1024, 1366×768, 1920×1080. 320 CSS-pixel reflow is the 400%-zoom equivalent for a 1280 CSS-pixel starting width; it is not a claim of physical browser-UI zoom testing. A separate synthetic 200% computed-font-size enlargement checks actual content overflow at 320px.
- axe rendered text contrast checks cover each edition's explorer, native product modal and appearance selector. Automated checks are not full WCAG certification; complex-image/incomplete audit cases and subjective visual reading remain review tasks.
- `node scripts/verify-compositing.cjs`: computed browser colors composited over black/white/midgray (bounding bright/dark/busy backdrop luminance) produce minimum header text contrast **9.17:1**; semantic boundaries against canvas/surface/elevated surfaces minimum **3.45:1**. These are computed-color measurements, not pixel sampling of every glass scene or artwork.
- Every supplied PNG's recorded hash and intrinsic dimensions are checked. All 51 originals are preserved, including their transparency/padding/trademark notation. The initial archive hash matches the supplied SHA-256. Artwork resolution limitations and unresolved families are recorded in the asset manifest.

## Build cost comparison

Using the same installed Vite version, the application baseline built to HTML 11.15 kB, CSS 24.33 kB, JS 19.12 kB (gzip 3.10/6.49/6.29 kB). The enhanced build is approximately HTML 13.31 kB, CSS 40.9 kB, JS 30.9 kB (gzip approximately 3.54/9.1/9.7 kB). This intentional increase contains the fifteen palettes/materials, selector/review UI, shared appearance logic and metadata. The archive adds approximately 892 KiB of static artwork, with local licensed fonts separately; not all assets are fetched on initial load. No runtime framework, external font service or animation library was introduced.

## Capture inventory

The downloadable evidence bundle contains actual rendered viewport crops, not generated mockups:

- `desktop-01.png` … `desktop-15.png`: 1920×1080 CSS pixels, DPR 1.
- `mobile-01.png` … `mobile-15.png`: independent 360×640 CSS layout, DPR 3, output 1080×1920.
- `desktop-contact-sheet.png` and `mobile-contact-sheet.png`: labelled comparisons of those thirty crops.
- `flagship-10-4k.png`: 1920×1080 CSS, DPR 2, output 3840×2160.
- `mobile-selector.png`, `mobile-dialog.png`: additional actual UI states at 390×844.
- `baseline-hosted-desktop.png`, `baseline-hosted-mobile.png`: browser captures of the original READY preview at application SHA `772f83a90b5c6befe290ad32f7d82fc2617473d1`, not implementation captures.
- `verification.json`, `composed-contrast.json`: local results and measurement details. Hosted evidence is labelled separately.

A hero crop does not prove the whole site. Search/filter/dialog/story/focus/scroll checks are separate evidence. High-DPR output does not increase the intrinsic resolution of the supplied logo masters.

## Hosted verification and explicit limits

See the enhancement PR's current verification section for the **published head SHA**, exact READY preview URL and hosted browser checks. This source document does not claim that a successful build or READY deployment is a hosted interaction test. Hosted browser captures are delivered separately from local Playwright output.

Not run: external product destinations and their authentication/financial flows; every browser/OS engine; a real browser lacking backdrop-filter support (solid-first fallback is implemented, but this runtime capability was not absent in Chromium); native OS assistive-technology testing; subjective final art-direction approval. French appearance strings are prepared, not full-site localization.

Blocked reference comparison: the pinned upstream material-reference source is inaccessible to this session. Implementation uses the supplied specification's embedded values, with documented readability adaptations. Remaining content inputs are provenanced higher-resolution masters if required, matching originals for unresolved product families and any additional sourced legal wording. No substitute artwork, trademark registration or legal claims were invented.

Production was not promoted by this enhancement. Final design acceptance and production promotion remain review decisions.
