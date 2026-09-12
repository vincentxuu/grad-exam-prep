# Personalized flashcard examples：測試盤點與 focused matrix

## 結論

最穩定、最容易落地的做法，是把「靜態卡例句補充／個人化橋接」做成一個可獨立測試的 client component，再由複習模式與瀏覽模式共用。不要以 `FlashcardsPage` 當主要測試邊界：該頁同時依賴 Next `use(params)`、query state、localStorage、flashcard API、語音 hook、SRS 與大量資料，整頁測試會需要太多無關 mock，且難以精準證明「翻面不會偷偷花配額」。

建議測試分四層：

1. 新 enrichment component：驗證 cache-only GET、明確觸發 POST、persona gate、錯誤／重試與呈現。
2. API route contract：驗證 cached flags、配額與 personal generation 邊界。
3. 一個很薄的 flashcard wiring regression：確認 browse／review 都傳入同一個 headword、persona 與「靜態卡已有例句」訊號。
4. accessibility assertions：以 role/name/live region 驗證狀態，不測 Tailwind class 或 DOM snapshot。

## 現有測試環境與慣例

- Jest 30 + `next/jest`，預設 `jest-environment-jsdom`；`src/__tests__/*.test.ts(x)` 會被收進來：`jest.config.js:1-18`。
- setup 只有 `@testing-library/jest-dom`：`jest.setup.js:1`。沒有全域 fetch mock、localStorage reset、MSW 或 fake timers。
- React component 測試目前偏 focused render + semantic query，例如 `src/__tests__/vocab-answer.test.tsx:11-32` 用 `getByRole` 驗證 TTS 按鈕。
- 專案沒有 `@testing-library/user-event`；若不新增依賴，互動可用 `fireEvent.click`，非同步結果用 `findByRole`／`findByText` 或 `waitFor`。
- fetch 測試的最佳現有範例是 dependency injection：`src/__tests__/llm-models.test.ts:11-13,35-97` 建立 `jsonResponse()` 並把 `fetchImpl` 傳入。React 元件目前沒有 fetch mock 慣例。
- route 測試使用檔案頂端 `@jest-environment node`，並 mock `@opennextjs/cloudflare`，可參考 `src/__tests__/tts-route.test.ts:1-10`。
- persona 已由 `preferences.persona` 保存，且 export/import regression 已在 `src/__tests__/saved-words.test.ts:152-163` 涵蓋；新 UI 測試不必重測 storage serialization。
- baseline focused suite 已執行：`vocab-answer.test.tsx`、`lexicon-store.test.ts`、`saved-words.test.ts`，共 28 tests，全數通過。

## 現況中和本功能直接相關的測試缺口

1. `VocabAnswer` 只測「原卡已有例句」的解析與朗讀，沒有缺例句分支，也沒有任何 enrichment 行為。
2. `LexiconReviewAnswer` 有 module-level `Map` cache，會 GET `/api/lexicon`，但目前完全沒有 component test：`src/components/lexicon/lexicon-review-answer.tsx:7-51`。
3. `LookupPanel` 已有「persona 時 POST、無 persona 時先 GET」的請求規則，但也沒有 component test：`src/components/lexicon/lookup-panel.tsx:43-82`。
4. `PersonalBridge` 沒有 render／TTS／heading 測試：`src/components/lexicon/personal-bridge.tsx:16-44`。
5. `/api/lexicon` 只有 store 與 normalize tests，沒有 route contract tests；因此 `cached.personal`、quota spend 次數、個人化失敗降級等關鍵行為未被鎖住。
6. browse 與 review 各自有一段 answer renderer：`src/app/[exam]/flashcards/page.tsx:278-295,550-577`。若直接各改一次，容易只接上一邊而沒有測到另一邊。

## 建議可落地的測試位置

### A. 首要：`src/__tests__/flashcard-example-enrichment.test.tsx`

對新的共用元件做大部分行為測試。建議元件介面明確接受：

- `headword`
- `hasStaticExample`
- `persona`
- `speak` / `speakingId`
- 可選的 `fetchImpl`（預設為 `fetch`）

將 `fetchImpl` 注入可沿用現有測試風格，免改全域，也不會讓平行 tests 互相污染。如果產品實作不想暴露 prop，至少在 test 中保存／恢復 `globalThis.fetch`，並在 `afterEach` 呼叫 `jest.restoreAllMocks()`。

### B. 呈現：`src/__tests__/personal-bridge.test.tsx`

只測 `PersonalBridge` 的語意結構與 speak callback。若 enrichment test 已完整覆蓋這些，可合併而不另開檔。

### C. API：`src/__tests__/lexicon-route.test.ts`

使用 `@jest-environment node`。mock：

