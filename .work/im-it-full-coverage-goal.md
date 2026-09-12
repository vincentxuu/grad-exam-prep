# IM-IT 61/61 Coverage Goal

## Completion contract

- Cover all 61 canonical subtopics from `im-it-concept-master.json`.
- Every added lesson has reviewed sources, past-paper refs, objectives, sections, worked examples, pitfalls, and a complete `learningScenario`.
- Every newly covered subtopic has at least two atomic concept cards.
- Lesson/card/source/question references form closed sets.
- Existing 20 lessons and 122 cards remain unchanged unless a verified correction is required.
- No disputed or self-review-only question becomes auto-grade evidence.
- Subtopics with no direct primary past-paper evidence are labeled foundational; related refs may support the lesson, but the site must not claim direct frequency evidence.
- Content tests, validators, typecheck, full Jest suite, and production build pass.

## Parallel authoring batches

1. Architecture + programming: 10 uncovered subtopics.
2. Data structures + database + operating systems: 9 uncovered subtopics.
3. Network + security + AI/ML: 14 uncovered subtopics.

Agents write isolated `.work` lesson/card/source fragments and review reports. The main line owns final merging, ID collision checks, source closure, coverage calculation, tests, and build.

## Status

- [x] Baseline confirmed: 20 lessons, 122 cards, 28/61 subtopics.
- [x] Evidence baseline confirmed: 8 uncovered subtopics currently have zero direct primary refs and require transparent foundational labeling.
- [x] Three isolated content batches authored and independently cross-reviewed.
- [x] Cross-review corrections completed: remove unsupported question refs, tighten source scopes, and split overloaded AI coverage.
- [x] Foundation-only lessons have a zero-ref practice fallback instead of an invalid question URL.
- [x] Fragments merged into canonical artifacts: 35 lessons, 191 cards, 35 reviewed sources.
- [x] Coverage validator reports 61/61, exactly once, with at least two cards per subtopic.
- [x] Full verification passes: 33 Jest suites / 313 tests, typecheck, content validation, paper integrity, targeted Biome checks, and production build (69 static pages).
