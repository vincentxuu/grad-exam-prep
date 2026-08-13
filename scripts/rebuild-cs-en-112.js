#!/usr/bin/env node
// 資料修復：pp-cs-en-112（112 學年度 英文(A)，題號 8）
//
// 原始狀態有兩個問題：
//   1. 第 1–10 題裝的根本不是英文題，而是離散數學／線性代數的題目（顯然是抽題時
//      抓錯 PDF，與 rebuild-cs-papers-108-110-112.js 修過的是同一類錯誤）。
//      這 10 題與 pp-cs-math-112 的題目也不完全相同，無法判定原屬哪一份卷子，
//      因此直接從英文卷移除，不做搬移。
//   2. 第 11–35 題整段缺漏，全卷只剩 25 題。
//
// 題目文字逐字轉錄自本 repo 既有的原卷頁面圖檔：
//   public/images/papers/pp-cs-en-112/page-1.jpg → I. Vocabulary and Phrases，第 1–20 題
//   public/images/papers/pp-cs-en-112/page-2.jpg → II. Cloze Test，Passage A(21–30)、Passage B(31–35)
// （台大圖書館網域在本工作環境被 egress policy 擋下，無法重抓 PDF，故以圖檔為準。）
//
// 版面慣例對齊 pp-cs-en-114：英文卷 points 為 null、克漏字整篇文章掛在該組第一題並
// 以「Passage X: Questions M-N」標頭帶出（src/lib/content.ts 的 PASSAGE_RANGE_RE 靠這行分組）。
//
// 第 36–50 題（三篇閱讀測驗）維持原樣：原卷第 3–6 頁沒有圖檔、PDF 也抓不到，
// 文章本體仍然缺漏，這批題目的既有解答是在沒有文章的情況下推測出來的。

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
}
function save(file, data) {
  fs.writeFileSync(path.join(dataDir, file), `${JSON.stringify(data, null, 2)}\n`)
}

// ---------------------------------------------------------------- 第 1–20 題

const VOCAB_HEADER =
  'I. Vocabulary and Phrases (40%): Choose the word that BEST completes the sentence.'

