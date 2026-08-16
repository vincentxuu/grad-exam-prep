import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FlashcardExampleSupport } from '@/components/flashcard/example-support'
import type { LexiconEntry, LookupResponse } from '@/types/lexicon'

function entry(headword: string): LexiconEntry {
  return {
    headword,
    kind: 'word',
    senses: [{ pos: 'verb', zh: '減輕', en: 'make less severe' }],
    collocations: [],
    phrases: [],
    confusables: [],
    synonyms: [],
    antonyms: [],
    examples: [
      {
        en: `A general example for ${headword}.`,
        zh: `${headword} 的通用例句。`,
        context: 'general',
      },
    ],
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

const baseProps = {
  setupHref: '/im/lookup',
  speak: jest.fn(),
  speakingId: null,
}

describe('FlashcardExampleSupport', () => {
  it('缺內建例句時只讀免費快取，不會自動 POST', async () => {
    const fetchImpl = jest.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse({
        entry: entry('mitigate-cache-test'),
        cached: { entry: true, personal: false },
      } satisfies LookupResponse)
    )

    render(
      <FlashcardExampleSupport
        {...baseProps}
        headword="mitigate-cache-test"
        hasEmbeddedExample={false}
        fetchImpl={fetchImpl as typeof fetch}
      />
    )

    expect(
      await screen.findByText('A general example for mitigate-cache-test.')
    ).toBeInTheDocument()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(fetchImpl.mock.calls[0][0]).toBe('/api/lexicon?q=mitigate-cache-test')
    expect(fetchImpl.mock.calls[0][1]).not.toMatchObject({ method: 'POST' })
  })

  it('有 persona 時只有明確點擊才生成個人化例句', async () => {
    const fetchImpl = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe('POST')
      return jsonResponse({
        entry: entry('mitigate-personal-test'),
        personal: {
          headword: 'mitigate-personal-test',
          examples: [
            {
              en: 'We added a retry limit to mitigate pressure on the production API.',
              zh: '我們加入重試上限，以減輕正式環境 API 的壓力。',
              context: 'technical',
            },
          ],
          mnemonic: '想到處理正式環境事故時先降低衝擊。',
        },
        cached: { entry: true, personal: false },
      } satisfies LookupResponse)
    })

    render(
      <FlashcardExampleSupport
        {...baseProps}
        headword="mitigate-personal-test"
        hasEmbeddedExample
        persona={{ work: '軟體工程師', interests: ['攀岩'], goal: '工作上使用' }}
        fetchImpl={fetchImpl as typeof fetch}
      />
    )

    expect(fetchImpl).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '用我的情境幫我記' }))

    expect(
      await screen.findByText('We added a retry limit to mitigate pressure on the production API.')
    ).toBeInTheDocument()
    expect(screen.getByText(/想到處理正式環境事故/)).toBeInTheDocument()

    const payload = JSON.parse(fetchImpl.mock.calls[0][1]?.body as string)
    expect(payload).toEqual({
      term: 'mitigate-personal-test',
      persona: { work: '軟體工程師', interests: ['攀岩'], goal: '工作上使用' },
    })
  })

  it('沒有 persona 時不會假裝個人化，並提供設定入口', async () => {
    const fetchImpl = jest.fn(async () => jsonResponse({ error: '尚未快取' }, 404))

    render(
      <FlashcardExampleSupport
        {...baseProps}
        headword="mitigate-setup-test"
        hasEmbeddedExample={false}
        fetchImpl={fetchImpl as typeof fetch}
      />
    )

    const link = await screen.findByRole('link', { name: '設定我的熟悉情境' })
    expect(link).toHaveAttribute('href', '/im/lookup')
    expect(screen.queryByRole('button', { name: '用我的情境幫我記' })).not.toBeInTheDocument()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('個人化生成失敗時顯示錯誤並保留重試按鈕', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ error: '今天的查詞額度用完了（10/10）。' }, 429)
    )

    render(
      <FlashcardExampleSupport
        {...baseProps}
        headword="mitigate-error-test"
        hasEmbeddedExample
        persona={{ work: '軟體工程師', interests: [] }}
        fetchImpl={fetchImpl as typeof fetch}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '用我的情境幫我記' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('今天的查詞額度用完了')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '用我的情境幫我記' })).toBeEnabled()
    )
  })
})
