#!/usr/bin/env node
// 為重建後仍缺答案的 124 題補上答案與解析。
//
// 涵蓋 pp-cs-en-110（英文(A) 110，50 題）、pp-im-en-114（英文(B) 114，50 題）、
// pp-cs-algo-112（16 題）、pp-cs-arch-108（8 題）。
//
// answer 欄位比照既有資料的慣例：單選填一個字母、複選填連續字母（如 "ABD"）、
// 申論題填 "N/A"、計算題填最終數值。

const fs = require('node:fs')
const path = require('node:path')

const answersPath = path.join(__dirname, '../public/data/answers.json')
const questionsPath = path.join(__dirname, '../public/data/questions.json')

// [題號起, 答案, 解析] —— 以陣列表示連續題號，索引即題號
function seq(prefix, start, rows) {
  const out = {}
  rows.forEach(([answer, explanation], i) => {
    out[`${prefix}-${start + i}`] = { answer, explanation }
  })
  return out
}

// ─────────────────────────────────────────── 英文(A) 110（pp-cs-en-110）

const EN110 = seq('q-pp-cs-en-110', 1, [
  [
    'B',
    '句意為「主張所有人平等、應享有同等權利與機會」，正是 egalitarian（平等主義的）的定義。equivalent 是「等同的」，指兩物相等而非社會理念；efficacious 是「有效的」；effluent 是「廢水」。',
  ],
  [
    'A',
    'strewn 意為「散落」，前面需要副詞描述散落的方式。haphazardly（雜亂無章地）與「散落在桌上的一堆文件」相符。coherently（條理分明地）、carefully（小心地）語意相反；accidentally 強調「意外地」，不足以描述雜亂狀態。',
  ],
  [
    'C',
    'niceties 指語言使用上的「微妙細節、精細之處」。句意為字表能提供例句，卻無法解釋當代英語用法的所有細微差異。positions（立場）、edges（邊緣）、happenings（事件）皆不合。',
  ],
  [
    'B',
    'lie fallow 是固定用法，指農地「休耕」。農夫讓土地每隔幾年休耕以恢復地力。shallow（淺的）、mellow（成熟柔和的）、fertile（肥沃的）都無法與 lie 構成這個意思 —— 尤其 fertile 語意正好相反。',
  ],
  [
    'C',
    'pervasive 意為「瀰漫的、無所不在的」，用來形容樟腦味久久不散、徹底透氣後才消失，最為貼切。perverse（乖僻的）、passive（被動的）、pertinent（切題的）皆與氣味無關。',
  ],
  [
    'C',
    'irrevocable 意為「不可撤回的」。句意為她簽約後後悔想收回卻做不到，正是因為該行為不可撤回。irreverent（不敬的）、irrelevant（不相關的）、irreproachable（無可指責的）都不符合「收不回來」的語境。',
  ],
  [
    'B',
    '關鍵在破折號後的說明：「devout without becoming narrowminded」（虔誠但不狹隘）。pious 就是中性的「虔誠」，符合 in the best sense 的限定。sanctimonious 是貶義的「假道學」，biased、prejudiced 皆為負面且與虔誠無關。',
  ],
  [
    'A',
    'conscientious 意為「一絲不苟的、盡責的」，與「反覆核對每個定義的正確性」直接呼應。cavalier（漫不經心的）語意相反；continuous（連續的）、callous（冷酷的）不合語境。',
  ],
  [
    'B',
    'inebriety 意為「酗酒」，是被解除主管職務的合理原因。sobriety（清醒、節制）語意相反；piety（虔誠）、variety（多樣性）都不構成免職理由。',
  ],
  [
    'C',
    'pacifists 指「和平主義者」，拒絕持械作戰卻仍以救護車駕駛與醫護兵身分在前線服務，正是和平主義者的典型行為。anarchists（無政府主義者）、nihilists（虛無主義者）、insurrectionists（起義者）都與「拒絕持械」的動機不符。',
  ],

  [
    'B',
    '天色暗了要「打開」電燈，英文用 turn on（開啟電器）。open the lights 是中式英語的常見錯誤，open 用於門窗、容器；touch 意為觸碰，語意不通。',
  ],
  [
    'C',
    'arrive 後接地點的介系詞取決於範圍：arrive at 用於較小的定點（餐廳、車站、機場），arrive in 用於較大的區域（城市、國家）。餐廳屬定點，故用 at。',
  ],
  [
    'B',
    '肯定句中表示「某個地方」用 somewhere。anywhere 用於否定句與疑問句表「任何地方」，此處是提議見面而非詢問任意地點；elsewhere 意為「別處」，語意不通。',
  ],
  [
    'B',
    '先行詞 experiment 在關係子句中作 in 的受詞：he trains a dog in the experiment。因此用「介系詞＋關係代名詞」的 in which。on which、with which 的介系詞搭配不符。',
  ],
  [
    'C',
    '前後句為讓步關係：雙胞胎出生就分開、在不同家庭長大（不利條件），卻仍有驚人相似之處。Although 引導讓步子句。However 是副詞不能引導子句；Hence（因此）表因果，方向相反。',
  ],
  [
    'B',
    'center on 後接名詞或動名詞。此處指「一切都取決於這個問題獲得解決」，被動語意需用動名詞被動式 being resolved。resolve 為原形動詞不能直接作介系詞受詞；with resolve（帶著決心）語意不通。',
  ],
  [
    'C',
    '主要子句主詞 The dog 與 expect 為主動關係，且動作同時發生，故用現在分詞 expecting 作分詞構句：狗畏縮了一下，預期會挨打。expect 為原形、to expect 為不定詞，皆不能作此處的分詞構句。',
  ],
  [
    'C',
    "與過去事實相反的假設，if 子句用過去完成式（hadn't been），主要子句須用 would/could/might have + 過去分詞。故選 would have come。",
  ],
  [
    'B',
    'made with 用於「由多種材料之一製成」。壽司除了生魚還有醋飯、海苔等，生魚只是其中一種食材。made of 用於材質不變且僅此單一材質；made from 用於材料經加工後已辨識不出原貌（如葡萄釀酒）。',
  ],
  [
    'C',
    'could have + 過去分詞表示「原本有能力做到卻沒做」，與後半句「花太多時間上網」構成對比。should have 表「本應該做卻沒做」的責備語氣，此處重點在能力而非義務；would have 需搭配假設條件。',
  ],

  [
    'C',
    'commit oneself to 意為「投入、許下承諾」，與後文「一旦投入就被困住很久」呼應。have difficulty 後接動名詞，故用 committing。constraining、containing、detaining 皆無此搭配語意。',
  ],
  [
    'A',
    '承接上句的承諾感：一旦投入，就覺得自己被「困住」很長一段時間。trapped 最貼切。tracked（被追蹤）、tackled（被處理）、convicted（被定罪）皆不合。',
  ],
  [
    'B',
    '長者告訴大學生「第一份工作不必然決定一生」，這對學生而言是一種「解放」。liberating 與前文的被困感形成對比。restricting、condemning、demeaning 都是負面詞，與安慰的語氣矛盾。',
  ],
  [
    'A',
    '對比前文的 ascending curve（一路向上的曲線），此處指職涯可以是「曲折的」，並以「五年後可能在做別的事」補充說明。zigzag 正是曲折之意。dead end（死路）過於負面；conclusion、solution 不成對比。',
  ],
  [
    'B',
    '句意為「一生早早就被定型的連續故事是一種文化建構，而非真實人生的『反映』」。reflection 意為反映、寫照。retraction（撤回）、resolution（決心）、revolution（革命）皆不合。',
  ],

  [
    'B',
    '本段主題為不同文化成員之間的溝通，故為 intercultural（跨文化的）communication problems。interstellar（星際的）、intertextual（互文的）、internal（內部的）皆不符。',
  ],
  [
    'C',
    '與 disagreement、fighting 並列，需要一個負面的衝突詞。strife 意為「衝突、紛爭」。accord（協議）、appeasement（綏靖）、settlement（和解）都是正面或中性的解決狀態，與並列詞矛盾。',
  ],
  [
    'A',
    '破折號後對比「地點會變，但問題依舊」。persist 意為持續存在。cease（停止）語意相反；increase（增加）與 the locations may change 的對比結構不合；deter（阻止）為及物動詞且語意不通。',
  ],
  [
    'B',
    'affect 是動詞「影響」，effect 是名詞「效果」。此處需要動詞，主詞為 what happens...，故用 affects。detects（偵測）、attacks（攻擊）語意不通。',
  ],
  [
    'A',
    '為了更理解不同文化的人，我們必須學會欣賞他們的「多樣性」。diversity 與 different cultures 直接呼應。adversity（逆境）、atrocity（暴行）、sagacity（睿智）皆不合。',
  ],

  [
    'B',
    '要改變習慣，人必須相信改變是「可能的」。possible 與後文尋求團體支持、最終成功的正面論述一致。impossible、improbable 語意相反；passable（尚可的）不合。',
  ],
  [
    'C',
    '找出另一套能「滿足」香菸所填補之渴望的做法。satisfy the cravings 為固定搭配。attain（達成）、pertain（有關）不能接 cravings；deprive 意為剝奪，語意方向錯誤。',
  ],
  [
    'A',
    '指「當你覺得自己可能會犯錯／破戒時」就靠團體支撐。stumble 有「失足、出錯」之意。bumble（笨拙行事）、humble（使謙卑）、fumble（笨手笨腳摸索）皆不符戒斷語境。',
  ],
  [
    'B',
    '呼應前文的 figure out a different routine，此處指必須找到一套「替代的」慣性行為。alternative routine 為固定搭配。substitute 作形容詞時通常指人（substitute teacher）；other、different 前不加冠詞 an 且語氣不足。',
  ],
  [
    'B',
    '整段主旨是加入團體能大幅提高改變習慣的機率，故為「成功」的機率。odds of success 為固定搭配。failure、loss 語意相反；gain 與 odds 搭配不自然。',
  ],

  [
    'B',
    '若相信東西不夠分，人就會「囤積」財物。hoard 正是囤積。discard（丟棄）、give away（贈送）、give up（放棄）都與「相信資源稀缺」的心理相反。',
  ],
  [
    'A',
    '若你得到太多愛，我就會「吃虧、被虧待」。shortchanged 原意為找錢少找，引申為受到不公平待遇。blacklisted（被列黑名單）、enlisted（入伍）、detested（被憎恨）皆不合。',
  ],
  [
    'B',
    '呼應全段主旨：把稀缺當成人生法則的「假設」，反而製造出我們害怕的稀缺。scarcity assumption 指這個預設立場。solution、supposition、proposition 語氣或搭配不如 assumption 貼切，且首句已用 regard scarcity as the law of life 鋪陳此為一種假定。',
  ],
  [
    'C',
    '呼應前文 If I struggle with others over power，此處為「往上爬的權力階梯」。ladder of power 與該句對應。years、life、knowledge 都無法與「他人被擊敗、我永遠沒有安全感」的競爭語境對應。',
  ],
  [
    'C',
    '像是「受困」在撒哈拉沙漠最後一處綠洲一樣爭奪資源。stranded 意為受困、進退不得。landed（降落）、branded（被烙印）、arrived（抵達）都無法表達受困而競爭的意象。',
  ],

  [
    'C',
    '文章肯定人類在「掌握環境、增加糧食生產、建立城市與貿易網」以及「從獨木舟到太空梭」的技術進展，屬技術層面的進步。作者明確否定生態面（其他動物處境更快惡化）與精神面（我們依然不滿足、不知目標），故 A、B、D 皆被文章反駁。',
  ],
  [
    'C',
    '作者通篇肯定人類力量增長，卻反覆質疑我們是否減少了苦難、指出人類不負責任，並以「還有什麼比不知自己要什麼的神更危險」作結，語氣是憂慮不安的。apprehensive 正是此意。optimistic 與批判語氣相反；indifferent（漠然）、defensive（防衛）皆不符。',
  ],
  [
    'A',
    "文章描述人類「只有物理法則作伴、不需向任何人負責」，「不斷對同類動物與生態系造成浩劫，只求自身舒適與娛樂」，正是傲慢而魯莽。B 的仁慈同情與文意相反；C 的精於算計未被提及；D 的全知全能被作者否定（nobody knows where we're going）。",
  ],
  [
    'D',
    '文章明言人類力量增長「usually caused immense misery to other animals」，且其他動物的處境正以前所未有的速度惡化，即人類虐待了其他動物。A 的和平共存、C 的改善動物福祉皆與文意相反；B 的「動物為人類而存在」是作者批判的對象而非其觀點。',
  ],
  [
    'D',
    '結尾直接點題：「還有什麼比不滿足又不負責任、卻不知道自己要什麼的神更危險？」指的正是人類握有巨大力量（power）卻永不滿足（greed）。饑荒與戰爭在文中被列為「已減少」的項目；虐待動物與人類苦難是後果而非作者所指的最大危險。',
  ],

  [
    'C',
    "文章明確指出簡訊雖然簡短，但「globally they're our most frequent piece of writing: 12 billion per day」，是全球最頻繁的書寫形式。推特每日五億則、臉書與部落格皆低於此數。",
  ],
  [
    'A',
    "Sturgeon's Law 是「九成的東西都是垃圾」，意即網路上的文字內容只有一小部分是好的。B 描述的是少數人產出多數內容，屬另一項調查發現；C 的編輯策展是文章用來對照的情況；D 誤把九成套用到「人口」而非「內容」。",
  ],
  [
    'C',
    '文章核心正是網路帶來書寫的大爆發，人們透過社群媒體自我表達的量前所未有。A 與文意相反；B 誤讀 —— 原文說相當於每天三千六百萬本書的「字數」，不是真的出版了那麼多書；D 前半與原文相反，原文說網路出現前多數人畢業後幾乎不再為樂趣而寫作。',
  ],
  [
    'A',
    '文章特別點名中國的新浪微博每日一億則更新、俄羅斯的 VK 以及其他語言的社群網路，明確指出這不是西方獨有的現象，故 A 為錯誤敘述。B、C 皆與原文相符；D 雖提到少數人產出多數內容，但原文緊接著說「有思想的內容量依然龐大」，不過該選項的前半仍符合調查結果，相較之下 A 的錯誤最為明確。',
  ],
  [
    'A',
    "全文主軸是網路讓自我表達式的書寫爆炸性成長，並與網路出現前的極少書寫量對比。A 涵蓋此主旨。B 只取 Sturgeon's Law 一句；C 誤讀三千六百萬本書的比喻；D 的數位素養並非文章討論重點。",
  ],
])

