# Question Bank Learning System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AI-generated answers, drill mode, mock exam, and wrong-answer review to the existing question bank.

**Architecture:** Static `answers.json` holds AI-generated answer+explanation for all 1,424 questions (generated once via Workflow). Cloudflare D1 stores per-user practice records keyed by an anonymous UUID in a cookie. Three new UI modes (drill, mock exam, review) build on top of this data.

**Tech Stack:** Next.js (OpenNext/Cloudflare Workers), Cloudflare D1, TypeScript, Tailwind CSS, shadcn/ui components already in project.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `migrations/0002_practice_tables.sql` | D1 schema for answers + practice records |
| Create | `public/data/answers.json` | AI-generated answer + explanation per question ID |
| Create | `src/types/practice.ts` | Answer, PracticeRecord, PracticeMode types |
| Create | `src/lib/answers.ts` | Load answers.json, lookup by question ID |
| Create | `src/lib/user-id.ts` | Read/write anonymous UUID from cookie |
| Create | `src/app/api/practice/route.ts` | POST: save one practice record to D1 |
| Create | `src/app/api/practice/review/route.ts` | GET: fetch wrong-answer question IDs for user |
| Create | `src/app/api/practice/stats/route.ts` | GET: per-subject correct rate for user |
| Create | `scripts/generate-answers.js` | Workflow script — generates answers.json |
| Create | `src/app/[exam]/questions/[questionId]/page.tsx` | Single-question drill view |
| Create | `src/app/[exam]/mock/page.tsx` | Mock exam (timed, full paper) |
| Create | `src/app/[exam]/review/page.tsx` | Wrong-answer review mode |
| Modify | `src/app/[exam]/questions/page.tsx` | Add "練習" link on each question card |
| Modify | `src/components/layout/header.tsx` | Add 模擬考 + 錯題本 nav links |

---

## Task 1: D1 Migration

**Files:**
- Create: `migrations/0002_practice_tables.sql`

- [ ] **Step 1: Write migration file**

```sql
-- migrations/0002_practice_tables.sql
CREATE TABLE IF NOT EXISTS question_answers (
  question_id  TEXT PRIMARY KEY,
  answer       TEXT NOT NULL,
  explanation  TEXT NOT NULL,
  generated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS practice_records (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      TEXT NOT NULL,
  question_id  TEXT NOT NULL,
  mode         TEXT NOT NULL,
  result       TEXT NOT NULL,
  answered_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_practice_user ON practice_records(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_question ON practice_records(question_id);
```

- [ ] **Step 2: Apply migration locally**

```bash
npx wrangler d1 migrations apply grad-exam-prep-db --local
```

Expected: `✅ Applied 1 migration`

- [ ] **Step 3: Apply migration to production**

```bash
npx wrangler d1 migrations apply grad-exam-prep-db --remote
```

Expected: `✅ Applied 1 migration`

- [ ] **Step 4: Commit**

```bash
git add migrations/0002_practice_tables.sql
git commit -m "feat(db): add question_answers and practice_records tables"
```

---

## Task 2: Types

**Files:**
- Create: `src/types/practice.ts`

- [ ] **Step 1: Create types file**

```typescript
// src/types/practice.ts
export type PracticeMode = 'drill' | 'mock' | 'review'
export type PracticeResult = 'correct' | 'wrong' | 'skipped'

export interface Answer {
  questionId: string
  answer: string       // "A" | "B" | "C" | "D" | "E"
  explanation: string
  generatedAt: number
}

export interface AnswersData {
  answers: Record<string, Answer>
}

export interface PracticeRecord {
  id: number
  userId: string
  questionId: string
  mode: PracticeMode
  result: PracticeResult
  answeredAt: number
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/types/practice.ts
git commit -m "feat(types): add Answer and PracticeRecord types"
```

---

## Task 3: Placeholder answers.json

**Files:**
- Create: `public/data/answers.json`

- [ ] **Step 1: Create empty answers file**

```json
{
  "answers": {}
}
```

Save to `public/data/answers.json`.

- [ ] **Step 2: Commit**

```bash
git add public/data/answers.json
git commit -m "chore: add empty answers.json placeholder"
```

---

## Task 4: answers.ts and user-id.ts helpers

**Files:**
- Create: `src/lib/answers.ts`
- Create: `src/lib/user-id.ts`