// [題幹, 選項, 答案, 詳解]
const VOCAB = [
  [
    'Most of her poems ___ in imagery.',
    '(A) abound (B) abandon (C) abate (D) able',
    'A',
    '本題考查動詞語意。abound in／with 意為「充滿、富含」，主詞為 poems，句意為「她的詩作充滿意象」。(B) abandon 是「拋棄」，且為及物動詞，後面不接 in。(C) abate 是「減弱、緩和」，語意相反。(D) able 是形容詞而非動詞，詞性就不合。故選 (A)。',
  ],
  [
    '___ attacks are those that may strike legitimate targets and civilians without distinction.',
    '(A) Identification (B) Incidental (C) Indiscriminate (D) Inactive',
    'C',
    '空格修飾 attacks，需要形容詞。句尾 without distinction（不加區別）是關鍵線索，indiscriminate 正是「不分青紅皂白的、無差別的」。(A) Identification 是名詞「識別」。(B) Incidental 是「附帶的、偶發的」，與「不加區別攻擊平民」的語意不符。(D) Inactive 是「不活躍的」。故選 (C)。',
  ],
  [
    "The visitor looks very suspicious hanging around by the bins. Let's keep a ___ eye on him.",
    '(A) vigilant (B) violent (C) vulnerable (D) voluntary',
    'A',
    'keep a vigilant eye on someone 是固定搭配，意為「對某人保持警戒、盯緊」。前句說訪客在垃圾桶旁徘徊很可疑，因此要「警覺地」盯著他。(B) violent 暴力的、(C) vulnerable 脆弱的、(D) voluntary 自願的，皆無法與 eye 搭配成合理語意。故選 (A)。',
  ],
  [
    'The museum ___ a collection of Roman sculptures.',
    '(A) horses (B) hoses (C) hales (D) houses',
    'D',
    '本題考查 house 當動詞的用法：「容納、收藏（展品、機構）」，博物館「收藏」一批羅馬雕塑。四個選項拼字相近是典型陷阱：(A) horses 馬、(B) hoses 以水管沖洗、(C) hales 硬拉（罕用），皆與博物館收藏無關。故選 (D)。',
  ],
  [
    'I tend to ___ on ice cream when I am lonely.',
    '(A) break (B) binge (C) bond (D) boil',
    'B',
    'binge on something 意為「暴飲暴食、狂吃某物」，符合「寂寞時就狂嗑冰淇淋」的語意。(A) break on 無此搭配。(C) bond 是「建立情感連結」，bond over food 才是常見說法。(D) boil 是「煮沸」。故選 (B)。',
  ],
  [
    'The chimney ___ thick smoke into the air.',
    '(A) emitted (B) emergent (C) escalated (D) eternal',
    'A',
    '空格需要及物動詞的過去式，emit 意為「排放、散發」，煙囪「排放」濃煙。(B) emergent（新興的）與 (D) eternal（永恆的）是形容詞，詞性不合。(C) escalated 是「升高、加劇」，不能直接接 smoke 當受詞。故選 (A)。',
  ],
  [
    'Coriander is ___ to southern Europe.',
    '(A) impassive (B) indigenous (C) indiscreet (D) indirect',
    'B',
    'be indigenous to + 地點 是固定用法，意為「原產於、原生於某地」，香菜原產於南歐。(A) impassive 面無表情的、(C) indiscreet 不謹慎的、(D) indirect 間接的，皆不與 to + 地點搭配表示原產地。故選 (B)。',
  ],
  [
    'Only a few people have ___ to the full facts of the case.',
    '(A) archive (B) accuse (C) access (D) academy',
    'C',
    'have access to 是固定搭配，意為「有取得／接觸的管道」，句意為「只有少數人能接觸到本案的全部事實」。(A) archive 檔案庫、(D) academy 學院，語意不合且無此搭配。(B) accuse 是動詞「指控」，have accuse 文法上不成立。故選 (C)。',
  ],
  [
    '___ of mosquitoes from gutters invaded our village every twilight.',
    '(A) Monstrous (B) Minerals (C) Myriads (D) Migrations',
    'C',
    'myriads of + 複數名詞意為「無數的、成群的」，句意為「每到黃昏，無數蚊子從水溝湧入村子」。(A) Monstrous 是形容詞「巨大的、可怕的」，不能接 of 當主詞。(B) Minerals 礦物語意不通。(D) Migrations of mosquitoes 語意勉強但搭配 invaded 與 every twilight 不自然，且未表達「數量龐大」這個重點。故選 (C)。',
  ],
  [
    'Hydrogen is a ___ of all organic compounds.',
    '(A) competition (B) compartment (C) company (D) component',
    'D',
    'component 意為「組成成分」，氫是所有有機化合物的組成元素之一。四個選項同樣以 com- 開頭形成干擾：(A) competition 競爭、(B) compartment 隔間、(C) company 公司／陪伴，皆與化學組成無關。故選 (D)。',
  ],
  [
    'He ___ doing anything wrong.',
    '(A) requests (B) denied (C) claims (D) maintains',
    'B',
    '本題考查動詞後接動名詞的用法。deny 後面接動名詞（deny doing something），意為「否認做過某事」。(A) request 後接 that 子句或不定詞。(C) claim 與 (D) maintain 表達「聲稱、主張」時後面要接 that 子句或不定詞（claim to have done），不能直接接動名詞。故選 (B)。',
  ],
  [
    'Mary got two job offers. ___ she accepted.',
    '(A) much of which (B) both of whom (C) most of whose (D) neither of which',
    'D',
    '本題考查「數量詞 + of + 關係代名詞」。先行詞 two job offers 是事物且為兩者，關係代名詞須用 which，故排除指人的 (B) both of whom 與所有格的 (C) most of whose。(A) much of which 用於不可數名詞，與 two offers 不合。兩者皆不的 neither of which 語意與數量都相符。故選 (D)。',
  ],
  [
    'Henry got sick the day he ___ his new job.',
    '(A) was to start (B) was started (C) will start (D) starts',
    'A',
    'be to + 原形動詞表示「預定要做某事」，過去式 was to start 意為「原本預定要開始」，與主句過去式 got sick 時態一致，句意為「亨利在原訂要上新工作的那天病倒了」。(B) was started 是被動語態，job 才是被開始的東西，主詞 he 不合。(C)(D) 為現在／未來式，與過去式主句時態衝突。故選 (A)。',
  ],
  [
    'Neither of the students ___ that both mystery writer Agatha Christie and inventor Thomas Edison were dyslexic.',
    '(A) are knowing (B) know (C) knows (D) is known',
    'C',
    'neither of + 複數名詞當主詞時視為單數，動詞須用第三人稱單數，故 (B) know 不合。(A) know 是狀態動詞，一般不用進行式，且 are 也與單數主詞衝突。(D) is known 是被動語態，但 know 在此有受詞子句，須用主動。故選 (C)。',
  ],
  [
    'An earthquake ___ last night.',
    '(A) occurs (B) occurred (C) was occurred (D) has occurred',
    'B',
    '時間副詞 last night 指明確的過去時間點，須搭配過去簡單式。(A) occurs 是現在式。(D) has occurred 為現在完成式，不能與明確過去時間並用。(C) was occurred 錯在 occur 是不及物動詞，沒有被動語態。故選 (B)。',
  ],
  [
    'I am not sure ___ you agree with his theory.',
    '(A) to what extent (B) as regards (C) on the whole (D) by means of which',
    'A',
    '空格後為完整子句 you agree with his theory，需要能引導名詞子句的疑問片語。to what extent 意為「到什麼程度」，句意為「我不確定你認同他的理論到什麼程度」。(B) as regards（關於）後接名詞。(C) on the whole（整體而言）是副詞片語，不能引導子句。(D) by means of which 是關係子句用法，此處無先行詞。故選 (A)。',
  ],
  [
    'She wrote an excellent essay ___ with a certain amount of help.',
    '(A) even so (B) as well as (C) albeit (D) despite the fact',
    'C',
    'albeit 意為「儘管、雖然」，後面可直接接介系詞片語或形容詞（albeit with help／albeit slowly），是本句最精簡自然的接法。(A) even so 是「即使如此」，用於句首連接兩句。(B) as well as 表示「以及」，語意不含讓步。(D) despite the fact 後面必須接 that 子句。故選 (C)。',
  ],
  [
    'He is a great poet ___ his work has had a great influence on other writers.',
    '(A) apart from (B) provided that (C) on top of which (D) in the sense that',
    'D',
    'in the sense that 意為「就……這層意義而言」，用來說明前句成立的理由或角度：「就其作品深深影響其他作家這點而言，他是偉大的詩人」。(A) apart from 後接名詞或動名詞，不接子句。(B) provided that 表條件「只要」，語意不合。(C) on top of which 是關係子句，語意為「除此之外」，與因果說明的語境不符。故選 (D)。',
  ],
  [
    'It is hard to ___ between these two similar plants.',
    '(A) differ (B) different (C) differentiate (D) difference',
    'C',
    'to 之後需要原形動詞，且要能與 between 搭配。differentiate between A and B 意為「區分兩者」。(A) differ 雖是動詞，但 differ from 才是正確搭配，且語意為「與……不同」，主詞應是被比較的事物本身。(B) different 是形容詞、(D) difference 是名詞，詞性皆不合。故選 (C)。',
  ],
  [
    'I am afraid my English ___ poorly with hers.',
    '(A) competes (B) compares (C) combines (D) contributes',
    'B',
    'compare poorly／favorably with 是固定用法，意為「比起來遜色／出色」，句意為「我的英文比她的差多了」。(A) competes with 是「與……競爭」，主詞通常是人或組織，且不與 poorly 搭配成此語意。(C) combines with 是「與……結合」。(D) contributes to 是「有助於」，介系詞也不對。故選 (B)。',
  ],
]

