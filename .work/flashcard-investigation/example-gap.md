# 閃卡例句缺口與個人化能力

## 結論

有兩個不同問題：

1. 靜態 IM 英文閃卡本身大量缺例句。
2. 專案已有個人化例句與記憶連結功能，但目前只接在查詞流程，沒有接到靜態閃卡答案面。

## 資料快照

對目前工作樹 `public/data/flashcards.json` 的 `im-english` 卡，以 `【例句】`／`例句：` 判定：

| tier | 總數 | 有例句 | 缺例句 |
| --- | ---: | ---: | ---: |
| must_know | 17 | 1 | 16 |
| important | 302 | 22 | 280 |
| worth_studying | 2,046 | 1,127 | 919 |
| domain | 2,371 | 635 | 1,736 |
| 合計 | 4,736 | 1,785 | 2,951 |

整體缺例句約 62.3%；核心 `must_know + important` 319 張中有 296 張缺例句，約 92.8%。

## 現有畫面為何補不起來

- 靜態卡使用 `VocabAnswer`，只解析卡片 `answer` 內現成的 `【例句】`，沒有呼叫詞條 API：`src/components/flashcard/vocab-answer.tsx:21-60,72-88`。
- 只有使用者自己收藏的 lexicon 卡走 `LexiconReviewAnswer`；它會 GET `/api/lexicon` 取通用快取詞條：`src/components/lexicon/lexicon-review-answer.tsx:19-53`。
- 這個 GET 明確只回通用 `entry`，`personal` 固定為 false：`src/app/api/lexicon/route.ts:43-64`。
- 個人化內容只有 POST `/api/lexicon` 並帶 `persona` 才會讀取或生成：`src/app/api/lexicon/route.ts:71-78,127-153`。
- 查詞頁的 `LookupPanel` 在有 persona 時走 POST，並呈現 `PersonalBridge`：`src/components/lexicon/lookup-panel.tsx:43-82,156-162`。

因此現在「查詞頁可以個人化，靜態閃卡頁不行」。

## 已有的個人化能力

persona 包含：

- 職業／領域
- 興趣
- 學英文的目的

表單：`src/components/lexicon/persona-form.tsx:14-25,46-125`。

生成規則要求兩句真正貼近工作／興趣的例句、中文翻譯，以及一句生活連結 mnemonic；不是只把通用例句換主詞：`src/lib/lexicon/prompts.ts:31-48,55-66`。

個人化結果依 `headword + persona hash` 存在 D1，可在之後複習時穩定重用：`src/lib/lexicon/normalize.ts:59-77`, `src/lib/lexicon/store.ts:101-130`。

## 建議整合方式

答案面保留兩層，避免 AI 個人化內容取代可信字義：

1. **通用層**：字義、詞性、至少一個自然例句；缺例句時從通用 lexicon cache 補上。
2. **跟你的連結**：依 persona 顯示兩句熟悉情境例句與 mnemonic，明確標示為個人化／AI 生成。

不要一次替 4,736 張全部生成，避免成本與大量無用內容：

- 翻開缺例句卡、按「不會」，或使用者主動按「用我的情境解釋」時才生成。
- 先 GET 通用快取；個人化需要時才 POST。
- 快取後每次複習顯示同一組例句，避免記憶線索一直變。
- persona 改變後產生新的 hash／版本，不覆蓋舊情境。
- 可提供「換個情境」和「這個例句不自然」回饋，但不要默默每次重生成。
