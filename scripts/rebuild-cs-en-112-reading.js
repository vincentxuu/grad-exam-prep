#!/usr/bin/env node
// 資料修復（承接 rebuild-cs-en-112.js）：pp-cs-en-112 第 36–50 題的閱讀測驗
//
// 這 15 題原本只有題目、沒有文章 —— 三篇 Reading Comprehension 的本體整段缺漏，
// 既有解答因此是在看不到文章的情況下推測出來的（例如第 36 題的詳解直接寫
// 「文章通常提及…」）。本腳本補上三篇文章，並把詳解全部改寫成有文可徵的版本。
//
// 來源：台大圖書館考古題 PDF https://exam.lib.ntu.edu.tw/sites/default/files/exam//graduate/112/2023-8.pdf
// 第 3–6 頁。答案字母經與文章逐題核對後與原本一致，故只換詳解、不改答案。
//
// 版面慣例對齊 pp-cs-en-114：文章掛在該組第一題並以「Article X: Questions M-N」
// 標頭帶出（src/lib/content.ts 的 PASSAGE_RANGE_RE 靠這行分組）。
//
// 註：第 42 題的「underlined sentence」與第 43 題的「two highlighted sentences」
// 在純文字轉錄中無法保留底線／標示，兩題各自附上依選項推斷出的原句，並註明來源。

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
}
function save(file, data) {
  fs.writeFileSync(path.join(dataDir, file), `${JSON.stringify(data, null, 2)}\n`)
}

const SECTION_HEADER =
  'III. Reading Comprehension (30%): Answer the following questions according to the information provided or implied in the articles. Choose the BEST answer to each question.'

const ARTICLE_A = `Article A: Questions 36-40
Autism is a lifelong disability that affects how people communicate and interact with the world. There are about 700,000 adults and children on the autism spectrum in the UK. Like everyone, each autistic person has their own strengths and challenges. But all of us have difficulties with communicating and interacting with other people. This could mean not speaking at all, needing longer to process information, or not understanding facial expressions. We also engage in repetitive behavior, doing or thinking the same thing over and over. This is sometimes for fun and sometimes to help deal with our anxiety. People on the autism spectrum can also find unexpected changes, however small, very distressing. And then there is sensory overload when noise, smells, touch, and bright lights become very painful and overwhelming. All these challenges can make the world feel very scary and hard to understand, and sometimes send us into physical and emotional meltdowns or shutdowns. It is very important that autistic people get help from an early age. Life can become very difficult if children or adults don't get the right support or understanding. Autistic children are three times more likely to be excluded from school. Only one in six autistic people in the UK have a full-time job. And over a third of autistic adults have reported serious mental health problems. The National Autistic Society is the UK's leading charity for autistic people. Since 1962, we have been changing society's attitude and transforming individuals' lives. We want to create a society that works for autistic adults and children. And, with your help, we can.`