// ---------------------------------------------------------------- 第 21–35 題

const CLOZE_HEADER =
  'II. Cloze Test (30%): Choose the BEST answer for each missing word or phrase in the following excerpted passages.'

const PASSAGE_A = `Passage A: Questions 21-30
The American songwriter Bob Dylan is often considered to be as much a poet as a musician. He (21) ___ his political ideas through folk songs in his early period. His melodies were often simple but his words (22) ___ complex messages often with subtle (23) ___. In one of his songs, he speaks of a "hard rain" which will fall after a nuclear war. On one level the words (24) ___ real, radioactive rain, but the (25) ___ of the words are many: life will be hard, perhaps impossible. Perhaps the consequences will fall hard on the politicians who started the war too. There are many things we can (26) ___ from these words. The song is part of the political (27) ___ of the Cold War of the 1960s. It (28) ___ an atmosphere of fear and hopelessness. Seen from the (29) ___ of the post-Cold-War era, it may seem difficult to (30) ___ such fear, but at the time, that fear was very real.`

const PASSAGE_B = `Passage B: Questions 31-35
Some linguists believe that we can best (31) ___ how language is processed by laboratory experiments. However, laboratory experiments are (32) ___ definition artificial and may not (33) ___ what happens in the real world. Other linguists believe, therefore, that empirical observation is better, and prefer to (34) ___ field studies and case studies of individuals in natural settings. In this way, in-depth data can be collected by observers without (35) ___ with the process in any way, even though this may be a more time-consuming method. However, individual studies in real situations may not be representative of the general population of second language learners. In short, both approaches have their advantages and disadvantages.`