- [ ] **Step 1: Write answers.ts**

```typescript
// src/lib/answers.ts
import type { Answer, AnswersData } from '@/types/practice'
import answersRaw from '../../public/data/answers.json'

const data = answersRaw as AnswersData

export function getAnswer(questionId: string): Answer | undefined {
  return data.answers[questionId]
}

export function hasAnswer(questionId: string): boolean {
  return questionId in data.answers
}
```

- [ ] **Step 2: Write user-id.ts**

```typescript
// src/lib/user-id.ts
'use client'

const COOKIE_KEY = 'gep_uid'
const TTL_DAYS = 365

function generateId(): string {
  return 'u-' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function getUserId(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]+)`))
  if (match) return match[1]
  const id = generateId()
  const expires = new Date(Date.now() + TTL_DAYS * 86400 * 1000).toUTCString()
  document.cookie = `${COOKIE_KEY}=${id}; expires=${expires}; path=/; SameSite=Lax`
  return id
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/answers.ts src/lib/user-id.ts
git commit -m "feat(lib): add answers loader and anonymous user-id helper"
```

---

## Task 5: API Routes

**Files:**
- Create: `src/app/api/practice/route.ts`
- Create: `src/app/api/practice/review/route.ts`
- Create: `src/app/api/practice/stats/route.ts`

- [ ] **Step 1: Write POST /api/practice**

```typescript
// src/app/api/practice/route.ts
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'

interface PracticeBody {
  userId: string
  questionId: string
  mode: 'drill' | 'mock' | 'review'
  result: 'correct' | 'wrong' | 'skipped'
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PracticeBody
    const { userId, questionId, mode, result } = body
    if (!userId || !questionId || !mode || !result) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    const { env } = await getCloudflareContext({ async: true })
    const db = (env as unknown as { DB: D1Database }).DB
    const now = Date.now()