- `@opennextjs/cloudflare`
- `@/lib/lexicon/store`
- `@/lib/lexicon/generate`
- `@/lib/llm/config`
- 必要時 `@/lib/auth`

以 `NextRequest` 呼叫 `GET`／`POST`。此檔只測 route orchestration；persona hashing 與 D1 persistence 已分別由 `lexicon-normalize.test.ts`、`lexicon-store.test.ts` 負責。

### D. 既有 regression：`src/__tests__/vocab-answer.test.tsx`

保留既有三個案例，新增「answer 沒有 `【例句】` 時仍顯示可信字義，不捏造例句」即可。個人化請求不應塞進 `VocabAnswer` 的 parser test。

### E. 薄 wiring test（只有拆出共用 answer surface 後才做）

建議把 browse／review 共用的答案內容抽成例如 `FlashcardAnswerSurface`，放 `src/components/flashcard/`，測試檔為 `src/__tests__/flashcard-answer-surface.test.tsx`。它只需證明：

- vocabulary content card 會同時 render `VocabAnswer` 與 enrichment；
- lexicon saved-word card 仍走既有 `LexiconReviewAnswer`，不重複 render 兩份詞條；
- 非英文／非 vocabulary 卡不出現個人化例句 action。

若不抽 component，就不建議為了測試 export `FlashcardsContent` 或 `CardRow`；那會把頁面實作細節變成測試 API。

## Focused component test matrix

| Priority | Scenario | Setup / action | Must assert |
| --- | --- | --- | --- |
| P0 | 翻開缺例句卡不自動生成 | render missing-example card；GET 可 404 | 沒有任何 POST；個人化 action 可見 |
| P0 | GET 命中通用 cache | GET 200，entry 有 general／academic example | 顯示通用例句與中文；`cached entry` 不觸發 POST |
| P0 | 明確點擊才生成 personal | persona 非空；click `用我的情境解釋`；POST 200 | POST 恰一次，body 精確為 `{ term: headword, persona }`；顯示「跟你的連結」、兩句與 mnemonic |
| P0 | 無 persona 不生成 | persona undefined 或 work/interests 都空；click action | POST 0 次；顯示可操作的「設定個人化情境」連結／按鈕 |
| P0 | 靜態原例句不被取代 | 原卡已有例句，再載入 generic/personal | 原例句仍在；新內容是額外區塊；不能只剩 AI 內容 |
| P0 | 429 配額錯誤 | POST 回 `{ error, quota }` + 429 | 顯示 API 中文訊息；保留原字義／例句；可重試但不自動重試 |
| P0 | 網路錯誤與 retry | 第一次 reject，第二次 resolve | `role=alert` 顯示可理解訊息；點重試後 POST 總共 2 次並成功顯示 |
| P1 | generic cache miss 是正常空狀態 | GET 404 | 不顯示「詞條讀取失敗」式災難訊息；仍可手動 personal generate |
| P1 | GET 500／malformed response | GET 非 2xx 或缺 `entry` | UI 不 crash；個人化按鈕仍依產品決策可用；不自動 POST |
| P1 | personal response 無 personal | POST 200 但只有 entry（generator 降級） | 通用內容保留；告知暫時無法產生個人化內容，不把它當成功 |
| P1 | quota metadata | POST 成功帶 `quota: { used, limit }` | 顯示「今日已用 n/limit」或等價資訊，不誤稱剩餘量 |
| P1 | TTS callback | click 通用／個人化例句播放鍵 | `speak` 收到精確英文句與穩定 id；不同例句 id 不重複 |
| P1 | headword 變更時忽略舊 response | A request pending，rerender B，先 resolve A | 不把 A 的例句畫在 B 卡；B 最終只顯示 B response |
| P1 | unmount pending request | request pending 後 unmount／resolve | 無 state update warning；若使用 AbortController，驗證 signal aborted |
| P2 | 同 headword session cache | mount、成功、unmount、再 mount 同字 | 若產品承諾 session cache，第二次不重打；否則不鎖實作細節 |
| P2 | persona 改變 | rerender 不同 persona 後 explicit click | POST 使用新 persona；舊 personal bridge 不冒充新 persona 的結果 |

### 測試資料建議

使用小型固定 fixture，不讀 4,736 張 production JSON：

- headword：`mitigate`
- static answer：`【意思】減輕；緩和`（故意無例句）
- generic：一個 exam 或 academic example
- personal：工程情境與登山情境各一句，附中文與 mnemonic

如此可明確分辨「通用層」和「跟你的連結」，也不會讓 generated card id 或大型資料異動使 component tests 失效。現有 `vocab-answer.test.tsx:4-8` 也已採用不依賴 production generated ID 的原則。

## Focused API route matrix