// [選項, 答案, 詳解]
const CLOZE_A = [
  [
    '(A) excess (B) expressed (C) exceeded (D) existed',
    'B',
    '空格為本句主要動詞，主詞 He、時間為 in his early period（過去），受詞是 his political ideas。express ideas through songs 意為「透過歌曲表達理念」。(A) excess 是名詞「過量」。(C) exceeded 是「超過」，與 ideas 搭配不通。(D) existed 是不及物動詞，不能接受詞。故選 (B)。',
  ],
  [
    '(A) conveyed (B) convinced (C) confirmed (D) consented',
    'A',
    '主詞是 his words，受詞是 complex messages。convey a message 是固定搭配，意為「傳達訊息」，且與前半句 his melodies were often simple 形成「曲調簡單、歌詞卻承載複雜訊息」的對比。(B) convince 的受詞應是人（convince someone of something）。(C) confirm 是「證實」。(D) consent 是不及物動詞（consent to）。故選 (A)。',
  ],
  [
    '(A) nuances (B) minds (C) notions (D) fractions',
    'A',
    'with subtle ___ 用來修飾傳達訊息的方式，nuance 意為「細微差別、微妙之處」，與形容詞 subtle 是最自然的搭配，呼應歌詞表面簡單、意涵幽微。(B) minds 心智、(D) fractions 分數／片段，語意不合。(C) notions（概念）雖為名詞，但不與 subtle 構成「幽微的表達層次」這個慣用語意。故選 (A)。',
  ],
  [
    '(A) denoting (B) denoted (C) denote (D) are denoted',
    'C',
    '本句主要子句為 the words ___ real, radioactive rain，需要主動語態的限定動詞。全段描述歌詞的意涵時使用現在式（speaks、will fall、are many），主詞 the words 為複數，故用原形 denote。(A) denoting 是分詞，不能單獨當主要動詞。(B) denoted 時態與全段現在式不一致。(D) are denoted 為被動，但後面接了受詞 real rain，文法不成立。故選 (C)。',
  ],
  [
    '(A) criteria (B) contradictions (C) constructions (D) connotations',
    'D',
    '前半句說 on one level the words denote real rain（字面義），此處以 but 轉折，並列舉「人生艱難、或許無以為繼」等引申義，正是 connotation（言外之意、引申義）與 denotation（字面義）的經典對比。(A) criteria 標準、(B) contradictions 矛盾、(C) constructions 建構，皆無法與 denote 形成這組語意學上的對照。故選 (D)。',
  ],
  [
    '(A) imply (B) invent (C) impose (D) infer',
    'D',
    '主詞是 we（讀者），從歌詞「推論」出許多意涵，故用 infer（由既有資訊推論）。(A) imply 是「暗示」，主詞應為文本或說話者本身，是 infer 的反向動作，也是本題最常見的陷阱。(B) invent 是「發明」。(C) impose 是「強加」。故選 (D)。',
  ],
  [
    '(A) discipline (B) discourse (C) diversity (D) diploma',
    'B',
    'political discourse 意為「政治論述、政治話語」，句意為「這首歌是 1960 年代冷戰政治論述的一部分」。(A) discipline 學科／紀律、(C) diversity 多樣性、(D) diploma 文憑，皆無法與 political 組成描述時代言論氛圍的片語。故選 (B)。',
  ],
  [
    '(A) evokes (B) evolves (C) excludes (D) exports',
    'A',
    'evoke 意為「喚起（情緒、氛圍、記憶）」，evoke an atmosphere of fear 意為「營造／喚起恐懼氛圍」。(B) evolves 是「演化」，且多為不及物用法。(C) excludes 排除、(D) exports 出口，與 atmosphere 搭配不通。故選 (A)。',
  ],
  [
    '(A) percentage (B) perceptive (C) perspective (D) presentative',
    'C',
    'seen from the perspective of 是固定用法，意為「從……的角度來看」，此處指「從後冷戰時代的角度看」。(A) percentage 百分比。(B) perceptive 是形容詞「有洞察力的」，前面有冠詞 the 需接名詞。(D) presentative 極罕用且語意不合。故選 (C)。',
  ],
  [
    '(A) contribute (B) comprehend (C) consume (D) correspond',
    'B',
    '句意為「從後冷戰的角度看，可能難以『理解』那樣的恐懼，但在當時那份恐懼非常真實」，comprehend（理解）最合語境，並與句尾 that fear was very real 的轉折呼應。(A) contribute 貢獻、(C) consume 消耗，語意不通。(D) correspond 是不及物動詞（correspond to／with），不能直接接 such fear。故選 (B)。',
  ],
]

