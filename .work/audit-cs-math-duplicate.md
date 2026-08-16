# pp-cs-math-111 vs pp-cs-math-112 audit

## Conclusion

The reported cross-paper duplicate is a **false positive**, not evidence that either PDF contains the other year's question. The collision is between question 2 in each paper:

- `q-pp-cs-math-111-2`: recurrence is `a_n = a_{n-1} + 6a_{n-2}`.
- `q-pp-cs-math-112-2`: recurrence is `a_n = -a_{n-1} + 6a_{n-2}`.

The bundled PDFs confirm that these are distinct questions. The answer choices happen to use nearly the same template. `scripts/check-paper-integrity.js` removes every non-letter character (including the decisive minus sign, coefficients, exponents, and denominators) and compares only the first 100 remaining letters. Consequently both canonical question texts produce the same fingerprint.

Fixing the question transcription alone will **not** remove this baseline warning. The duplicate fingerprint should preserve mathematically meaningful characters (at minimum digits and `+`, `-`, `=`, `^`) or otherwise use a math-aware normalization before this baseline entry is removed.

## PDF evidence

- `public/papers/pp-cs-math-111.pdf`, PDF page 1, official paper header year 111 / paper code 362, question 2: the stem visibly reads `a_n = a_{n-1} + 6a_{n-2}`. Its five options all have denominator `1/5`.
- `public/papers/pp-cs-math-112.pdf`, PDF page 1, official paper header year 112 / paper code 348, question 2: the stem visibly reads `a_n = -a_{n-1} + 6a_{n-2}`. Its five options all have denominator `1/5`.

Thus the leading negative sign distinguishes the two recurrence relations in the source PDFs.

## Records

### `q-pp-cs-math-111-2` — already matches PDF; no record edit

```json
{
  "id": "q-pp-cs-math-111-2",
  "paperId": "pp-cs-math-111",
  "examId": "cs",
  "subjectId": "cs-math",
  "year": 111,
  "number": 2,
  "text": "(10%) Which solves a_n = a_{n-1} + 6a_{n-2} for a_n in terms of a_0 = A and a_1 = B:\n(A) 1/5[(-3)^n(2A - B) + 2^n(3A + B)]\n(B) 1/5[(-3)^n(2A - B) + 2^n(3A - B)]\n(C) 1/5[(-2)^n(3A - B) + 3^n(2A + B)]\n(D) 1/5[(-2)^n(3A + B) + 3^n(2A + B)]\n(E) 1/5[(-2)^n(3A - B) + 3^n(2A - B)]",
  "points": 10,
  "hasImage": false,
  "subQuestions": []
}
```

Source evidence: `public/papers/pp-cs-math-111.pdf`, PDF page 1, question 2.

### `q-pp-cs-math-112-2` — transcription is wrong; use this corrected record

```json
{
  "id": "q-pp-cs-math-112-2",
  "paperId": "pp-cs-math-112",
  "examId": "cs",
  "subjectId": "cs-math",
  "year": 112,
  "number": 2,
  "text": "(10%) Which solves a_n = -a_{n-1} + 6a_{n-2} for a_n in terms of a_0 = A and a_1 = B:\n(A) 1/5[(-3)^n(2A - B) + 2^n(3A + B)]\n(B) 1/5[(-3)^n(2A - B) + 2^n(3A - B)]\n(C) 1/5[(-2)^n(3A - B) + 3^n(2A + B)]\n(D) 1/5[(-2)^n(3A + B) + 3^n(2A + B)]\n(E) 1/5[(-2)^n(3A - B) + 3^n(2A - B)]",
  "points": 10,
  "hasImage": false,
  "subQuestions": []
}
```

Source evidence: `public/papers/pp-cs-math-112.pdf`, PDF page 1, question 2.

The current 112 record has these PDF transcription errors:

- every `1/5` was stored as `1/4`;
- option B's final term was stored as `2^n(3A + B)` instead of `2^n(3A - B)`;
- option C was stored as `(-2)^n(3A + B) + 2^n(3A - B)` instead of `(-2)^n(3A - B) + 3^n(2A + B)`;
- option E's first coefficient was stored as `(3A + B)` instead of `(3A - B)`.

The same incorrect 112 text exists in both `public/data/questions.json` and `public/data/qfiles/q-pp-cs-math-112-2.json`; both should be kept in sync when applying the repair. `public/data/answers.json` already identifies answer A and its derivation uses denominator 5, so its answer does not need to change.