const ARTICLE_B = `Article B: Questions 41-45
Most people know that one meaning of green is eco-friendly, but are you familiar with greenwashing, a verb that entered dictionaries in the late 90s? Patterned on words like brainwashing (making people believe what you want by controlling information) and whitewashing (covering up wrongdoing with deceptive information), greenwashing occurs when a company misleads customers about its negative impact on the environment by attempting to convince them otherwise through advertising and publicity.

In the 60s and 70s, before we had a name for this phenomenon, the chemical, automobile, and energy industries were already greenwashing their products and services to calm fears about the dangers of air pollution, chemical and oil spills, and nuclear energy technology.

In the 80s, several ecological catastrophes, including massive chemical and oil spills and a nuclear disaster, prompted various greenwashing campaigns by powerful corporations. This was the start of the corporate environmentalism movement. As a consequence of the severe damage inflicted on the environment, a company's reputation for eco-friendly practices had never been more important. Opinion polls at the time revealed that more than 70% of those surveyed were swayed by environmental issues when they shopped, and over 80% viewed environmental offenses as the most abhorrent of all corporate crimes.

The 90s brought various buzzwords, many of which still appear on packaging today, such as recyclable, biodegradable, environmentally friendly, and all natural. In recent years, sustainable, renewable, and organic are frequently seen. While it is reassuring to see such language on the packaging of the products we buy, whether it is simply a case of greenwashing depends on the meaning of the terms. For example, green, pure, and natural are essentially meaningless when they do not correspond to any legal or industrial standards. There have also been cases when organic and sustainable have only referred to one component of a product, whereas the other components were neither organic nor sustainable.

The terms recyclable and biodegradable have been particularly controversial. In order to reduce its ecological footprint, one bottled water brand switched from plastic bottles to Tetra Pak packaging made of paper, aluminum, and plastic. The problem was that although Tetra Pak cartons are labeled recyclable, not all municipalities are equipped to recycle them; thus, the switch may have had a detrimental environmental impact. In another case, a large retailer was forced to pay a fine of nearly $1 million for labeling plastic bottles biodegradable. Although technically correct, the bottles could take up to 1,000 years to disintegrate in landfills, which did not meet local standards for products labeled that way.

To conclude, here are four tips to help you avoid being fooled by greenwashing.
• Learn to recognize abused and inappropriately used buzzwords.
• Watch out for "green" products made by companies that pollute.
• Look past suggestive labeling with natural images of birds, flowers, and trees, that create a "green" impression.
• Think critically about product claims. For example, if a company claims it is "greener" than its competitors, it does not mean much if those competitors are terrible polluters.`

const ARTICLE_C = `Article C: Questions 46-50
A summer trip with the family to a theme park seems like a wonderful idea. As you load up the car, the kids can hardly contain their excitement. Along the way, you have to deal with a flat tire, and at the park, there are the usual high prices, long lines, occasional rudeness, and mediocre food. It is a relief when you get home, and you tell yourself it is the last time you will go. But somehow, in the following months, all the negative memories seem to fade, leaving mostly happy recollections and the general sense that you had a good time. Next summer, or the summer after that, you will probably look forward to going again.

The memory changes described above are what psychologists call "rosy retrospection", a cognitive bias that makes past events seem more positive upon later reflection than they were in reality. Several studies have confirmed this bias. For example, bicyclists who were surveyed before, during, and after a three-week tour recalled their trip in a more positive light after some time had elapsed. This provides evidence of a phenomenon known as "fading affect bias", that is, how the brain retains positive memories while allowing negative ones to fade.

This distorted yet rosy view of the past seems to have a largely positive effect on our well-being as viewing life positively is a coping mechanism that helps fight depression while bolstering an individual's sense of self-esteem and belief in personal control over influences that shape our lives. At work, letting go of negative memories reduces anxiety and enhances productivity. Furthermore, forgetting the pain of past failures eliminates the consequent regrets and fears that could be barriers to healthy risk-taking.

However, rosy retrospection has drawbacks. Since we learn from our mistakes, forgetting their negative consequences can prevent us from learning valuable lessons. As a result, we might find ourselves repeatedly in the same bad situation. For example, if you only remember the exciting aspects of a hike climbing a mountain with friends and not how much you regretted having sore legs for a week after, you could easily find yourself making the same mistake again. Rosy retrospection has also been linked to a "declinist" perspective: the belief that a situation is in decline and heading, in the long run, toward collapse. Adopting this perspective instills the idea that our best days are behind us and a yearning for "the good old days." Declinist arguments are often used by politicians, and although historians have shown that they are frequently false, they can effectively appeal to a bias toward a past that looks enviable in retrospect.

So, while researchers have confirmed the benefits of rosy retrospection for our well-being and its value as a coping mechanism, by maintaining an awareness of its effects, we can also improve the accuracy of our judgment and decision-making. This might help us avoid falling into a declinist perspective. In sum, rosy retrospection should have a net positive effect as long as we make sure not to prefer that rosy view of the past to a genuinely bright future.`

const NOTE_42 =
  '\n\n[原卷此句在文章中以底線標示，純文字轉錄無法保留。依選項判斷應為：「While it is reassuring to see such language on the packaging of the products we buy, whether it is simply a case of greenwashing depends on the meaning of the terms.」]'

