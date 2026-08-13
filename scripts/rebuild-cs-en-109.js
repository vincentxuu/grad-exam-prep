#!/usr/bin/env node
// 資料修復：pp-cs-en-109（109 學年度 英文(A)，題號 8）
//
// 原始狀態：全卷只有 44 題，而且第 36–44 題根本不屬於這份卷子 ——
// 抽題時混進了別份考卷的內容（Passage II 誤植為「punch drunk／CTE／Martland」
// 那篇、第 41–44 題誤植為「morass of hate and lies online」與 [W][X][Y][Z] 插句題），
// 真正的第 45–50 題則整段缺漏。另有數題的題幹空格在抽題時掉了（例如第 1 題的
// ____、第 5 題的 ____ Mile-High city、第 12 題的 ____ novel、第 15 題的 came ____ up）。
//
// 本腳本以原始 PDF 重建整份卷子的 50 題：
//   https://exam.lib.ntu.edu.tw/sites/default/files/exam//graduate/109/8_graduate-109.pdf
// 卷面結構為 I. Vocabulary (30%) 1–15、II. Grammar (30%) 16–30、
// III. Cloze Test (30%) 31–45（三篇）、Reading Comprehension (10%) 46–50。
//
// 版面慣例對齊 pp-cs-en-114：points 為 null、克漏字與閱讀測驗的文章掛在該組第一題。
// 原卷的 "Passage I." 沒有標題號範圍，此處補成「Passage I: Questions 31-35」，
// 讓 src/lib/content.ts 的 PASSAGE_RANGE_RE 能把整組題目綁在一起。
//
// 解答：第 1–20、22–35 題原有的答案與詳解經與原卷逐題核對後正確，予以保留；
// 第 21 題改答案（詳見 ANSWER_FIXES）；第 36–50 題全部重寫。

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
}
function save(file, data) {
  fs.writeFileSync(path.join(dataDir, file), `${JSON.stringify(data, null, 2)}\n`)
}

// ------------------------------------------------- I. Vocabulary（第 1–15 題）

const VOCAB_HEADER =
  'I. Vocabulary: Choose the best answer to complete the following sentences (30%)'

const VOCAB = [
  'By nine in the morning the fake, country-wet freshness that somehow seeped in overnight ____ like the tail end of a sweet dream.\n(A) evaporated (B) executed (C) entailed (D) ensued',
  'In the early reform years, many small-scale entrepreneurial ventures were ____ by unemployed citizens.\n(A) launched (B) looped (C) swaggered (D) strolled',
  'Predominantly uneducated and lacking cultural capital, these ____ were greeted by intellectuals with disdain.\n(A) debris (B) tentacles (C) upstarts (D) dignitaries',
  'The students were all ____ from the news that they had won all the lottery.\n(A) rolling (B) ricocheting (C) rebounding (D) reeling',
  'Situated at exactly 5,280 feet above sea level, Denver is the ____ Mile-High city, jam-packed with all the outdoor thrills one would expect of a mountain-based destination.\n(A) unacceptable (B) uncontested (C) unsubstantiated (D) unaffectionate',
  'The translator not only translates the text but recreates the ____ and tonality of the original work.\n(A) coterie (B) patrons (C) simulations (D) nuances',
  'A coherent waste and resources strategy is one that ____ reducing the environmental impact of the things we buy, not simply reducing plastic use.\n(A) prioritizes (B) exhilarates (C) encloses (D) abridges',
  'His direct, often abrasive approach will doubtless ____ a few feathers.\n(A) dominate (B) ruffle (C) slam (D) batter',
  'He soon fell asleep, but woke up with a ____ when his grandmother screamed with pain.\n(A) start (B) stomp (C) steam (D) strike',
  'The strong typhoon made ____ on Monday evening, leading to flooding that caused a number of fatalities, including dozens of injuries.\n(A) landowner (B) landfill (C) landmass (D) landfall',
  'A smoker may create smoke rings by taking smoke into their mouth and ____ it with a tongue flick, by closing the jaw, tapping the cheek, or producing a sudden burst of air with the lungs and throat.\n(A) excruciating (B) extinguishing (C) expelling (D) expunging',
  "Kevin couldn't put the ____ novel down until he had finished it.\n(A) compensating (B) compelling (C) compliant (D) complacent",
  'John felt really sad at the ____ reviews her debut book received.\n(A) persistent (B) benevolent (C) auspicious (D) withering',
  'Conservationists claim that overfishing, deforestation and new plans to build dams are jeopardizing this ____ for endangered species.\n(A) haven (B) plight (C) fissure (D) sanction',
  'The toothless man came ____ up to them, pointing at an old boat bobbing in the water.\n(A) debilitating (B) revered (C) ambling (D) skimped',
]

