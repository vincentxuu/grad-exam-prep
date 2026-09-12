# pp-im-en-111 Q26/Q31 補文詞彙審核

## 範圍與規則

- 只審核 Q26、Q31 此次補回的句子，不擴張到整卷重建。
- 依 `ntu-im-vocab-master.json.metadata.tierLogic`：文章中實際出現、且不是英文前 2000 高頻基本字的詞，列為 `worth_studying`；普通基本字排除／維持 `skip`。
- 規則形態變化回到 lemma：`undercuts -> undercut`、`lobbed -> lob`、`releases -> release`、`manuals -> manual`。
- 衍生詞若詞性或意義獨立則保留自己的 dictionary headword。現有字庫本來就同時保留 `coherent/coherently`、`significant/significantly`，因此 `plausibly` 不應硬併到 `plausible`。

所有建議納入項目的共同 provenance：

```json
{
  "source": "english-exam",
  "englishExam": {
    "tier": "supplementary",
    "frequency": 1,
    "years": [111],
    "yearSpread": 1,
    "isChoiceWord": false,
    "sources": ["passage"]
  },
  "tier": "worth_studying",
  "totalFrequency": 1
}
```

## 建議新增的 lemma / headword

| headword | Q | 詞性 | 建議中文 | tier | 理由 |
|---|---:|---|---|---|---|
| `prompt` | 26 | n | 提示詞；（給 AI 的）指令 | worth_studying | AI 語境的核心名詞，非此處的「迅速的」形容詞義；目前 master 無此詞。category 建議 `technology`。 |
| `plausibly` | 26 | adv | 看似合理地；似乎可信地 | worth_studying | 修飾 `follow`，是有獨立教學價值的學術副詞。既有 `plausible` 不應取代副詞 headword。category 建議 `academic/general`。 |
| `press release` | 26 | n | 新聞稿；新聞發布稿 | worth_studying | 固定媒體／商務複合名詞；以單數 phrase 收錄，不新增複數 `press releases`。既有 `press`、`release` 各自無法直接表達此固定義。category 建議 `business/media`。 |
| `frightening` | 26 | adj | 令人害怕的；嚇人的 | worth_studying | 在 `It's hilarious and frightening` 中為造成恐懼的形容詞。既有 `frightened` 是「感到害怕的」，語意角色不同，不能當 alias。category 建議 `academic/general`。 |
| `self-deprecating` | 31 | adj | 自嘲的；自我貶抑的 | worth_studying | 固定且高價值的性格／修辭形容詞。既有 `deprecate` 的「反對、貶低」不足以覆蓋此複合詞義。category 建議 `academic/general`。 |
| `undercut` | 31 | v | 削弱；暗中損害 | worth_studying | `undercuts any similar jokes` 是抽象／比喻義；以原形收錄，不新增 `undercuts`。category 建議 `academic/general`。 |
| `lob` | 31 | v | 拋；（向某人）拋出／丟出批評或玩笑 | worth_studying | `jokes lobbed at them` 使用非字面、新聞常見的動詞義；以原形收錄，不新增 `lobbed`。category 建議 `academic/general`。 |

## 已存在但應更新 provenance / tier

| 既有 headword | 目前狀態 | 建議 |
|---|---|---|
| `hilarious` | `gre_extra`, `gre-online`，中文空白 | 因 Q26 真題文章已實際出現，升為 `worth_studying`、source 改為 `english-exam` 並保留 GRE 標記；補中文「非常好笑的；滑稽的」、pos `adj`、Q26 passage provenance。 |
| `launch` | `domain`, source `domain` | Q31 的 `launch self-deprecating jokes` 是一般英文的比喻義。建議 source 合併為 `both`，加入 Q31 passage provenance；tier 依「文章出現且非基本字」升為 `worth_studying`，中文可補「發起；推出；發射」、pos `v/n`。 |

`plausible`（worth_studying / GRE）與 `deprecate`（worth_studying / GRE）可保留原項目；它們只是相關詞，不是此次表面詞形的 canonical replacement。

## 建議排除或不新增

| 表面詞／詞組 | 處理 | 原因 |
|---|---|---|
| `gotten` | 不新增；lemma `get` 亦不建卡 | A1 高頻基本動詞，符合 `skip` 邏輯。 |
| `write`, `add`, `follow`, `song`, `story`, `future`, `move`, `often`, `joke` | 不新增 | 高頻基本字；其中數個已在 master 以 domain/skip 等狀態存在，不需要因補文另建 headword。 |
| `guitar` | 不新增 | 基本具體名詞，且只在範例清單中偶發，不具備考辨識價值。 |
| `guitar tab` / `tabs` | 不新增 | `tab` 在此是 `tablature` 的口語縮寫，屬非常狹窄的音樂記譜詞；整個 phrase 是清單中的 incidental example，不宜擴張成必要字卡。 |
| `interview` | 不新增 | 常見基本名詞／動詞，應視為 skip。 |
| `manuals` | 不新增 | 正規 lemma `manual` 已存在且 tier=`skip`；維持現有判定。 |
| `similar` | 不新增 | 已存在且 tier=`skip`；維持現有判定。 |
| `releases` | 不新增複數 lemma | 使用單數固定詞組 `press release`；`release` 本身已存在。 |
| `undercuts`, `lobbed` | 不新增屈折詞形 | 分別 canonicalize 為 `undercut`、`lob`。 |
| `jokes` | 不新增複數 lemma | canonical 是基本字 `joke`，應排除／skip。 |

## 實作注意事項

1. 新增 7 個 required headwords：`prompt`, `plausibly`, `press release`, `frightening`, `self-deprecating`, `undercut`, `lob`。
2. 更新 2 個既有 headwords：`hilarious`, `launch`。
3. `findAuthenticExample` 目前只做 exact headword match，因此 `undercut` 找不到文章中的 `undercuts`、`lob` 找不到 `lobbed`；要嘛在 curation override 提供 Q31 原句，要嘛讓 example lookup 支援基本屈折變化。不要為了配合 exact match 而建立錯誤的 `undercuts`／`lobbed` 卡。
4. `press release` 的原文是複數 `press releases`，同樣需要 override example 或 phrase plural matching。
5. `frightening` 與 `frightened`、`self-deprecating` 與 `deprecate` 必須保留不同中文義，避免 family 合併造成語意錯卡。
