'use client'

import { ChevronRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense, use, useEffect, useMemo, useState } from 'react'
import { FlashcardExampleSupport } from '@/components/flashcard/example-support'
import { SpeakButton } from '@/components/flashcard/speak-button'
import { hasVocabExample, VocabAnswer } from '@/components/flashcard/vocab-answer'
import { VoiceSelect } from '@/components/flashcard/voice-select'
import { LexiconReviewAnswer } from '@/components/lexicon/lexicon-review-answer'
import { PageLoading } from '@/components/page-loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQueryState } from '@/hooks/use-query-state'
import { useSpeech } from '@/hooks/use-speech'
import { FLASHCARD_EXAM_LABELS, getFlashcardSubjects } from '@/lib/flashcard-meta'
import { fromFlashcard, fromSavedWord, type ReviewCard } from '@/lib/review-card'
import type { RecallRating } from '@/lib/srs'
import { getAuthHeader } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'
import { daysUntilDue, initialCardState, RECALL_LABELS } from '@/lib/srs'
import { localStorageImpl } from '@/lib/storage'
import { extractWord, isVocabCard } from '@/lib/vocab'
import { dueCardsFromState, dueCountFromState, useFlashcardStore } from '@/store/flashcard'
import type { ExamId, Flashcard } from '@/types/content'
import type { PersonaProfile } from '@/types/lexicon'
import type { CardSRSState, SavedWord } from '@/types/storage'

interface Props {
  params: Promise<{ exam: string }>
}

/** 「我的單字」的篩選鍵，與科目 id 共用同一個 query param */
const SAVED_FILTER = 'saved'
const BROWSE_BATCH_SIZE = 60
const REVIEW_BATCH_SIZE = 50

const TIER_LABELS: Record<NonNullable<Flashcard['tier']>, string> = {
  must_know: '必背',
  important: '重要',
  worth_studying: '值得學',
  domain: '領域詞',
}

export default function FlashcardsPage(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <FlashcardsContent {...props} />
    </Suspense>
  )
}