    await db
      .prepare(
        'INSERT INTO practice_records (user_id, question_id, mode, result, answered_at) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(userId, questionId, mode, result, now)
      .run()

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Write GET /api/practice/review**

```typescript
// src/app/api/practice/review/route.ts
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    const { env } = await getCloudflareContext({ async: true })
    const db = (env as unknown as { DB: D1Database }).DB

    // Latest result per question: wrong if last attempt was wrong, skip if correct
    const rows = await db
      .prepare(`
        SELECT question_id
        FROM practice_records pr1
        WHERE user_id = ?
          AND result = 'wrong'
          AND NOT EXISTS (
            SELECT 1 FROM practice_records pr2
            WHERE pr2.user_id = pr1.user_id
              AND pr2.question_id = pr1.question_id
              AND pr2.result = 'correct'
              AND pr2.answered_at > pr1.answered_at
          )
        GROUP BY question_id
      `)
      .bind(userId)
      .all<{ question_id: string }>()

    const questionIds = (rows.results ?? []).map((r) => r.question_id)
    return NextResponse.json({ questionIds })
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Write GET /api/practice/stats**

```typescript
// src/app/api/practice/stats/route.ts
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    const { env } = await getCloudflareContext({ async: true })
    const db = (env as unknown as { DB: D1Database }).DB

    const rows = await db
      .prepare(`
        SELECT
          SUBSTR(question_id, 1, INSTR(question_id || '-', '-', 4) - 1) AS subject_prefix,
          result,
          COUNT(*) AS cnt
        FROM practice_records
        WHERE user_id = ?
        GROUP BY subject_prefix, result
      `)
      .bind(userId)
      .all<{ subject_prefix: string; result: string; cnt: number }>()

    return NextResponse.json({ stats: rows.results ?? [] })
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/app/api/practice/
git commit -m "feat(api): add practice record POST and review/stats GET routes"
```

---

## Task 6: Answer Generation Workflow

**Files:**
- Create: `scripts/generate-answers.js`

This workflow generates `public/data/answers.json` using Sonnet 4.6 subagents. Run it once via the Claude Code `Workflow` tool with `{scriptPath: "scripts/generate-answers.js"}`.

- [ ] **Step 1: Write workflow script**

```javascript
// scripts/generate-answers.js
export const meta = {
  name: 'generate-question-answers',
  description: 'Generate AI answers and explanations for all exam questions',
  phases: [
    { title: 'Generate', detail: 'Parallel answer generation per question' },
    { title: 'Save', detail: 'Write answers.json to disk' },
  ],
}

import questionsRaw from '../public/data/questions.json' assert { type: 'json' }

const ANSWER_SCHEMA = {
  type: 'object',
  required: ['answer', 'explanation'],
  properties: {
    answer: { type: 'string', description: 'Correct option letter: A, B, C, D, or E' },
    explanation: { type: 'string', description: 'Clear explanation in Traditional Chinese, 3-5 sentences' },
  },
}

const questions = questionsRaw.questions

phase('Generate')
log(`Generating answers for ${questions.length} questions...`)

const results = await pipeline(
  questions,
  async (q) => {
    const result = await agent(
      `你是台灣研究所考試（資工所/資管所）解題專家。請分析以下考題，判斷正確答案並用繁體中文解釋原因。

題目ID: ${q.id}
科目: ${q.subjectId}
年份: ${q.year}年

題目內容:
${q.text}

請回傳正確選項（A/B/C/D/E）及清晰的中文解析（3-5句）。`,
      {
        label: `answer:${q.id}`,
        phase: 'Generate',
        schema: ANSWER_SCHEMA,
      }
    )
    return { questionId: q.id, ...result }
  }
)

phase('Save')
const answersMap = {}
let successCount = 0
let failCount = 0

for (const r of results) {
  if (!r) { failCount++; continue }
  answersMap[r.questionId] = {
    questionId: r.questionId,
    answer: r.answer,
    explanation: r.explanation,
    generatedAt: 0,
  }
  successCount++
}

log(`Generated: ${successCount} success, ${failCount} failed`)

return {
  answersJson: JSON.stringify({ answers: answersMap }, null, 2),
  successCount,
  failCount,
}
```

- [ ] **Step 2: Run the workflow via Claude Code Workflow tool**

In your Claude Code session, run:
```
Workflow({ scriptPath: "scripts/generate-answers.js" })
```

Wait for completion (~15-20 min). The workflow returns `{ answersJson, successCount, failCount }`.

- [ ] **Step 3: Save returned answersJson to disk**

Take the `answersJson` string from the workflow result and write it to `public/data/answers.json`.

- [ ] **Step 4: Push answers to D1**

```bash
# Generate SQL from answers.json
node -e "
const d = require('./public/data/answers.json');
const now = Date.now();
const rows = Object.values(d.answers);
const sql = rows.map(r =>
  \`INSERT OR REPLACE INTO question_answers (question_id, answer, explanation, generated_at) VALUES ('\${r.questionId.replace(/'/g,\"''\")}", '\${r.answer}', '\${r.explanation.replace(/'/g,\"''\")}", \${now});\`
).join('\n');
require('fs').writeFileSync('/tmp/answers_seed.sql', sql);
console.log('Written', rows.length, 'rows');
"

npx wrangler d1 execute grad-exam-prep-db --local --file=/tmp/answers_seed.sql
npx wrangler d1 execute grad-exam-prep-db --remote --file=/tmp/answers_seed.sql
```

- [ ] **Step 5: Commit**

```bash
git add public/data/answers.json scripts/generate-answers.js
git commit -m "feat(content): add AI-generated answers for all 1424 questions"
```

---

## Task 7: Single Question Drill View

**Files:**
- Create: `src/app/[exam]/questions/[questionId]/page.tsx`

- [ ] **Step 1: Create drill page**

```typescript
// src/app/[exam]/questions/[questionId]/page.tsx
'use client'

import { notFound, useRouter } from 'next/navigation'
import { use, useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getQuestionsByExam } from '@/lib/content'
import { getAnswer } from '@/lib/answers'
import { getUserId } from '@/lib/user-id'
import type { ExamId, Question } from '@/types/content'
import type { PracticeMode } from '@/types/practice'

const OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const

interface Props {
  params: Promise<{ exam: string; questionId: string }>
  searchParams: Promise<{ mode?: string; next?: string }>
}

export default function DrillPage({ params, searchParams }: Props) {
  const { exam, questionId } = use(params)
  const { mode = 'drill', next } = use(searchParams)
  const router = useRouter()

  const allQuestions = getQuestionsByExam(exam as ExamId)
  const question = allQuestions.find((q) => q.id === questionId)
  if (!question) notFound()

  const answerData = getAnswer(questionId)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function submitResult(result: 'correct' | 'wrong') {
    setSubmitting(true)
    const userId = getUserId()
    await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, questionId, mode: mode as PracticeMode, result }),
    })
    setSubmitting(false)
    if (next) {
      router.push(`/${exam}/questions/${next}?mode=${mode}`)
    } else {
      router.push(`/${exam}/questions`)
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">{question.year}年</Badge>
        <span className="text-xs text-muted-foreground">第 {question.number} 題</span>
        {question.points != null && (
          <Badge variant="secondary">{question.points} 分</Badge>
        )}
      </div>

      {/* Question */}
      <Card>
        <CardContent className="py-4 px-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{question.text}</p>
        </CardContent>
      </Card>

      {/* Option buttons */}
      {!revealed && (
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((opt) => (
            <Button
              key={opt}
              variant={selected === opt ? 'default' : 'outline'}
              className="w-12 h-12 text-base font-bold"
              onClick={() => setSelected(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
      )}

      {/* Confirm button */}
      {!revealed && (
        <Button
          disabled={!selected}
          onClick={() => setRevealed(true)}
          className="w-full"
        >
          確認答案
        </Button>
      )}

      {/* Reveal answer */}
      {revealed && answerData && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="py-4 px-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-700 dark:text-green-400">
                正確答案：{answerData.answer}
              </span>
              {selected && (
                <Badge variant={selected === answerData.answer ? 'default' : 'destructive'}>
                  你選了 {selected}
                </Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{answerData.explanation}</p>
          </CardContent>
        </Card>
      )}

      {revealed && !answerData && (
        <p className="text-sm text-muted-foreground text-center">此題尚無解析</p>
      )}

      {/* Know it / Don't know it */}
      {revealed && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
            disabled={submitting}
            onClick={() => submitResult('correct')}
          >
            ✓ 會了
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-400 text-red-600 hover:bg-red-50"
            disabled={submitting}
            onClick={() => submitResult('wrong')}
          >
            ✗ 不會
          </Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Start dev server and manually test**

```bash
npm run dev
```

Navigate to `http://localhost:3000/im/questions` — click any question card (after Step 8 adds the link). Verify: options appear, confirm reveals answer, 會了/不會 navigates back.

- [ ] **Step 4: Commit**

```bash
git add src/app/[exam]/questions/[questionId]/
git commit -m "feat(drill): add single-question drill view"
```

---

## Task 8: Add Drill Entry Points to Questions List

**Files:**
- Modify: `src/app/[exam]/questions/page.tsx`

- [ ] **Step 1: Update QuestionCard to link into drill**

In `src/app/[exam]/questions/page.tsx`, find the `QuestionCard` component and add a "練習" link. Also pass the `exam` param down.

Replace the entire `QuestionCard` function (line 154–217) with:

```typescript
function QuestionCard({
  question,
  exam,
  expanded,
  onToggle,
  nextId,
}: {
  question: Question
  exam: string
  expanded: boolean
  onToggle: () => void
  nextId?: string
}) {
  const preview = question.text.slice(0, 200)
  const needsTruncation = question.text.length > 200

  const drillHref = nextId
    ? `/${exam}/questions/${question.id}?mode=drill&next=${nextId}`
    : `/${exam}/questions/${question.id}?mode=drill`

  return (
    <Card>
      <CardContent className="py-3 px-4 space-y-2">
        {/* Header row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs shrink-0">
            {question.year}年
          </Badge>
          <span className="text-xs font-medium text-muted-foreground shrink-0">
            第 {question.number} 題
          </span>
          {question.points != null && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {question.points} 分
            </Badge>
          )}
          {question.hasImage && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 shrink-0">
              含圖
            </Badge>
          )}
          <a
            href={drillHref}
            className="ml-auto text-xs text-primary hover:underline shrink-0"
          >
            練習 →
          </a>
        </div>

        {/* Question text */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {expanded || !needsTruncation ? question.text : `${preview}…`}
        </div>

        {/* Sub-questions */}
        {expanded && question.subQuestions.length > 0 && (
          <ol className="list-none space-y-1 pl-2 border-l-2 border-muted">
            {question.subQuestions.map((sq, i) => (
              <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                {sq}
              </li>
            ))}
          </ol>
        )}

        {/* Expand toggle */}
        {needsTruncation && (
          <button
            onClick={onToggle}
            className="text-xs text-primary hover:underline"
          >
            {expanded ? '收起 ▲' : '展開全題 ▼'}
          </button>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Update QuestionCard call sites to pass exam and nextId**

In the `TabsContent` render block, update the `shown.map(...)` call:

```typescript
{shown.map((q, idx) => (
  <QuestionCard
    key={q.id}
    question={q}
    exam={exam}
    expanded={expandedIds.has(q.id)}
    onToggle={() => toggleExpand(q.id)}
    nextId={subjectQuestions[idx + 1]?.id}
  />
))}
```

Also add `import Link from 'next/link'` is NOT needed — we used a plain `<a>` tag.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/app/[exam]/questions/page.tsx
git commit -m "feat(drill): add practice entry link to each question card"
```

---

## Task 9: Mock Exam Page

**Files:**
- Create: `src/app/[exam]/mock/page.tsx`

- [ ] **Step 1: Create mock exam page**

```typescript
// src/app/[exam]/mock/page.tsx
'use client'

import { notFound } from 'next/navigation'
import { use, useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EXAM_LABELS, getQuestionsByExam, getSubjectsByExam } from '@/lib/content'
import { getAnswer } from '@/lib/answers'
import { getUserId } from '@/lib/user-id'
import type { ExamId, Question } from '@/types/content'

type Phase = 'setup' | 'exam' | 'result'
const OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const

interface Props {
  params: Promise<{ exam: string }>
}

export default function MockExamPage({ params }: Props) {
  const { exam } = use(params)
  const subjects = getSubjectsByExam(exam as ExamId)
  if (!subjects.length) notFound()

  const allQuestions = getQuestionsByExam(exam as ExamId)
  const years = [...new Set(allQuestions.map((q) => q.year))].sort((a, b) => b - a)

  const [phase, setPhase] = useState<Phase>('setup')
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id)
  const [selectedYear, setSelectedYear] = useState(years[0])
  const [timeLimitMin, setTimeLimitMin] = useState(90)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const startExam = useCallback(() => {
    const qs = allQuestions.filter(
      (q) => q.subjectId === selectedSubject && q.year === selectedYear
    )
    if (qs.length === 0) return
    setQuestions(qs)
    setAnswers({})
    setCurrentIdx(0)
    setSecondsLeft(timeLimitMin * 60)
    setSubmitted(false)
    setPhase('exam')
  }, [allQuestions, selectedSubject, selectedYear, timeLimitMin])

  useEffect(() => {
    if (phase !== 'exam' || submitted) return
    if (secondsLeft <= 0) {
      handleSubmit()
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, secondsLeft, submitted])

  async function handleSubmit() {
    if (submitted) return
    setSubmitted(true)
    const userId = getUserId()
    await Promise.all(
      questions.map((q) => {
        const userAnswer = answers[q.id]
        const correct = getAnswer(q.id)?.answer
        const result =
          !userAnswer ? 'skipped' : userAnswer === correct ? 'correct' : 'wrong'
        return fetch('/api/practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, questionId: q.id, mode: 'mock', result }),
        })
      })
    )
    setPhase('result')
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const score = questions.reduce((acc, q) => {
    const userAns = answers[q.id]
    const correct = getAnswer(q.id)?.answer
    return acc + (userAns && userAns === correct ? (q.points ?? 5) : 0)
  }, 0)

  const total = questions.reduce((acc, q) => acc + (q.points ?? 5), 0)

  if (phase === 'setup') {
    return (
      <div className="space-y-6 max-w-lg">
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 模擬考</h1>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">科目</p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <Button
                  key={s.id}
                  size="sm"
                  variant={selectedSubject === s.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSubject(s.id)}
                >
                  {s.name.split('（')[0]}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">年份</p>
            <div className="flex flex-wrap gap-2">
              {years.map((y) => (
                <Button
                  key={y}
                  size="sm"
                  variant={selectedYear === y ? 'default' : 'outline'}
                  onClick={() => setSelectedYear(y)}
                >
                  {y}年
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">時間限制（分鐘）</p>
            <div className="flex gap-2">
              {[60, 90, 120].map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={timeLimitMin === m ? 'default' : 'outline'}
                  onClick={() => setTimeLimitMin(m)}
                >
                  {m} 分
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={startExam}>
          開始考試
        </Button>
      </div>
    )
  }

  if (phase === 'exam') {
    const q = questions[currentIdx]
    return (
      <div className="space-y-4 max-w-3xl">
        {/* Progress bar */}
        <div className="flex items-center justify-between text-sm">
          <span>{currentIdx + 1} / {questions.length} 題</span>
          <span className={secondsLeft < 300 ? 'text-red-500 font-bold' : ''}>
            ⏱ {formatTime(secondsLeft)}
          </span>
        </div>

        <Card>
          <CardContent className="py-4 px-4 space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{q.year}年</Badge>
              <span className="text-xs text-muted-foreground">第 {q.number} 題</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{q.text}</p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((opt) => (
            <Button
              key={opt}
              variant={answers[q.id] === opt ? 'default' : 'outline'}
              className="w-12 h-12 text-base font-bold"
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
            >
              {opt}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => i - 1)}
          >
            ← 上一題
          </Button>
          {currentIdx < questions.length - 1 ? (
            <Button onClick={() => setCurrentIdx((i) => i + 1)} className="flex-1">
              下一題 →
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700">
              交卷
            </Button>
          )}
        </div>
      </div>
    )
  }

  // phase === 'result'
  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-xl font-bold">成績單</h2>
      <Card>
        <CardContent className="py-4 px-4 text-center space-y-1">
          <p className="text-3xl font-bold">{score} / {total}</p>
          <p className="text-muted-foreground text-sm">
            答對 {questions.filter((q) => answers[q.id] === getAnswer(q.id)?.answer).length} 題，
            共 {questions.length} 題
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {questions.map((q) => {
          const userAns = answers[q.id]
          const correct = getAnswer(q.id)?.answer
          const isCorrect = userAns === correct
          return (
            <Card key={q.id} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
              <CardContent className="py-3 px-4 space-y-1">
                <div className="flex gap-2 items-center text-sm">
                  <span>{isCorrect ? '✓' : '✗'}</span>
                  <span className="font-medium">第 {q.number} 題</span>
                  <span className="text-muted-foreground">你答：{userAns ?? '未作答'}</span>
                  {!isCorrect && <span className="text-green-600">正解：{correct ?? '?'}</span>}
                </div>
                {!isCorrect && getAnswer(q.id)?.explanation && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {getAnswer(q.id)!.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Button variant="outline" className="w-full" onClick={() => setPhase('setup')}>
        再考一次
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Manual test**

```bash
npm run dev
```

Navigate to `http://localhost:3000/im/mock` → select subject + year → start exam → answer questions → submit → verify score shown.

- [ ] **Step 4: Commit**

```bash
git add src/app/[exam]/mock/
git commit -m "feat(mock): add timed mock exam mode"
```

---

## Task 10: Review / 錯題本 Page

**Files:**
- Create: `src/app/[exam]/review/page.tsx`

- [ ] **Step 1: Create review page**

```typescript
// src/app/[exam]/review/page.tsx
'use client'

import { notFound } from 'next/navigation'
import { use, useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EXAM_LABELS, getQuestionsByExam } from '@/lib/content'
import { getAnswer } from '@/lib/answers'
import { getUserId } from '@/lib/user-id'
import type { ExamId, Question } from '@/types/content'

const OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const

interface Props {
  params: Promise<{ exam: string }>
}

export default function ReviewPage({ params }: Props) {
  const { exam } = use(params)
  const allQuestions = getQuestionsByExam(exam as ExamId)
  if (!allQuestions.length) notFound()

  const [wrongIds, setWrongIds] = useState<string[] | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const userId = getUserId()
    if (!userId) { setWrongIds([]); return }
    fetch(`/api/practice/review?userId=${userId}`)
      .then((r) => r.json())
      .then((data: { questionIds: string[] }) => setWrongIds(data.questionIds))
      .catch(() => setWrongIds([]))
  }, [])

  if (wrongIds === null) {
    return <p className="text-sm text-muted-foreground">載入中…</p>
  }

  const reviewQuestions = allQuestions.filter((q) => wrongIds.includes(q.id))

  if (reviewQuestions.length === 0) {
    return (
      <div className="space-y-2 max-w-lg">
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 錯題本</h1>
        <p className="text-muted-foreground text-sm">目前沒有錯題，繼續加油！</p>
      </div>
    )
  }

  if (currentIdx >= reviewQuestions.length) {
    return (
      <div className="space-y-2 max-w-lg">
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 錯題本</h1>
        <p className="text-sm">本輪 {reviewQuestions.length} 題複習完畢！</p>
        <Button onClick={() => { setCurrentIdx(0); setRevealed(false); setSelected(null) }}>
          再來一輪
        </Button>
      </div>
    )
  }

  const q = reviewQuestions[currentIdx]
  const answerData = getAnswer(q.id)

  async function submitResult(result: 'correct' | 'wrong') {
    setSubmitting(true)
    const userId = getUserId()
    await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, questionId: q.id, mode: 'review', result }),
    })
    setSubmitting(false)
    setCurrentIdx((i) => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{EXAM_LABELS[exam as ExamId]} — 錯題本</h1>
        <span className="text-sm text-muted-foreground">
          {currentIdx + 1} / {reviewQuestions.length}
        </span>
      </div>

      <Card>
        <CardContent className="py-4 px-4 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{q.year}年</Badge>
            <span className="text-xs text-muted-foreground">第 {q.number} 題</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{q.text}</p>
        </CardContent>
      </Card>

      {!revealed && (
        <>
          <div className="flex flex-wrap gap-2">
            {OPTIONS.map((opt) => (
              <Button
                key={opt}
                variant={selected === opt ? 'default' : 'outline'}
                className="w-12 h-12 text-base font-bold"
                onClick={() => setSelected(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
          <Button disabled={!selected} onClick={() => setRevealed(true)} className="w-full">
            確認答案
          </Button>
        </>
      )}

      {revealed && answerData && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="py-4 px-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-700 dark:text-green-400">
                正確答案：{answerData.answer}
              </span>
              {selected && (
                <Badge variant={selected === answerData.answer ? 'default' : 'destructive'}>
                  你選了 {selected}
                </Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{answerData.explanation}</p>
          </CardContent>
        </Card>
      )}

      {revealed && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
            disabled={submitting}
            onClick={() => submitResult('correct')}
          >
            ✓ 會了（移出錯題本）
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-400 text-red-600 hover:bg-red-50"
            disabled={submitting}
            onClick={() => submitResult('wrong')}
          >
            ✗ 還不會
          </Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Manual test**

```bash
npm run dev
```

Navigate to `http://localhost:3000/im/review` — if no wrong answers yet, should show "目前沒有錯題". First do a drill and mark a question wrong, then revisit the review page.

- [ ] **Step 4: Commit**

```bash
git add src/app/[exam]/review/
git commit -m "feat(review): add wrong-answer review mode (錯題本)"
```

---

## Task 11: Header Nav Links

**Files:**
- Modify: `src/components/layout/header.tsx`

- [ ] **Step 1: Read current header**

Read `src/components/layout/header.tsx` and find the nav links section.

- [ ] **Step 2: Add 模擬考 and 錯題本 links**

In `src/components/layout/header.tsx`, find `examItems` (line 12) and add two entries:

```typescript
const examItems = [
  { key: 'plan', label: '備考計畫' },
  { key: 'flashcards', label: '閃卡練習' },
  { key: 'past-papers', label: '考古題' },
  { key: 'questions', label: '題庫' },
  { key: 'mock', label: '模擬考' },
  { key: 'review', label: '錯題本' },
]
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Manual test**

```bash
npm run dev
```

Verify new nav links appear and route correctly.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/header.tsx
git commit -m "feat(nav): add 模擬考 and 錯題本 nav links"
```

---

## Task 12: Production Deploy

- [ ] **Step 1: Build**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 2: Deploy to Cloudflare**

```bash
npm run deploy
```

Or:
```bash
npx opennextjs-cloudflare build && npx wrangler deploy
```

- [ ] **Step 3: Smoke test production**

Visit `https://grad-exam-prep.vincent-xu-work.workers.dev/im/questions` — verify "練習 →" links appear on question cards.

Visit `/im/mock` — verify setup screen loads.

Visit `/im/review` — verify page loads.

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -p
git commit -m "fix: production smoke test fixes"
```
