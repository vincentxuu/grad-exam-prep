# IM English duplicate-looking flashcards: UI trace

## Root cause

The browse page is faithfully rendering a data-quality problem, not cloning one React row. `public/data/flashcards.json` contains 5,452 `im` / `im-english` cards with 5,452 unique IDs and 5,452 unique full prompts, but 2,833 cards (51.96%) share the exact first sentence `The professor emphasized the importance of _____ in the research methodology.`. They differ only in their options/answer. Of these 2,833 template instances, 2,391 are tagged `im-english-domain` and 442 are tagged `im-english-reading`.

## Data loading and filtering

- `src/lib/content.ts:12-25` statically imports `public/data/flashcards.json` and exports the entire array without validation, grouping, or deduplication.
- `src/app/[exam]/flashcards/page.tsx:40-46` selects every card whose `examId` equals the route exam (`im`).
- `src/app/[exam]/flashcards/page.tsx:64-71` maps every selected static card 1:1 through `fromFlashcard`, then appends saved words. No uniqueness check is applied.
- `src/lib/review-card.ts:27-35` preserves the source card's `id` and `prompt` exactly.
- `src/app/[exam]/flashcards/page.tsx:73-77` handles `?subject=im-english` solely by `subjectId`; it does not filter by `topicId`, card quality, source tier, or repeated sentence stem. This is why both the 2,391 domain cards and 442 reading cards using the same template appear together.

## Rendering and review behavior

- `src/app/[exam]/flashcards/page.tsx:291-301` maps every filtered item to one `CardRow`, keyed by its unique ID. There is no pagination, grouping, sampling, or deduplication.
- `src/app/[exam]/flashcards/page.tsx:339-344` prints `item.prompt` directly, so the repeated source sentence is visible verbatim.
- `src/store/flashcard.ts:29-35` also preserves every due card; it only filters on due state and sorts by review time. Thus review mode does not deduplicate the repeated templates either.

## Screenshot-to-data match

- `public/data/flashcards.json:25483-25568` is the exact run visible in the screenshot: `abscond`, `abstruse`, `accolade`, `acquiesce`, `acrimonious`, `admonish`, `ameliorate`, `anathema`, `approbation`, `arduous`, and `assuage`. Every record has a distinct ID and option set, while lines 25487, 25495, 25503, 25511, 25519, 25527, 25535, 25543, 25551, 25559, and 25567 repeat the same stem.
- The answers on `public/data/flashcards.json:25488-25568` use generic fallback examples (`This is an example of ... in academic context.`), which is additional evidence that this block was mass-generated from vocabulary entries rather than authored as distinct contextual questions.
- Another consecutive generated block at `public/data/flashcards.json:35883-35928` applies the same stem to unrelated words such as `teachers`, `theorem`, `throughput`, `title`, `together`, and `tolerance`, showing the repetition is systemic in the bundled data.

## Diagnosis

There are no exact duplicate IM-English records by either ID or full prompt. The apparent duplicates are thousands of distinct generated cards reusing one fallback cloze template. The UI has no defense against low-diversity templates and displays the source order unchanged, so alphabetically adjacent generated vocabulary produces long uninterrupted runs like the screenshot.