// ─────────────────────────────────────────── 英文(B) 114（pp-im-en-114）

const IMEN114 = seq('q-pp-im-en-114', 1, [
  [
    'D',
    'complement 意為「與⋯⋯相襯、互補」，鮮紅的鞋子與鮮紅的手提包相配。compliment 是「讚美」（拼字極易混淆）；compartment 是「隔間」；component 是「元件」，皆為名詞且語意不合。',
  ],
  [
    'D',
    'worn out 意為「精疲力竭」，符合「工作一週後」的語境。broken down 指機器故障或人崩潰；phased out 指逐步淘汰；turned down 指拒絕或調低，皆不合。',
  ],
  [
    'C',
    '後面列舉幼兒之死、母親自殺、姊姊被謀殺，都是death 相關的陰森情節，故用 morbid（病態的、陰森的）。exhilarating（令人振奮的）語意相反；opposable（可對置的）、avaricious（貪婪的）不合。',
  ],
  [
    'B',
    'adhere to 意為「遵守（規定、預防措施）」。revert to 是「回復到」；contribute to 是「促成」；subscribe to 是「訂閱／贊同」，皆不能表達遵守預防措施。',
  ],
  [
    'D',
    'substantiate 意為「以證據證實」，與後文提出實驗證據、個案報告、觀察紀錄完全對應。allocate（分配）、incorporate（納入）、exacerbate（加劇）皆不合。',
  ],
  [
    'A',
    'be analogous to 意為「與⋯⋯類似」，工程師說吊橋設計類似蜘蛛網結構。susceptible to 是「易受影響」；indifferent to 是「漠不關心」；intangible（無形的）不接 to。',
  ],
  [
    'A',
    'leverage 作動詞意為「善用、發揮（既有技術的）效益」，符合「將研究推進一步、運用單細胞技術研究更多組織」的語境。manufacture（製造）、screen（篩檢）、prescribe（開處方）皆不合。',
  ],
  [
    'C',
    '與後半句「移民立刻同意政府的提議」形成對比，島民是「不情願回應」，可見其性格固執難撼，故用 tenacious（頑強的）。exquisite（精緻的）、robust（強健的）、mediocre（平庸的）都無法構成這個對比。',
  ],
  [
    'B',
    'expunge 意為「刪除、抹去（文字紀錄）」。編輯要求先刪掉點名政治醜聞當事人的段落才肯付印。expound（詳述）語意相反；detach（分離）、dismantle（拆解）不用於文字段落。',
  ],
  [
    'A',
    '被定罪的犯人對陪審團「大聲咒罵」，profanities 即髒話、褻瀆之詞。approbations（讚許）、benedictions（祝福）語意相反；amenities（便利設施）完全不合。',
  ],
  [
    'B',
    'grievance 意為「（勞工的）申訴、不滿」，與前文「許多工人抱怨工作條件」直接對應，且是成立特別委員會要調查的對象。divergence（分歧）、serendipity（意外發現）、disparagement（貶低）皆不合。',
  ],
  [
    'C',
    'antithetical to 意為「與⋯⋯背道而馳」。處罰未穿著合宜服裝的學生，與「教育所有學生」的使命相牴觸。compatible（相容的）語意相反；extravagant（奢侈的）、outrageous（駭人的）不與 to 搭配此意。',
  ],

  [
    'B',
    'the least you can do 是固定用法，意為「至少該做的事」。句意為「我真的認為道歉是你至少該做的」。a little 不與 you can do 構成此結構；as far as、not as much as 語意不通。',
  ],
  ['C', 'promise 後接不定詞，否定形式為 promise not to + 原形動詞。故選 to be：我答應不會遲到。'],
  [
    'C',
    '先行詞 the place 為地點，且關係子句 your parents spend their vacation 結構完整不缺主詞或受詞，故需用關係副詞 where。that、which 為關係代名詞，用了會使子句缺少受詞；who 只用於人。',
  ],
  [
    'D',
    '主要子句動詞 wondered 為過去式，其後的名詞子句須配合時態後移，故用 would look like。此外「未來看起來如何」的正常語序是 her future looks like，而非 looks like her future，故 A、B 兩項語序也錯。',
  ],
  [
    'A',
    '(A) 為分詞構句的懸垂修飾錯誤：Using the latest technology 的邏輯主詞應是「人」，但主要子句主詞是 better hearing（更好的聽力不會使用技術）。(B)(C)(D) 的分詞其邏輯主詞都與主要子句主詞一致，正確。',
  ],
  [
    'D',
    '(D) until 引導的時間副詞子句中不使用進行式表未來，應為 until you finish the writing。(A) 用現在進行式表即將發生、(B) 用現在進行式表暫時狀態、(C) 用現在進行式表已排定的近期安排，皆為正確用法。',
  ],
  [
    'A',
    '(A) 混用條件句型：if 子句用過去完成式（had studied）屬第三類假設，主要子句必須是 would have got，不能用 will get。(B) 為第二類假設、(C) 為第一類假設、(D) 為第二類假設，皆正確。',
  ],
  [
    'B',
    '(B) 應為 What the team needs now is clear leadership。名詞子句作主詞且子句中缺少 needs 的受詞時要用 what，whether 引導的是「是否」的子句，語意與結構皆不通。(A)(C)(D) 分別為省略關係代名詞、分裂句、what 引導的名詞子句，皆正確。',
  ],
  [
    'C',
    '(C) 應為 I wish I had remembered to bring my umbrella。wish 表達與過去事實相反的遺憾時，子句須用過去完成式。由 (D) 的 I had left it at home 也可確認講述的是過去已發生的事。',
  ],
  [
    'B',
    "(B) 前後矛盾：既然說「我不該用這種油漆」，後面就不可能是「這是對的那種」，應為 It's the wrong kind。(A) might have + 過去分詞表對過去的推測、(C) should have 表懊悔、(D) must have 表有把握的推斷，邏輯皆通順。",
  ],

  [
    'A',
    'due to 意為「由於」，指許多人因行程忙碌或沒有食慾而不吃早餐。similar to、contrary to、according to 語意皆不通。',
  ],
  [
    'D',
    'have effects on 意為「對⋯⋯產生影響」，指這個習慣對身心健康都有明顯影響。additions to（增添）、functions of（功能）、patterns with 皆不符「不吃早餐造成影響」的語意。',
  ],
  [
    'B',
    '空格前為 the body，後為 energy，指身體在數小時未進食後「渴求」能量。craving 意為渴求，且此處為分詞修飾 the body。featuring（以⋯⋯為特色）、pursuing（追求）、resolving（解決）皆不合。',
  ],
  [
    'A',
    '前段講不吃早餐導致暴食，本句再加一項負面影響（影響專注力與生產力），屬於補充並列，故用 Additionally。Conversely（相反地）表對比，但兩者同為負面影響，並無轉折。',
  ],
  [
    'C',
    'compensate for 意為「彌補」，指暴食往往是為了補回錯過的熱量，因而導致體重增加。contend（主張／競爭）、fend（抵擋）、vouch（擔保）皆不與 for 構成此意。',
  ],

  [
    'C',
    '主要子句已有動詞 are，此處需用分詞構句補述，且 spiffs 與 offer 為主動關係，故用現在分詞 offering。to offer 表目的、offer 為原形動詞、offered 為被動，皆不合。',
  ],
  [
    'A',
    'such as 用於舉例，說明這類獎勵「例如達標獎金」。unlike（不同於）、in addition to（除了）、despite（儘管）都會使前後語意矛盾 —— 達標獎金正是 spiff 的一種。',
  ],
  [
    'A',
    'mitigate 意為「減輕（疑慮）」，與「雖然有人認為 spiff 可能助長惡性競爭，但妥善執行可以⋯⋯」的讓步結構相符。elicit（引出）、implicate（牽連）方向錯誤；forestall（預先阻止）語意較近但搭配 concerns 時不如 mitigate 自然，且前文疑慮已存在，只能減輕而非預防。',
  ],
  [
    'B',
    '複合形容詞的正確形式為 results-driven（以成果驅動的），採「名詞＋過去分詞」結構，如 data-driven、market-driven。其餘三個選項語序或詞性錯誤。',
  ],
  [
    'D',
    'align A with B 為固定搭配，意為「使 A 與 B 一致」。此處指確保員工的努力與公司目標一致。for、on、to 皆非 align 的正確搭配介系詞。',
  ],

  [
    'C',
    '第二段明言冬天毛色轉白可與雪地融為一體，提供絕佳偽裝以躲避北極熊與狼；夏天轉為棕灰色以配合凍原岩石地形。故變色的目的是與環境融合以偽裝。A、B 的保暖功能文中歸因於毛的厚度與體型，非顏色；D 未提及。',
  ],
  [
    'D',
    '文章通篇說明北極狐如何適應極端環境，但從未拿牠與其他北極動物比較「演化是否更成功」，故 D 為文中未提及的錯誤敘述。A（尾巴如包裹式毯子）、B（緊湊體型減少熱量散失）、C（吃動物糞便與撿食殘骸）皆有明確依據。',
  ],
  [
    'A',
    "testament to nature's ingenuity 直譯為「大自然巧思的明證」，後半句「展現動物如何演化以在最極端的條件下生存」正是在說大自然的創造力與適應力。B 的「簡單」與全文強調的多重精巧適應相反；C、D 未觸及 ingenuity 的意涵。",
  ],

  [
    'C',
    '第一段明確指出主因是加工食品過度普及，其中往往含有大量添加糖，讓人在不知不覺中攝取過量。A 說的是水果中的天然糖，與過量無關；B 的看不懂標示是文末建議要改善的行為，非文中所述主因；D 與運動的關聯文中未提。',
  ],
  [
    'D',
    'D 與文意完全相反 —— 文章說過量糖分因熱量高又不易產生飽足感而導致體重增加，並未說長期攝取糖分能防止體重增加。A（擾亂腸道菌相）、B（BMJ 研究指出心血管死亡風險高出 38%）、C（改吃水果等天然選項）皆與原文相符。',
  ],
  [
    'B',
    'satiety 意為「飽足感」。原句說糖「熱量高但 satiety 低」，因而導致體重增加 —— 亦即吃了不容易覺得飽，才會攝取過量。A 的消化過程、C 的飢餓感（語意相反）、D 的情緒性渴望皆不符。',
  ],

  [
    'B',
    '文章主軸是 Tarjei Boe 在賽季開局不順後於 Annecy 完成漂亮的逆轉奪冠，B 同時涵蓋「人物、成就、地點」。A 只談天候與速度的挑戰；C 與文意相反，年輕選手前段帶速但未能維持；D 雖提及挪威隊表現強勢，但焦點是個人奪冠。',
  ],
  [
    'C',
    '全文重點在於：儘管大雨造成賽道條件惡劣，Tarjei Boe 仍保持沉著、在射擊階段展現精準，最終奪下 15 公里追逐賽冠軍。A 與「挪威隊展現統治力」矛盾；B 與「年輕選手未能維持領先」矛盾；D 與弟弟第三名並為哥哥感到驕傲的敘述矛盾。',
  ],
  [
    'A',
    'A 為錯誤敘述 —— 原文說賽道條件因大雨而困難（difficult track conditions caused by heavy rain），且射擊精準度與速度必須兼顧，並非只需專注速度。B（確保未來錦標賽資格）、C（年輕選手前段帶速）、D（個人表現與團隊實力兼具）皆與原文相符。',
  ],
  [
    'D',
    'resilience 意為「從困境中迅速復原的能力」。文中用它形容 Tarjei Boe 在賽季開局不順後仍能重新站上顛峰，正是這個意思。A 的「不在乎挫折」是漠然而非復原；B 的天賦、C 的體能都不是 resilience 的核心語意。',
  ],

  [
    'C',
    'C 為錯誤敘述 —— 文章說《馬克白》是對「不受節制的野心」的驚悚探討，主角墮入道德腐敗與暴政，警示不擇手段追求權力的毀滅性後果，而非歌頌野心的喜悅與個人成就。A、B、D 皆與原文相符。',
  ],
  [
    'A',
    '全文以《羅密歐與茱麗葉》《哈姆雷特》《馬克白》三部作品，加上莎士比亞創造片語的貢獻，論證其影響力橫跨語言、敘事與普世人性經驗三個層面。B 把價值窄化為歷史脈絡、C 誤指其作品準確記錄史實、D 只涉及改編作品這一小節，皆非主旨。',
  ],
  [
    'B',
    'unchecked 意為「未受抑制、放任滋長的」。文中馬克白的野心在女巫預言與馬克白夫人的操弄下不斷膨脹，終致道德淪喪與暴政。A 的「受道德約束」語意正好相反；C、D 未觸及 unchecked 的核心意義。',
  ],
  [
    'D',
    '文章把 wild-goose chase 與 break the ice、foregone conclusion 並列，說明莎士比亞革新了英語、創造出「至今仍具影響力」的片語。D 正是此意。A 的自然意象、B 的戲謔語氣、C 的歷史脈絡隱喻皆非文章重點。',
  ],

  [
    'C',
    '第二段明白對比：前身哈伯望遠鏡主要在可見光波段運作，而韋伯專精紅外線觀測，因此能穿透濃密的氣體與塵埃雲，捕捉恆星育嬰室與數十億年前形成的遙遠星系。A 與「距地球約 150 萬公里」矛盾；B 把兩者顛倒；D 與哈伯以可見光運作矛盾。',
  ],
  [
    'A',
    'A 為錯誤敘述 —— 韋伯望遠鏡的任務是觀測宇宙深處，文中從未提及監測地球氣候。B（推進天文學、揭開謎團）、C（分析系外行星大氣尋找生命跡象）、D（宇宙膨脹速度比先前模型預測快約 8%）皆與原文相符。',
  ],
  [
    'D',
    '第三段說部署過程歷時 30 天，工程師面臨巨大挑戰，因為巨型遮陽罩或鏡面在展開過程中任何一次失敗都可能導致整個任務報銷 —— 也就是多年心血與數十億經費付諸流水。A、B 與「距地球 150 萬公里、無法由太空人維修或人工組裝」的事實矛盾；C 未提及。',
  ],
  [
    'B',
    '第六段說韋伯的觀測「可能為我們理解暗能量與暗物質開闢突破之路」，即可能揭示暗能量在宇宙膨脹中扮演的角色。A 與文意相反；C 與「暗能量約佔宇宙 69% 並驅動加速膨脹」矛盾；D 過度延伸 —— 文中只說可能帶來突破，未說能直接測量其物理性質。',
  ],
])