// --------------------------------------------------- II. Grammar（第 16–30 題）

const GRAMMAR_HEADER =
  'II. Grammar: Select the most appropriate item to complete the following sentences (30%)'

const GRAMMAR = [
  'During the early years of the Cultural Revolution, dried mushrooms on dinner tables were an unheard-of luxury, ____.\n(A) thinking pork chops\n(B) pork chops thinkable\n(C) pork chops unthinkable\n(D) unthinkable pork chops',
  'The great snake was uncoiling itself rapidly, ____ out on to the floor. People throughout the reptile house screamed and started running for the exits.\n(A) slithering\n(B) slithered\n(C) slither\n(D) slithers',
  'Part-time jobs teach you a variety of invaluable skills, ____ include time-management, organization and communication skills, which many employers seek in a potential employee.\n(A) some where\n(B) where\n(C) some of which\n(D) of which',
  'For the future well-being of our company, it is imperative that the CEO ____ now.\n(A) resign\n(B) resigning\n(C) would resign\n(D) be resigning',
  "Susan will bring her best camera ____ the photographer forgets to show up at her parents' wedding anniversary.\n(A) in case\n(B) in case if\n(C) in case when\n(D) in such case",
  'The girl entered the room hesitantly, her arms ____ to her sides, her shoulders hunched; she looked both frightened and indifferent, like a captured bird.\n(A) closes\n(B) closing\n(C) closed\n(D) close',
  'I prefer the poetry of this new professor, who relied heavily on images to evoke ideas, ____, who employed elaborate description and philosophy.\n(A) to those of the old professor\n(B) to that of the old professor\n(C) than those of the old professor\n(D) than that of the old professor',
  "F. Scott Fitzgerald, Sherwood Anderson, James Joyce, Ezra Pound, and Gertrude Stein are among those usually ____ influencing Hemingway's early writing.\n(A) credited with\n(B) credited for\n(C) credited\n(D) crediting",
  'Neither the child nor the parents ____ able to resist the crushing force of the winter and eventually they moved away.\n(A) is\n(B) are\n(C) was\n(D) were',
  'You have the right to remain silent. Anything you say can, and will, be used against you in court of law. You have ____ an attorney. If you cannot afford one, one will be appointed to you.\n(A) the right\n(B) the right of\n(C) the right with\n(D) the right to',
  'The lawyer emphasized the ill-treatment and threats that his client was ____ in the work environment, and the fact that his client would not be able to return to work after the incident.\n(A) subject to\n(B) subjecting to\n(C) subjected to\n(D) subjected',
  'Convicted sex offenders on the register are ____ residency restrictions, which prevent them from living near places where children congregate - like schools, parks and even bus stops.\n(A) subject to\n(B) subjecting to\n(C) subjected to\n(D) subjected',
  'According to the new manager, the boss has given us ____ work to do.\n(A) yet\n(B) yet more\n(C) more yet\n(D) as yet',
  'Her performance is a combination of grace and fury, ____ athleticism, and enchanting artistry.\n(A) jaw-dropping\n(B) jaw-drop\n(C) dropping-jaw\n(D) drop-jaw',
  "The much beloved athlete's long-term popularity was as great, ____, outside his own country.\n(A) if not\n(B) if not greater\n(C) greater if not\n(D) greater not",
]

// ------------------------------------------------- III. Cloze Test（第 31–45 題）

const CLOZE_HEADER = 'III. Cloze Test: Select the most appropriate item for each blank (30%)'

const PASSAGE_I = `Passage I: Questions 31-35
The Ring of Fire, also referred to as the Circum-Pacific Belt, is a path (31) ___ the Pacific Ocean characterized by active volcanoes and frequent earthquakes. Seventy-five percent of Earth's volcanoes—more than 450 volcanoes—are located along the Ring of Fire. Ninety percent of Earth's earthquakes occur along its path, including the planet's most violent and dramatic seismic events. The (32) ___ of volcanoes and earthquakes along the Ring of Fire is caused by the amount of movement of tectonic plates in the area. Along much of the Ring of Fire, plates overlap at (33) ___ boundaries called subduction zones. That is, the plate that is underneath is pushed down, or subducted, by the plate above. As rock is subducted, it melts and becomes magma. The magma so near to Earth's surface gives rise to conditions (34) ___ for volcanic activity. A significant exception is the border between the Pacific and North American Plates. This stretch of the Ring of Fire is a transform boundary, where plates move sideways past one another. This type of boundary generates a large number of earthquakes as (35) ___ in Earth's crust builds up and is released.`

