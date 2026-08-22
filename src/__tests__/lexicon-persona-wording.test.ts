/**
 * @jest-environment node
 */
import { preservePersonaWording } from '@/lib/lexicon/persona-wording'
import type { PersonalBridge } from '@/types/lexicon'

const bridge: PersonalBridge = {
  headword: 'exacerbate',
  examples: [
    {
      en: 'Poor testing could exacerbate the risk while rock climbing.',
      zh: '攀巖裝備的測試不當可能加重攀巖風險。',
    },
  ],
  mnemonic: '記得攀巖時先檢查裝備。',
}

describe('preservePersonaWording', () => {
  it('模型內容維持臺灣正規化，但 persona 原詞不被 OpenCC 改寫', () => {
    expect(
      preservePersonaWording(bridge, {
        work: '軟體工程師',
        interests: ['攀岩'],
        goal: '工作上使用',
      })
    ).toEqual({
      ...bridge,
      examples: [{ ...bridge.examples[0], zh: '攀岩裝備的測試不當可能加重攀岩風險。' }],
      mnemonic: '記得攀岩時先檢查裝備。',
    })
  })

  it('同時支援工作、目標與興趣，較長詞組優先恢復', () => {
    const result = preservePersonaWording(
      {
        ...bridge,
        examples: [{ en: 'Example.', zh: '攀巖教練帶領攀巖課程。' }],
        mnemonic: '你的攀巖教練目標與攀巖興趣。',
      },
      {
        work: '攀岩教練',
        interests: ['攀岩'],
        goal: '攀岩教練目標',
      }
    )

    expect(result.examples[0].zh).toBe('攀岩教練帶領攀岩課程。')
    expect(result.mnemonic).toBe('你的攀岩教練目標與攀岩興趣。')
  })

  it('沒有會被 OpenCC 改寫的 persona 詞時保留原物件', () => {
    expect(
      preservePersonaWording(bridge, {
        work: '後端工程師',
        interests: ['登山'],
      })
    ).toBe(bridge)
  })
})
