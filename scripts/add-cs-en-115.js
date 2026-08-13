#!/usr/bin/env node
// 新增 pp-cs-en-115（115 學年度 英文(A)，題號 8）。
//
// past-papers.json 原本記著「115年尚未上架台大圖書館」、url 為 null，現在已經上架：
//   https://exam.lib.ntu.edu.tw/sites/default/files/exam//graduate/115/115-8.pdf
// 本腳本更新該筆 past paper 的 url／verified，並依原卷寫入 50 題與逐題解答。
//
// 卷面結構（共 9 頁，全卷 50 題四選一）：
//   Part I.  Academic Vocabulary          1–12
//   Part II. Reading Comprehension        Passage A 13–17、Passage B 18–23
//   Part III. Fill in the blank           24–34 單句、35–39 為一篇短文的克漏字
//   Part IV. Contextual Analysis          40–50（換句話說，替換畫底線的字詞）
//
// 版面慣例對齊 pp-cs-en-114：points 為 null、文章掛在該組第一題並以
// 「… : Questions M-N」標頭帶出，供 src/lib/content.ts 的 PASSAGE_RANGE_RE 分組。

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
}
function save(file, data) {
  fs.writeFileSync(path.join(dataDir, file), `${JSON.stringify(data, null, 2)}\n`)
}

const PAPER_URL = 'https://exam.lib.ntu.edu.tw/sites/default/files/exam//graduate/115/115-8.pdf'

// ------------------------------------------------ Part I（第 1–12 題）

const PART_I_HEADER =
  'Part I. Academic Vocabulary: Select the term that most logically completes each sentence based on the provided context.'

