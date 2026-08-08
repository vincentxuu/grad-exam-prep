import { getGuide, getGuidesByExam, getSubject, guides } from '@/lib/content'

const BLOCK_TYPES = new Set([
  'prose',
  'list',
  'callout',
  'compare',
  'table',
  'prompt',
  'quote',
  'subject',
  'links',
])

describe('guides content', () => {
  it('has at least one guide', () => {
    expect(guides.length).toBeGreaterThan(0)
  })

  it('has unique guide ids', () => {
    const ids = guides.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('looks up a guide by id', () => {
    const guide = getGuide('guide-dcard-115-im-tech')
    expect(guide).toBeDefined()
    expect(guide?.examRelevance).toContain('im')
  })

  it('returns undefined for an unknown id', () => {
    expect(getGuide('nope')).toBeUndefined()
  })

  it('filters guides by exam', () => {
    const imGuides = getGuidesByExam('im')
    expect(imGuides.length).toBeGreaterThan(0)
    expect(imGuides.every((g) => g.examRelevance.includes('im'))).toBe(true)
  })

  it.each(guides.map((g) => [g.id, g] as const))('%s has a valid structure', (_id, guide) => {
    expect(guide.source.url).toMatch(/^https?:\/\//)
    expect(guide.summary.length).toBeGreaterThan(0)
    expect(guide.takeaways.length).toBeGreaterThan(0)
    expect(guide.sections.length).toBeGreaterThan(0)

    const sectionIds = guide.sections.map((s) => s.id)
    expect(new Set(sectionIds).size).toBe(sectionIds.length)

    for (const section of guide.sections) {
      expect(section.blocks.length).toBeGreaterThan(0)
      for (const block of section.blocks) {
        expect(BLOCK_TYPES.has(block.type)).toBe(true)
        if (block.type === 'prompt') expect(block.prompt).toBeTruthy()
        if (block.type === 'compare') {
          for (const col of block.columns ?? []) {
            expect(['pro', 'con', 'neutral']).toContain(col.tone)
            expect(col.items.length).toBeGreaterThan(0)
          }
        }
        if (block.type === 'subject' && block.subjectId) {
          expect(getSubject(block.subjectId)).toBeDefined()
        }
        if (block.type === 'table') {
          const cols = block.headers?.length ?? 0
          expect(cols).toBeGreaterThan(0)
          for (const row of block.rows ?? []) expect(row).toHaveLength(cols)
        }
      }
    }
  })

  it.each(
    guides.filter((g) => g.timeAllocation).map((g) => [g.id, g] as const)
  )('%s time allocation sums to 100%%', (_id, guide) => {
    const total = guide.timeAllocation?.items.reduce((sum, item) => sum + item.pct, 0)
    expect(total).toBe(100)
  })
})
