# IM-IT Batch C cross-review

> Resolution: the must-fix findings below were addressed in the revised fragments. The current merge decision and remaining limitations are recorded in `im-it-full-batch-c-review.md`; this file is retained as the audit trail that drove those changes.

## Verdict

**Structurally complete, but not ready to merge.** The fragment passes its current validator, and the lesson/card shapes are strong. However, the validator checks ID closure and eligibility rather than whether each paper/source actually supports the attached claim. Manual cross-review found source-support gaps, several card-level evidence overclaims, and one important blockchain simplification that must be corrected before merge.

## Audit method

The review script-enumerated all fields from:

- 5 lessons, including every objective, section, example, pitfall and complete scenario;
- all 37 lesson `pastPaperRefs`, joined to canonical `primarySubtopicId`, metadata eligibility, answer-review eligibility and taxonomy rationale;
- all 28 cards, including card/lesson/subtopic closure, text, paper refs and source refs;
- direct eligible question counts for all 14 covered subtopics;
- the canonical `scope`, `usage` and `status` of every referenced source.

The supplied validator also passes:

```text
Validated IM-IT Batch C: 5 lessons, 14 subtopics, 28 cards, eligible refs only, reviewed sourceRefs closed.
```

That result is valid but insufficient: it proves structural closure, not semantic evidence support.

## Must-fix

### 1. Blockchain sources do not support the lesson's technical depth

`lesson-im-it-security-blockchain-01` cites `src-brookshear-13e` and `src-mit-network-computer-security`. Their canonical registry scopes are respectively general architecture/OS/network/database/AI and information-security/cryptography/network-security; neither has blockchain, distributed-ledger or consensus scope. The lesson's own `evidenceNote` explicitly admits that no specialist source exists.

The paper refs support the exam-level claims “mining validates transactions” and “blockchain provides verifiable records without a central authority.” They do not independently support the expanded treatment of hash linkage, digital signatures, proof of work, consensus trust assumptions, forks, or miner incentives.

Required fix: add and review a blockchain primary/specialist source before retaining that expansion, or narrow the lesson/cards to only the claims established by reviewed material and the four eligible questions.

### 2. Mining is described too broadly as transaction validation

The lesson repeatedly makes `validate transactions` the main protocol-level definition of mining. That matches the simplified multiple-choice answer, but conflates roles in Bitcoin-like systems: validating nodes check transactions and blocks; miners additionally select candidate transactions, construct candidate blocks and perform proof of work to propose/order blocks. “多數參與者依規則同意下一頁” can also be read as one-participant-one-vote, whereas Bitcoin fork choice is based on accumulated proof of work.

Required fix: retain the exam cue, but explicitly label it as the exam-level simplification and distinguish miner block production/proof of work from validation performed by nodes. Adjust the scenario or boundary so consensus is not described as a head-count majority.

### 3. Security governance/privacy claims lack supporting sources

`lesson-im-it-security-risk-access-governance-01` makes substantive claims about ISO/IEC 27001 requirements, ISMS operation, GDPR/privacy principles, purpose limitation, retention, data-subject rights and audit. Its sources are a general CS overview and MIT network/computer security course. Neither canonical source scope covers ISO 27001, GDPR, privacy law or ISMS governance.

The exam refs identify ISO 27001 and GDPR, but do not support all expanded legal/governance details. In particular, `card-im-it-security-governance-privacy-02` cites only `q-pp-im-it-108-9`, whose question merely asks which option is the EU privacy regulation; it does not establish the card's list of privacy principles.

Required fix: add reviewed authoritative ISO/privacy sources, or narrow the prose and card to the exam-supported identification claims. Do not present the current source refs as evidence for the expanded governance content.

### 4. RAG and AI-governance content is not source-supported

`lesson-im-it-ai-neural-transformer-generative-governance-01` cites a general CS overview and NTU Machine Learning 2021. The registry scopes cover AI, ML and model evaluation, but do not establish that either source supports RAG, LLM-specific architecture, hallucination governance, privacy/accountability controls or the worked example's source-freshness governance.

The eligible questions directly support the expansion of GPT, the function of self-attention and the exam definition of RAG. They do not replace a reviewed technical/governance source for the broader explanatory claims.

Required fix: add reviewed sources specifically covering Transformer/LLM/RAG and AI governance, or narrow the lesson to the exact eligible-question claims plus source-supported neural-network fundamentals. The zero-direct disclosure for ethics is necessary but does not solve source closure.

### 5. Five cards overstate what their paper refs directly support