// [題幹, 選項, 答案, 詳解]
const PART_I = [
  [
    'The report highlights the urgent need to address global income ___, noting that the wealth gap between the top 1% and the rest of the population has reached historic levels. Without intervention, economists warn that this imbalance could trigger long-term social instability.',
    '(A) equality (B) inequality (C) harmony (D) stability',
    'B',
    '後文的 the wealth gap… has reached historic levels 與 this imbalance 是關鍵線索，空格要填的是「不平等」，income inequality（所得不均）為固定術語。(A) equality 與 (C) harmony 語意相反，(D) stability 也與 imbalance 矛盾。故選 (B)。',
  ],
  [
    "The researcher's claims were supported by extensive empirical ___ gathered over a ten-year longitudinal study. By providing raw data and measurable results, the team was able to move the theory from a mere hypothesis to a widely accepted scientific fact.",
    '(A) imagination (B) evidence (C) ideology (D) rhetoric',
    'B',
    'empirical evidence（實證證據）是學術寫作的固定搭配，且後句的 raw data and measurable results 正是在說明何謂證據。(A) imagination 想像、(C) ideology 意識形態、(D) rhetoric 修辭，三者都與「可測量的資料」相斥，也無法 be gathered over a longitudinal study。故選 (B)。',
  ],
  [
    'The policy aims to promote sustainable development rather than short-term ___ that satisfy quarterly shareholders but deplete natural resources. This shift in strategy prioritizes the health of the ecosystem for future generations over immediate financial profit.',
    '(A) gains (B) delays (C) ethics (D) equity',
    'A',
    'rather than 建立對比：永續發展 vs. 短期的什麼？後句的 immediate financial profit 直接點明答案是「短期利益」，short-term gains 為固定搭配。(B) delays 延誤不會讓股東滿意，(C) ethics 倫理與 deplete natural resources 矛盾，(D) equity 公平／股權在此語意不通。故選 (A)。',
  ],
  [
    'The findings were later ___ by independent studies conducted at three different universities. This successful reproduction of the original results confirmed the reliability of the initial data and strengthened the scientific consensus.',
    '(A) contradicted (B) replicated (C) ignored (D) concealed',
    'B',
    '後句的 This successful reproduction of the original results 是同義改寫，replicate 意為「複製、重現（研究結果）」，是科學方法的核心術語。(A) contradicted 反駁與 confirmed the reliability 矛盾，(C) ignored 忽視、(D) concealed 隱瞞，都無法由獨立研究「執行」。故選 (B)。',
  ],
  [
    'The author adopts a ___ tone throughout the article, carefully weighing the pros and cons of the legislation without showing personal bias. This objective approach allows readers to form their own conclusions based on the presented facts.',
    '(A) sarcastic (B) sentimental (C) hostile (D) neutral',
    'D',
    'without showing personal bias 與 This objective approach 兩處都指向「中立」，neutral tone 即中立語氣。(A) sarcastic 諷刺、(C) hostile 敵意，都是帶立場的語氣；(B) sentimental 情感用事，與 objective 相斥。故選 (D)。',
  ],
  [
    'Advances in biotechnology, such as CRISPR and gene editing, have raised serious ethical ___ regarding the limits of human intervention. Scientists and philosophers alike are now debating whether the ability to "design" offspring outweighs the potential social risks.',
    '(A) conveniences (B) dilemmas (C) advantages (D) traditions',
    'B',
    'ethical dilemma（倫理兩難）是固定搭配，後句的 debating whether… outweighs the potential social risks 正是在描述兩難。(A) conveniences 便利與 (C) advantages 優點都是正面詞，與 serious、risks 的語氣不合；(D) traditions 傳統與 raised 也搭配不起來。故選 (B)。',
  ],
  [
    "The proposal was rejected due to its lack of theoretical ___, as the committee felt the project was based more on anecdotal observation than established academic frameworks. Without a solid starting point, the reviewers felt the project's goals were unattainable.",
    '(A) rigor (B) decoration (C) ambition (D) curiosity',
    'A',
    'theoretical rigor（理論嚴謹度）是學術評審用語，與後文「靠軼事觀察而非既有學術框架」正好呼應——缺的就是嚴謹。(B) decoration 裝飾語意不通，(C) ambition 企圖心與 anecdotal observation 的問題無關，(D) curiosity 好奇心亦然。故選 (A)。',
  ],
  [
    'The data suggest a clear ___ between education level and health outcomes, indicating that individuals with higher degrees often have better access to preventative care. Researchers are now looking into whether this link is primarily driven by income or by health literacy.',
    '(A) obstacle (B) correlation (C) contradiction (D) illusion',
    'B',
    '空格接 between A and B，且後句以 this link 回指，correlation（相關性）是最合的統計術語。(A) obstacle 障礙不會存在於「教育程度與健康結果之間」這種關係語境。(C) contradiction 矛盾與句中「學歷越高、醫療可近性越好」的一致趨勢不合。(D) illusion 錯覺則與 The data suggest a clear… 相斥。故選 (B)。',
  ],
  [
    'The committee reached a ___ decision after extensive discussion, ensuring that every member was in full agreement before moving forward. This total consensus was seen as a vital show of unity during a period of corporate restructuring.',
    '(A) unanimous (B) accidental (C) impulsive (D) reluctant',
    'A',
    'every member was in full agreement 與 This total consensus 都是同義提示，unanimous decision 即「全體一致的決議」。(B) accidental 偶然、(C) impulsive 衝動，都與 after extensive discussion 矛盾；(D) reluctant 勉強的雖可修飾 decision，但與 full agreement、show of unity 的正面語氣不符。故選 (A)。',
  ],
  [
    'The study focuses on communities that are socially and economically ___, specifically those living in "food deserts" with limited access to fresh produce. By highlighting these underserved populations, the researchers hope to influence local zoning laws.',
    '(A) dominant (B) privileged (C) marginalized (D) commercial',
    'C',
    '"food deserts"、limited access、underserved populations 三處線索一致指向「被邊緣化的」社群，marginalized 為社會學固定用語。(A) dominant 主導的與 (B) privileged 享有特權的語意相反，(D) commercial 商業的則與社經弱勢無關。故選 (C)。',
  ],
  [
    'The lecture emphasized the importance of critical thinking in an age of information ___, where the sheer volume of digital content can make it difficult to distinguish fact from fiction. Students were encouraged to verify sources before sharing headlines.',
    '(A) scarcity (B) balance (C) equality (D) overload',
    'D',
    'the sheer volume of digital content（數位內容的龐大數量）是關鍵，information overload 即「資訊超載」。(A) scarcity 稀缺正好相反，(B) balance 平衡與 (C) equality 平等都無法解釋「難以辨別真假」的成因。故選 (D)。',
  ],
  [
    'The theory has been widely accepted, though not without ___ from a small group of physicists who believe the mathematical model is incomplete. Despite these objections, the theory remains the primary framework used in the field today.',
    '(A) consensus (B) popularity (C) efficiency (D) criticism',
    'D',
    'not without ___ 是雙重否定的讓步結構，後句以 Despite these objections 回指，可知空格是「批評」。(A) consensus 共識與 (B) popularity 受歡迎程度都是正面詞，放進 not without 會與 who believe the mathematical model is incomplete 矛盾；(C) efficiency 效率則與整句無關。故選 (D)。',
  ],
]

// ------------------------------------- Part II（第 13–23 題，兩篇閱讀）

const PART_II_HEADER = 'Part II. Reading Comprehension'

const PASSAGE_A = `Reading Passage A: Questions 13-17
Language has long functioned not merely as a medium of communication but as a site where power is negotiated and exercised. In contemporary digital environments, this function is increasingly mediated by technological systems that regulate how language circulates and acquires authority.

Although such systems are often framed as neutral tools, their design embeds assumptions about legitimacy and normativity. Algorithms that rank, filter, or generate language do not eliminate power relations; instead, they reconfigure them in less visible forms. As a result, linguistic authority becomes intertwined with technical infrastructure.

As universities work to cultivate critical awareness of technological mediation, language education must extend beyond mere proficiency to include an interrogation of the conditions under which meaning is produced.`