const PASSAGE_II = `Passage II: Questions 36-40
Altruism is acting out of (36) ___ for another's well-being. Often, people behave altruistically when they see others in desperate circumstances and feel (37) ___ and a desire to help. "Reciprocal altruism" is a term used by evolutionary biologists and psychologists to characterize the decision to help with an expectation that one will receive some benefit or (38) ___ to oneself. Even when people don't expect recognition or reward for a good deed, however, they often feel energized and happy afterward, a sensation sometimes called the "helper's high." Cooperative behavior allowed our ancestors to survive under harsh conditions, and it still serves a purpose in a highly complex society. Humans aren't the only animals who behave altruistically, though. Many species benefit when individual organisms (39) ___ personal costs and act in service of the larger group. What kind of people behave altruistically toward those who are not in their immediate social or familial circle? There are likely many factors that underlie altruistic tendencies, though research suggests that people who are more grounded in the present and people who have fewer resources may be more (40) ___ to acts of altruism.`

const PASSAGE_III = `Passage III: Questions 41-45
War can have a devastating impact not just on human life, but also on the environment. More than two thirds of the world's biodiversity hotspots experienced conflict at least once between 1950 and 2000, with many seeing repeated outbreaks, according to one study. Scorched-earth tactics and chemical warfare (41) ___ particular threats to flora and fauna. But when the conflict ends, ceasefires are agreed, and troops (42) ___, unexpected sanctuaries for wildlife can appear in their (43) ___. In 1953, hostilities between warring North Korea and South Korea ended when an armistice agreement was signed. It mapped out a demilitarized zone (DMZ) between the countries that is 250 kilometers long and on average 4 kilometers wide.

A heavy military presence remains and civilians are very rarely allowed into the DMZ, but troops have found evidence of rare Asiatic black bears, Amur Leopards, and Amur gorals (a type of mountain goat) living there. "We call the region an accidental paradise," says Seung-ho Lee, president of the DMZ Forum, a group that campaigns to protect the area's ecological and cultural (44) ___. The DMZ is home to more than 5,000 species, 106 of which have protected status. White-naped cranes and black-faced spoonbills are among the rarer species to seek (45) ___ there, among the minefields and abandoned towns.`

const CLOZE_I = [
  '(A) along (B) alone (C) align (D) alive',
  '(A) concordance (B) attendance (C) impedance (D) abundance',
  '(A) intransigent (B) negligent (C) convergent (D) stringent',
  '(A) rope (B) cape (C) ripe (D) pipe',
  '(A) illusion (B) tension (C) depression (D) admission',
]

// [選項, 答案, 詳解] —— 第 36–45 題為新增，須連同解答一併寫入
const CLOZE_II = [
  [
    '(A) conduit (B) concern (C) convict (D) contour',
    'B',
    'out of concern for someone 意為「出於對某人的關心」，本句在為 altruism（利他）下定義：出於對他人福祉的關心而行動。(A) conduit 管道、(C) convict 罪犯、(D) contour 輪廓，皆是與 con- 開頭形成干擾的名詞，語意完全不合。故選 (B)。',
  ],
  [
    '(A) telepathy (B) antipathy (C) apathy (D) empathy',
    'D',
    '空格與 a desire to help 並列，描述看到他人身處困境時產生的情緒，empathy（同理心）最合。同字根選項是典型陷阱：(A) telepathy 心電感應、(B) antipathy 反感、(C) apathy 冷漠——後兩者語意與「想幫忙」正好相反。故選 (D)。',
  ],
  [
    '(A) payoff (B) standoff (C) blastoff (D) layoff',
    'A',
    '本句解釋 reciprocal altruism（互惠利他）：幫助他人時期待自己能得到某種好處或回報，benefit or payoff 為同義並列。(B) standoff 僵局、(C) blastoff 發射升空、(D) layoff 裁員，都是 -off 結尾的干擾項，語意不合。故選 (A)。',
  ],
  [
    '(A) disregard (B) dispend (C) dismay (D) disrupt',
    'A',
    '句意為「當個體『不顧』自身代價、為更大的群體效力時，許多物種因此受益」，disregard personal costs 意為置個人代價於度外，與後半句 act in service of the larger group 相呼應。(B) dispend 罕用且語意不合、(C) dismay 使沮喪、(D) disrupt 擾亂，皆無法表達「不計代價」。故選 (A)。',
  ],
  [
    '(A) profound (B) proof (C) prone (D) proper',
    'C',
    'be prone to something 是固定搭配，意為「傾向於、易於」，句意為活在當下的人與資源較少的人比較容易做出利他行為。(A) profound 深刻的、(D) proper 適當的，都不與 to 構成此語意；(B) proof 是名詞／形容詞「防……的」，搭配也不對。故選 (C)。',
  ],
]

