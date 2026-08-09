#!/usr/bin/env node
// 為補回的 pp-im-en-113、pp-im-en-107 兩份英文卷（各 50 題）寫入答案與解析。

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')
const answersPath = path.join(dataDir, 'answers.json')

function seq(prefix, rows) {
  const out = {}
  rows.forEach(([answer, explanation], i) => {
    out[`${prefix}-${i + 1}`] = { questionId: `${prefix}-${i + 1}`, answer, explanation }
  })
  return out
}

// ═══════════════════════════════════════════════ 英文(B) 113

const EN113 = seq('q-pp-im-en-113', [
  [
    'B',
    'debut 指「首次公開演出、初登場」，正是「第一次在公眾面前表演」。publicity 是「宣傳」；trial 是「試驗、審判」；outing 是「外出遊玩」，皆不合。',
  ],
  [
    'A',
    'facade 原指建築的正面外牆，引申為「偽裝的表象」。句意為她裝出快樂的樣子，其實非常難過。ego（自我）、tempo（節奏）、pace（步調）皆無「外表偽裝」之意。',
  ],
  [
    'B',
    'alleviate 意為「減輕（痛苦）」，注射的目的正是止痛。interpret（詮釋）、aspire（渴望）不合；escalate（升高）語意正好相反。',
  ],
  [
    'D',
    'grasp 除了「抓住」也有「理解、領會」之意，與 have great difficulty trying to 搭配表示難以理解這個概念。evoke（喚起）、facilitate（促進）、encompass（涵蓋）皆不能表達「學生理解不了」。',
  ],
  [
    'D',
    '雅典衛城與泰姬瑪哈陵都是著名的建築「紀念性建物」，architectural monuments 為固定搭配。relics 偏指「遺物、殘存物」，語氣上不如 monuments 貼切；tenements（廉價公寓）、sculpture（雕塑）皆不合。',
  ],
  [
    'A',
    '譯者對作者意圖有歧見，原因是作者用語的「模稜兩可」。ambiguity 正是此意。blockage（阻塞）、stupor（恍惚）、hurdles（障礙）都無法解釋「各自解讀不同」。',
  ],
  [
    'B',
    'emissions 專指廢氣「排放」，automobile emissions（汽車排放）為固定搭配，且與後文空氣污染直接呼應。secretions 指生物體的分泌物；projections（預測）不合；discharge 雖有排放之意，但多用於液體或不可數，此處需可數複數形。',
  ],
  [
    'C',
    '前文說「困在自己的壕溝裡就會失去對現實的認識」，後文說被誤導以為某個群體代表全人類 —— 既然前面用 small 修飾，且與 all humankind 形成對比，該群體必為「少數」。minority 正確；majority 語意相反。',
  ],
  [
    'B',
    '達爾文提出的是 natural selection（天擇、物競天擇），這是固定術語。screening（篩檢）、competition（競爭）、violation（違反）皆非達爾文理論的名稱。',
  ],
  [
    'D',
    '後半句「在維持效能的同時讓模型更小更快」正是專用化模型的特徵 —— 針對特定任務裁切而非追求通用。specialized 最貼切。commercialized（商業化）與大小速度無關；subsidized（受補助）、trivialized（瑣碎化）皆不合。',
  ],

  ['C', '名詞 students 為複數，不定冠詞 a／an 只能修飾單數名詞，故用 some。'],
  [
    'B',
    'gifted 意為「有天賦的」，為固定用法（gifted children 資優兒童）。gift 是名詞、gifting 是動名詞，皆不能作前位修飾語表達此意。',
  ],
  [
    'B',
    '主詞是 The causes（複數），須用複數動詞，故 was 錯誤。本題考的是主詞與動詞的一致性 —— 注意 of the accident 只是修飾語，不是主詞。',
  ],
  ['B', 'There be 句型的動詞要與後面的真主詞一致，several reasons 為複數，故用 are。'],
  [
    'B',
    '修飾動詞 pays 需要副詞，pay well 意為「待遇優厚」。good 與 fair 皆為形容詞，不能修飾動詞。',
  ],
  [
    'C',
    '表示「在夜間」的固定用法是 at night。in the night 強調某個特定夜裡發生的事；by night 意為「趁夜、在夜間（與白天對比）」，多用於對照句式。',
  ],
  [
    'C',
    '介紹某主題的紀錄片用 a documentary about（或 on）。with 表伴隨、by 表施作者，皆不能引出紀錄片的主題。',
  ],
  ['C', 'be good at 為固定搭配，意為「擅長」。'],
  [
    'A',
    '把碗放在櫥櫃「上面」用 on top of，表接觸並置於其上。between 需要兩個對象；over 表位於上方但不接觸，不適合描述放置動作。',
  ],
  [
    'C',
    '與過去事實相反的假設：if 子句用過去完成式 hadn’t been，主要子句須用 would have + 過去分詞，故為 would have come。',
  ],

  [
    'B',
    '需要名詞作 has 的受詞，effects 是名詞「影響、作用」；affects 是動詞。impacts 雖也可作名詞，但與 widespread and varied 搭配、且後文以 only one of them 回指「多種作用」，effects 最為標準。',
  ],
  [
    'A',
    '與前文並列，說明胰島素還會「促使」身體把熱量儲存為脂肪。encourages 與後文 may encourage cells 的用字一致。discourages 語意相反；provokes 語氣過於負面突發，不合生理描述。',
  ],
  [
    'B',
    '後一句「藉由製造較少的胰島素受體，它們變得具胰島素抗性」正是「敏感度」下降。sensitivity 為醫學上的標準用詞（insulin sensitivity）。sensibility 指「感受力、情操」；sensation 指「感覺、知覺」。',
  ],
  [
    'C',
    'be associated with 意為「與⋯⋯有關聯」，是流行病學描述相關性的標準用語。pertinent 與 relevant 雖有「相關」之意，但需搭配 to 而非 with。',
  ],
  [
    'B',
    '澱粉類植物「被馴化」之後人類才大量取得碳水化合物，domestication（馴化）正是農業起源的標準用詞。solicitation（懇求）、eradication（根除）皆不合。',
  ],

  [
    'C',
    '後文說矽谷不斷端出越來越聳動的釣魚標題，可見新聞正變得越來越「極端」。extreme 正確。moderate（溫和）、insipid（乏味）語意相反。',
  ],
  [
    'B',
    '與後文「但臉書、推特、Google 很了解你個人」形成對比 —— 過去記者不了解個別讀者，只能為「大眾」而寫。masses 正確。elite、intellectuals 都是特定小眾，無法構成這個對比。',
  ],
  [
    'B',
    '在數位廣告的語境下，平台掌握的是什麼會讓你「點擊」。click 與後文的 clickbait（釣魚標題）直接呼應。flick（輕彈）、think（思考）皆不合。',
  ],
  [
    'A',
    '後文解釋「多數人的生活相當可預測、美好但無聊」，可見被攻擊的對象是「平凡日常」。mundane 正是此意。unusual、extraordinary 語意相反。',
  ],
  [
    'B',
    'dish up 意為「端出（菜餚）」，引申為「大量供應（內容）」，與前文 serve you the most lucrative helping 的飲食比喻一脈相承，也呼應結尾「新聞之於心靈猶如糖之於身體」。dig up（挖出）、push up（推高）皆不合。',
  ],

  [
    'B',
    '與前句「想要穩定婚姻卻不斷外遇」平行 —— 想要成功事業卻不斷「自我破壞」。undermine oneself 正確。push（推動）、overcome（克服）皆與矛盾的語境相反。',
  ],
  [
    'C',
    '亞里斯多德的名言是「人是理性的動物」，而下一句 Contradictions like these show that we are not（這些矛盾顯示我們並非如此）正是要反駁這個定義。rational 正確。',
  ],
  [
    'B',
    '前文描述的正是「想要的」與「實際生活」之間的矛盾，這種自相矛盾在英文中稱為 paradox。parable（寓言）、paragon（典範）皆不合。',
  ],
  [
    'A',
    '要解釋的是彼此「不相容」的想法、感受與動機 —— 呼應全段的矛盾主題。incompatible 正確。explicable（可解釋的）、inherent（固有的）都無法表達衝突。',
  ],
  [
    'C',
    'postulate 意為「假定、設定（一個概念）」，佛洛伊德假定了一個我們意識不到、由非理性主宰的概念空間。capitulate（投降）完全不合；stipulate（明訂）用於契約條款。',
  ],

  [
    'C',
    '後一句說它可能是大學部最被避開的課，可見統計不是多數學生「最喜歡」的科目。favorite 正確 —— challenging 與 difficult 反而使前後句重複而非轉折，且 not most students’ difficult subject 語意不通。',
  ],
  [
    'B',
    'lord over 意為「支配、凌駕」，與下一句「我們都是機率的棋子」呼應。run down（貶低、耗盡）、come up（出現）皆無支配之意。',
  ],
  [
    'C',
    '與 enough time、enough drivers 並列，指自來水管日積月累「逐步累積」的問題，最終導致人孔蓋爆開。incremental 正是「漸進累加」。partial（部分的）、elemental（基本的）皆不合。',
  ],
  [
    'C',
    '人孔蓋因水管問題累積而「爆開」，blow 正確（blow off／blow 用於爆開）。slip（滑動）、fall（掉落）都無法解釋為何停在上面會出事。',
  ],
  [
    'A',
    'stand-in 意為「替身、代用品」——「隨機」與「運氣」其實只是「機率性結果」這個術語的通俗替代說法。prop-up、show-off 皆無此意。',
  ],

  [
    'D',
    '文章前半講唯美主義運動、後半講攝影分離派運動，並以「唯美主義為了美而拒斥真實，攝影分離派則擁抱真實視之為更美」作結，涵蓋的是攝影從模仿繪畫到獨立成藝術的演變。(a)、(b) 各只涵蓋一半；(c) 只是其中一位人物。',
  ],
  [
    'B',
    '文中說唯美主義的相片因膠質重鉻酸鹽版容許人工介入而「朦朧」，因此容易與現代相片區別，而直接攝影的影像「銳利清晰」。故差別在清晰度。(a) 顏色、(d) 未經修飾都與事實相反 —— 唯美派才是手工上色與修飾的一方。',
  ],
  [
    'B',
    'Camera Work 是攝影分離派的刊物，宗旨是推廣直接攝影，並非鼓勵唯美主義運動的成員，故 (b) 為不實敘述。(a)（被譽為最美的期刊之一）、(c)（由 Steiglitz 推動）、(d)（寫實之美的載體）皆與原文相符。',
  ],
  [
    'D',
    '攝影分離派的核心主張正是「拒絕對題材或相片進行加工」，故 (d) 不屬於該運動。(a) 直接攝影、(b) 機械精確性、(c) 銳利清晰的影像都是其特徵。',
  ],
  [
    'D',
    '文中說「主要透過 Steiglitz 的努力，現代攝影才自繪畫獨立出來、成為正當的藝術形式」，用語帶有明顯的推崇。(a) 私交、(b) 不感興趣、(c) 不認同皆無依據。',
  ],

  [
    'C',
    '全文主旨是在演化心理學與理性選擇經濟學等「尋找行為通則」的框架之外，作者一再驚嘆於單一個人所能造成的差異，並以米德的名言作結。(c) 最貼切。(a)、(b) 與文意相反或過寬；(d) 只涵蓋正面人物，忽略了希特勒等反例。',
  ],
  [
    'A',
    '作者開宗明義說自己「對於用演化心理學、理性選擇經濟學來霸權式地解釋所有人類行為，很少有共鳴」，故 (a) 與作者立場完全相反，為錯誤敘述。(b) 七十億人口、(c) 古典音樂與莫札特、(d) 黛安娜王妃之死引發的哀慟皆有原文依據。',
  ],
  [
    'B',
    '作者說「若沒有希特勒、史達林或毛澤東，二十世紀的歷史會快樂得多」，顯然認為他們讓世界更糟，故 (b) 不反映作者觀點。(a)、(c)、(d) 皆與原文相符。',
  ],
  [
    'D',
    '作者強調單一個人或小群體能造成巨大差異，並列舉甘地影響曼德拉、金恩博士以及天安門與解放廣場上的「孤獨身影」。(d) 正確。(b)、(c) 強調人多勢眾，與作者的個人論旨相反；(a) 與「他在印度的成就不言自明」矛盾。',
  ],
  [
    'D',
    '米德的名言是「永遠不要懷疑一小群有思想、有決心的公民能夠改變世界；事實上，世界向來只由這樣的人改變」。(d) 正確。(a) 與原文相反；(b) 誤把「小群體」理解為「群體努力」而否定個人；(c) 的質疑意圖完全不在文中。',
  ],
])