const PASSAGE_B = `Reading Passage B: Questions 18-23
As artificial intelligence systems become increasingly embedded in education, research, and professional practice, concerns about their reliability have grown more urgent. One major concern is the phenomenon known as "hallucination," in which AI systems generate responses that appear fluent and authoritative but are factually incorrect. These errors arise from the probabilistic nature of language models, which predict plausible sequences of words rather than verify truth. Because such outputs often sound confident, hallucinations can be difficult to detect without careful scrutiny.

Closely related is the issue of bias. Trained on large datasets that reflect existing social patterns, AI systems may reproduce or amplify historical inequalities. When AI-generated content is treated as neutral or objective, biased outputs risk being accepted uncritically, particularly in academic or institutional contexts.

These risks have already been impacting real-life practices. In several documented cases, AI tools used for legal research have generated fictitious court cases that were subsequently cited by lawyers in formal filings. Although the text appeared professionally written and legally coherent, the sources did not exist. These incidents demonstrate how fluency can mask inaccuracy and how overreliance on AI can shift responsibility away from human users.

Technical improvements—such as better training data or refined model architecture—may reduce error rates, but they cannot eliminate these limitations. AI systems lack understanding and epistemic judgment. Responsibility therefore remains with human users. In educational settings especially, responsible AI use requires cultivating critical literacy: the ability to evaluate AI-generated content with informed skepticism. Integrating AI successfully depends not on replacing judgment, but on strengthening it.`

const PART_II_A = [
  [
    'The passage primarily argues that technological systems:\n(A) eliminate linguistic power relations\n(B) operate independently of discourse\n(C) reshape how power circulates through language\n(D) neutralize ideological influence',
    'C',
    '第二段的關鍵句是 "Algorithms that rank, filter, or generate language do not eliminate power relations; instead, they reconfigure them in less visible forms."——不是消除而是重新配置，(C) 的 reshape 正是 reconfigure 的同義改寫。(A) 與 (D) 都被 do not eliminate 直接否定。(B) 與全文「語言、權力與技術交纏」的立論相反。故選 (C)。',
  ],
  [
    'The author challenges claims of technological neutrality by emphasizing:\n(A) computational error\n(B) market incentives\n(C) embedded assumptions in design\n(D) user resistance',
    'C',
    '原文 "Although such systems are often framed as neutral tools, their design embeds assumptions about legitimacy and normativity." 以 Although 讓步後直接指出：設計本身就內嵌了對正當性與規範性的假設，(C) 即此句的濃縮。(A) 運算錯誤、(B) 市場誘因、(D) 使用者抵抗，全文皆未提及。故選 (C)。',
  ],
  [
    'The phrase "less visible forms" suggests that power relations are:\n(A) diminishing\n(B) becoming more transparent\n(C) irrelevant to discourse\n(D) concealed within technical systems',
    'D',
    '該片語承接 they reconfigure them，指權力關係被重新編排成「較不可見的形式」——並非消失，而是藏進技術系統裡，(D) 的 concealed within technical systems 正是此意。(A) diminishing 會誤讀成權力減弱，恰是本題陷阱；(B) 語意相反；(C) 與全文主張相反。故選 (D)。',
  ],
  [
    'Universities are presented as institutions that must:\n(A) adapt by adopting new technologies\n(B) abandon traditional language instruction\n(C) resist digital transformation\n(D) cultivate critical awareness of mediation',
    'D',
    '末段原文為 "As universities work to cultivate critical awareness of technological mediation…"，(D) 幾乎是原句照抄。(A) 把重點錯置為導入新技術，(B) 的 abandon 過強——原文說的是 extend beyond mere proficiency（延伸而非拋棄），(C) 抵抗數位轉型則是文中沒有的立場。故選 (D)。',
  ],
  [
    "Which implied concept is central to the passage's argument?\n(A) Discursive authority\n(B) Technological autonomy\n(C) Economic productivity\n(D) Linguistic efficiency",
    'A',
    '全文圍繞語言如何「acquires authority」、以及 "linguistic authority becomes intertwined with technical infrastructure"，核心概念即話語權威（discursive authority）。(B) technological autonomy 恰恰是本文要反駁的中立／自主工具觀，(C) 經濟生產力與 (D) 語言效率在文中都沒有著墨。故選 (A)。',
  ],
]