const CLOZE_III = [
  [
    '(A) pose (B) poise (C) paste (D) probe',
    'A',
    'pose a threat to 是固定搭配，意為「對……構成威脅」，主詞為焦土戰術與化學戰。(B) poise 意為「使平衡、泰然自若」，與 threats 不搭配，且拼字近似正是陷阱所在。(C) paste 黏貼、(D) probe 探查，語意皆不合。故選 (A)。',
  ],
  [
    '(A) retrace (B) retard (C) retreat (D) retract',
    'C',
    "本句描述衝突結束、停火協議達成、軍隊「撤離」，retreat 意為撤退。(A) retrace 是「折返、回溯（retrace one's steps）」。(B) retard 拖慢。(D) retract 縮回、收回（言論），主詞通常不是軍隊本身。故選 (C)。",
  ],
  [
    '(A) wake (B) wire (C) will (D) wage',
    'A',
    'in their wake 是固定片語，原指船行過後的航跡，引申為「在其身後、隨之而來」，句意為軍隊撤離後留下了意想不到的野生動物庇護所。(B) wire 電線、(C) will 意志、(D) wage 工資，皆無此片語用法。故選 (A)。',
  ],
  [
    '(A) withdrawal (B) heritage (C) deputy (D) tenure',
    'B',
    '空格與 ecological 並列，由 cultural 修飾，指 DMZ 論壇所要保護的「生態與文化遺產」，heritage 意為遺產、傳承。(A) withdrawal 撤離（雖與上文的撤軍有關，但此處要的是被保護的對象）、(C) deputy 代理人、(D) tenure 任期，皆不合。故選 (B)。',
  ],
  [
    '(A) confection (B) canopy (C) reflex (D) refuge',
    'D',
    'seek refuge 是固定搭配，意為「尋求庇護」，呼應全段「戰爭遺留的無人地帶反而成為野生動物庇護所」的主旨。(A) confection 糖果、(C) reflex 反射動作，語意不合。(B) canopy 樹冠層雖與生態有關，但 seek canopy 並非固定用法，也無法承接前文的 sanctuaries。故選 (D)。',
  ],
]

// -------------------------------------- Reading Comprehension（第 46–50 題）

const READING_HEADER =
  'Reading Comprehension: Read the following article and select the best answer for each question. (10%)'

const ARTICLE = `Article: Questions 46-50
The first edible lab-grown sample – a fish fillet grown from goldfish cells – was produced in 2000. The following year, Nasa began funding research into growing meat from turkey cells so its astronauts could enjoy a Thanksgiving dinner in space. These experimental attempts soon gave way to a culinary race, with companies _____ to be the first to bring "clean meat" to the mass market. That race is now entering its final lap, with the front runners predicting they could have cultured meat on restaurant menus by the end of this year, once a regulatory framework is agreed upon. "Step one is producing products like nuggets, ground chicken and ground beef; that's the way to think about the path of cultured meats," explains Joshua Tetrick, chief executive of San Francisco's Just, Inc. After successfully finding a plant-based alternative to the conventional egg in the form of a scrambled mung bean, Just turned its attention to cultured meats, and is now one of the companies leading the way. "The next stage will be the more structured products – such as steaks and chicken breasts. Products like that require a lot more development; they are a little bit further out."

But just how far out are we talking? In June, global consultancy AT Kearney predicted that by the year 2040, 60 percent of all meat consumed globally would not come from slaughtered animals. Rather, the bulk of our diets will be made up of a mix of cultured and plant-based meat substitutes. This timeframe was reached through a series of interviews with industry experts, as well as by looking at the amount of recent investment from around the globe in sustainable meat alternatives – $1 billion in the last year. "The large-scale livestock industry is viewed by many as an unnecessary evil," the report says. "With the advantages of novel vegan meat replacements and cultured meat over conventionally produced meat, it is only a matter of time before they capture a substantial market share."

But will that "substantial market share" ever be enough to topple the 2.4-million-year-old human habit of eating slaughtered animals, an industry that last year alone turned over $1 trillion worldwide? "The problem with cultured meat is it's just hypothetical for the most part right now," says Tetrick. And the concept of eating flesh grown by scientists in a lab is, understandably, acutely alien in the minds of many. "There have been a lot of surveys done, and people are seemingly becoming more accepting," he adds, "but ____."`