// ═══════════════════════════════════════════════ 英文(B) 107

const EN107 = seq('q-pp-im-en-107', [
  [
    'B',
    'in rapid succession 意為「快速連續地」，指一連串影像接連呈現而產生動態錯覺。subordination（從屬）、explosion（爆炸）、predecessor（前輩）皆不合。',
  ],
  [
    'A',
    'time lapse 意為「時間間隔」，指影格之間的時間差（1/24 秒）。languor（倦怠）、larceny（竊盜）、lard（豬油）與時間無關。',
  ],
  [
    'A',
    'restoration 意為「恢復（已廢除的制度）」—— 他主張恢復絞刑與鞭刑，這也解釋了為何「令我們驚訝」。resuscitation 指對人的急救甦醒；resonance（共鳴）、resilience（韌性）皆不合。',
  ],
  [
    'C',
    'communication apparatus 意為「溝通機制／器官」。apprentice（學徒）、apparel（服飾）、apprehension（憂慮）皆不合。',
  ],
  [
    'D',
    'reside in 意為「（本質、根源）在於」，此處指這個概念的基本前提「在於」某種體認。retort（反駁）、retreat（撤退）、resign（辭職）皆不與 in 構成此意。',
  ],
  [
    'B',
    'in remission 是醫學固定用語，指癌症「緩解期」。recess（休會）、regret（後悔）、remiss（疏忽的）皆不合。',
  ],
  [
    'B',
    'relapse 意為「（戒除後）故態復萌、再度沉迷」，與「成功戒了一個月，然後⋯⋯」的轉折完全吻合。relax（放鬆）、relay（轉播）、reply（回覆）皆不合。',
  ],
  [
    'C',
    'instigate 意為「煽動、策動（叛亂）」。instil（灌輸）用於觀念；install（安裝）不合；insight 是名詞，insighted 並非標準動詞。',
  ],
  [
    'D',
    'litigants 指「訴訟當事人」，與 after the trial、appeals were dismissed（上訴被駁回）的司法語境一致。barristers 是出庭律師，但律師不會被羈押、也不會是「未滿十八歲」；lampoons（諷刺文）、shrines（神龕）完全不合。',
  ],
  [
    'C',
    'unkempt 意為「未整理的、邋遢的」，與「只有光禿禿的床墊」「冰箱很髒」的描述一致。melancholy（憂鬱）、concave（凹的）、burly（魁梧的）皆不能形容房間狀況。',
  ],

  [
    'D',
    '空格引導的名詞子句作主詞，且子句中缺少 brings 的主詞，需用複合關係代名詞 Whatever（＝Anything that）。Those 為複數代名詞會與後面的單數動詞 is 衝突；There、When 都無法引導這種主詞子句。',
  ],
  [
    'B',
    'no less than 意為「多達、不下於」，強調摩擦耗損佔燃料消耗的比例之高。Following（在⋯⋯之後）、Regarding（關於）、Given（考慮到）都會使句子失去主詞。',
  ],
  [
    'A',
    'Anyone 後接分詞片語作後位修飾，需用過去分詞 interested in（對⋯⋯感興趣的）。(d) who is interested 雖然文法正確，但缺少介系詞 in，無法接續 getting information。',
  ],
  [
    'C',
    'as 在此引導表「隨著」的時間副詞子句 —— 隨著更開明、教育程度更高的世代取代舊世代，種族偏見會逐漸消散。through 是介系詞不能引導子句；though 表讓步、for 表原因，方向皆不符。',
  ],
  [
    'A',
    '本句為倒裝：正常語序是 An electron micrograph... is featured on our cover this month。分詞 Featured 移到句首形成倒裝，故選過去分詞。Featuring 為主動、Be featured／Be featuring 為原形，皆不合。',
  ],
  [
    'D',
    'the last but one 意為「倒數第二」，符合「我快做完了，這是倒數第二個要清空的」。其餘三個選項的語序都不是標準用法。',
  ],
  [
    'B',
    '介系詞 to 後需接名詞或動名詞，且與「被困在密閉室內」為被動語意，故用 being stuck。stick 為原形、stuck 為單獨的過去分詞、have stuck 為完成式，皆不能作介系詞受詞。',
  ],
  [
    'C',
    'Hardly had... when... 是固定句型，意為「一⋯⋯就⋯⋯」。與之對應的另一組是 No sooner had... than...。',
  ],
  [
    'D',
    'regardless 作副詞置於句尾，意為「無論如何、不管怎樣」。regarding 是介系詞必須接受詞；regarded、regard of 語法皆不成立。',
  ],
  [
    'C',
    '分詞構句的邏輯主詞是 I，且「我感到無聊」為被動感受，故用 Feeling bored。boring 用來形容令人感到無聊的事物而非感受者；Felt 為過去式動詞，不能作分詞構句。',
  ],

  [
    'A',
    'take on many appearances 意為「呈現多種樣貌」。take in（吸收、理解）、take out（取出）、take to（開始喜歡）皆不合。',
  ],
  [
    'C',
    'a given topic 意為「某個特定主題」，given 在此作形容詞。give、giving、gave 皆無法修飾名詞表此意。',
  ],
  [
    'D',
    'collective 意為「集體的」，指由眾多學科共同構成的科學事業整體。collecting、collect、collected 皆不能修飾 enterprise 表達「集體」。',
  ],
  ['B', 'to the benefit of 意為「為了⋯⋯的利益」。into、since、from 的搭配皆不成立。'],
  [
    'C',
    'from where they resided 意為「從它們（過去）所處的位置」，where 引導的關係子句作 from 的受詞。when、how 語意不符；(A) 的空白選項會使句子缺少連接成分。',
  ],
  [
    'B',
    'the march forward 意為「向前推進」，與「與科技進展密不可分」的語境相符。parch（烤乾）、arch（拱）、archive（檔案）皆不合。',
  ],
  [
    'A',
    'nothing more than 意為「僅僅、只不過」—— 過去的發現只能靠肉眼觀察。nothing less than 意為「不折不扣、簡直就是」，語意方向相反；more than、less than 在此語法上也不通順。',
  ],
  [
    'C',
    'usher in 意為「開啟、引領（新時代）」，顯微鏡的出現開啟了下一個觀察與分析的時代。revealed（揭露）、populated（充滿）、connected by（被⋯⋯連接）皆不合。',
  ],
  [
    'D',
    'arrive on the scene 為固定用法，意為「登場、問世」。appeal（呼籲）、arrest（逮捕）、allot（分配）皆不與 on the scene 搭配。',
  ],
  [
    'B',
    'ever-expanding 為複合形容詞「不斷擴張的」，修飾 universe。其餘選項語序錯誤，或誤用 expend（花費）而非 expand（擴張）。',
  ],

  [
    'B',
    'how the dead met their fate 意為「死者是如何遭遇其命運的」，敘述已發生的事需用過去式 met。meet 為原形；wind／wound 與 fate 不搭配。',
  ],
  [
    'C',
    'carcass 意為「（動物的）屍體」——驗屍官拿各種刀刃在牛屍上試驗以比對傷口。car（汽車）、carriage（馬車）、carrier（載具）皆不合。',
  ],
  [
    'B',
    'wield a blade 意為「揮舞刀刃」，此處指查明「是誰的手揮動了這把刀」。wretched（可憐的）是形容詞；wired（接線）、warranted（擔保）皆不合。',
  ],
  [
    'D',
    '既然已知凶器，接下來就要追查可能的「動機」。motives 正確，且下文以「財物完好排除搶劫」「沒有仇家」「債務糾紛」逐一檢視動機。merchants（商人）、metropolis（大都會）、migrants（移民）皆不合。',
  ],
  [
    'A',
    'intact 意為「原封不動的」——死者的財物都還在，因此排除搶劫的可能。impact（衝擊）、indelible（不可磨滅的）、indistinct（模糊的）皆不合。',
  ],
  [
    'D',
    'lead 在偵查語境中意為「線索」。最好的線索是死者無力償還某人催討的債務。momentum（動能）、placebo（安慰劑）、phobia（恐懼症）皆不合。',
  ],
  [
    'B',
    'deny that the murder had anything to do with him 意為「否認這樁謀殺與他有任何關係」。否定語境中用 anything；用 nothing 會構成雙重否定而語意顛倒。',
  ],
  [
    'C',
    'tenacious 意為「執著不放的」，形容這位驗屍官像電視劇裡的偵探一樣鍥而不捨 —— 下文他召集全村七十人列隊驗刀正是明證。tentative（試探性的）語意相反；precocious（早熟的）、viable（可行的）皆不合。',
  ],
  [
    'C',
    'minute 在此讀作 /maɪˈnjuːt/，是形容詞「極微小的」——刀上沒有肉眼可見的血跡，蒼蠅卻循著極微量的血跡而來。這正是本題的關鍵對比。nonchalant（漠不關心的）、vibrant（充滿活力的）、full-blown（全面的）皆不合。',
  ],
  [
    'C',
    'foil 意為「挫敗、識破（詭計）」——他想清理刀刃以掩蓋罪行，卻被蒼蠅這些「昆蟲線人」給破壞了。overheard（無意間聽到）、sentenced（判刑）、measured（測量）皆不合。',
  ],

  [
    'D',
    'double nickel 是俚語，兩個五分錢（nickel＝5）即 55，指五十五歲。文中作者自嘲步入暮年、靈感枯竭，年齡與 declining years、twilight years 的描述一致。',
  ],
  [
    'D',
    '全段描述作者抱著女兒來回踱步、精疲力竭、滿身奶漬、瀕臨偏執，並自嘲「沒人會雇用這樣的人照顧六週大的嬰兒」，可推知他照顧嬰兒非常疲憊。(a) 誤讀 —— lives on Australian Standard Time 是形容作息日夜顛倒的玩笑話；(b) 與「她抗拒睡覺」相反；(c) 嬰兒的哭鬧不是心理疾患。',
  ],
  [
    'A',
    '「養這個孩子要動用一整個村子 —— 大約六十八個人」是明顯的誇飾，用以強調照顧嬰兒的工作量之大。overstatement（誇張法）正確。understatement 是輕描淡寫，語意相反；metaphor 與 simile 需要本體與喻體的比擬結構，此處是數量上的誇大。',
  ],
  [
    'B',
    '作者說女兒「不是那種可以硬塞進你忙碌行程的孩子。不是 hobby baby」，可見 hobby baby 指的是不太麻煩父母、可以像興趣一樣輕鬆應付的嬰兒。(a) 是作者女兒的特徵而非 hobby baby；(c)、(d) 誤把 hobby 照字面理解為「嗜好」。',
  ],

  [
    'D',
    '開篇即說本片「遠不如那部 2000 年的電影（《神鬼戰士》）好看」。(d) 正確。(b) 與「也遠不如《亞歷山大帝》那麼糟」相反；(c) 同理，本片優於《特洛伊》；(a) 把片中的「令人著迷的混亂」誤讀為與十字軍一樣令人困惑。',
  ],
  [
    'C',
    '文中稱《特洛伊》與《亞歷山大帝》是跟在《神鬼戰士》之後進戲院的「沉悶無趣之作」（inert bores），可見兩片都比《神鬼戰士》無聊得多。(a) 錯 —— Ridley Scott 是以《神鬼戰士》復興了這個類型，而非「復興了兩部片」；(b) 錯 —— 本片有男主角 Orlando Bloom，只是缺乏撐起全片的份量；(d) 錯 —— Legolas 正是 Bloom 演的角色。',
  ],
  [
    'B',
    'of all stripes 意為「各式各樣的、形形色色的」（stripe 在此指類型而非條紋），religious fanatics of all stripes 即「各種宗教的狂熱分子」。(a) 把 stripes 照字面理解成衣服上的條紋；(c)、(d) 把主體從「人」錯換成「行為」或「活動」。',
  ],

  [
    'D',
    '文末說「曼徹斯特把自己的文化成就穿得很輕」（wears its cultural achievements lightly），意即它成就斐然卻不張揚；後文列舉它曾與柏林、維也納並列為音樂之都、擁有世界級的哈雷管弦樂團，正是佐證。(a) 錯 —— 文章開頭把曼城歸為「需要時間才認識」的那一類；(b) 錯 —— 原文說它一向要傳達的是 substance 而非 poetry；(c) 錯 —— 原文說它覺得張揚很荒謬。',
  ],
  [
    'C',
    '維多利亞新哥德式的代表作市政廳被形容為「商業的大教堂」，而下一段明言曼城所有公共建築、廣場與雕像所紀念的是「實業家、自由貿易者與改革者，而非藝術家或冒險家」。(c) 正確。(a) 的 total magnificence 過度 —— 原文只說它「不無對浮誇的喜好」，且全城基調是不張揚；(b) 把 enjoyed a flowering（盛極一時）誤解為以花卉裝飾；(d) 錯 —— 市政廳「散發自信與繁榮」，並非 self-effacing。',
  ],
  [
    'A',
    '原文說哈雷管弦樂團由「一位德國移民」在五十年前創立，緊接著說一位年輕的西發里亞（德國）音樂神童 Charles Hallé 選擇定居曼城 —— 兩處指的是同一人，樂團也以他為名。(b) 錯 —— 創辦者是一位移民個人，並非「德國僑民群體」；(c) 錯 —— 推動討論文學與藝術的是那群德國僑民，不是樂團；(d) 文中並無此呼籲。',
  ],
])

// ═══════════════════════════════════════════════ 寫入

const ALL = { ...EN113, ...EN107 }

const questions = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'questions.json'), 'utf8')
).questions
const questionIds = new Set(questions.map((q) => q.id))
const unknown = Object.keys(ALL).filter((id) => !questionIds.has(id))
if (unknown.length) {
  console.error(`❌ 有 ${unknown.length} 個題目 id 不存在: ${unknown.slice(0, 5).join(', ')}`)
  process.exit(1)
}

const answersData = JSON.parse(fs.readFileSync(answersPath, 'utf8'))
for (const [id, entry] of Object.entries(ALL)) {
  answersData.answers[id] = entry
}
fs.writeFileSync(answersPath, `${JSON.stringify(answersData, null, 2)}\n`)

console.log(`✅ 寫入 ${Object.keys(ALL).length} 筆答案`)
console.log(`   仍缺答案: ${questions.filter((q) => !answersData.answers[q.id]).length} 題`)
