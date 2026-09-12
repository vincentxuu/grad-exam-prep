# Hand-drawn icon migration

- [x] Read the reference article and choose a licensing-safe approach.
- [x] Inventory current icon imports and shared wrappers.
- [x] Define a restrained hand-drawn icon token and migration boundary.
- [x] Replace compatible project icons through the shared dependency/API.
- [x] Verify accessibility, tests, typecheck, and Cloudflare build.
- [x] Record final scope and any intentionally retained icons.

## Direction

- Use deterministic Sketchyicons geometry derived from Lucide instead of copying a third-party icon
  collection. This preserves Lucide coverage and avoids asset-by-asset licensing ambiguity.
- Keep icons crisp at real UI sizes; do not add random runtime wobble or decorative animation.
- Preserve icon labels, button semantics, and sizing unless a visual-weight adjustment is necessary.

## Icon token

- 14px: compact badges and dense metadata.
- 16px: controls and inline actions.
- 20px: navigation identity and section labels.
- 24px: feature entry points.
- Stroke and fill inherit `currentColor`; primary color is reserved for navigation identity and feature
  markers, while controls inherit their surrounding foreground color.
- Motion remains limited to the existing loading spinner; the hand-drawn geometry is deterministic.

## Outcome

- `@sketchyicons/react` is the only icon package used across 46 source files; `lucide-react` and its
  lockfile entry were removed.
- Replaced UI emoji and glyphs used for navigation, success/error state, warnings, ratings, resource
  categories, and external links with accessible Sketchyicons components.
- Exhaustive scans found no remaining alternate icon imports, handwritten inline SVG, CSS-generated
  icons, or references to the unused starter SVG files in `public/`.
- Intentionally retained arrows and symbols that are learning content, correction notation, question
  data, mathematical notation, or locale flags rather than interface icons.
- Verified with TypeScript, 56 Jest suites / 410 tests, 61-paper / 1,475-question integrity checks,
  and a complete OpenNext Cloudflare production bundle.