// ─────────────────────────────────────────── 資料結構與演算法 112

const ALGO112 = {
  'q-pp-cs-algo-112-1': {
    answer: 'ABCD',
    explanation:
      '(A) 正確：merge sort 最壞情況仍為 O(n log n)，是重視最壞表現時的好選擇。(B) 正確：加上「本回合無交換即提前結束」的最佳化後，bubble sort 對已排序輸入只需一輪掃描，為 O(n)。(C) 正確：quick sort 在隨機順序輸入下的平均時間為 O(n log n)。(D) 正確：selection sort 每輪只做一次交換，共 n−1 次，是所有簡單排序法中搬移次數最少的，適合搬移成本昂貴的情況。(E) 錯誤：對範圍 1…n^k 的整數以基數 n 做 radix sort 需要 k 輪，每輪 O(n)，總計 O(kn) 而非 O(k log n)。',
  },
  'q-pp-cs-algo-112-2': {
    answer: 'N/A',
    explanation:
      '本題需對照原卷的 B+ tree 結構圖作答，該頁圖檔題庫尚未收錄，故不提供選項答案。判讀時請逐項檢查四個 B+ tree 條件：(1) 所有資料只存在葉節點，內部節點僅存索引鍵並作為路由；(2) 所有葉節點串成雙向鏈結串列且位於同一層；(3) 內部節點的左子樹鍵值小於該鍵、右子樹鍵值大於等於該鍵；(4) 每個節點最多容納 4 個鍵，且非根節點的鍵數不得低於下限。常見的違規型態是資料出現在內部節點、葉節點深度不一致、以及子樹鍵值落在錯誤的區間。',
  },
  'q-pp-cs-algo-112-3': {
    answer: 'B',
    explanation:
      '依機率由小到大合併：G(0.03)+B(0.06)=0.09；再與 E(0.09) 合併為 0.18；與 A(0.15) 合併為 0.33；D(0.21)+F(0.21)=0.42；C(0.24)+0.33=0.57；最後 0.42+0.57=1.0。得到各符號碼長為 C=2、D=2、F=2、A=3、E=4、G=5、B=5。因此 (A) C 為 3 錯誤（實際為 2）、(B) G 為 5 正確、(C) E 為 5 錯誤（實際為 4）、(D) A 為 4 錯誤（實際為 3）、(E) 因 (B) 成立故不選。',
  },
  'q-pp-cs-algo-112-4': {
    answer: 'E',
    explanation:
      '大 O 是漸近上界，只要實際空間不超過該界限，敘述即為真。四項分別是：DFS 走平衡二元樹的空間為遞迴深度 O(log N)，未超過 O(N)；DFS 走一般（可能傾斜）二元樹最壞為 O(N)；BFS 的佇列最多同時容納一整層節點，平衡樹最寬一層約 N/2，為 O(N)；一般二元樹的 BFS 同樣為 O(N)。四項皆成立，故選 (E) 4。附帶提醒：若題目意圖是要求「緊確界（tight bound）」，第一項的 DFS 平衡樹應寫成 Θ(log N)，該讀法下答案會變成 (D) 3 —— 作答時可留意命題者對 O 記號的定義。',
  },
  'q-pp-cs-algo-112-5': {
    answer: 'D',
    explanation:
      '共有 N 個已排序陣列、每個 M 個整數，總元素量為 NM。以大小為 N 的 min-heap 做 N 路合併：每次從堆頂取出最小元素並補入同一陣列的下一個元素，單次操作為 O(log N)，總共要處理 NM 個元素，因此為 O(NM log N)，選 (D)。若改用兩兩合併的分治法，複雜度同樣是 O(NM log N)。(A) 漏掉了每個陣列有 M 個元素；(B)、(C) 的對數項底數對象錯誤 —— 堆的大小取決於陣列數 N 而非每個陣列的長度 M。',
  },
  'q-pp-cs-algo-112-6': {
    answer: 'AE',
    explanation:
      '依原卷附圖，樹的中序走訪為 D H B E I A J F C K G L M。(A) 正確：B 的中序後繼是 E。(B) 錯誤：A 的中序後繼是 J，不是 C。(C) 錯誤：逐節點檢查左右子樹高度差皆不超過 1（A 為 |3−4|=1、C 為 |2−3|=1、G 為 |1−2|=1、B 為 |2−2|=0），這棵樹本身就是 AVL tree。(D) 錯誤：移除 J 後 F 變成葉節點高度為 1，節點 C 的左右高度差變成 |1−3|=2，不再是 AVL。(E) 正確：移除 H 後 D 變成葉節點，B 的高度差為 |1−2|=1、A 為 |3−4|=1，仍然滿足 AVL 條件。',
  },
  'q-pp-cs-algo-112-7': {
    answer: 'E',
    explanation:
      '每棵樹為 7 節點的完滿二元樹，中序走訪順序是「左子樹左葉、左子樹根、左子樹右葉、樹根、右子樹左葉、右子樹根、右子樹右葉」。依附圖讀出各樹的中序位元串並轉為十進位後對 11 取餘數，再以線性探測依序插入：t₁→0（空位）、t₂→4（空位）、t₃→4 已被佔用故探測到 5（碰撞 1 次）、t₄→6（空位）、t₅→6 已被佔用故探測到 7（碰撞 1 次）、t₆→0 已被佔用故探測到 1（碰撞 1 次）、t₇→7 已被佔用故探測到 8（碰撞 1 次），合計 4 次碰撞，選 (E)。提醒：各節點的 0/1 數值係由掃描圖檔判讀，作答練習時請對照原卷附圖再確認一次位元串。',
  },
  'q-pp-cs-algo-112-8': {
    answer: 'ABD',
    explanation:
      '(A) 正確：後序（postfix）表示法的運算順序已由位置決定，完全不需要括號。(B) 正確：同理也不需要考慮運算子優先順序。(C) 錯誤：人類習慣中序表示法，後序反而難讀。(D) 正確：電腦只需一個堆疊即可線性掃描求值，實作簡單效率高。(E) 錯誤：對同一運算式，前序與後序的符號數量完全相同，並不會比較精簡。',
  },
  'q-pp-cs-algo-112-9': {
    answer: 'AC',
    explanation:
      '(A) 正確：DFS 只需保存從根到目前節點的路徑，空間為 O(深度)；BFS 需保存整層節點，在八皇后這種分支度高的搜尋樹上會呈指數成長，記憶體差距是偏好 DFS 的首要理由。(C) 正確：八皇后只要找到「一組可行解」即可，DFS 會一路往下擺到底，能很快抵達「成功」或「此路不通」的終端狀態並回溯；BFS 要把淺層所有部分解都展開完才會往下一層，找到完整解的速度慢得多。(B) 雖是事實，但那是 DFS 的實作方式而非「偏好 DFS 勝過 BFS」的理由 —— BFS 也同樣可以用佇列簡單實作。(D) 兩者概念都不複雜，難分軒輊，不構成理由。(E) BFS 本來就該用佇列，這是對 BFS 的描述而非選擇 DFS 的理由。',
  },
  'q-pp-cs-algo-112-10': {
    answer: 'ABDE',
    explanation:
      '(A) 正確：維護一個大小為 k 的 min-heap，即可在串流中即時取得最大的 k 個數。(B) 正確：以一個 max-heap 存較小半邊、一個 min-heap 存較大半邊，可在 O(log n) 內維護串流中位數。(D) 正確：證券撮合的委託簿本質上就是買方 max-heap 與賣方 min-heap，用以快速找出最高買價與最低賣價。(E) 正確：事件驅動的分子動力學模擬以優先佇列（heap）依時間排序下一個碰撞事件，這是 heap 的經典應用。(C) 錯誤：PageRank 是對轉移矩陣做迭代的冪次法運算，屬線性代數計算，與 heap 無關。',
  },
  'q-pp-cs-algo-112-11': {
    answer: 'ABDE',
    explanation:
      '(A) 正確：DP 問題都可以轉化為在一張有向無環圖（子問題為節點、狀態轉移為邊）上找最佳路徑。(B) 正確：DP 以表格由下而上填滿，過程中所有相關子問題的最佳解都已一併求出。(D) 正確：這就是最佳子結構（optimal substructure），是 DP 成立的前提之一。(E) 正確：重疊子問題（overlapping subproblems）是 DP 的另一個前提，也是它比單純分治法有效率的原因。(C) 錯誤：DP 表格只保存每個子問題的最佳值，次佳解需要額外保存候選集合或另行設計 k-best 演算法，並非「直接可得」。',
  },
  'q-pp-cs-algo-112-12': {
    answer: 'BD',
    explanation:
      '(B) 正確：Dijkstra 以優先佇列取出目前距離最小的節點，實作上通常用 heap，可將複雜度降到 O((V+E) log V)。(D) 正確：Floyd-Warshall 以「是否經過中繼點 k」逐步擴充，是典型的動態規劃。(A) 錯誤：Dijkstra 的正確性依賴「已確定的最短距離不會再變小」，只要有負權邊就可能失效，不是只要沒有負環就可以用。(C) 錯誤：Floyd-Warshall 可以處理負權邊，但圖中不能有負環，否則最短路徑無定義。(E) 錯誤：對每條邊加上固定權重會依路徑「邊數」不等比例地加重，邊數多的路徑被懲罰更多，最短路徑可能因此改變。',
  },
  'q-pp-cs-algo-112-13': {
    answer: 'ABCD',
    explanation:
      '(A) 正確：這是環路性質（cycle property）—— 把不在 MST 中的邊 e 加入 T 會形成一個環，e 必為該環中權重最大的邊，否則以環中更大的邊替換 e 可得更小的生成樹。(B) 正確：這是切割性質（cut property）—— 跨越任一切割的最小權重邊必屬於某棵 MST。(C) 正確：全圖權重最小的邊是「以其兩端點為切割」的跨切割最小邊，必屬於某棵 MST。(D) 正確：次小邊與最小邊至多共用一個端點，無法單獨構成環，同樣可由切割性質保證屬於某棵 MST。(E) 錯誤：第三小的邊有可能與最小、次小兩邊恰好構成一個三角形，此時它會是該環中權重最大的邊，依環路性質不屬於任何 MST。',
  },
  'q-pp-cs-algo-112-14': {
    answer: 'ABCD',
    explanation:
      '(A) 正確：以堆疊暫存運算子並依優先順序彈出，即為經典的 Shunting-yard 演算法。(B) 正確：掃描後序式時以堆疊存放已組成的子運算式字串，遇運算子就取出兩個運算元並加上括號組合，即可還原中序式。(C) 正確：前序的第一個符號決定樹根，再由中序切出左右子樹範圍，可遞迴唯一還原。(D) 正確：後序的最後一個符號決定樹根，同理可唯一還原。(E) 錯誤：前序與後序無法唯一決定二元樹 —— 當節點只有一個子節點時，該子節點在左或在右會產生相同的前序與後序序列（僅對「每個節點都有 0 或 2 個子節點」的完滿二元樹才唯一）。',
  },
  'q-pp-cs-algo-112-15': {
    answer: 'N/A',
    explanation:
      '總元素量為 kn。學生 A：每取出一個元素都要掃描 k 個串列的頭節點找最小值，單次 O(k)，取出 kn 次，故為 O(k²n)。學生 B：以大小為 k 的 min-heap 維護各串列目前的頭節點，每個元素進出堆各一次、單次 O(log k)，故為 O(kn log k)。學生 C：分治法將 k 個串列兩兩合併，遞迴深度為 log k 層，每一層都要走過全部 kn 個元素，故為 O(kn log k)。結論：A 為 O(k²n)，B 與 C 同為 O(kn log k)；當 k 較大時 B、C 明顯優於 A。',
  },
  'q-pp-cs-algo-112-16': {
    answer: '5',
    explanation:
      '對 P=ABACABACABACABAD 逐步計算前綴函數，得 π = [0,0,1,0,1,2,3,4,5,6,7,8,9,10,11,0]。第 7 行 k=π[k] 只在 while 迴圈成立時執行，共發生於兩處：q=4 時 k=1、P[2]=B≠P[4]=C，執行一次使 k 歸 0；q=16 時 P[16]=D 與前綴無法匹配，k 依序由 11→7→3→1→0 退回，執行四次。其餘 q 值都在第一次比較就匹配成功而未進入迴圈。合計 1+4 = 5 次。',
  },
}