const NOTE_43 =
  '\n\n[原卷這兩句在文章中以標示強調，純文字轉錄無法保留。依選項判斷應為：「In another case, a large retailer was forced to pay a fine of nearly $1 million for labeling plastic bottles biodegradable.」與「Although technically correct, the bottles could take up to 1,000 years to disintegrate in landfills, which did not meet local standards for products labeled that way.」]'

// [題號, 題幹（含選項）, 答案, 詳解]
const ITEMS = [
  [
    36,
    'Which communication challenge experienced by the autistic population is NOT mentioned in the article?\n(A) emotional barrier\n(B) struggles with nonverbal communication\n(C) delayed language development in writing',
    'C',
    '文章列出的溝通困難包括「not speaking at all（完全不說話）、needing longer to process information（需要較長時間處理訊息）、not understanding facial expressions（看不懂臉部表情）」，後者即 (B) 的非語言溝通困難；文中也多次提到 anxiety、emotional meltdowns，對應 (A) 的情緒障礙。唯獨「書寫方面的語言發展遲緩」全文未提，故選 (C)。',
  ],
  [
    37,
    'What is the meaning of "overwhelming" in this article?\n(A) very weak in strength (B) very great in amount (C) very dark in color',
    'B',
    '該字出現在 "sensory overload when noise, smells, touch, and bright lights become very painful and overwhelming"，描述感官刺激多到難以承受，因此 overwhelming 在此意為「量大到無法招架」，對應 (B) very great in amount。(A) 語意相反，(C) 與顏色有關，與感官超載的語境無關。故選 (B)。',
  ],
  [
    38,
    "Which statement is NOT correct according to the article?\n(A) The National Autistic Society is the UK's leading charity for autistic people.\n(B) Autistic people should get help as early as possible.\n(C) Over half of autistic adults have reported serious mental health problems.",
    'C',
    '文章原文為 "over a third of autistic adults have reported serious mental health problems"（超過三分之一），(C) 卻寫成 over half（超過一半），數字被放大，與原文不符。(A) 對應 "The National Autistic Society is the UK\'s leading charity for autistic people."，(B) 對應 "It is very important that autistic people get help from an early age."，兩者皆與原文一致。故選 (C)。',
  ],
  [
    39,
    'Which of the following is correct about this article?\n(A) The article reports a case study about discrimination against autistic children and adults.\n(B) This article shows the inequality in education and in employment for the autistic population.\n(C) This article compares the characteristics of autism spectrum disorder to those of attention deficit hyperactivity disorder.',
    'B',
    '文章以兩個數據點呈現教育與就業上的不平等：「Autistic children are three times more likely to be excluded from school」與「Only one in six autistic people in the UK have a full-time job」，正是 (B) 所述。(A) 錯在本文不是個案研究（case study），而是概述加上倡議。(C) 錯在全文從未提及 ADHD，更沒有比較。故選 (B)。',
  ],
  [
    40,
    'This article is very likely to be:\n(A) a transcript of a short speech delivered by a representative from the National Autistic Society,\n(B) a script for a stand-up comedy performance written by an experienced comedian.\n(C) an announcement made by a professor on a course website.',
    'A',
    '判斷文體要看人稱與結尾訴求。文中以 "all of us have difficulties"、"send us into…meltdowns" 這種第一人稱複數自述，又說 "The National Autistic Society is the UK\'s leading charity… Since 1962, we have been changing society\'s attitude"，最後以 "with your help, we can" 對聽眾喊話，明顯是該協會代表對外發言的講稿。(B) 全文無任何幽默鋪陳，(C) 課程公告不會有募款式訴求。故選 (A)。',
  ],
  [
    41,
    'According to the article, which statement below is FALSE?\n(A) The 1970s were a time of increasing awareness about environmental issues, and many people were becoming more conscious of the impact of human activity on the natural world.\n(B) The 1940s were a time when the public became very sensitive to ecologically destructive behavior by corporations due to ecological catastrophes.\n(C) The 1990s were a time when consumers and regulators were increasingly concerned about environmental issues, and companies that were able to demonstrate their commitment to sustainability and environmental responsibility often had a strong reputation in the marketplace.',
    'B',
    '文章談的年代是 60s、70s（industries were already greenwashing…to calm fears）、80s（several ecological catastrophes…prompted various greenwashing campaigns，且民調顯示逾八成民眾視環境犯罪為最可惡的企業罪行）與 90s（各種環保標語出現）。(B) 把生態浩劫引發的大眾反感移到 1940 年代，文中完全沒有提及該年代，故為錯誤敘述。(A)(C) 分別對應 60s–70s 與 90s 的段落。故選 (B)。',
  ],
  [
    42,
    'Which sentence is closest in meaning to the sentence underlined?\n(A) Green buzzwords are reassuring, whether or not greenwashing is present.\n(B) Although they can be misused for greenwashing, green buzzwords are reassuring.\n(C) People are reassured by green buzzwords in simple cases of greenwashing.',
    'B',
    '原句是 While 引導的讓步句：「雖然在包裝上看到這些字眼讓人安心，但這是不是漂綠，要看這些詞究竟指什麼。」(B) 用 Although 保留了同樣的讓步結構——標語令人安心，但可能被拿來漂綠。(A) 把「whether… depends on」讀成「不論是否漂綠都令人安心」，抹掉了原句的但書。(C) 誤讀 simply，把「單純只是漂綠而已」的 simply 當成「單純的漂綠案例」。故選 (B)。',
  ],
  [
    43,
    'Two sentences are highlighted in the text. How is the second sentence connected to the first?\n(A) The second sentence ignores a small point and then provides an example of a fine.\n(B) The second sentence emphasizes slight wrongdoing and then provides a reason for the fine.\n(C) The second sentence concedes a minor point and then provides a reason for the fine.',
    'C',
    '第二句以 "Although technically correct" 開頭，先退一步承認「就技術上而言標示沒錯」——這是讓步（concede a minor point）；接著說瓶子在掩埋場要一千年才分解、不符當地標示規範，這正是被罰款的理由。(A) 錯在 ignores（忽略）而非讓步，且罰款的例子出現在第一句而非第二句。(B) 錯在 emphasizes——第二句是淡化而非強調該過失。故選 (C)。',
  ],
  [
    44,
    'Which topic below is NOT covered in the article?\n(A) tips on how to greenwash\n(B) the definition of greenwashing\n(C) advice to shoppers',
    'A',
    '文末四點建議是教消費者「如何不被漂綠話術騙倒」（tips to help you avoid being fooled by greenwashing），立場站在消費者這邊，對應 (C)；第一段給出 greenwashing 的定義，對應 (B)。全文從未教企業「怎麼漂綠」，(A) 是把建議的對象與方向都反過來的陷阱選項。故選 (A)。',
  ],
  [
    45,
    'Below are some common buzzwords used in greenwashing. Which expression was not mentioned in this article?\n(A) biodegradable (B) all natural (C) carbon neutral',
    'C',
    '文章列舉的標語有 recyclable、biodegradable、environmentally friendly、all natural，以及近年常見的 sustainable、renewable、organic，另外提到 green、pure、natural。(A) 與 (B) 都在其中，唯獨 carbon neutral（碳中和）全文未出現。故選 (C)。',
  ],
  [
    46,
    'What is the relationship between fading affect bias and rosy retrospection?\n(A) Rosy retrospection and fading affect bias are the causes of memory loss.\n(B) Fading affect bias refers to the tendency for people to overestimate the extent to which others agree with them which is the outcome of rosy retrospection.\n(C) Fading affect bias causes the brain to retain positive memories while allowing the negative ones to fade, thus leading to rosy retrospection.',
    'C',
    '文章定義 fading affect bias 為 "how the brain retains positive memories while allowing negative ones to fade"，而這正是 rosy retrospection（回憶美化）背後的機制，(C) 完整重述了這層因果。(A) 兩者造成的是記憶偏差而非記憶喪失。(B) 描述的是 false consensus effect（假共識效應），且把因果方向弄反。故選 (C)。',
  ],
  [
    47,
    'Which of the following is a synonym of the word "yearning"?\n(A) desire (B) slogan (C) complaint (D) memory',
    'A',
    '該字出現在 "instills the idea that our best days are behind us and a yearning for \'the good old days\'"，指對過去美好時光的強烈嚮往，與 (A) desire（渴望）同義。(B) slogan 口號、(C) complaint 抱怨、(D) memory 記憶，皆非 yearning 的同義詞——(D) 尤其是陷阱，本文雖在談記憶，但 yearning 本身指的是渴望而非記憶。故選 (A)。',
  ],
  [
    48,
    'Which sentence below is closest in meaning to the underlined sentence?\n(A) In politics, declinist arguments, despite often being false, are persuasive.\n(B) Because they are often false, declinist arguments have limited appeal in politics.\n(C) Declinist arguments by politicians are frequently unconvincing and exposed as false.',
    'A',
    '原句為 "Declinist arguments are often used by politicians, and although historians have shown that they are frequently false, they can effectively appeal to a bias toward a past that looks enviable in retrospect."，讓步結構是「雖然常被證明是假的，卻仍然很有說服力」，(A) 以 despite 保留了同樣的轉折。(B) 與 (C) 都把結論反過來，說這類論述沒有吸引力或沒有說服力，與 effectively appeal 矛盾。故選 (A)。',
  ],
  [
    49,
    'According to the article, how is a declinist perspective exploited?\n(A) Politicians use social media to spread false information about societal decline to create divisions within society.\n(B) Politicians use declinist arguments to appeal to people who yearn for "the good old days" to gain political advantage.\n(C) Politicians use rhetoric to create fear or anxiety about the future to promote their own agendas.',
    'B',
    '文章說政治人物利用衰退論訴諸「對回顧起來令人稱羨的過去的偏好」，也就是打動那些嚮往 "the good old days" 的人，(B) 正是這個機制。(A) 的社群媒體與製造社會分裂在文中完全沒提。(C) 的方向錯了——衰退論的著力點是美化過去，而非渲染對未來的恐懼。故選 (B)。',
  ],
  [
    50,
    'How does the writer suggest we deal with the effects of rosy retrospection?\n(A) We should use multiple sources of information to provide a more complete view of the past, present, and future.\n(B) We should be engaged in memory training so that we could recall from both short-term and long-term memories.\n(C) We should be aware of its effect on our judgment and decision-making, avoid a declinist perspective, and be careful not to prefer a rosy view of the past to the future.',
    'C',
    '最後一段的三個要點依序是：maintaining an awareness of its effects 以改善判斷與決策、help us avoid falling into a declinist perspective、not to prefer that rosy view of the past to a genuinely bright future，(C) 正是這三點的總結。(A) 的多方查證與 (B) 的記憶訓練文中都沒有提到。故選 (C)。',
  ],
]

// ---------------------------------------------------------------- 寫入

const questionsData = load('questions.json')
const answersData = load('answers.json')

const byNumber = new Map(
  questionsData.questions.filter((q) => q.paperId === 'pp-cs-en-112').map((q) => [q.number, q])
)

for (const [number, stem, answer, explanation] of ITEMS) {
  const question = byNumber.get(number)
  if (!question) throw new Error(`pp-cs-en-112 找不到第 ${number} 題`)

  let text = `${number}. ${stem}`
  if (number === 42) text += NOTE_42
  if (number === 43) text += NOTE_43
  if (number === 36) text = `${SECTION_HEADER}\n\n${ARTICLE_A}\n\n${text}`
  if (number === 41) text = `${ARTICLE_B}\n\n${text}`
  if (number === 46) text = `${ARTICLE_C}\n\n${text}`

  question.text = text
  answersData.answers[question.id] = { questionId: question.id, answer, explanation }
}

save('questions.json', questionsData)
save('answers.json', answersData)

console.log(
  `補上三篇閱讀文章，改寫第 ${ITEMS[0][0]}–${ITEMS[ITEMS.length - 1][0]} 題共 ${ITEMS.length} 題的題目與詳解`
)
