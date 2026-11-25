# QuantumYield · Explore

An independently designed, responsive ecosystem explorer inspired by the editorial feature-discovery pattern of Microsoft Edge's updates page. Original QuantumYield branding, illustrations, layout, and motion; no Microsoft assets are used.

## Run

Node.js 22.12+ (or a newer supported Node release) and npm.

```sh
npm ci
npm run dev
npm test
npm run build
```

Vite generates a static `dist/` site. `vercel.json` specifies the build and output. No environment variables, application login, backend, or third-party runtime assets are required.

## Experience

- Animated orbital hero with clickable product satellites
- Three illustrated, manually navigated feature stories; arrow/Home/End keyboard support
- Search across 19 families and 63 named QYX/QuantumYield projects and editions
- Five category filters, empty results/reset, and result announcements
- Native modal dialogs with Escape, focus restoration, previous/next, and `#product/<id>` deep links
- Responsive navigation, scroll reveals, progress line, hover motion, persistent pause control, and OS reduced-motion support

## Maintain the directory

Edit `src/catalog.js`. Snapshot: November 25, 2026. It contains QYX/QuantumYield-named projects plus the QYX AI-branded landing page, grouped into product families. It does not assert that all team projects belong to QYX. Public destination URLs reflect project metadata, not uptime or a feature audit. Projects without a production URL are explicitly labeled and have no launch button. Family descriptions are navigational summaries, not financial-service, interoperability, security, or availability claims. Prototype/interface projects remain identified by their original names.

Keep project names unique across families. Update snapshot copy in `index.html` with inventory changes. `npm test` validates family membership, destinations, and search/filter behavior.

## Preview verification

All explorer flows are reachable signed out. External apps may have their own authentication and are outside this site's test boundary. Check hero satellites, story tabs and keyboard navigation, search plus categories, no-results reset, modal Escape and next/previous, reduced-motion/pause, and mobile menu. No wallet or payment operations are implemented by this directory.

## Proposed 15-edition design system

See [system and provenance](docs/QYX_DESIGN_SYSTEM.md) and [v0 handoff](docs/QYX_V0_IMPORT.md). Default: Edition 10. Review: `/?review=design-system`. Appearance preview: `?edition=09&variant=dark`. This enhancement depends on application PR #1 and does not constitute production promotion or final design approval.