// ─────────────────────────────────────────── 計算機結構與作業系統 108

const ARCH108 = {
  'q-pp-cs-arch-108-1': {
    answer: 'N/A',
    explanation:
      'a) FALSE。軟體管線化（software pipelining）與全域指令排程的目的是把有相依性的指令拉開距離、填滿延遲空檔，單發射的管線化處理器同樣受惠 —— 例如把載入指令提前以掩蓋記憶體延遲。多發射機器只是能放大這個效益，並非前提。\nb) FALSE。有資料相依不必然造成停頓：RAW 相依多數可由前遞（forwarding／bypassing）在管線內解決，只有像 load-use 這種來源尚未就緒的情況才需要插入氣泡；WAR 與 WAW 屬名稱相依，可用暫存器重新命名消除。',
  },
  'q-pp-cs-arch-108-2': {
    answer: 'N/A',
    explanation:
      'a) 選 4（減少完成的 page walk 次數）。工作集約 2 GB，以 4 KB 分頁需要約 50 萬個頁表項，遠超過 TLB 的涵蓋範圍（TLB reach），在整個工作集上隨機存取幾乎每次都 TLB miss 並觸發 page walk。改用 2 MB 大分頁後，同樣的 2 GB 只需約 1000 個項目，TLB 命中率大幅提升。選項 5 不成立 —— 題目已說明 swap 關閉，不會有分頁錯誤；選項 3 也不對，分頁大小不改變資料在虛擬位址空間中的連續性。\nb) 選 4。亂序超純量利用的是指令階平行（ILP），而資料階平行（DLP）靠的是 SIMD／向量單元，不是亂序執行機制。其餘四項對亂序超純量而言都成立。\nc) 選 2（區塊鏈挖礦）。TEE 的用途是保護少量高敏感資產與操作 —— 指紋辨識、私鑰保管、Android keystore、亂數產生都屬此類。挖礦是長時間、高運算量且不涉機密的工作，放進資源受限的安全區既無安全上的必要，也會排擠真正需要保護的作業。',
  },
  'q-pp-cs-arch-108-3': {
    answer: 'N/A',
    explanation:
      'a) 虛擬指令（pseudo instruction）是組合語言層級提供、但硬體並未實作的指令，由組譯器展開成一到多道真實指令。好處是讓組合語言更好寫好讀、提供跨架構一致的寫法，同時不必為此擴充 ISA 與硬體。\nb) 真實的前置／後置遞增指令把「存取記憶體」與「更新位址暫存器」合併成一道指令，可減少指令數與程式碼大小、降低取指頻寬需求，也少佔一個發射槽。最受惠的高階語言結構是陣列的循序走訪、指標遞增（如 C 的 *p++）、字串處理，以及堆疊的推入彈出。\nc) Itanium 是靜態排程的 VLIW/EPIC 架構，仰賴編譯器把載入儘早提前以掩蓋延遲。後置遞增在「先搬資料、後改位址」的語意下，位址更新不會擋住當下的存取；前置遞增則必須先完成位址加法才能發出存取，形成額外的相依鏈，不利於編譯器的靜態排程，效益不足以支撐額外的編碼空間與硬體成本。\nd) 缺點：指令語意變複雜、單一指令產生兩個結果（載入值與更新後的位址），使相依性追蹤、暫存器重新命名與例外處理（尤其精確例外時需回復已被修改的位址暫存器）都更麻煩；同時佔用寶貴的指令編碼空間，也可能拉長關鍵路徑。',
  },
  'q-pp-cs-arch-108-4': {
    answer: 'N/A',
    explanation:
      'a) 例外（exception，由指令執行同步引發）：page fault、TLB miss、浮點運算下溢、未定義指令、execution abort、system call。中斷（interrupt，由外部非同步事件引發）：I/O 裝置請求、使用者定義中斷。判準是「是否由當前指令本身觸發、且與指令流同步」—— system call 雖常被稱為軟體中斷，但它由 trap 指令同步觸發，歸類為例外。\nb) 由難到易：Speculative execution（推測執行）> Out-of-order superscalar（亂序超純量）> Superscalar（超純量）> Pipelined（管線化）> Hierarchical data caches（階層式資料快取）> Single issue in-order（單發射循序）。困難度的來源是「要維持精確例外，必須能把機器狀態回復到出錯指令之前」—— 推測執行還多了要作廢錯誤路徑上的所有副作用；循序單發射每次只有一道指令在飛，最單純。\nc) 由難到易：GPGPU > Virtual Machines > Containers > Hyper-threaded processor > Superscalar processor > Pipelined processor。GPGPU 有數千條執行緒同時在飛且缺乏逐執行緒的精確狀態，最難處理；虛擬機需要在 hypervisor 與客體作業系統之間做中斷的攔截與注入；容器共用同一核心，中斷處理相對單純，只需歸屬到正確的命名空間；超執行緒需判斷中斷該送往哪個邏輯核心並處理共用資源。',
  },
  'q-pp-cs-arch-108-5': {
    answer: 'N/A',
    explanation:
      'a) ILP：Instruction-Level Parallelism，指令階平行。DLP：Data-Level Parallelism，資料階平行。MLP：Memory-Level Parallelism，記憶體階平行（同時容納多筆未完成的記憶體存取）。TLP：Thread-Level Parallelism，執行緒階平行。\nb) 架構／微架構技術 —— ILP：管線化、超純量發射、亂序執行、分支預測、暫存器重新命名。DLP：SIMD／向量指令（SSE、AVX、NEON）、GPU 的 SIMT 執行。MLP：非阻塞式快取與 MSHR、硬體預取器、亂序執行下的多筆未完成載入。TLP：多核心、同步多執行緒（SMT／超執行緒）、快取一致性協定。\nc) 軟體技術 —— ILP：迴圈展開、軟體管線化、指令排程、以述詞化消除分支。DLP：向量化（自動或以 intrinsics 手寫）、資料佈局改為 SoA 以利連續存取。MLP：軟體預取、迴圈交換與分塊以增加同時可發出的獨立存取、避免指標追逐式的相依鏈。TLP：以 OpenMP／pthread 做迴圈或任務平行化、減少鎖競爭與偽共享。',
  },
  'q-pp-cs-arch-108-6': {
    answer: 'N/A',
    explanation:
      'a) 應該反對。手機的實際負載以互動式短工作與背景常駐工作為主，真正需要大核全力運算的時間佔比很低，而大核的面積與功耗遠高於小核。把配置推到 6 大 2 小會帶來三個問題：閒置與輕載時的功耗與漏電上升、在手機的熱設計功耗與散熱條件下多顆大核無法長時間同時全速運轉（很快就會降頻，等於白給），以及相同矽面積下總吞吐量反而下降。從 Snapdragon 670 的 2+6 到 850 的 4+4 已是朝效能傾斜的調整，2020 年的合理設計應維持在 4+4 或採大中小三叢集，而非 6+2。若目標裝置改為持續高負載的場景（如遊戲手機或筆電），則另當別論。\nb) 兩個叢集會各自擁有私有快取（各核 L1、叢集內共用 L2），同一份記憶體資料可能同時存在於兩邊，若不維持一致性，執行緒在大小核之間遷移時就會讀到過期資料，作業系統的排程器也無法自由搬移執行緒。做法是在兩個叢集之上以一致性互連（如 ARM 的 CCI／CMN）連接，實作以目錄為基礎或監聽過濾的 MESI／MOESI 協定：叢集的 L2 作為一致性節點對外參與監聽，互連維護各快取行的擁有狀態，寫入時使遠端副本失效，讀取缺失時可由持有較新副本的叢集直接供應。這正是 big.LITTLE 能做到全域任務排程（global task scheduling）的前提。',
  },
  'q-pp-cs-arch-108-7': {
    answer: 'N/A',
    explanation:
      'a-1) real UID 是啟動該行程的使用者身分，代表「這個行程屬於誰」，用於訊號傳送權限等歸屬判斷。effective UID 是核心實際據以做存取控制檢查的身分，決定「此刻能存取什麼」。saved UID 是執行 set-user-ID 程式時保存的原 effective UID，讓行程能在提權與降權之間來回切換。三者在一般情況下相同；執行 set-user-ID 程式時，effective UID 會變成檔案擁有者，real UID 不變，saved UID 則保存提升後的值以供日後恢復。\na-2) 應改變 effective UID —— 存取控制檢查看的是 effective UID。實務上以最小權限原則操作：平時把 effective UID 降為一般使用者，需要時再從 saved UID 取回特權，用完立刻放掉。\nb-1) 記憶體：多行程各有獨立位址空間，建立成本高、需要 IPC 才能共享資料；多執行緒共用同一位址空間，資料共享零成本但須自行同步。CPU 排程：兩者都是核心的排程單位，但行程切換要換頁表並使 TLB 失效，成本明顯高於同一行程內的執行緒切換。資源共享：執行緒共用檔案描述子、訊號處理設定與堆積；行程彼此隔離，一個崩潰不影響其他，穩定性較佳。\nb-2) 不會印出 C，父行程印出的仍是 P。fork() 之後子行程取得父行程位址空間的複本（採 copy-on-write），子行程把 sharedVariable 改成 C 時觸發實體頁複製，改到的是自己那份；父行程的變數完全不受影響。這正是行程間記憶體隔離的體現。\nb-3) 印出的位址會相同，但那是「相同的虛擬位址、不同的實體頁框」。子行程繼承了父行程的整個位址空間佈局，變數的虛擬位址自然一致；copy-on-write 在寫入時只換掉背後的實體頁，虛擬位址不變。因此位址相同卻互不影響，並不矛盾。\nb-4) 改用 vfork() 後，第 24 行會印出 C。vfork() 不複製位址空間，子行程直接借用父行程的記憶體執行，且父行程被暫停直到子行程呼叫 exec 或 _exit；子行程對 sharedVariable 的修改因此直接寫在父行程的變數上。附帶一提，vfork() 的子行程若如本例這般修改變數再返回而非立即 exec，屬於未定義行為，實務上不應這樣用。',
  },
  'q-pp-cs-arch-108-8': {
    answer: 'N/A',
    explanation:
      'a) 若目標是營收最大化，不應採單純的 FCFS，而應以「訂單金額／預期毛利」為權重做優先排程，並輔以短工作優先來提高整體吞吐。實務上需加上防餓死機制（隨等待時間提高優先權），否則小額訂單永遠排不到，長期會流失客群 —— 也要留意這與「先搶先贏」的公平期待相衝突，通常僅用於庫存分配以外的資源調度。\nb) 沒有全域時鐘時，用 Lamport 邏輯時鐘或向量時鐘為每筆交易標記，並以「(邏輯時戳, 節點編號)」構成全序來決定先後；節點間交換訊息時一併攜帶時戳以維持因果順序。實務上也可用 Google TrueTime 那類有界誤差的時戳，或由單一序號產生服務發號。至於「以送出時間或抵達時間為準」，應以送出時間為準才符合使用者的公平認知，但必須防範用戶端偽造時戳，因此需由伺服器在接收端簽章確認。\nc) 避免超賣的核心是讓每項商品的庫存扣減成為一個序列化的臨界區。可行做法：依商品 ID 做分片，每片由單一節點負責庫存的原子扣減（單點序列化，跨商品仍可完全平行）；或以樂觀並行控制加版本號的 CAS 更新，衝突則重試；或預先把庫存切成數段分配給各節點，段內本地扣減、耗盡時再向中央要一段（減少跨節點協調次數）。跨多商品的訂單則需兩階段提交或 saga 補償，以維持一致性。\nd) 交易紀錄應採 append-only 的 write-ahead log：只追加不就地修改，取消以補償紀錄（沖銷）表示而非刪除，如此可完整重建任一時點的狀態並具備稽核能力。效率上以順序寫入取得高吞吐，搭配群組提交（group commit）攤銷 fsync 成本，並以檢查點與快照加速復原；為了可信，可對日誌分段做雜湊鏈或 Merkle tree 以偵測竄改，並跨機房複寫。\ne) 需要防範的攻擊包括：搶購機器人與腳本（以速率限制、行為驗證、風控評分因應）、重放攻擊（訂單附一次性 nonce 與簽章）、應用層 DDoS 與流量洪峰（前端排隊系統、CDN、令牌桶限流、降級與熔斷）、庫存耗盡攻擊（下單即扣庫存並設短時效，未付款自動釋回）、以及內部人員或中間人竄改交易（全鏈路 TLS、訂單簽章、日誌防竄改）。',
  },
}

// ─────────────────────────────────────────────────────────── 寫入

const ALL = { ...EN110, ...IMEN114, ...ALGO112, ...ARCH108 }

const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8')).questions
const answersData = JSON.parse(fs.readFileSync(answersPath, 'utf8'))

const questionIds = new Set(questions.map((q) => q.id))
const unknown = Object.keys(ALL).filter((id) => !questionIds.has(id))
if (unknown.length) {
  console.error(`❌ 有 ${unknown.length} 個題目 id 不存在: ${unknown.slice(0, 5).join(', ')}`)
  process.exit(1)
}

let written = 0
for (const [questionId, { answer, explanation }] of Object.entries(ALL)) {
  answersData.answers[questionId] = { questionId, answer, explanation }
  written++
}

fs.writeFileSync(answersPath, `${JSON.stringify(answersData, null, 2)}\n`)

const stillMissing = questions.filter((q) => !answersData.answers[q.id])
console.log(`✅ 寫入 ${written} 筆答案`)
console.log(`   仍缺答案: ${stillMissing.length} 題`)