const PART_II_B = [
  [
    'The primary purpose of the passage is to:\n(A) describe recent advances in AI technology\n(B) argue that AI errors are unavoidable and harmless\n(C) examine risks associated with AI use\n(D) promote wider adoption of AI in education',
    'C',
    '全文依序處理 hallucination、bias、真實案例與責任歸屬，主軸是檢視 AI 使用的風險，(C) 最能概括。(A) 錯在本文談的是缺陷而非技術進展。(B) 錯在 harmless——文中舉了律師引用虛構判例的實例，正說明其危害。(D) 與末段「責任仍在人」的審慎立場不符。故選 (C)。',
  ],
  [
    'According to the passage, why are AI hallucinations particularly problematic?\n(A) They occur randomly and unpredictably\n(B) They are caused by intentional system design\n(C) They often appear confident and credible\n(D) They only affect non-expert users',
    'C',
    '原文 "Because such outputs often sound confident, hallucinations can be difficult to detect without careful scrutiny." 直接給出理由：聽起來太有把握，因此難以察覺。(A) 文中把成因歸於語言模型的機率本質，而非隨機不可預測。(B) 錯在 intentional。(D) 錯在 only——律師是專業人士，正是反例。故選 (C)。',
  ],
  [
    'The legal research example primarily serves to:\n(A) criticize the legal profession\n(B) argue that AI should be banned from professional use\n(C) show how bias affects AI training data\n(D) illustrate how fluency can conceal factual errors',
    'D',
    '該段結論句寫得很明白："These incidents demonstrate how fluency can mask inaccuracy…"，(D) 的 conceal 即 mask 的同義改寫。(A) 文章意不在批評法界。(B) 全文主張的是負責任地使用而非禁用。(C) 偏誤是前一段的主題，這個例子講的是流暢度掩蓋錯誤。故選 (D)。',
  ],
  [
    'Which conclusion does the author reach?\n(A) AI systems will soon develop independent judgment\n(B) Technical solutions can fully eliminate bias\n(C) Human users remain responsible for verifying AI output\n(D) AI is more reliable than traditional research methods',
    'C',
    '末段 "Responsibility therefore remains with human users." 即結論。(A) 與 "AI systems lack understanding and epistemic judgment" 相反。(B) 被 "they cannot eliminate these limitations" 直接否定，fully 一詞更是明顯的過度推論。(D) 文中從未做此比較。故選 (C)。',
  ],
  [
    'The phrase "informed skepticism" most nearly means:\n(A) complete rejection of AI-generated content\n(B) uncritical acceptance of fluent language\n(C) reliance on AI over human expertise\n(D) careful evaluation rather than automatic trust',
    'D',
    '該片語出現在 "the ability to evaluate AI-generated content with informed skepticism"，指在了解其限制的前提下審慎評估，(D) 正是此意。(A) 的 complete rejection 過強，與末句 "not on replacing judgment, but on strengthening it" 的建設性立場不符。(B) 與懷疑相反，(C) 與「責任在人」相反。故選 (D)。',
  ],
  [
    "The author's overall stance toward AI in education can best be described as:\n(A) strongly optimistic\n(B) cautiously critical but constructive\n(C) entirely oppositional\n(D) neutral and descriptive",
    'B',
    '全文花大半篇幅指出風險（critical），但結尾主張透過培養批判素養來「成功整合」AI（constructive），並未主張禁用，(B) 精準描述這種審慎而不否定的立場。(A) 過度樂觀，(C) 的 entirely oppositional 與 "Integrating AI successfully" 矛盾，(D) 錯在本文有明確立場，不只是客觀描述。故選 (B)。',
  ],
]

// ------------------------------------ Part III（第 24–39 題）

const PART_III_HEADER =
  'Part III. Fill in the blank: Choose the best or most context-appropriate word to finish the sentence.'

