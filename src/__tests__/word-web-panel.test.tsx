import fs from 'node:fs'
import path from 'node:path'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { WordWebPanel } from '@/components/flashcard/word-web-panel'

const dataDir = path.join(process.cwd(), 'public/data/word-web')
let requested: string[] = []

beforeAll(() => {
  global.fetch = ((url: string) => {
    requested.push(url)
    const file = path.join(dataDir, path.basename(url))
    if (!fs.existsSync(file)) return Promise.resolve({ ok: false } as Response)
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(JSON.parse(fs.readFileSync(file, 'utf8'))),
    } as Response)
  }) as unknown as typeof fetch
})

beforeEach(() => {
  requested = []
})

describe('WordWebPanel', () => {
  it('只抓索引與該字首的分片，不再下載整份資料', async () => {
    render(<WordWebPanel word="mitigate" />)
    await screen.findByRole('button', { name: '同義：alleviate' })

    expect(requested).toEqual(['/data/word-web/index.json', '/data/word-web/m.json'])
    expect(requested.some((url) => url.includes('im-english-word-web.json'))).toBe(false)
  })

  it('資料庫裡有的關聯詞才給展開按鈕', async () => {
    render(<WordWebPanel word="mitigate" />)
    await screen.findByRole('button', { name: '同義：alleviate' })

    // exacerbate 本身也是收錄單字，alleviate 不是。
    expect(
      screen.getAllByRole('button', { name: '展開 exacerbate 的語義網絡' }).length
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole('button', { name: '展開 alleviate 的語義網絡' })
    ).not.toBeInTheDocument()
  })

  it('展開後圖譜換中心並留下麵包屑，返回可回上一層', async () => {
    render(<WordWebPanel word="mitigate" />)
    await screen.findByRole('button', { name: '同義：alleviate' })

    fireEvent.click(screen.getAllByRole('button', { name: '展開 exacerbate 的語義網絡' })[0])

    await waitFor(() => {
      expect(screen.getByRole('group', { name: 'exacerbate 的語義網絡' })).toBeInTheDocument()
    })
    expect(requested).toContain('/data/word-web/e.json')
    expect(screen.getByRole('button', { name: '← 返回' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '← 返回' }))
    await waitFor(() => {
      expect(screen.getByRole('group', { name: 'mitigate 的語義網絡' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: '← 返回' })).not.toBeInTheDocument()
  })

  it('顯示中文語義群標籤與同群單字', async () => {
    render(<WordWebPanel word="mitigate" />)
    await screen.findByText(/變化・改善/)
    expect(screen.getByRole('button', { name: 'reform' })).toBeInTheDocument()
    // 中心字自己不列在同群清單裡
    expect(screen.queryByRole('button', { name: 'mitigate' })).not.toBeInTheDocument()
  })

  it('顯示詞性與例句來源標記', async () => {
    render(<WordWebPanel word="mitigate" />)
    await screen.findByText(/動詞/)
    expect(screen.getByText('生活')).toBeInTheDocument()
    expect(screen.getByText('考題')).toBeInTheDocument()
  })

  it('滑過關聯詞會顯示中文對照', async () => {
    render(<WordWebPanel word="mitigate" />)
    await screen.findByRole('button', { name: '同義：alleviate' })

    expect(screen.getByText('滑過或聚焦單字可看中文')).toBeInTheDocument()
    fireEvent.focus(screen.getByRole('button', { name: '同義：diminish' }))
    expect(screen.getByText('減少')).toBeInTheDocument()

    // 字典裡查不到的字要說清楚，不是留白
    fireEvent.focus(screen.getByRole('button', { name: '相關：mitigating' }))
    expect(screen.getByText('（尚無中文對照）')).toBeInTheDocument()
  })

  it('點單字會朗讀', async () => {
    const speak = jest.fn()
    render(<WordWebPanel word="mitigate" speak={speak} idPrefix="card-1" />)
    const node = await screen.findByRole('button', { name: '同義：alleviate' })

    fireEvent.click(node)
    expect(speak).toHaveBeenCalledWith('alleviate', 'card-1-alleviate')
  })

  it('沒有收錄的字不顯示任何東西', async () => {
    const { container } = render(<WordWebPanel word="zzzznotaword" />)
    await waitFor(() => expect(requested.length).toBeGreaterThan(0))
    expect(container).toBeEmptyDOMElement()
  })
})