| Card | Attached ref | Actual question support | Required action |
|---|---|---|---|
| `card-im-it-network-performance-reliability-01` | `q-pp-im-it-106-9` | Defines streaming; does not test bandwidth, latency or jitter. | Remove the paper ref or rewrite the card to streaming. |
| `card-im-it-security-governance-privacy-02` | `q-pp-im-it-108-9` | Identifies GDPR; does not establish purpose limitation, minimization, retention or data-subject rights. | Narrow/rewrite or remove the ref after adding an authoritative source. |
| `card-im-it-security-malware-social-02` | `q-pp-im-it-108-18` | Defines social engineering; says nothing about ransomware, patching, segmentation, offline backup or recovery. | Remove the ref or replace the card with a second social-engineering card supported by the question. |
| `card-im-it-ai-neural-networks-02` | `q-pp-im-it-106-7` | Identifies deep learning as an AlphaGo technique; does not test backpropagation or optimizer roles. | Remove the paper ref or rewrite the card to AlphaGo/deep learning. |
| `card-im-it-ai-transformers-attention-02` | `q-pp-im-it-115-27` | Tests self-attention's function; does not establish positional information, feed-forward layers, residual connections or normalization. | Remove the paper ref or rewrite the card around self-attention. |

These are semantic evidence errors even though all five refs are eligible and belong to a covered lesson.

## Should-fix

### 1. Split or reduce the five-subtopic AI lesson

The AI lesson combines neural-network training, CNN/RNN, Transformer internals, GPT/RAG and governance in 44 minutes and four sections. The progression is understandable, but governance is compressed into part of the final section and one worked example. It is the only noticeably overloaded grouping in Batch C.

Preferred fix: separate architecture/generation from governance, or reduce architecture detail and add a dedicated governance section with reviewed evidence.

### 2. Strengthen the card-evidence validator

The validator currently accepts any eligible card ref that appears anywhere in the parent lesson. It should default to:

```text
metadata.primarySubtopicId === card.subtopicId
```

and additionally require a claim-level manual justification for composite cards. Primary-subtopic equality alone still would not catch the streaming/metrics, ransomware/social-engineering, or AlphaGo/backprop mismatches, so the review artifact should include an explicit semantic evidence map.

`card-im-it-security-application-attacks-02` intentionally combines an HTTPS ref whose primary subtopic is network defense with a SQL-injection ref whose primary subtopic is application attacks. The synthesis is defensible, but should be explicitly marked as composite evidence instead of silently relying on parent-lesson membership.

### 3. Strengthen source-scope validation

The validator only checks `source.status === reviewed`. Add a review-time mapping from each section/card claim to a source whose canonical `scope` and `usage` actually cover it. A reviewed source with an unrelated scope is closed syntactically but not evidentially.

### 4. Clarify the network evidence boundary

The cloud/performance grouping is coherent and its direct refs are correctly classified. However, `q-pp-im-it-106-10` supports only the digital-divide bullet, while the lesson's main performance teaching covers latency, jitter and availability without a direct question. This is acceptable source-based teaching, but an evidence note or section-level mapping would prevent readers from inferring that every performance concept is directly tested.

## Passed checks

- All 37 lesson paper refs exist and are both metadata and answer-review auto-grade eligible.
- Every lesson ref's canonical `primarySubtopicId` is included in that lesson's grouped subtopics.
- Exactly 14 assigned subtopics are covered once across 5 lessons.
- All 28 cards link to a valid parent lesson; every subtopic has exactly 2 cards.
- `im-it-ai-cnn-rnn-sequence` and `im-it-ai-ethics-governance` correctly disclose zero direct primary refs, and all four corresponding cards keep `pastPaperRefs: []`.
- No other covered subtopic has zero eligible direct refs.
- All lesson scenarios have 5 mappings, 4 exam cues, prediction and boundary text.
- The network/cloud lesson is a coherent deployment-versus-quality grouping; its scenario and boundary correctly separate cloud, edge, VPN, streaming and QoS.
- The security risk/access/governance scenario correctly distinguishes identification, authentication, authorization and accountability; its boundary correctly prevents “logged in means fully authorized.”
- The attack/defense lesson is coherently grouped by attack surface, and its HTTPS/firewall boundaries correctly state that transport and perimeter controls do not repair endpoint/application flaws.
- CNN/RNN/Transformer mappings are technically reasonable and the boundary correctly rejects “attention weights equal explanation” and “RAG guarantees correctness.”
- The blockchain boundary correctly states that tamper-evident is not physically immutable and that not every blockchain uses mining; it only needs the mining/consensus precision correction listed above.

## Merge recommendation

Block merge until the five must-fix areas are resolved. After source support and semantic card refs are corrected, rerun both the structural validator and a claim-to-evidence review; structural eligibility alone is not sufficient for publication.