function FlashcardsContent({ params }: Props) {
  const { exam } = use(params)
  const subjects = useMemo(() => getFlashcardSubjects(exam as ExamId), [exam])
  if (!subjects.length) notFound()

  const subjectLabel = useMemo(
    () => Object.fromEntries(subjects.map((subject) => [subject.id, subject.name.split('（')[0]])),
    [subjects]
  )

  const { user } = useAuth()
  const { reviewCard: reviewCardLocal } = useFlashcardStore()
  const {
    voices,
    selectedVoiceURI,
    setVoice,
    speak,
    speakingId,
    providers,
    provider,
    setProvider,
  } = useSpeech()

  const [subjectFilter, setSubjectFilter] = useQueryState('subject', 'all')
  const [mode, setMode] = useState<'browse' | 'review'>('browse')
  const [reviewQueue, setReviewQueue] = useState<ReviewCard[]>([])
  const [savedWords, setSavedWords] = useState<SavedWord[]>([])
  const [persona, setPersona] = useState<PersonaProfile | undefined>()
  const [examCards, setExamCards] = useState<Flashcard[]>([])
  const [cardsLoading, setCardsLoading] = useState(true)
  const [cardsError, setCardsError] = useState<string | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<Flashcard['tier'] | 'all'>('all')
  const [visibleLimit, setVisibleLimit] = useState(BROWSE_BATCH_SIZE)
  const [schedule, setSchedule] = useState<{
    states: Record<string, CardSRSState>
    now: number
  }>({ states: {}, now: 0 })

  useEffect(() => {
    const stored = localStorageImpl.getState()
    const saved = stored.savedWords
    setSavedWords(saved)
    setPersona(stored.preferences.persona)

    if (!user) {
      setSchedule({ states: stored.srsState, now: Date.now() })
    }

    const controller = new AbortController()
    setCardsLoading(true)
    setCardsError(null)

    const fetchCards = fetch(`/api/flashcards?exam=${encodeURIComponent(exam)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<{ cards: Flashcard[]; allCardIds: string[] }>
      })

    const fetchSrs = user
      ? fetch('/api/srs', {
          signal: controller.signal,
          headers: { ...getAuthHeader() },
        }).then(async (response) => {
          if (!response.ok) throw new Error(`SRS ${response.status}`)
          return response.json() as Promise<{ states: Record<string, CardSRSState> }>
        })
      : null

    Promise.all([fetchCards, fetchSrs])
      .then(([{ cards, allCardIds }, srsData]) => {
        if (!user) {
          const validIds = new Set([...allCardIds, ...saved.map((word) => word.cardId)])
          localStorageImpl.pruneSRSState(validIds)
          setSchedule((current) => ({
            states: Object.fromEntries(
              Object.entries(current.states).filter(([cardId]) => validIds.has(cardId))
            ),
            now: Date.now(),
          }))
        } else if (srsData) {
          setSchedule({ states: srsData.states, now: Date.now() })
        }
        setExamCards(cards)
        setCardsLoading(false)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setCardsError(error instanceof Error ? error.message : '載入失敗')
        setCardsLoading(false)
      })

    return () => controller.abort()
  }, [exam, user])

  /** 靜態閃卡與查來的字，正規化成同一種卡後共用同一個 SRS 排程 */
  const allCards: ReviewCard[] = useMemo(
    () => [
      ...examCards.map((c) => fromFlashcard(c, subjectLabel[c.subjectId])),
      ...savedWords.map(fromSavedWord),
    ],
    [examCards, savedWords, subjectLabel]
  )

  const subjectScopedCards = useMemo(() => {
    if (subjectFilter === 'all') return allCards
    if (subjectFilter === SAVED_FILTER) return allCards.filter((card) => card.source === 'lexicon')
    return allCards.filter((card) => card.flashcard?.subjectId === subjectFilter)
  }, [allCards, subjectFilter])

  const availableTiers = useMemo(
    () =>
      new Set(
        subjectScopedCards.flatMap((card) => (card.flashcard?.tier ? [card.flashcard.tier] : []))
      ),
    [subjectScopedCards]
  )
  const canFilterTiers = availableTiers.size > 0

  const filteredCards = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return subjectScopedCards.filter((card) => {
      const tierMatches =
        !canFilterTiers || tierFilter === 'all' || card.flashcard?.tier === tierFilter
      const searchMatches =
        !normalizedSearch ||
        (card.headword ?? card.prompt).toLowerCase().includes(normalizedSearch) ||
        card.flashcard?.answer.toLowerCase().includes(normalizedSearch)
      return tierMatches && searchMatches
    })
  }, [canFilterTiers, search, subjectScopedCards, tierFilter])

  useEffect(() => {
    if (!canFilterTiers && tierFilter !== 'all') setTierFilter('all')
  }, [canFilterTiers, tierFilter])

  useEffect(() => {
    setVisibleLimit(BROWSE_BATCH_SIZE)
    setExpandedId(null)
  }, [search, subjectFilter, tierFilter])

  const dueCards = useMemo(
    () => dueCardsFromState(filteredCards, schedule.states, schedule.now),
    [filteredCards, schedule]
  )
  const dueCount = useMemo(
    () => dueCountFromState(allCards, schedule.states, schedule.now),
    [allCards, schedule]
  )

  function startReview() {
    setReviewQueue(dueCards.slice(0, REVIEW_BATCH_SIZE))
    setCurrentIdx(0)
    setRevealed(false)
    setMode('review')
  }

  function handleRating(rating: RecallRating) {
    const card = reviewQueue[currentIdx]

    if (user) {
      fetch('/api/srs/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ cardId: card.id, rating }),
      })
        .then((res) => (res.ok ? (res.json() as Promise<{ card: CardSRSState }>) : Promise.reject()))
        .then((data) => {
          setSchedule((current) => ({
            states: { ...current.states, [data.card.cardId]: data.card },
            now: Date.now(),
          }))
        })
        .catch(() => {})
    } else {
      const updated = reviewCardLocal(card, rating)
      setSchedule((current) => ({
        states: { ...current.states, [updated.cardId]: updated },
        now: Date.now(),
      }))
    }

    if (currentIdx + 1 < reviewQueue.length) {
      setCurrentIdx((i) => i + 1)
      setRevealed(false)
    } else {
      setMode('browse')
    }
  }

  const coverageBySubject = useMemo(
    () =>
      subjects.map((subject) => {
        const cards = allCards.filter((card) => card.flashcard?.subjectId === subject.id)
        return {
          subject,
          cardCount: cards.length,
          due: dueCountFromState(cards, schedule.states, schedule.now),
        }
      }),
    [allCards, schedule, subjects]
  )

  if (cardsLoading) return <PageLoading />
  if (cardsError) {
    return (
      <div className="max-w-xl rounded-lg border p-6 text-sm">
        <p className="font-medium">閃卡資料載入失敗</p>
        <p className="mt-1 text-muted-foreground">{cardsError}，請重新整理頁面再試一次。</p>
      </div>
    )
  }

  if (mode === 'review' && reviewQueue.length > 0) {
    const item = reviewQueue[currentIdx]
    const card = item.flashcard
    // lexicon 卡的正面就是那個字；content 卡沿用既有的抽字邏輯
    const word = item.headword ?? (card && isVocabCard(card) ? extractWord(card.prompt) : null)

    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {currentIdx + 1} / {reviewQueue.length}
          </span>
          <div className="flex items-center gap-2">
            <VoiceSelect
              voices={voices}
              selectedVoiceURI={selectedVoiceURI}
              onSelect={setVoice}
              providers={providers}
              provider={provider}
              onProviderChange={setProvider}
            />
            <Button variant="ghost" size="sm" onClick={() => setMode('browse')}>
              結束複習
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-6 space-y-4 min-h-48">
          <Badge variant="secondary" className="text-xs">
            {card ? `${item.label} · ${card.topicId.split('-').pop()}` : item.label}
          </Badge>
          <div className="flex items-center gap-2">
            <p className="text-lg font-medium leading-relaxed whitespace-pre-line">{item.prompt}</p>
            {word && (
              <SpeakButton
                text={word}
                id={`${item.id}-word`}
                speak={speak}
                speakingId={speakingId}
                size="md"
                label={`播放 ${word} 發音`}
              />
            )}
          </div>

          {!revealed ? (
            <Button className="w-full" onClick={() => setRevealed(true)}>
              顯示答案
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md bg-muted/40 p-4">
                {item.source === 'lexicon' && item.headword ? (
                  <LexiconReviewAnswer
                    headword={item.headword}
                    speak={speak}
                    speakingId={speakingId}
                  />
                ) : card && isVocabCard(card) ? (
                  <VocabAnswer
                    cardId={card.id}
                    answer={card.answer}
                    speak={speak}
                    speakingId={speakingId}
                  />
                ) : (
                  <div className="text-sm whitespace-pre-line leading-relaxed">{card?.answer}</div>
                )}
              </div>
              {card?.pastPaperRef && (
                <p className="text-xs text-muted-foreground">→ 參見：{card.pastPaperRef}</p>
              )}
              {word && (
                <FlashcardExampleSupport
                  headword={word}
                  hasEmbeddedExample={
                    item.source === 'lexicon' || !!(card && hasVocabExample(card.answer))
                  }
                  persona={persona}
                  setupHref={`/${exam}/lookup`}
                  speak={speak}
                  speakingId={speakingId}
                />
              )}
              <div className="grid grid-cols-3 gap-2">
                {([0, 1, 2] as RecallRating[]).map((r) => (
                  <Button
                    key={r}
                    variant={r === 0 ? 'destructive' : r === 2 ? 'default' : 'outline'}
                    onClick={() => handleRating(r)}
                  >
                    {RECALL_LABELS[r]}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">
              {FLASHCARD_EXAM_LABELS[exam as ExamId]} — 閃卡練習
            </h1>
            {dueCount > 0 && <Badge className="text-xs">{dueCount} 張待複習</Badge>}
          </div>
          <p className="text-muted-foreground text-sm mt-1">SM-2 間隔重複排程</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={startReview} disabled={dueCards.length === 0}>
            {dueCards.length > 0
              ? `開始複習（${Math.min(dueCards.length, REVIEW_BATCH_SIZE)} / ${dueCards.length}）`
              : '暫無待複習卡'}
          </Button>
          <VoiceSelect
            voices={voices}
            selectedVoiceURI={selectedVoiceURI}
            onSelect={setVoice}
            providers={providers}
            provider={provider}
            onProviderChange={setProvider}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="搜尋單字、片語或解釋…"
          className="max-w-sm"
        />
        {canFilterTiers && (
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant={tierFilter === 'all' ? 'secondary' : 'outline'}
              onClick={() => setTierFilter('all')}
            >
              全部分級
            </Button>
            {Object.entries(TIER_LABELS)
              .filter(([tier]) => availableTiers.has(tier as NonNullable<Flashcard['tier']>))
              .map(([tier, label]) => (
                <Button
                  key={tier}
                  size="sm"
                  variant={tierFilter === tier ? 'secondary' : 'outline'}
                  onClick={() => setTierFilter(tier as NonNullable<Flashcard['tier']>)}
                >
                  {label}
                </Button>
              ))}
          </div>
        )}
      </div>

      {/* Subject filter */}
      <div className="flex flex-wrap gap-1">
        <Button
          size="sm"
          variant={subjectFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setSubjectFilter('all')}
        >
          全部（{allCards.length}）
        </Button>
        {subjects.map((s) => {
          const count = examCards.filter((c) => c.subjectId === s.id).length
          return (
            <Button
              key={s.id}
              size="sm"
              variant={subjectFilter === s.id ? 'secondary' : 'outline'}
              onClick={() => setSubjectFilter(s.id)}
            >
              {s.name.split('（')[0]}（{count}）
            </Button>
          )
        })}
        {savedWords.length > 0 && (
          <Button
            size="sm"
            variant={subjectFilter === SAVED_FILTER ? 'secondary' : 'outline'}
            onClick={() => setSubjectFilter(SAVED_FILTER)}
          >
            我的單字（{savedWords.length}）
          </Button>
        )}
      </div>

      {/* Coverage report */}
      <div className="rounded-lg border p-4 space-y-2">
        <h2 className="text-sm font-medium">科目涵蓋率</h2>
        <div className="grid grid-cols-2 gap-2">
          {coverageBySubject.map(({ subject, cardCount, due }) => (
            <div key={subject.id} className="flex items-center justify-between text-xs">
              <span className="truncate text-muted-foreground">{subject.name.split('（')[0]}</span>
              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                <span>{cardCount} 張</span>
                {due > 0 && (
                  <Badge variant="default" className="text-xs h-4 px-1">
                    {due} 到期
                  </Badge>
                )}
                {cardCount === 0 && (
                  <Badge variant="outline" className="text-xs h-4 px-1">
                    待補充
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card list */}
      <div className="space-y-2">
        {filteredCards.length > 0 && (
          <p className="text-xs text-muted-foreground">
            點卡片可展開答案，英文字彙卡附單字與例句發音。
          </p>
        )}
        {filteredCards.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {subjectScopedCards.length > 0 ? (
              <>
                <p>沒有符合目前搜尋或分級的卡片</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setSearch('')
                    setTierFilter('all')
                  }}
                >
                  清除篩選
                </Button>
              </>
            ) : subjectFilter === SAVED_FILTER ? (
              <>
                <p>單字庫還是空的</p>
                <p className="text-xs mt-1">在查詞或閱讀頁按「加入單字庫」，字就會排進這裡</p>
              </>
            ) : (
              <>
                <p>此科目尚無閃卡</p>
                <p className="text-xs mt-1">之後會持續補充</p>
              </>
            )}
          </div>
        ) : (
          filteredCards
            .slice(0, visibleLimit)
            .map((item) => (
              <CardRow
                key={item.id}
                item={item}
                persona={persona}
                setupHref={`/${exam}/lookup`}
                days={daysUntilDue(
                  schedule.states[item.id] ?? initialCardState(item.id, schedule.now),
                  schedule.now
                )}
                expanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                speak={speak}
                speakingId={speakingId}
              />
            ))
        )}
        {filteredCards.length > visibleLimit && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setVisibleLimit((limit) => limit + BROWSE_BATCH_SIZE)}
          >
            載入更多（剩 {filteredCards.length - visibleLimit} 張）
          </Button>
        )}
      </div>
    </div>
  )
}

interface CardRowProps {
  item: ReviewCard
  persona?: PersonaProfile
  setupHref: string
  days: number
  expanded: boolean
  onToggle: () => void
  speak: (text: string, id?: string) => void
  speakingId: string | null
}

/**
 * 瀏覽模式的單張卡片。點開就能看答案 —— 例句與發音不必等到 SRS 排程到期
 * 才進得了複習模式。
 */
function CardRow({
  item,
  persona,
  setupHref,
  days,
  expanded,
  onToggle,
  speak,
  speakingId,
}: CardRowProps) {
  const card = item.flashcard
  const vocab = !!card && isVocabCard(card)
  const word = item.headword ?? (vocab && card ? extractWord(card.prompt) : null)

  return (
    <div className="rounded-lg border text-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full p-3 text-left flex items-start justify-between gap-2 hover:bg-muted/40 rounded-lg transition-colors"
      >
        <div className="flex items-start gap-1 min-w-0">
          <ChevronRight
            className={`h-4 w-4 mt-0.5 shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
          <p className={`font-medium ${expanded ? '' : 'line-clamp-2'}`}>{item.prompt}</p>
        </div>
        <div className="shrink-0 flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {item.label}
          </Badge>
          {days === 0 ? (
            <Badge className="text-xs">到期</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">{days}天後</span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {word && (
            <div className="flex items-center gap-1">
              <SpeakButton
                text={word}
                id={`${item.id}-word`}
                speak={speak}
                speakingId={speakingId}
                label={`播放 ${word} 發音`}
              />
              <span className="text-muted-foreground text-xs">點擊播放單字發音</span>
            </div>
          )}
          <div className="rounded-md bg-muted/40 p-3">
            {item.source === 'lexicon' && item.headword ? (
              <LexiconReviewAnswer headword={item.headword} speak={speak} speakingId={speakingId} />
            ) : vocab && card ? (
              <VocabAnswer
                cardId={card.id}
                answer={card.answer}
                speak={speak}
                speakingId={speakingId}
              />
            ) : (
              <div className="whitespace-pre-line leading-relaxed">{card?.answer}</div>
            )}
          </div>
          {card?.pastPaperRef && (
            <p className="text-xs text-muted-foreground">→ 參見：{card.pastPaperRef}</p>
          )}
          {word && (
            <FlashcardExampleSupport
              headword={word}
              hasEmbeddedExample={
                item.source === 'lexicon' || !!(card && hasVocabExample(card.answer))
              }
              persona={persona}
              setupHref={setupHref}
              speak={speak}
              speakingId={speakingId}
            />
          )}
        </div>
      )}
    </div>
  )
}