| Priority | Request state | Expected orchestration |
| --- | --- | --- |
| P0 | POST；entry cached + personal cached | `generateEntry`／`generatePersonal`／quota increment 全為 0；`cached` 兩者 true |
| P0 | POST；entry cached + personal missing | 只 spend 一次、只 generate personal；entry 不重生成；`cached.entry=true, personal=false` |
| P0 | POST；entry missing + personal missing | 各生成一層並各 spend 一次；回完整 response |
| P0 | POST；空 persona | 不讀／不生成 personal；不為 personal 花 quota |
| P0 | quota exhausted before personal | 429 與 quota payload；不呼叫 generator／putPersonal |
| P1 | personal generation failure | route 仍 200 回 generic entry、不寫 personal；UI 能辨認 personal 缺席 |
| P1 | GET cached entry | 200，只回 generic；不讀 personal、不計 quota |
| P1 | GET miss | 404；不生成 |
| P1 | normalized inflected alias hit | 查詢字可由 store 回 lemma entry；response headword 保持 lemma |

注意：現有 POST 對「通用 entry 生成成功、接著 personal 遇到 quota exhausted」會整筆回 429，即使通用 entry 已經寫入。這是現有 route 行為；測試前應由產品決定要鎖住它，或改為像 personal generation failure 一樣降級回 generic entry。不要讓測試無意中替未決 UX 做決策。

## Accessibility acceptance criteria

新功能最低應鎖住以下語意，不只靠顏色／文字是否存在：

- 個人化觸發器是 `button`，accessible name 明確，例如「用我的情境解釋 mitigate」。
- 沒 persona 時的設定入口是可鍵盤操作的 `link` 或 `button`，而非純文字提示。
- loading 容器使用 `role="status"` 或 `aria-live="polite"`，有可讀文字「正在載入例句」／「正在產生個人化例句」；目前 `LexiconReviewAnswer` skeleton 沒有任何 accessible status（lines 64-69）。
- error 使用 `role="alert"`；目前 `LookupPanel` error 只有一般 `div`（lines 147-153）。
- 觸發按鈕於 request 中 disabled 並帶 `aria-busy`（或 live status），避免重複送出配額請求。
- 通用例句與 personal bridge 各有 heading；personal 既有「跟你的連結」heading 可保留。
- 多個播放鍵要有可區分名稱，例如「播放個人化例句 1」／「播放通用例句 1」。目前 `PersonalBridge` 每一個都叫「播放例句」（lines 21-30），畫面上有兩句時 screen reader 無法辨識。
- 新內容出現後不強制搶走 focus；live region 宣告完成即可。發生錯誤後 focus 可留在 retry action 附近。
- action 必須在卡片 toggle button 外面，避免 button-in-button。現有 expanded answer 是 toggle button 的 sibling（`flashcards/page.tsx:548-550`），在該區放 action 是安全位置。
- 如果 generic cache miss 是預期狀態，不應用 `role=alert`；只有真正的生成／網路失敗才 alert，避免大量新卡製造警報噪音。

## Mock 與 isolation 實作提醒

建議每個 component test 都明確處理：

```ts
afterEach(() => {
  jest.restoreAllMocks()
  localStorage.clear()
})
```

若採 global fetch：

```ts
const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})
```

但更建議 `fetchImpl` injection，因為它與 `llm-models` 現有慣例一致，也能用 `toHaveBeenNthCalledWith` 精確驗證 GET／POST 順序。

`LexiconReviewAnswer` 的 module cache 目前無 reset API。若直接為它寫 tests：

- 每個 test 使用不同 headword，或
- 把 cache 抽成可注入 request/cache helper，或
- 僅在 test build export 一個清理函式（較不推薦）。

不要只靠 `jest.clearAllMocks()`；它不會清 Map，也不會還原替換過的 `globalThis.fetch`。

對 deferred promises，測試只需在外部保存 resolver，不用 fake timers。若產品實作加入 debounce 或延遲 retry，再局部使用 modern fake timers，並在 test 結束恢復 real timers。

## 最小 ship gate

功能合併前至少跑：

```bash
npm test -- --runInBand \
  src/__tests__/vocab-answer.test.tsx \
  src/__tests__/flashcard-example-enrichment.test.tsx \
  src/__tests__/lexicon-route.test.ts \
  src/__tests__/lexicon-store.test.ts \
  src/__tests__/lexicon-normalize.test.ts \
  src/__tests__/saved-words.test.ts
npm run typecheck
npm run lint
```

若這次不改 `/api/lexicon`，`lexicon-route.test.ts` 可先降為 strongly recommended，但 P0 component tests 仍需全部存在；它們才直接證明「只有使用者明確點擊才生成、靜態內容不被取代、配額錯誤可恢復」。
