import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
      // flashcard 只渲染例句，不用等一份完整辭典詞條
      mode: 'examples',
      persona: { work: '軟體工程師', interests: ['攀岩'], goal: '工作上使用' },
    })
  })

  it('網路層失敗時顯示看得懂的中文，不是瀏覽器的 "Load failed"', async () => {
    // Safari 的 fetch 在連線被切斷時就是丟這個
    const fetchImpl = jest.fn(async () => {
      throw new TypeError('Load failed')
    })

    render(
      <FlashcardExampleSupport
        {...baseProps}
        headword="mitigate-network-test"
        hasEmbeddedExample
        persona={{ work: '軟體工程師', interests: [] }}
        fetchImpl={fetchImpl as unknown as typeof fetch}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '用我的情境幫我記' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('連線中斷')
    expect(alert).not.toHaveTextContent('Load failed')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '用我的情境幫我記' })).toBeEnabled()
    )
  })

  it('回應不是 JSON 時不會把解析錯誤丟到畫面上', async () => {
    // edge 回 HTML 錯誤頁的情況
    const fetchImpl = jest.fn(
      async () =>
        ({
          ok: false,
          status: 502,
          json: async () => {
            throw new SyntaxError('Unexpected token <')
          },
        }) as unknown as Response
    )

    render(
      <FlashcardExampleSupport
        {...baseProps}
        headword="mitigate-html-test"
        hasEmbeddedExample
        persona={{ work: '軟體工程師', interests: [] }}
        fetchImpl={fetchImpl as unknown as typeof fetch}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '用我的情境幫我記' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('伺服器錯誤（502）')
  })

  it('等太久就自己放棄，並留下可重試的狀態', async () => {
    jest.useFakeTimers()
    try {
      // 永遠不 resolve，但要能被 abort
      const fetchImpl = jest.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError'))
            )
          })
      )

      render(
        <FlashcardExampleSupport
          {...baseProps}
          headword="mitigate-timeout-test"
          hasEmbeddedExample
          persona={{ work: '軟體工程師', interests: [] }}
          fetchImpl={fetchImpl as unknown as typeof fetch}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: '用我的情境幫我記' }))
      expect(screen.getByRole('button', { name: '正在連結你的情境…' })).toBeDisabled()

      await act(async () => {
        jest.advanceTimersByTime(60_000)
      })

      expect(screen.getByRole('alert')).toHaveTextContent('等太久')
      expect(screen.getByRole('button', { name: '用我的情境幫我記' })).toBeEnabled()
    } finally {
      jest.useRealTimers()
    }
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
