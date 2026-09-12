# pp-im-en-106 data audit

Date: 2026-08-16

Scope: `public/data/questions.json`, `public/data/answers.json`,
`public/data/past-papers.json`, and the bundled source scan
`public/papers/pp-im-en-106.pdf`. No data or implementation was edited.

## Executive finding

The warning shown in the UI is stale. Questions 21-50 no longer consist only
of one-line placeholders in `questions.json`: all five source passages are
present on the first question of each group. However, those recovered passages
still contain duplicated text, omitted sentences, and OCR artifacts. More
importantly, four reading-comprehension answers are demonstrably wrong because
their explanations were generated before the passages were restored:

| Question | Stored | Supported by source | Finding |
| --- | --- | --- | --- |
| 41 | D | **B** | The passage explicitly repeats "That's why I hate New Year's"; B is also the near-verbatim title. |
| 46 | A | **C** | The opening says visiting Stockholm was "beyond expectation" and "beyond conception": the author begins by expressing surprise, not gratitude. |
| 47 | D | **A** | "den-life", "doze of hibernation", "in suspension", and "torpid" support dormant; the passage explicitly denies terror/chaos. |
| 49 | D | **B** | The childhood setting is "in the nineteen forties" and describes bombers, bombed cities, war fronts, the enemy and allies: World War II. |

Question 50 = D is supported. The passage says the war news did not enter the
author as terror and emphasizes the security he inhabited, so the statement
about childhood being overshadowed by fear is false.

## PDF page evidence and transcription defects

PDF page numbers below are the printed/source page numbers (the file has five
pages and the same page ordering).

### Questions 21-26 - PDF page 2

The source includes the sentence:

> As early as the American Revolution, it was noted that troops played "base ball" in their free time.

That sentence is missing from Q21's restored passage. Conversely, the database
duplicates `three outs per __23__, a nine man team.` immediately after the
same fragment. Options and stored answers 21=C, 22=B, 23=A, 24=B, 25=D, 26=A
are supported by the passage.

### Questions 27-32 - PDF page 2

Q27's restored passage duplicates two spans that appear only once in the PDF:

- `the rapid growth of cities, __29__ then by reactions of horror to World War I.`
- `were becoming ill-fitted to their tasks and __31__ in the new economic, social, and political environment of an emerging, fully industrialized world.`

Options and stored answers 27=D, 28=B, 29=A, 30=C, 31=A, 32=D are supported.

### Questions 33-40 - PDF pages 2-3

Q33's restored passage omits several complete source sentences or clauses:

- `Vader and his stormtroopers killed all aboard with the exception of the Princess,`
- `Vader and Obi-Wan clashed one last time, with the Sith Lord striking down his former Master.`
- `Luke, Leia, and the heroes were able to escape, but only because the Empire allowed it:`
- `As the Death Star closed in, the Rebels mounted an attack, with Vader himself entering the fray in his TIE Advanced starfighter.`
- `Ricocheted away from the Death Star and spun out of control, Vader was unable to stop Luke.`

The database also duplicates the clause beginning `Vader led an attack on a
__34__ Rebel vessel`. Despite the damaged context, options and stored answers
33=B, 34=C, 35=A, 36=D, 37=A, 38=A, 39=C, 40=B are locally supported.

### Questions 41-45 - PDF pages 3-4

Q41 contains a visibly corrupted OCR line:

` n    t       l      s   nn  t    n`

The source on page 3 reads:

> day I want to renew myself. No day set aside for rest. I choose my pauses myself, when I feel drunk with the intensity of life and I

The database also ends `That is nauseating:` where the PDF has a period.
Stored answers 42=A, 43=C, 44=D, 45=C are supported. Stored Q41=D is wrong;
the source supports B.

### Questions 46-50 - PDF pages 4-5

Q46's passage includes four OCR boundary artifacts not present in the PDF:

- `lone bedroom wall` -> `one bedroom wall`
- `mpressionable` -> `impressionable`
- `land “the allies.` -> `and “the allies.”`
- `łtones` -> `tones`

Stored answers 48=C and 50=D are supported. Stored answers 46=A, 47=D, and
49=D conflict with the passage; the supported answers are 46=C, 47=A, 49=B.

## Questions 1-20

The question and option text matches PDF pages 1-2 closely, and answers 1-12
and 14-20 are supported. Q13 is a separate source-quality problem: the printed
question is itself malformed. Stored A treats bare `even` as if it were `even
though`, yielding the ungrammatical `came even he scarcely sold ...`. C
(`despite that`) is the likely intended choice, but the PDF contains no answer
key, so the official intended answer cannot be established from the bundled
source alone. At minimum the stored A explanation is linguistically invalid
and should not be presented as certain.

## Stale metadata and secondary copies

- `past-papers.json` still marks `pp-im-en-106` as `contentStatus: incomplete`
  and says passages 21-50 have not been extracted. This is the direct cause of
  the warning in the screenshot, but it no longer describes current
  `questions.json`.
- `public/data/qfiles/q-pp-im-en-106-{21,27,33,41,46}.json` and the other group
  files remain stale one-line copies with `[Passage ...]` markers; they do not
  match `questions.json`. Runtime imports `questions.json`, but any regeneration
  workflow consuming qfiles can resurrect the old incomplete form.
- `scripts/flag-paper-content-status.js` hard-codes the obsolete warning and
  will restore it whenever run.
- `scripts/fix-en-106-passages.js` produced the concatenation approach that
  caused duplicated fragments; its own comments say the reading passages still
  need manual restoration, which is no longer current.

## Recommended repair boundary

1. Replace the five group-header passages (Q21, Q27, Q33, Q41, Q46) with clean,
   page-faithful transcriptions and synchronize their qfiles.
2. Correct answers/explanations for Q41, Q46, Q47, Q49; review Q13 separately
   as a malformed-source question.
3. Remove `contentStatus`/`contentIssue` for this paper only after the repaired
   passage text and answers are validated, then update the two maintenance
   scripts so rerunning them cannot reintroduce stale data.

## Evidence artifacts

Rendered page images and OCR text used for this audit are under
`tmp/pdfs/im-en-106/` (`page-1.png` through `page-5.png` and corresponding
`.txt` files). These are working artifacts, not product data.
