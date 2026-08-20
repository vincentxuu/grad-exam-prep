import fs from 'node:fs'
import path from 'node:path'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { VocabMindMap } from '@/components/flashcard/vocab-mind-map'
import { layoutWordWeb, nodesOverlap } from '@/lib/word-web-layout'

const mitigate = {
  word: 'mitigate',
  chinese: '減輕；緩和',
  synonyms: ['alleviate', 'lessen', 'diminish', 'ease', 'moderate'],
  antonyms: ['exacerbate', 'aggravate', 'intensify'],
  relatedWords: ['mitigation', 'mitigating'],
  confusableWith: ['litigate'],
}

function toGroups(entry: Record<string, unknown>) {
  return [
    { key: 'synonym', label: '同義', words: (entry.synonyms as string[]) ?? [] },
    { key: 'related', label: '相關', words: (entry.relatedWords as string[]) ?? [] },
    { key: 'antonym', label: '反義', words: (entry.antonyms as string[]) ?? [] },
    { key: 'confusable', label: '易混', words: (entry.confusableWith as string[]) ?? [] },
  ].filter((g) => g.words.length > 0)
}

describe('layoutWordWeb', () => {
  it('放置的詞彙標籤不會互相重疊', () => {
    const layout = layoutWordWeb(mitigate.word, mitigate.chinese, toGroups(mitigate))
    expect(layout).not.toBeNull()
    const nodes = layout?.nodes ?? []
    expect(nodes).toHaveLength(11)

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        expect({
          pair: `${nodes[i].word} / ${nodes[j].word}`,
          overlap: nodesOverlap(nodes[i], nodes[j]),
        }).toEqual({ pair: `${nodes[i].word} / ${nodes[j].word}`, overlap: false })
      }
    }
  })

  it('畫布範圍涵蓋所有節點，不會被裁切', () => {
    const layout = layoutWordWeb(mitigate.word, mitigate.chinese, toGroups(mitigate))
    const [x, y, w, h] = (layout?.viewBox ?? '').split(' ').map(Number)
    for (const node of layout?.nodes ?? []) {
      expect(node.x - node.width / 2).toBeGreaterThanOrEqual(x)
      expect(node.y - node.height / 2).toBeGreaterThanOrEqual(y)
      expect(node.x + node.width / 2).toBeLessThanOrEqual(x + w)
      expect(node.y + node.height / 2).toBeLessThanOrEqual(y + h)
    }
  })

  it('沒有關聯詞時回傳 null', () => {
    expect(layoutWordWeb('mitigate', '減輕', [])).toBeNull()
  })

  it('資料集中每個單字都能排出無重疊的版面', () => {
    const file = path.join(process.cwd(), 'public/data/im-english-word-web.json')
    const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as {
      words: Record<string, Record<string, unknown>>
    }

    const collisions: string[] = []
    for (const [word, entry] of Object.entries(raw.words)) {
      const groups = toGroups(entry)
      if (groups.length === 0) continue
      const layout = layoutWordWeb(word, String(entry.chinese ?? ''), groups)
      const nodes = layout?.nodes ?? []
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodesOverlap(nodes[i], nodes[j])) {
            collisions.push(`${word}: ${nodes[i].word} / ${nodes[j].word}`)
          }
        }
      }
    }

    expect(collisions).toEqual([])
  })
})

describe('VocabMindMap', () => {
  it('標籤列出各關聯類型與數量', () => {
    render(<VocabMindMap {...mitigate} />)
    expect(screen.getByRole('button', { name: '同義 5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '反義 3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '易混 1' })).toBeInTheDocument()
  })

  it('點擊類型標籤可以隱藏該類型的節點', () => {
    render(<VocabMindMap {...mitigate} />)
    expect(screen.getByRole('button', { name: '反義：exacerbate' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '反義 3' }))

    expect(screen.queryByRole('button', { name: '反義：exacerbate' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '同義：alleviate' })).toBeInTheDocument()
  })

  it('全部隱藏後顯示提示文字', () => {
    render(<VocabMindMap {...mitigate} />)
    for (const label of ['同義 5', '相關 2', '反義 3', '易混 1']) {
      fireEvent.click(screen.getByRole('button', { name: label }))
    }
    expect(screen.getByText(/已隱藏所有關聯詞/)).toBeInTheDocument()
  })

  it('點擊節點會回傳該單字', () => {
    const onWordClick = jest.fn()
    render(<VocabMindMap {...mitigate} onWordClick={onWordClick} />)
    fireEvent.click(screen.getByRole('button', { name: '同義：alleviate' }))
    expect(onWordClick).toHaveBeenCalledWith('alleviate')
  })

  it('清單檢視列出所有關聯詞，供小螢幕使用', () => {
    const { container } = render(<VocabMindMap {...mitigate} />)
    const list = container.querySelector('.sm\\:hidden')
    expect(list).not.toBeNull()
    const scoped = within(list as HTMLElement)
    for (const word of [...mitigate.synonyms, ...mitigate.antonyms, ...mitigate.relatedWords]) {
      expect(scoped.getByRole('button', { name: word })).toBeInTheDocument()
    }
  })

  it('重複出現在多個分類的字只顯示一次', () => {
    render(
      <VocabMindMap
        word="ease"
        chinese="緩和"
        synonyms={['relieve']}
        relatedWords={['relieve', 'easing']}
      />
    )
    expect(screen.getByRole('button', { name: '同義 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '相關 1' })).toBeInTheDocument()
  })
})