const READING = [
  [
    "Which of the following could be the title for this article?\n(A) Is lab-grown meat part of our future diet?\n(B) Lab-grown meat will replace slaughtered animals in 2040.\n(C) Problems with lab-grown meat.\n(D) People's reaction to lab-grown meat today.",
    'A',
    '全文先講實驗室培養肉的發展與 2040 年的預測，最後又以「這一切目前多半仍屬假設」與大眾的心理障礙收尾，整體是開放式的探問而非定論，(A) 的問句標題最能涵蓋。(B) 把預測寫成斷言，且原文說的是六成而非全部取代。(C)(D) 各自只涵蓋最後一段的一部分，格局太小。故選 (A)。',
  ],
  [
    'According to the article, which of the following statements is TRUE?\n(A) The first lab-grown meat was developed by NASA for astronauts.\n(B) By 2040, all meat will be produced in the lab environment.\n(C) Human beings hate the unnecessary evil of killing animals.\n(D) Just is one of the companies that have been devoted to the development of lab-grown meat.',
    'D',
    '原文寫 Just「turned its attention to cultured meats, and is now one of the companies leading the way」，(D) 正確。(A) 錯在順序：第一份可食用的實驗室樣本是 2000 年的金魚細胞魚片，NASA 是「隔年」才開始資助火雞細胞研究。(B) 錯在原文說的是 2040 年全球六成的肉不來自屠宰動物，不是全部都在實驗室生產。(C) 錯在原文是 "viewed by many as an unnecessary evil"（許多人視大規模畜牧業為必要之惡般的存在），並非人類憎恨殺生。故選 (D)。',
  ],
  [
    'Which of the following words can be used to replace the blank in the first paragraph?\n(A) revolting\n(B) vying\n(C) vanishing\n(D) wiggling',
    'B',
    '空格前後為 "a culinary race, with companies ____ to be the first to bring \'clean meat\' to the mass market"，既然是一場競賽，各家公司是在「競逐」成為第一，vie to do something 意為爭相做某事。(A) revolting 令人作嘔的（或 revolt 反叛）、(C) vanishing 消失、(D) wiggling 扭動，皆與 race 的語境不符。故選 (B)。',
  ],
  [
    "Which of the following statements can replace the long blank at the end of the article?\n(A) companies such as Just believe that investment could come from countries with both the capital and a vested interest in food security\n(B) a survey is not the same as putting it on a menu or in a grocery store – that's totally different\n(C) there's a real opportunity to make this a big thing\n(D) these changing diets have forced the food industry's hand, with more vegan options than ever before, particularly when it comes to the rapidly growing business of mock meat",
    'B',
    '空格前是 "people are seemingly becoming more accepting," he adds, "but ____."，but 要求轉折：民調變好看，但那和真的端上餐桌是兩回事，(B) 正是這個保留態度。(C) 語氣樂觀，與 but 的轉折方向相反。(A)(D) 雖然都是文中相關的話題，卻沒有承接「調查結果 vs. 實際購買」的對比，接在 but 之後語意不通。故選 (B)。',
  ],
  [
    'Which of the following best describes the tone of the last paragraph?\n(A) sarcastic\n(B) nervous\n(C) optimistic\n(D) skeptical',
    'D',
    '最後一段以反問句質疑培養肉能否撼動人類 240 萬年的吃肉習慣與年產值一兆美元的產業，接著引用 Tetrick 的 "it\'s just hypothetical for the most part right now"，並指出一般人對實驗室培養的肉仍感陌生，通篇是保留、存疑的語氣。(A) 諷刺、(B) 緊張的情緒文中沒有，(C) 樂觀則與整段的質疑方向相反。故選 (D)。',
  ],
]

// ---------------------------------------------------------------- 既有解答修正