const CLOZE_B = [
  [
    '(A) destroy (B) deduct (C) decline (D) determine',
    'D',
    '句意為「有些語言學家認為，透過實驗室實驗最能『確定』語言如何被處理」。determine 意為「確定、判定」，與後文比較兩種研究方法何者更能得知真相的主旨相符。(A) destroy 破壞、(C) decline 婉拒／衰退，語意不通。(B) deduct 是「扣除」，常與意為「推論」的 deduce 混淆，正是本題陷阱。故選 (D)。',
  ],
  [
    '(A) by (B) through (C) at (D) on',
    'A',
    'by definition 是固定片語，意為「就定義而言、本質上」，句意為「實驗室實驗就定義上來說即為人為的」。(B) through、(C) at、(D) on 與 definition 皆無此固定搭配。故選 (A)。',
  ],
  [
    '(A) reappear (B) reflect (C) repeat (D) rejoin',
    'B',
    '承接前句「實驗本質上是人為的」，此處說它「可能無法『反映』真實世界所發生的事」，reflect 意為「反映」。(A) reappear 是不及物動詞「再次出現」。(C) repeat 是「重複」，語意上實驗並非要重演真實世界。(D) rejoin 是「重新加入」。故選 (B)。',
  ],
  [
    '(A) equip with (B) carry out (C) depart from (D) set off',
    'B',
    'carry out field studies 意為「進行田野研究」，是 study／research 的標準搭配動詞片語。(A) equip with 是「以……裝備」，語意與結構皆不合。(C) depart from 是「偏離」。(D) set off 是「出發、引發」。故選 (B)。',
  ],
  [
    '(A) illuminating (B) interfering (C) indicating (D) investigating',
    'B',
    '介系詞 without 後接動名詞，且後方有 with the process，interfere with 意為「干擾」，句意為「觀察者可在完全不干擾過程的情況下蒐集深度資料」，正是田野觀察相對於實驗室的優點。(A) illuminating 闡明、(C) indicating 指出、(D) investigating 調查，皆不與 with 構成此語意。故選 (B)。',
  ],
]

