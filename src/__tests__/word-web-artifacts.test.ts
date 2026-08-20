import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const source = JSON.parse(
  fs.readFileSync(path.join(root, 'public/data/im-english-word-web.json'), 'utf8')
) as { words: Record<string, { semanticGroup?: string }> }

const dir = path.join(root, 'public/data/word-web')
const readJson = (name: string) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
const index = readJson('index.json') as {
  words: string[]
  groups: Record<string, { label: string; words: string[] }>
}

function shardKey(word: string) {
  const initial = word.slice(0, 1).toLowerCase()
  return initial >= 'a' && initial <= 'z' ? initial : '_'
}

describe('Word Web 分片產物', () => {
  it('索引收錄的單字與原始資料一致', () => {
    expect(index.words).toEqual(Object.keys(source.words).sort((a, b) => a.localeCompare(b)))
  })

  it('每個單字都在對應字首的分片裡，且內容與原始資料相同', () => {
    const shards = new Map<string, Record<string, unknown>>()
    for (const [word, entry] of Object.entries(source.words)) {
      const key = shardKey(word)
      if (!shards.has(key)) shards.set(key, readJson(`${key}.json`).words)
      expect(shards.get(key)?.[word]).toEqual(entry)
    }
  })

  it('分片沒有多餘或重複的單字', () => {
    const files = fs.readdirSync(dir).filter((name) => name !== 'index.json')
    const seen: string[] = []
    for (const file of files) {
      const words = Object.keys(readJson(file).words)
      for (const word of words) expect(shardKey(word)).toBe(file.replace('.json', ''))
      seen.push(...words)
    }
    expect(seen.sort((a, b) => a.localeCompare(b))).toEqual(index.words)
  })

  it('語義群對應原始資料，且標籤都翻成中文', () => {
    const expected = new Map<string, string[]>()
    for (const [word, entry] of Object.entries(source.words)) {
      if (!entry.semanticGroup) continue
      expected.set(entry.semanticGroup, [...(expected.get(entry.semanticGroup) ?? []), word])
    }

    expect(Object.keys(index.groups).sort()).toEqual([...expected.keys()].sort())
    for (const [slug, group] of Object.entries(index.groups)) {
      expect(group.words).toEqual(expected.get(slug)?.sort((a, b) => a.localeCompare(b)))
      expect(group.label).not.toMatch(/[a-z]/i)
    }
  })

  it('單張卡片要下載的量遠小於整份資料', () => {
    const sourceSize = fs.statSync(path.join(root, 'public/data/im-english-word-web.json')).size
    const indexSize = fs.statSync(path.join(dir, 'index.json')).size
    const biggestShard = Math.max(
      ...fs
        .readdirSync(dir)
        .filter((name) => name !== 'index.json')
        .map((name) => fs.statSync(path.join(dir, name)).size)
    )
    expect(indexSize + biggestShard).toBeLessThan(sourceSize / 3)
  })
})
