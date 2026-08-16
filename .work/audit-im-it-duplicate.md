# `pp-im-it-108` ↔ `pp-im-it-109` duplicate audit

## Finding

This is a **false positive in `scripts/check-paper-integrity.js`**, not a question-data mix-up. No record in `public/data/questions.json` should be replaced.

The detector removes nonletters, lowercases, and compares only the first 100 characters. These two legitimate heap questions share a 229-letter normalized introduction, so they receive the same fingerprint:

```text
heapisacompletebinarytreethatprovidesanefficientimplementationofpriorityqueuessupposeweuseaheaptoman
```

They diverge after the shared heap/class introduction:

- 108 asks the candidate to implement heap `delete()` and `insert()`.
- 109 asks the candidate to implement `boostPriority()`.

## PDF evidence

- `public/papers/pp-im-it-108.pdf`, PDF page 3 (printed page 3): header says 108 academic year, subject 資訊科技概論. The non-choice section's printed Q1 is the heap `delete()` / `insert()` problem; it maps to database question 21 because the preceding section has 20 multiple-choice questions. The same page then contains the distinct double-hashing problem.
- `public/papers/pp-im-it-109.pdf`, PDF page 3 (printed page 3): header says 109 academic year, subject 資訊科技概論. Printed Q22 is the heap `boostPriority()` problem. Printed Q21 immediately above it is the separate ADT LIST problem.

The bundled scans therefore independently confirm that both database records belong to their stated papers.

## Authoritative records (no correction required)

### `q-pp-im-it-108-21` — database no. 21 / PDF section-II no. 1

```json
{
  "id": "q-pp-im-it-108-21",
  "paperId": "pp-im-it-108",
  "examId": "im",
  "subjectId": "im-it",
  "year": 108,
  "number": 21,
  "text": "HEAP is a complete binary tree that provides an efficient implementation of priority queues. Suppose we use a heap to manage a list of positive integers that large values mean high priority. The following C++ code fragment shows the class definition of the heap.\n\nclass HEAP\n{\npublic:\n    int delete();\n    // return and delete the integer in the root of the heap\n    // return -1 if there is nothing to delete\n    bool insert(int newValue);\n    // insert newValue into the heap\n    // return false if the insertion is not successful\nprivate:\n    int itemCount;  // number of heap items\n    int items[100]; // array of heap items\n};\n\n(a) (15 points) Write the member function delete() that removes the integer in the root of the heap.\n(b) (15 points) Write the member function insert() that inserts a new integer into the heap.",
  "points": 30,
  "hasImage": false,
  "subQuestions": ["a", "b"]
}
```

Source: `public/papers/pp-im-it-108.pdf`, PDF page 3.

### `q-pp-im-it-109-22` — database/PDF no. 22

```json
{
  "id": "q-pp-im-it-109-22",
  "paperId": "pp-im-it-109",
  "examId": "im",
  "subjectId": "im-it",
  "year": 109,
  "number": 22,
  "text": "HEAP is a complete binary tree that provides an efficient implementation of priority queues. Suppose we use a heap to manage a list of positive integers that large values mean high priority. The following C++ code fragment shows the class definition of the heap.\n\nclass HEAP\n{\npublic:\n    ...\n    // boost items[i]'s priority\n    void boostPriority(int i, int newPriorityValue)\nprivate:\n    ...\n    int itemCount;   // number of heap items\n    int items[100];  // array of heap items\n};",
  "points": 20,
  "hasImage": false,
  "subQuestions": [
    {
      "label": "(a)",
      "text": "(20 points) Complete the following C++ function that boosts the priority value of element HEAP::items[i].\n\n// assume 0 <= i < itemCount,\n// and newPriorityValue > items[i]\nvoid Heap::boostPriority(int i, int newPriorityValue)\n{\n\n}",
      "points": 20
    }
  ]
}
```

Source: `public/papers/pp-im-it-109.pdf`, PDF page 3.

## Recommended repair scope

Do not alter either question. Repair the integrity detector so a shared generic prefix is not treated as full-content equality. Comparing the complete normalized text rather than `.slice(0, 100)` was checked against the current dataset: it removes this IM false positive while still detecting the exact `pp-cs-math-111` / `pp-cs-math-112` duplicate (`q-pp-cs-math-111-2` / `q-pp-cs-math-112-2`). Then remove this known IM finding from the baseline only after the revised check no longer emits it.