const PART_III_SINGLES = [
  [
    "In a move seen as a symbolic step toward reconciliation between the Catholic and Anglican churches, King Charles has made history as the first ___ British monarch to pray publicly with a pope since Henry VIII's 1534 split from Rome.",
    '(A) crowning (B) aspiring (C) achieving (D) reigning',
    'D',
    'reigning monarch 是固定搭配，意為「在位的君主」，句中查爾斯是現任國王，故為 the first reigning British monarch。(A) crowning 是「加冕的、最高的（crowning achievement）」，不修飾 monarch 表在位。(B) aspiring 有志成為……的，(C) achieving 語意不通。故選 (D)。',
  ],
  [
    'As public concern over digital surveillance and data misuse continues to grow, several governments around the world have begun to ___ new regulations requiring technology companies to disclose in greater detail how user data are collected, stored, and monetized.',
    '(A) loosen (B) enact (C) inherit (D) speculate',
    'B',
    'enact regulations／legislation 是「制定法規」的固定用法，主詞為各國政府，且後文說明法規要求科技公司揭露更多細節，方向是加強管制。(A) loosen 放寬與 growing concern 的語境矛盾。(C) inherit 繼承、(D) speculate 臆測（且為不及物），皆不與 regulations 搭配。故選 (B)。',
  ],
  [
    'In its official citation, the Nobel Committee emphasized that the prize was awarded not for a single breakthrough or isolated experiment, but for decades of ___ research that fundamentally reshaped both theory and practice in the field.',
    '(A) intermittent (B) speculative (C) sustained (D) accidental',
    'C',
    'not… but… 的對比是解題關鍵：不是單一突破或孤立實驗，而是數十年「持續不輟」的研究，sustained research 正合。(A) intermittent 斷斷續續的與 decades of 的持續性矛盾，(D) accidental 偶然的與 isolated experiment 屬同一側，(B) speculative 臆測性的則與 fundamentally reshaped 的實績不符。故選 (C)。',
  ],
  [
    'Facing mounting criticism from regulators and the public, the company issued a formal apology, conceding that its earlier public statement had been ___ and therefore failed to address key concerns raised by stakeholders.',
    '(A) ambiguous (B) redundant (C) transparent (D) consistent',
    'A',
    '公司道歉並承認先前聲明有問題，才會 failed to address key concerns，ambiguous（含糊不清）最能解釋為何沒能回應關切。(C) transparent 透明與 (D) consistent 前後一致都是正面評價，放進道歉語境自相矛盾。(B) redundant 冗贅雖是缺點，但冗贅不會導致「沒講到重點」。故選 (A)。',
  ],
  [
    'Fueled by prolonged drought conditions and unusually strong winds, the wildfire rapidly ___ containment efforts, overwhelming emergency responders and spreading across multiple regions within days.',
    '(A) undermined (B) justified (C) predicted (D) regulated',
    'A',
    '空格的受詞是 containment efforts（圍堵行動），後接 overwhelming emergency responders，可知野火是「破壞、瓦解」了圍堵努力，undermine 意為削弱、使失效。(B) justified 使正當化、(C) predicted 預測，主詞是野火時語意不通。(D) regulated 規範亦然。故選 (A)。',
  ],
  [
    'Although the economic reform package was initially met with skepticism from both opposition parties and financial analysts, it has since been ___ by subsequent data showing improved fiscal stability.',
    '(A) dismissed (B) contested (C) vindicated (D) postponed',
    'C',
    'Although 建立轉折：起初被質疑，後來卻被顯示財政改善的數據「證明是對的」，vindicate 意為為……平反、證實其正確。(A) dismissed 被否決、(B) contested 被爭論，都與 Although 的轉折方向相同，等於沒有轉折。(D) postponed 延後與 by subsequent data 的施動者不合。故選 (C)。',
  ],
  [
    "What began as a single employee's disclosure soon ___ a broader public debate about corporate accountability, regulatory oversight, and the ethical responsibilities of multinational firms.",
    '(A) obscured (B) triggered (C) neutralized (D) confined',
    'B',
    'What began as… soon ___ 的句式在描述事件的擴大，trigger a debate 意為「引發辯論」，與 broader 呼應。(A) obscured 模糊、(C) neutralized 中和、(D) confined 侷限，三者方向都是縮小或壓抑，與 broader public debate 矛盾。故選 (B)。',
  ],
  [
    'Rather than relying on dramatic imagery or emotional appeals, the documentary adopts a ___ approach, offering a careful and evidence-based examination of the long-term social consequences of rapid urbanization.',
    '(A) superficial (B) partisan (C) measured (D) fragmented',
    'C',
    'Rather than 的對比加上後半句的 careful and evidence-based，指向「節制、審慎」的手法，measured approach 即此意。(A) superficial 膚淺與 careful 相反，(B) partisan 帶黨派立場與 evidence-based 相斥，(D) fragmented 零碎則與 examination 的系統性不合。故選 (C)。',
  ],
  [
    'Despite early optimism and repeated rounds of negotiation, the peace talks eventually ___ when the two sides failed to reach agreement on territorial boundaries and security guarantees.',
    '(A) culminated (B) stabilized (C) converged (D) collapsed',
    'D',
    'Despite 讓步加上 failed to reach agreement，可知和談最終「破局」，collapse 意為崩潰、告吹。(A) culminated（達到高潮）、(B) stabilized（趨於穩定）、(C) converged（趨於一致）全是正面結果，與談判失敗矛盾。故選 (D)。',
  ],
  [
    'In its ruling, the court concluded that the surveillance program, although justified on grounds of national security, nevertheless ___ constitutional protections related to privacy and due process.',
    '(A) reinforced (B) expanded (C) clarified (D) infringed',
    'D',
    'although… nevertheless 的雙重轉折要求空格與 justified 相對立：雖然基於國安有其正當性，卻仍「侵害」了隱私與正當程序的憲法保障，infringe 意為侵犯（權利）。(A) reinforced 強化、(B) expanded 擴大、(C) clarified 釐清，都不構成轉折。故選 (D)。',
  ],
  [
    "What initially appeared to be a minor technical malfunction was later recognized by engineers as ___ of deeper structural flaws embedded in the system's original design.",
    '(A) symptomatic (B) dismissive (C) incidental (D) decorative',
    'A',
    'be symptomatic of 是固定搭配，意為「是……的徵兆」，句意為原以為只是小故障，後來才發現是設計中更深層結構缺陷的徵兆。(C) incidental（附帶的、無關緊要的）會讓句子失去 What initially appeared… was later recognized 的轉折張力。(B) dismissive 輕蔑的、(D) decorative 裝飾性的，語意皆不合。故選 (A)。',
  ],
]

