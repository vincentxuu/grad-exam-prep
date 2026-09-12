# IM-IT 61/61 Batch C review

## Merge status

Batch C is ready to merge as a fragment. It contains 6 lessons, covers the assigned 14 canonical subtopics exactly once, retains 28 cards (2 per subtopic), and adds 5 reviewed source entries. No canonical public artifact is modified by the batch files.

## Lesson grouping

1. Cloud/distributed services plus network performance and reliability.
2. Security principles/risk plus authentication/access and governance/privacy.
3. Network defense plus application attacks and malware/social engineering.
4. Blockchain as a standalone lesson.
5. Neural networks plus CNN/RNN sequence models and Transformer attention.
6. Generative LLM plus AI ethics/governance.

The previous five-subtopic AI lesson was split. Architecture now has a focused 36-minute lesson; GenAI/governance has a separate 30-minute lesson with its own scenario, four sections, two examples and governance boundary.

## Reviewed source fragment

`.work/im-it-full-batch-c-sources.json` adds:

- `src-nist-ir-8202-blockchain`: blockchain, distributed ledger, consensus, proof of work and hash linkage.
- `src-nist-ai-rmf-1`: AI risk management, trustworthiness and accountability.
- `src-stanford-cs224n`: neural NLP, sequence models, Transformers and LLMs.
- `src-nist-privacy-framework`: organizational privacy-risk management and governance.
- `src-nist-ai-600-1-genai-profile`: generative-AI risks including confabulation, privacy and accountability.

Official landing pages were verified with `stealth_fetch`. The source entries remain a fragment until canonical merge; every lesson/card source ref resolves against either the canonical reviewed registry or this reviewed fragment.

## Corrected evidence boundaries

- Blockchain now distinguishes the exam simplification (`mining` → validate transactions) from protocol roles: validating nodes check transactions/blocks, while miners select transactions, construct candidate blocks and perform proof of work. The scenario no longer implies one-person-one-vote consensus.
- Security governance uses NIST Privacy Framework for privacy-risk claims. GDPR is retained only as the direct exam-level identification claim; the lesson does not infer a complete GDPR legal summary.
- RAG is retained only at the direct question's level: retrieve from an external authoritative knowledge base before generation and place results in context. The lesson explicitly states that this does not change model parameters or guarantee correctness.
- AI governance is source-based foundational coverage using NIST AI RMF and the GenAI Profile; it is not presented as past-paper frequency.
- The five semantically unsupported paper refs identified in cross-review were removed from the bandwidth/latency/jitter, privacy-risk, ransomware controls, backprop/optimizer and full-Transformer-components cards. Those cards are source-based and now have empty `pastPaperRefs`.
- Card validation requires `metadata.primarySubtopicId === card.subtopicId` without exceptions. The HTTPS/SQL-injection comparison keeps only the direct SQL-injection ref; HTTPS remains a source-backed contrast rather than claimed direct card evidence.

## Zero-direct disclosures

- `im-it-ai-cnn-rnn-sequence`: zero direct primary refs; two cards have empty paper refs.
- `im-it-ai-ethics-governance`: zero direct primary refs; two cards have empty paper refs.

Both lessons carry explicit `evidenceNote` text and do not claim those subtopics are high-frequency.

## Validation

Run:

```sh
node .work/build-im-it-full-batch-c.mjs
node .work/validate-im-it-full-batch-c.mjs
```

Result:

```text
Validated IM-IT Batch C: 6 lessons, 14 subtopics, 28 cards, 5 reviewed source additions, eligible and direct card refs only.
```

The validator checks lesson/card/source ID uniqueness and canonical collisions, exact 14-subtopic coverage, the two AI lesson groupings, scenario/section/example/pitfall completeness, question eligibility, lesson taxonomy, card primary-subtopic evidence, explicit composite evidence, zero-ref cards, five forbidden semantic ref regressions, and reviewed source closure across canonical plus fragment registries.

## Remaining limitations

- CNN/RNN and AI ethics/governance still have no direct primary past-paper refs; they remain clearly marked foundational content.
- Security application attacks and malware/social engineering each have only one directly eligible question. Additional cards may be source-based but must not borrow unrelated paper refs.
- RAG has one directly eligible question. The current lesson intentionally avoids deeper retrieval architecture, embedding, ranking or evaluation claims.
- NIST Privacy Framework supports privacy-risk governance, not a full interpretation of GDPR or ISO/IEC 27001. Those standards remain limited to what the eligible questions directly establish unless dedicated reviewed standards sources are added later.
