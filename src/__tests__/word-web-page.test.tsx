import fs from 'node:fs'
import path from 'node:path'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SemanticGroupBrowser } from '@/components/lexicon/semantic-group-browser'

jest.mock('@/hooks/use-speech', () => ({
  useSpeech: () => ({ speak: jest.fn(), speakingId: null }),
}))

const dataDir = path.join(process.cwd(), 'public/data/word-web')

beforeAll(() => {
  global.fetch = ((url: string) => {
    const file = path.join(dataDir, path.basename(url))
    if (!fs.existsSync(file)) return Promise.resolve({ ok: false } as Response)
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(JSON.parse(fs.readFileSync(file, 'utf8'))),
    } as Response)
  }) as unknown as typeof fetch
})

function renderPage() {
  return render(<SemanticGroupBrowser examLabel="資管所" />)
}

describe('語義群瀏覽頁', () => {
  it('依主題列出單字，預設只顯示多字主題', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { name: /語義群/ })).toBeInTheDocument()

    const heading = await screen.findByRole('heading', { name: '變化・改善' })
    expect(heading).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'mitigate' })).toBeInTheDocument()
  })

  it('搜尋可以用中文主題或英文單字過濾', async () => {
    renderPage()
    await screen.findByRole('heading', { name: '變化・改善' })

    fireEvent.change(screen.getByLabelText('搜尋語義群'), { target: { value: 'mitigate' } })

    await waitFor(() => {
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
    })
    expect(screen.getByRole('heading', { name: '變化・改善' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('搜尋語義群'), { target: { value: '情緒' } })
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: '變化・改善' })).not.toBeInTheDocument()
    })
  })

  it('點單字會開出該字的語義網絡', async () => {
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'mitigate' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('group', { name: 'mitigate 的語義網絡' })).toBeInTheDocument()
    })
  })
})