const PASSAGE_JP = `Passage: Questions 35-39
After years of pandemic restrictions, Japan has experienced a dramatic rebound in international tourism, driven by a weak yen, expanded flight routes, and pent-up global demand. While the surge has delivered clear economic benefits, it has also (35) ___ long-standing tensions between national growth strategies and local capacity, particularly in historic districts and rural destinations unaccustomed to sustained visitor pressure.

In cities such as Kyoto and Kamakura, residents have raised concerns about congestion, noise, and the erosion of everyday life. Local governments, once eager to attract tourists, now find themselves (36) ___ by needing to balance between promoting economic recovery and responding to mounting public frustration. Measures such as higher accommodation taxes, restricted access to certain areas, and differentiated pricing for foreign visitors have been proposed, though each carries political and ethical implications.

Critics argue that Japan's tourism model has relied too heavily on volume rather than sustainability, (37) ___ short-term gains while externalizing social costs. At the same time, officials caution that abrupt restrictions could undermine regional economies still struggling to recover. The result is a policy environment marked less by decisive reform than by incremental adjustment.

Ultimately, the challenge of overtourism in Japan is not merely logistical but conceptual. It raises questions about who tourism is for, who bears its costs, and how cultural heritage should be protected without being (38) ___ into a consumable spectacle. Whether current measures represent a genuine shift toward sustainable tourism or merely a temporary (39) ___ remains an open question.`

const PART_III_CLOZE = [
  [
    '(A) resolved (B) exacerbated (C) neutralized (D) postponed',
    'B',
    'While the surge has delivered clear economic benefits, it has also ___ 的 While 與 also 要求空格帶出負面效果，exacerbate 意為「加劇（既有問題）」，正好搭配 long-standing tensions。(A) resolved 解決、(C) neutralized 化解，方向相反；(D) postponed 延後則不與 tensions 搭配。故選 (B)。',
  ],
  [
    '(A) insulated (B) constrained (C) suspended (D) aligned',
    'B',
    '地方政府夾在「促進經濟復甦」與「回應民怨」之間，find themselves constrained by 意為受制、動彈不得。(A) insulated 被隔絕保護，與夾在中間的處境相反；(C) suspended 停職／暫停，主詞不合；(D) aligned 一致，與兩難的語境矛盾。故選 (B)。',
  ],
  [
    '(A) privileging (B) obscuring (C) redistributing (D) compensating',
    'A',
    '本句在批評日本觀光模式重量不重永續，分詞構句 ___ short-term gains while externalizing social costs 形成對比：偏重短期利益、卻把社會成本外部化。privilege 當動詞意為「優先看待、給予特權」，最合。(B) obscuring 模糊化 gains 語意不通，(C) redistributing 重新分配與 externalizing 的對比失焦，(D) compensating 補償方向相反。故選 (A)。',
  ],
  [
    '(A) diluted (B) instrumentalized (C) commemorated (D) standardized',
    'B',
    '句意為文化遺產應受保護，而不該被「工具化」成可供消費的奇觀，instrumentalize into a consumable spectacle 正是把文化當成手段的批判用語，呼應前文 who tourism is for、who bears its costs 的提問。(A) diluted 稀釋、(D) standardized 標準化雖也是負面，但都無法與 into a consumable spectacle 構成「淪為……」的語意；(C) commemorated 紀念是正面詞。故選 (B)。',
  ],
  [
    '(A) anomaly (B) concession (C) recalibration (D) solution',
    'C',
    '句式為 a genuine shift toward sustainable tourism or merely a temporary ___，兩者對比：真正的轉向 vs. 只是暫時的微調。前段已鋪陳 "a policy environment marked less by decisive reform than by incremental adjustment"，recalibration（重新校準、微調）正是 incremental adjustment 的同義改寫。(A) anomaly 異常、(B) concession 讓步、(D) solution 解方，都接不上這個伏筆。故選 (C)。',
  ],
]

// ------------------------------------ Part IV（第 40–50 題）

const PART_IV_HEADER =
  "Part IV. Contextual Analysis: Replace the target word or phrase with one of the four options. The correct answer must maintain the original meaning without altering the sentence's logical or grammatical structure."