const ANSWER_FIXES = {
  21: [
    'D',
    "本題考查獨立分詞構句中的形容詞用法。close to one's sides 意為「（雙臂）緊貼身側」，close 在此是形容詞「靠近的」，整個 her arms close to her sides 是「名詞＋形容詞片語」的獨立結構，與後面的 her shoulders hunched 並列描述女孩的姿態。(C) closed 看似能與 hunched 形成過去分詞的對稱，是本題最大的陷阱，但 close X to Y 的意思是「把某物關上／封閉」，說 arms closed to her sides 並不成立。(A) closes 是限定動詞，句中已有主要動詞 entered，不能再放一個。(B) closing 表主動進行，語意上雙臂並非正在把自己合上。故選 (D)。",
  ],
}

// ---------------------------------------------------------------- 組裝

function buildQuestions() {
  const texts = new Array(50)

  VOCAB.forEach((body, i) => {
    const number = i + 1
    texts[i] = `${number === 1 ? `${VOCAB_HEADER}\n` : ''}${number}. ${body}`
  })

  GRAMMAR.forEach((body, i) => {
    const number = 16 + i
    texts[number - 1] = `${number === 16 ? `${GRAMMAR_HEADER}\n` : ''}${number}. ${body}`
  })

  const clozeGroups = [
    [31, PASSAGE_I, CLOZE_I.map((options) => [options])],
    [36, PASSAGE_II, CLOZE_II],
    [41, PASSAGE_III, CLOZE_III],
  ]
  for (const [start, passage, items] of clozeGroups) {
    items.forEach(([options], i) => {
      const number = start + i
      const body = `${number}. ${options}`
      texts[number - 1] =
        number === start
          ? `${start === 31 ? `${CLOZE_HEADER}\n\n` : ''}${passage}\n\n${body}`
          : body
    })
  }

  READING.forEach(([stem], i) => {
    const number = 46 + i
    const body = `${number}. ${stem}`
    texts[number - 1] = number === 46 ? `${READING_HEADER}\n\n${ARTICLE}\n\n${body}` : body
  })

  return texts.map((text, i) => ({
    id: `q-pp-cs-en-109-${i + 1}`,
    paperId: 'pp-cs-en-109',
    examId: 'cs',
    subjectId: 'cs-english',
    year: 109,
    number: i + 1,
    text,
    points: null,
    hasImage: false,
    subQuestions: [],
  }))
}

function buildAnswers() {
  const out = {}
  const push = (number, answer, explanation) => {
    out[`q-pp-cs-en-109-${number}`] = {
      questionId: `q-pp-cs-en-109-${number}`,
      answer,
      explanation,
    }
  }
  CLOZE_II.forEach(([, answer, explanation], i) => push(36 + i, answer, explanation))
  CLOZE_III.forEach(([, answer, explanation], i) => push(41 + i, answer, explanation))
  READING.forEach(([, answer, explanation], i) => push(46 + i, answer, explanation))
  for (const [number, [answer, explanation]] of Object.entries(ANSWER_FIXES)) {
    push(Number(number), answer, explanation)
  }
  return out
}

// ---------------------------------------------------------------- 寫入

const questionsData = load('questions.json')
const answersData = load('answers.json')
const images = load('question-images.json')

const newQuestions = buildQuestions()
if (newQuestions.some((q) => !q.text)) {
  throw new Error('有題號沒有對應到題目文字')
}

const firstIdx = questionsData.questions.findIndex((q) => q.paperId === 'pp-cs-en-109')
const others = questionsData.questions.filter((q) => q.paperId !== 'pp-cs-en-109')
questionsData.questions = [...others.slice(0, firstIdx), ...newQuestions, ...others.slice(firstIdx)]

// 舊卷有 44 題，新卷 50 題；清掉不再存在的題號殘留（此卷本來就沒有圖檔對應）
for (let n = 51; n <= 60; n++) {
  delete answersData.answers[`q-pp-cs-en-109-${n}`]
  delete images[`q-pp-cs-en-109-${n}`]
}
Object.assign(answersData.answers, buildAnswers())

const missing = newQuestions.filter((q) => !answersData.answers[q.id])
if (missing.length) {
  throw new Error(`以下題目缺少解答：${missing.map((q) => q.number).join(', ')}`)
}

save('questions.json', questionsData)
save('answers.json', answersData)
save('question-images.json', images)

console.log(`pp-cs-en-109 重建完成：${newQuestions.length} 題，解答 ${newQuestions.length} 筆`)
