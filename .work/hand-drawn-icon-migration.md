# Hand-drawn icon migration

- [x] Read the reference article and choose a licensing-safe approach.
- [x] Inventory current icon imports and shared wrappers.
- [x] Define a restrained hand-drawn icon token and migration boundary.
- [x] Replace compatible project icons through the shared dependency/API.
- [ ] Verify accessibility, tests, typecheck, and Cloudflare build.
- [ ] Record final scope and any intentionally retained icons.

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