const PART_IV = [
  [
    'As a widely used social media platform faces mounting criticism over data breaches and algorithmic bias, the controversy has raised the stakes for a company already under intense regulatory and public scrutiny.\n(A) intensified media scrutiny\n(B) increased the seriousness and potential consequences\n(C) accelerated the pace of product development\n(D) exposed long-standing organizational weaknesses',
    'B',
    'raise the stakes 源自賭桌上的「加注」，引申為「提高風險與後果的嚴重性」，(B) 正是其字面意義的展開。(A) 把 stakes 誤讀成媒體關注，且句尾已另有 scrutiny 一詞。(C) 與資安爭議無關。(D) 說的是揭露既有弱點，並非提高風險。故選 (B)。',
  ],
  [
    "Given the volatile nature of the market, the CEO decided to hedge her bets by diversifying the company's investment portfolio across multiple sectors.\n(A) take a significant financial risk\n(B) reduce the risk of a loss by following several courses of action\n(C) withdraw all capital from the current market\n(D) focus exclusively on the highest-performing asset",
    'B',
    "hedge one's bets 意為「分散押注以降低損失風險」，句中的 diversifying… across multiple sectors 正是這個做法的說明，(B) 完全吻合。(A) 冒大風險與避險相反。(C) 全數撤資與 (D) 集中單一標的，都與「分散」矛盾。故選 (B)。",
  ],
  [
    'The legal team warned that the new regulations might stifle innovation within the tech industry by imposing excessive administrative hurdles.\n(A) encourage and support growth\n(B) provide a framework for development\n(C) suppress or prevent\n(D) monitor the progress of a project',
    'C',
    'stifle 原意為「使窒息」，引申為壓抑、扼殺，句中由 warned 與 excessive administrative hurdles 確認是負面效果，(C) suppress or prevent 為其同義。(A) 與 (B) 都是正面詞，與 warned 的語氣相斥。(D) 監督進度並非 stifle 的意思。故選 (C)。',
  ],
  [
    "Critics argued that the politician's speech was merely rhetoric, designed to appease the crowd without offering any concrete policy solutions.\n(A) language designed to have a persuasive effect but often lacking sincerity\n(B) a detailed and actionable legislative plan\n(C) an aggressive and confrontational style of debate\n(D) a humble apology for past mistakes",
    'A',
    'merely rhetoric 帶貶義，指「只是漂亮話」——有說服效果卻缺乏誠意與實質，(A) 的定義正好對應句尾的 without offering any concrete policy solutions。(B) 與 without… concrete policy 直接矛盾。(C) 把 rhetoric 誤解成好辯的風格，(D) 道歉則與 appease the crowd 的語境不同。故選 (A)。',
  ],
  [
    "Although the initial results were promising, the researchers remained cautious, knowing that the small sample size was a caveat to their conclusions.\n(A) a strong piece of supporting evidence\n(B) a warning of potential limitations\n(C) a final summary of the study's impact\n(D) an unexpected breakthrough in the data",
    'B',
    'caveat 意為「須注意的但書、限制性的提醒」，句中樣本數過小正是結論的保留條件，與 remained cautious 呼應，(B) 為其同義。(A) 支持性證據與 (D) 突破都是正面詞，與 Although… cautious 的轉折不合；(C) 總結亦非其意。故選 (B)。',
  ],
  [
    'Following months of whistleblower testimony and forensic audits, independent investigations have lent credence to allegations that the data were deliberately manipulated, prompting calls for regulatory scrutiny.\n(A) intensified media coverage of\n(B) provided support or legitimacy to\n(C) postponed official verification of\n(D) weakened competing explanations for',
    'B',
    'lend credence to 意為「使……更可信、為……提供佐證」，句中獨立調查讓指控更站得住腳，因而引發監管呼聲，(B) 即其同義。(A) 媒體報導量與 credence（可信度）不同。(C) 延後查證與 Following… audits 的推進方向相反。(D) 削弱其他解釋是間接效果，並非該片語的意思。故選 (B)。',
  ],
  [
    'Following weeks of intense media scrutiny and public criticism over the handling of the controversy, party members quickly closed ranks, presenting a unified front in an effort to contain political fallout.\n(A) dispersed publicly to avoid further scrutiny\n(B) restructured leadership roles within the organization\n(C) delayed internal decision-making to reduce conflict\n(D) unified defensively to protect the group from external criticism',
    'D',
    'close ranks 原是軍事用語「收攏隊形」，引申為「內部團結一致對外」，句中 presenting a unified front 就是同義提示，(D) 完全對應。(A) 四散躲避與團結相反。(B) 改組領導層與 (C) 延後決策，句中都沒有依據。故選 (D)。',
  ],
  [
    'Through detailed testimony that challenged earlier assumptions and introduced new evidence, the witness helped reshape the narrative surrounding the crisis, shifting public perception of who bore responsibility.\n(A) reinforce existing interpretations without alteration\n(B) change how the story is understood and interpreted\n(C) bring the issue to a definitive conclusion\n(D) divert attention away from the central facts',
    'B',
    'reshape the narrative 意為「改變事件被理解與詮釋的方式」，句尾 shifting public perception 是同義提示，(B) 正合。(A) 的 without alteration 與 challenged earlier assumptions 直接矛盾。(C) 下定論、(D) 轉移焦點，都不是 reshape 的語意。故選 (B)。',
  ],
  [
    'As new digital platforms and technologies are introduced at an unprecedented speed, innovation has continued to outpace regulation, leaving lawmakers struggling to update legal frameworks quickly enough to keep up.\n(A) be slowed down by existing legal frameworks\n(B) conform closely to established rules\n(C) develop faster than regulatory systems can adapt\n(D) eliminate the need for formal oversight',
    'C',
    'outpace 意為「速度超前於」，句尾 lawmakers struggling to update legal frameworks quickly enough to keep up 把落後的一方點得很清楚，(C) 為其忠實改寫。(A) 主客易位，變成創新被法規拖慢。(B) 遵循規則與超前無關。(D) 過度推論——跑得比法規快不等於不需要監理。故選 (C)。',
  ],
  [
    'After facing widespread backlash from both the public and opposition lawmakers, officials attempted to walk back their earlier remarks, clarifying their position and softening the language used in the original statement.\n(A) retract or soften previous statements\n(B) defend earlier remarks more aggressively\n(C) postpone further discussion indefinitely\n(D) shift attention to an unrelated issue',
    'A',
    'walk back 是美式政治用語，意為「收回或淡化先前的說法」，句中 clarifying their position and softening the language 即其具體做法，(A) 正是同義。(B) 強硬辯護與 softening 矛盾。(C) 無限期延後與 (D) 轉移話題，句中都沒有依據。故選 (A)。',
  ],
  [
    'Following a series of legal challenges and conflicting interpretations of constitutional law, the proposed legislation now appears to be on shaky ground, raising doubts about whether it can withstand judicial review.\n(A) bolstered by some legal interpretations\n(B) formally enacted but awaiting clarification through judicial precedent\n(C) legally uncertain and vulnerable to constitutional challenge\n(D) structurally sound but politically controversial',
    'C',
    'on shaky ground 意為「立足不穩、根基薄弱」，句尾 raising doubts about whether it can withstand judicial review 說明不穩的正是法律上的正當性，(C) 精準對應。(A) 獲得支持與「不穩」相反。(B) 錯在該法案還只是 proposed，尚未 enacted。(D) 的 structurally sound 同樣與 shaky 矛盾。故選 (C)。',
  ],
]