// ---------------------------------------------------------------- 組裝

function buildQuestions() {
  const out = []

  VOCAB.forEach(([stem, options], i) => {
    const number = i + 1
    const body = `${number}. ${stem}\n${options}`
    out.push({ number, text: number === 1 ? `${VOCAB_HEADER}\n${body}` : body })
  })

  CLOZE_A.forEach(([options], i) => {
    const number = 21 + i
    const body = `${number}. ${options}`
    out.push({
      number,
      text: number === 21 ? `${CLOZE_HEADER}\n\n${PASSAGE_A}\n\n${body}` : body,
    })
  })

  CLOZE_B.forEach(([options], i) => {
    const number = 31 + i
    const body = `${number}. ${options}`
    out.push({ number, text: number === 31 ? `${PASSAGE_B}\n\n${body}` : body })
  })

  return out.map(({ number, text }) => ({
    id: `q-pp-cs-en-112-${number}`,
    paperId: 'pp-cs-en-112',
    examId: 'cs',
    subjectId: 'cs-english',
    year: 112,
    number,
    text,
    points: null,
    hasImage: false,
    subQuestions: [],
  }))
}

function buildAnswers() {
  const out = {}
  const push = (number, answer, explanation) => {
    out[`q-pp-cs-en-112-${number}`] = {
      questionId: `q-pp-cs-en-112-${number}`,
      answer,
      explanation,
    }
  }
  VOCAB.forEach(([, , answer, explanation], i) => push(i + 1, answer, explanation))
  CLOZE_A.forEach(([, answer, explanation], i) => push(21 + i, answer, explanation))
  CLOZE_B.forEach(([, answer, explanation], i) => push(31 + i, answer, explanation))
  return out
}

// ---------------------------------------------------------------- 寫入

const questionsData = load('questions.json')
const answersData = load('answers.json')
const images = load('question-images.json')

const newQuestions = buildQuestions()
const newAnswers = buildAnswers()
const newNumbers = new Set(newQuestions.map((q) => q.number))

// 舊的 1–10 題（數學題）連同 11–35 的空缺一併由新題目取代。
const stale = questionsData.questions.filter(
  (q) => q.paperId === 'pp-cs-en-112' && newNumbers.has(q.number)
)
const firstIdx = questionsData.questions.findIndex((q) => q.paperId === 'pp-cs-en-112')
const kept = questionsData.questions.filter(
  (q) => !(q.paperId === 'pp-cs-en-112' && newNumbers.has(q.number))
)

// 新題目插回原本 pp-cs-en-112 的位置，並讓整份卷子依題號排序。
const others = kept.filter((q) => q.paperId !== 'pp-cs-en-112')
const remaining = kept.filter((q) => q.paperId === 'pp-cs-en-112')
const paper = [...newQuestions, ...remaining].sort((a, b) => a.number - b.number)
questionsData.questions = [...others.slice(0, firstIdx), ...paper, ...others.slice(firstIdx)]

for (const q of stale) {
  delete answersData.answers[q.id]
  delete images[q.id]
}
Object.assign(answersData.answers, newAnswers)

save('questions.json', questionsData)
save('answers.json', answersData)
save('question-images.json', images)

console.log(`移除舊題（數學誤植）：${stale.map((q) => q.number).join(', ')}`)
console.log(
  `寫入英文題 1–35 共 ${newQuestions.length} 題，解答 ${Object.keys(newAnswers).length} 筆`
)
console.log(
  `pp-cs-en-112 現有題數：${questionsData.questions.filter((q) => q.paperId === 'pp-cs-en-112').length}`
)
