import { getGuidesByExam, guides, resources } from '@/lib/content'

// Guides point at other people's articles; they must never grow into copies of
// them. These tests pin that boundary: a working source URL, and topics that
// stay short enough to be labels rather than a retelling.
const TOPIC_MAX_LENGTH = 40

describe('guides content', () => {
  it('has at least one guide', () => {
    expect(guides.length).toBeGreaterThan(0)
  })

  it('has unique guide ids', () => {
    const ids = guides.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('filters guides by exam', () => {
    const imGuides = getGuidesByExam('im')
    expect(imGuides.length).toBeGreaterThan(0)
    expect(imGuides.every((g) => g.examRelevance.includes('im'))).toBe(true)
  })

  it.each(guides.map((g) => [g.id, g] as const))('%s links to its original', (_id, guide) => {
    expect(guide.source.url).toMatch(/^https?:\/\//)
    expect(guide.source.platform.length).toBeGreaterThan(0)
  })

  it.each(
    guides.map((g) => [g.id, g] as const)
  )('%s topics are labels, not a retelling', (_id, guide) => {
    expect(guide.topics.length).toBeGreaterThan(0)
    for (const topic of guide.topics) {
      expect(topic.length).toBeLessThanOrEqual(TOPIC_MAX_LENGTH)
    }
  })

  it('every guide is also reachable from the resource library', () => {
    const resourceUrls = new Set(resources.map((r) => r.url))
    for (const guide of guides) {
      expect(resourceUrls.has(guide.source.url)).toBe(true)
    }
  })
})