// ---------------------------------------------------------------- 組裝

function buildPaper() {
  const texts = new Array(50)
  const answers = {}

  const put = (number, text, answer, explanation) => {
    texts[number - 1] = text
    answers[`q-pp-cs-en-115-${number}`] = {
      questionId: `q-pp-cs-en-115-${number}`,
      answer,
      explanation,
    }
  }

  PART_I.forEach(([stem, options, answer, explanation], i) => {
    const number = i + 1
    const body = `${number}. ${stem}\n${options}`
    put(number, number === 1 ? `${PART_I_HEADER}\n\n${body}` : body, answer, explanation)
  })

  PART_II_A.forEach(([stem, answer, explanation], i) => {
    const number = 13 + i
    const body = `${number}. ${stem}`
    put(
      number,
      number === 13 ? `${PART_II_HEADER}\n\n${PASSAGE_A}\n\n${body}` : body,
      answer,
      explanation
    )
  })

  PART_II_B.forEach(([stem, answer, explanation], i) => {
    const number = 18 + i
    const body = `${number}. ${stem}`
    put(number, number === 18 ? `${PASSAGE_B}\n\n${body}` : body, answer, explanation)
  })

  PART_III_SINGLES.forEach(([stem, options, answer, explanation], i) => {
    const number = 24 + i
    const body = `${number}. ${stem}\n${options}`
    put(number, number === 24 ? `${PART_III_HEADER}\n\n${body}` : body, answer, explanation)
  })

  PART_III_CLOZE.forEach(([options, answer, explanation], i) => {
    const number = 35 + i
    const body = `${number}. ${options}`
    put(number, number === 35 ? `${PASSAGE_JP}\n\n${body}` : body, answer, explanation)
  })

  PART_IV.forEach(([stem, answer, explanation], i) => {
    const number = 40 + i
    const body = `${number}. ${stem}`
    put(number, number === 40 ? `${PART_IV_HEADER}\n\n${body}` : body, answer, explanation)
  })

  const questions = texts.map((text, i) => {
    if (!text) throw new Error(`第 ${i + 1} 題沒有題目文字`)
    return {
      id: `q-pp-cs-en-115-${i + 1}`,
      paperId: 'pp-cs-en-115',
      examId: 'cs',
      subjectId: 'cs-english',
      year: 115,
      number: i + 1,
      text,
      points: null,
      hasImage: false,
      subQuestions: [],
    }
  })

  return { questions, answers }
}

// ---------------------------------------------------------------- 寫入

const papersData = load('past-papers.json')
const questionsData = load('questions.json')
const answersData = load('answers.json')

const paper = papersData.papers.find((p) => p.id === 'pp-cs-en-115')
if (!paper) throw new Error('past-papers.json 找不到 pp-cs-en-115')
paper.url = PAPER_URL
paper.verified = true
delete paper.note

const { questions, answers } = buildPaper()

// 放在 pp-cs-en-114 之後，維持同一科目由新到舊的排列
const kept = questionsData.questions.filter((q) => q.paperId !== 'pp-cs-en-115')
const lastIdx = kept.map((q) => q.paperId).lastIndexOf('pp-cs-en-114')
if (lastIdx === -1) throw new Error('questions.json 找不到 pp-cs-en-114，無法決定插入位置')
questionsData.questions = [...kept.slice(0, lastIdx + 1), ...questions, ...kept.slice(lastIdx + 1)]

Object.assign(answersData.answers, answers)

save('past-papers.json', papersData)
save('questions.json', questionsData)
save('answers.json', answersData)

console.log(`pp-cs-en-115 已上架：${questions.length} 題、解答 ${Object.keys(answers).length} 筆`)
