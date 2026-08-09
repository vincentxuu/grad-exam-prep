#!/usr/bin/env node
// 資料修復：資管所英文卷 107 / 113 / 114 三份紀錄裝的是同一份東西 —— 114 學年度
// 英文(B)（題號 9）。三次抽題各自截斷在不同長度（113 完整 50 題、107 截到 42 題、
// 114 截到 38 題），OCR 細節也略有出入，因此逐字比對只抓得到部分重複。
//
// 以 114-9.pdf 的原始內容重建 pp-im-en-114（完整 50 題）；
// pp-im-en-113 與 pp-im-en-107 的題目全部是 114 的內容，沒有一題屬於該年度，
// 因此整批刪除。這兩年的 PDF 網址仍在 past-papers.json 內且正確（113-9.pdf、
// 107_graduate_9.pdf），日後可重新抽題補回。

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
}
function save(file, data) {
  fs.writeFileSync(path.join(dataDir, file), `${JSON.stringify(data, null, 2)}\n`)
}

// Part I. Vocabulary (24%)
const VOCAB = [
  'Those shiny red shoes Janny just bought ____ her shiny red purse.\n(A) compartment  (B) compliment  (C) component  (D) complement',
  'After a long week at work, most people feel ____.\n(A) broken down  (B) phased out  (C) turned down  (D) worn out',
  'The play contained a variety of ____ events: the death of a young child, the suicide of her mother, and the murder of an older sister.\n(A) opposable  (B) avaricious  (C) morbid  (D) exhilarating',
  'We can ensure a safe and enjoyable holiday season by ____ to these precautions.\n(A) reverting  (B) adhering  (C) contributing  (D) subscribing',
  'To ____ his theory, Dr. Hayes offered experimental evidence, case study reports, and a log of observational notes.\n(A) allocate  (B) incorporate  (C) exacerbate  (D) substantiate',
  "The engineer explained that the suspension bridge's design is ____ to a spider's web structure.\n(A) analogous  (B) susceptible  (C) indifferent  (D) intangible",
  'To take the research further, the team plans to ____ single-cell technology to investigate more tissues such as muscle and adipose.\n(A) leverage  (B) manufacture  (C) screen  (D) prescribe',
  "The ____ islanders responded reluctantly to the government's compromises on land settlement, while the immigrants agreed immediately to the government's offer.\n(A) exquisite  (B) robust  (C) tenacious  (D) mediocre",
  'The editor would not allow the paper to go to press until certain passages were ____ from an article naming individuals involved in a political scandal.\n(A) expounded  (B) expunged  (C) detached  (D) dismantled',
  'When the judge pronounced the sentence, the convicted criminal shouted ____ at the jury.\n(A) profanities  (B) approbations  (C) benedictions  (D) amenities',
  "Many workers complained about the job conditions, so a special committee was set up to investigate the workers' ____.\n(A) divergence  (B) grievance  (C) serendipity  (D) disparagement",
  "The school's policy of punishing students who did not wear proper clothes was ____ to its mission of educating all of its students.\n(A) extravagant  (B) compatible  (C) antithetical  (D) outrageous",
]

// Part II. Grammar and Structure (20%)
const GRAMMAR = [
  'I really think that apologizing is ____ you can do.\n(A) a little  (B) the least  (C) as far as  (D) not as much as',
  'I have to go now. I promised not ____ late.\n(A) have been  (B) being  (C) to be  (D) be',
  "What's the name of the place ____ your parents spend their vacation?\n(A) that  (B) which  (C) where  (D) who",
  'She wondered what ____.\n(A) will look like her future\n(B) looks like her future\n(C) her future looks like\n(D) her future would look like',
  'Which of the following is NOT correct?\n(A) Using the latest technology, better hearing is made possible for people with hearing problems.\n(B) Hiking through the dense forest, we discovered a hidden waterfall.\n(C) The car, damaged in the accident, was towed to the nearest repair shop.\n(D) Written in haste, the letter contained several errors that needed to be corrected.',
  "Which of the following is NOT correct?\n(A) Look out! There is a truck coming! It's going to hit us!\n(B) I live in Taipei but I'm staying in New York for a few weeks.\n(C) Sorry, I can't help you. I'm leaving for an interview in an hour.\n(D) I'll wait here until you are finishing the writing.",
  "Which of the following is NOT correct?\n(A) If Jack had studied more, he will get better marks.\n(B) I'd join the basketball team if I were taller.\n(C) If you leave now, you might catch the train to Taichung.\n(D) If I owned a dog like that, I'd keep it on a leash.",
  'Which of the following is NOT correct?\n(A) Is this the person you told me about?\n(B) Whether the team needs now is clear leadership.\n(C) It is during the night that the city becomes most vibrant.\n(D) What makes this course unique is its focus on real-world applications.',
  'The following is a narrated sequence of thought. Which sentence is NOT correct?\n(A) I was walking home after school yesterday when it started raining heavily.\n(B) "Oh no, I will get soaked before I reach home," I thought.\n(C) "I wish I remember to bring my umbrella," I sighed.\n(D) But unfortunately, I had left it at home.',
  "Which of the following is NOT logically correct?\n(A) That was close! You might have caused an accident!\n(B) I shouldn't have used this kind of paint. It's the right kind.\n(C) We should have turned right. We've missed the turning.\n(D) The thief must have unlocked the door. There is no other explanation.",
]

// Part III. Cloze Test (20%) 與 Part IV. Reading Comprehension (36%)
// [起始題號, 文章, 該組每題的題幹／選項]
const PASSAGES = [
  [
    23,
    'Breakfast is often called the most important meal of the day, but many people skip it __23__ to busy schedules or lack of appetite. This habit can have notable __24__ both physical and mental health.\n\nSkipping breakfast usually causes hunger later in the day, leading to overeating during lunch or unhealthy snacking. These patterns are often a result of the body __25__ energy after hours without food. __26__, skipping breakfast can negatively affect concentration and productivity, particularly at school or work, as the brain needs fuel to function well.\n\nLong-term effects of this habit may include weight gain, as overeating often __27__ for missed calories. Studies also indicate a link between skipping breakfast and an increased risk of heart disease and diabetes. Therefore, a balanced breakfast is essential for good health; understanding the effects of skipping it can help you make healthier daily choices.',
    [
      '(A) due  (B) similar  (C) contrary  (D) according',
      '(A) additions to  (B) functions of  (C) patterns with  (D) effects on',
      '(A) featuring  (B) craving  (C) pursuing  (D) resolving',
      '(A) Additionally  (B) Conversely  (C) Inherently  (D) Transitionally',
      '(A) contends  (B) fends  (C) compensates  (D) vouches',
    ],
  ],
  [
    28,
    'Spiffs are essential in sales and marketing, __28__ a simple yet impactful way to boost employee motivation and drive business outcomes. These incentives, __29__ bonuses for meeting targets, energize teams to focus on specific goals, like increasing product visibility or achieving short-term revenue boosts.\n\nWhile some argue that spiffs may encourage unhealthy competition or short-term thinking, proper implementation can __30__ these concerns. When used correctly, spiffs promote accountability and foster a __31__ culture, ensuring employees align their efforts __32__ company objectives.',
    [
      '(A) to offer  (B) offer  (C) offering  (D) offered',
      '(A) such as  (B) unlike  (C) in addition to  (D) despite',
      '(A) mitigate  (B) elicit  (C) forestall  (D) implicate',
      '(A) driven-results  (B) results-driven  (C) results-driving  (D) driving-results',
      '(A) for  (B) on  (C) to  (D) with',
    ],
  ],
  [
    33,
    "The Arctic fox, also known as the polar fox or snow fox, is a small species of fox that thrives in one of the harshest environments on Earth, the Arctic tundra. This remarkable creature has developed several adaptations that allow it to survive during the polar winter when temperatures rarely get above zero degrees Fahrenheit.\n\nOne of the most striking features of the Arctic fox is its thick, fluffy coat, which changes color with the seasons. In winter, the fox's fur turns white, blending seamlessly with the snow and providing excellent camouflage from predators like polar bears and wolves. Its fur becomes brown or gray in summer, matching the tundra's rocky terrain.\n\nAnother adaptation is the fox's compact body shape, which minimizes heat loss. Its small ears, short legs, and bushy tail all contribute to retaining warmth. The tail acts as a \"wrap-around blanket,\" adding insulation when the fox curls up tightly, tucking its legs and head under their body to protect less insulated areas and reduce exposure. These features help it endure the extreme cold.\n\nThe Arctic fox's diet is highly flexible, enabling it to survive in harsh and unpredictable environments. While it primarily hunts small mammals like lemmings, it also consumes insects, berries, and even animal droppings when food is scarce. Arctic foxes often scavenge leftovers from polar bear hunts, making the most of available resources. This opportunistic feeding strategy ensures their survival despite the challenges of their extreme habitat.\n\nThe Arctic fox is a testament to nature's ingenuity, showcasing how animals can evolve to survive in even the most extreme conditions.",
    [
      "Why does the Arctic fox's fur change color with the seasons?\n(A) To protect its skin from the cold\n(B) To maintain a consistent body temperature\n(C) To blend with its surroundings for camouflage\n(D) To attract mates during specific times of the year",
      "Which of the following statements about the Arctic fox is incorrect?\n(A) The Arctic fox's tail is a wrap-around blanket to insulate its body.\n(B) The Arctic fox's compact body shape helps it conserve heat during the winter.\n(C) The Arctic fox eats animal droppings and scavenged remains.\n(D) The Arctic fox has evolved more successfully than other Arctic animals.",
      "The phrase “a testament to nature's ingenuity” (in bold) in the fifth paragraph most likely means that the Arctic fox is an example of ____.\n(A) nature's creativity and adaptability\n(B) the simplicity of animal evolution\n(C) the harshness of Arctic life\n(D) the victim of global warming",
    ],
  ],
  [
    36,
    'Sugar is everywhere in modern diets, from sodas and candy to seemingly healthy snacks like granola bars. Consuming too much sugar can have serious effects on our health. One major cause of this issue is the excessive availability of processed foods, which often contain high levels of added sugars, making it easy for people to overconsume without realizing it.\n\nResearch has demonstrated the harmful effects of high sugar intake. A study published in The BMJ (2014) found that individuals who consumed large amounts of sugar had a 38% higher risk of dying from cardiovascular disease. Excess sugar also contributes to weight gain because it is high in calories but low in satiety. Another study in Nature Communications (2019) highlighted how sugary diets disrupt gut microbiota, which may lead to metabolic disorders.\n\nConsuming too much sugar over time raises the risk of type 2 diabetes, heart disease, and tooth decay. To address these issues, it is important to reduce sugar intake, choose natural options like those in fruits, and carefully read food labels. These steps help individuals make better choices and maintain their health.',
    [
      'According to the article, why do people often consume too much sugar?\n(A) People enjoy the taste of natural sugars in fruits.\n(B) People misunderstand food labels and ingredients.\n(C) Processed foods often contain hidden added sugars.\n(D) Sugar consumption is strongly linked to physical activity.',
      'Which of the following statements is incorrect based on the article?\n(A) Diets high in sugar can disturb gut microbiota, possibly causing metabolic issues.\n(B) Studies have shown that consuming large amounts of sugar increases the risk of death from heart disease.\n(C) Consuming natural foods like fruits instead of sugary items helps lower health risks.\n(D) Long-term sugar consumption prevents weight gain when paired with a balanced diet.',
      'What does the word “satiety” (in bold) most likely mean in the second paragraph?\n(A) The process of digesting sugary foods\n(B) A feeling of fullness and satisfaction after eating\n(C) The feeling of needing or wanting food\n(D) An emotional craving for sweet snacks',
    ],
  ],
  [
    39,
    "Norwegian veteran Tarjei Boe delivered an outstanding performance to win the 15 km Mass Start at Annecy Le Grand-Bornand, crossing the finish line at 37:20.8. This victory marks a remarkable comeback after a challenging start to the season.\n\nDespite difficult track conditions caused by heavy rain, Tarjei Boe remained composed and focused, excelling in the shooting stages where precision was key. The Norwegian team showcased its dominance, with Johannes Thingnes Boe and other top athletes fiercely competing. Balancing speed with shooting accuracy was crucial, as missed targets made it difficult to maintain the lead.\n\nThe race featured strong competition from young athletes pushing the pace early, while veterans like Sturla Holm Lægreid demonstrated their consistency and experience. Tarjei Boe's triumph was particularly significant as it secured his qualification for future championships, underlining his resilience and determination.\n\nJohannes Thingnes Boe, who finished third, 9.7 seconds behind his brother, expressed pride in his brother's achievement, emphasizing their close bond. The thrilling race highlighted not only Tarjei Boe's individual skill but also the strength and depth of the Norwegian team, making it a memorable event for fans and competitors alike.",
    [
      "Which of the following is the best title for the article?\n(A) “Rain and Speed: Challenges in Modern Biathlon”\n(B) “Tarjei Boe's Comeback Victory at Annecy”\n(C) “Young Athletes Steal the Spotlight at Annecy”\n(D) “Norwegian Team Dominates 15 km Race”",
      "What is the main idea of the article?\n(A) The Norwegian team struggled to perform due to heavy rain and track challenges.\n(B) Younger athletes outperformed veterans, showcasing a shift in dominance in the sport.\n(C) Tarjei Boe's precise shooting and determination secured his win in the 15 km Mass Start despite tough conditions.\n(D) Johannes Thingnes Boe overshadowed his brother's success with his own performance.",
      "Which statement about the article is incorrect?\n(A) The favorable race conditions allowed athletes to focus solely on speed.\n(B) Tarjei Boe's victory was pivotal in securing his qualification for upcoming championships.\n(C) Young athletes pushed the pace early in the race but couldn't sustain their lead.\n(D) The Norwegian team displayed strong individual performances alongside teamwork.",
      'What does the word “resilience” (in bold) in the third paragraph most likely mean in the context of the article?\n(A) A lack of concern for setbacks\n(B) A natural talent for competitive sports\n(C) Consistent physical strength in extreme conditions\n(D) The ability to recover quickly from difficulties',
    ],
  ],
  [
    43,
    "William Shakespeare's works transcend time, offering insights into human nature and storytelling that remain profoundly relevant in the modern world. His themes, characters, and language continue to inspire and influence literature, theater, and film.\n\nTake Romeo and Juliet, for example, a powerful story of forbidden love and family conflict. The tragedy captures the intensity of youthful passion, the destructiveness of family feuds, and the devastating consequences of miscommunication. The final, heart-wrenching scene, where Romeo and Juliet's misaligned timing leads to their tragic deaths, is a poignant reminder of how misunderstandings can have irreversible consequences. Its themes have inspired modern adaptations like West Side Story, where the feud between two families is reimagined as rival street gangs, showcasing the story's enduring relevance.\n\nIn Hamlet, Shakespeare delves into existential questions and the human psyche. Hamlet's soliloquy, “To be or not to be,” remains one of the most quoted passages in literature, exploring the struggle with doubt, morality, and the meaning of life. The play's sophisticated depiction of revenge and betrayal, reflected in Hamlet's reluctance to seek vengeance for his father's murder, uncovers the depths of human emotion. These themes continue to resonate in contemporary storytelling, reflecting universal struggles with justice and identity.\n\nMacbeth offers a chilling exploration of unchecked ambition. The title character, driven by the witches' prophecy and Lady Macbeth's manipulation, descends into moral corruption and tyranny. His famous soliloquy, “Is this a dagger which I see before me?” reflects his growing paranoia and guilt. The play warns of the destructive consequences of pursuing power at any cost, a theme echoed in modern political dramas like House of Cards.\n\nShakespeare also revolutionized the English language, coining phrases such as “wild-goose chase,” “break the ice,” and “foregone conclusion.” In Romeo and Juliet, Mercutio uses the phrase “wild-goose chase” to describe an elusive pursuit, a notion that continues to be impactful today.\n\nUltimately, Shakespeare's works offer timeless insight into love, ambition, morality, and the human condition. His innovative use of language and compelling stories ensure his enduring legacy.",
    [
      "According to the article, which of the following statements is incorrect?\n(A) Romeo and Juliet addresses themes of family conflict and youthful passion.\n(B) Hamlet explores existential questions about morality and doubt.\n(C) Macbeth focuses on the joys of ambition and personal achievement.\n(D) Shakespeare's linguistic innovations continue to influence modern communication.",
      "What is the main idea of the article?\n(A) Shakespeare's influence is evident in language, storytelling, and the exploration of universal human experiences.\n(B) Shakespeare's works are primarily valuable for their historical context.\n(C) Shakespeare's plays continue to be studied because they document historical events accurately.\n(D) Modern adaptations improve Shakespeare's accessibility to a global audience.",
      "What does the word “unchecked” (in bold) in the fourth paragraph most likely mean when describing ambition in Macbeth?\n(A) Limited or restrained by moral considerations.\n(B) Left to grow without control or moderation.\n(C) Constantly questioned and analyzed by the protagonist.\n(D) Driven by external forces beyond the character's control.",
      "What does the article imply about the phrase “wild-goose chase” (in bold) in the fifth paragraph?\n(A) It reflects Shakespeare's focus on natural imagery and pastoral themes.\n(B) It highlights the consistent playful tone across Shakespeare's plays.\n(C) It demonstrates Shakespeare's mastery of metaphors within historical contexts.\n(D) It exemplifies Shakespeare's ability to create timeless phrases.",
    ],
  ],
  [
    47,
    "In the serene expanse of space, an extraordinary instrument transforms our understanding of the universe. The James Webb Space Telescope (JWST), launched on December 25, 2021, represents the pinnacle of human innovation. The telescope has reached significant milestones over three years into its mission, validating theories, uncovering mysteries, and sparking fresh inquiries about our cosmos.\n\nThe JWST is humanity's most advanced observatory, designed to peer into the farthest reaches of space. Unlike its predecessor, the Hubble Space Telescope, which primarily operated in the visible spectrum, the JWST specializes in infrared observations. This capability allows it to pierce through dense clouds of gas and dust, capturing images of stellar nurseries and distant galaxies formed billions of years ago.\n\nThe telescope's journey to its operational location was as extraordinary as its mission. Deployed nearly 1.5 million kilometers from Earth at the second Lagrange point, the JWST's complex deployment process spanned 30 days. Engineers faced immense challenges, as any failure during the unfolding of its massive sunshield or mirrors could have spelled disaster for the mission. However, the seamless execution of these operations marked a triumph of collaboration and precision.\n\nSince its deployment, the JWST has provided breathtaking images and invaluable data. One of its most iconic achievements is its capture of the Carina Nebula, a stellar nursery showcasing the lifecycle of stars. These images are not just visually stunning but also scientifically significant, helping astronomers understand the processes of star formation and destruction.\n\nMoreover, the JWST is at the forefront of exoplanet exploration. Its ability to analyze the atmospheres of planets orbiting other stars has brought us closer to answering profound questions about life beyond Earth. By detecting water, methane, and other life-related molecules, Webb could identify potential candidates for habitability.\n\nThe telescope has also shed light on the mysterious expansion of the universe. Recent data confirmed that the universe is expanding about 8% faster than earlier models predicted. This perplexing discovery hints at the influence of dark energy, a poorly understood force that constitutes approximately 69% of the universe and drives its accelerated growth. The Webb telescope's observations may pave the way for breakthroughs in our understanding of dark energy and dark matter.\n\nThe James Webb Space Telescope is more than a tool for scientific inquiry; it symbolizes humanity's quest for knowledge. Its findings take us back to the universe's origins, challenge our current understanding of the cosmos, and encourage us to aim higher. As its mission progresses, the JWST is poised to unveil mysteries that will redefine our view of the cosmos for future eras.",
    [
      'What makes the JWST unique compared to the Hubble Space Telescope?\n(A) The JWST is closer to Earth, making it easier to maintain than Hubble.\n(B) Hubble uses infrared technology, while JWST does not.\n(C) The JWST observes distant regions with infrared technology.\n(D) Hubble cannot capture visible spectrum images.',
      "According to the article, which of the following is an incorrect statement?\n(A) The JWST replaces older technology to monitor Earth's climate.\n(B) The JWST advances astronomy, revealing mysteries and expanding understanding.\n(C) The JWST analyzes exoplanet atmospheres to search for signs of life.\n(D) Recent JWST findings suggest the universe's expansion rate is faster than previously thought.",
      "Why was the JWST's deployment process considered a major challenge?\n(A) The telescope's location required frequent repairs by astronauts.\n(B) The telescope's deployment required manual assembly in space.\n(C) Its equipment was highly resistant to adjustments during the journey.\n(D) Any mistake in deployment could have wasted years of work and billions of dollars.",
      "Which statement about dark energy is true based on the article?\n(A) Recent JWST findings may disprove the existence of dark energy.\n(B) The JWST may reveal insights into dark energy's role in the universe's expansion.\n(C) Dark energy has little impact on the universe's expansion.\n(D) The JWST directly measures the physical properties of dark energy.",
    ],
  ],
]

function buildIm114() {
  const texts = new Array(50)
  VOCAB.forEach((t, i) => {
    texts[i] = t
  })
  GRAMMAR.forEach((t, i) => {
    texts[12 + i] = t
  })

  for (const [start, passage, items] of PASSAGES) {
    const end = start + items.length - 1
    texts[start - 1] =
      `Questions ${start}-${end} refer to the following passage.\n\n${passage}\n\n(Question ${start}) ${items[0]}`
    for (let i = 1; i < items.length; i++) {
      texts[start - 1 + i] = items[i]
    }
  }

  return texts.map((text, i) => ({
    id: `q-pp-im-en-114-${i + 1}`,
    paperId: 'pp-im-en-114',
    examId: 'im',
    subjectId: 'im-english',
    year: 114,
    number: i + 1,
    text,
    points: null,
    hasImage: false,
    subQuestions: [],
  }))
}

const REBUILT = buildIm114()
const DROPPED_PAPERS = new Set(['pp-im-en-113', 'pp-im-en-107'])

const questionsData = load('questions.json')
const answersData = load('answers.json')
const images = load('question-images.json')

const removedIds = new Set()
let insertedRebuild = false
const nextQuestions = []

for (const q of questionsData.questions) {
  if (DROPPED_PAPERS.has(q.paperId)) {
    removedIds.add(q.id)
    continue
  }
  if (q.paperId === 'pp-im-en-114') {
    removedIds.add(q.id)
    if (!insertedRebuild) {
      nextQuestions.push(...REBUILT)
      insertedRebuild = true
    }
    continue
  }
  nextQuestions.push(q)
}

questionsData.questions = nextQuestions
questionsData.totalQuestions = nextQuestions.length

const newIds = new Set(nextQuestions.map((q) => q.id))
let removedAnswers = 0
for (const id of Object.keys(answersData.answers)) {
  if (removedIds.has(id) || !newIds.has(id)) {
    delete answersData.answers[id]
    removedAnswers++
  }
}
for (const id of Object.keys(images)) {
  if (!newIds.has(id)) delete images[id]
}

save('questions.json', questionsData)
save('answers.json', answersData)
save('question-images.json', images)

console.log(`✅ pp-im-en-114 重建為 ${REBUILT.length} 題（原 38 題，截斷）`)
console.log('   pp-im-en-113、pp-im-en-107 的題目全部為 114 卷內容，已整批刪除')
console.log(`   共移除 ${removedIds.size} 題、${removedAnswers} 筆答案`)
console.log(`   總題數: ${nextQuestions.length}`)
console.log(`   缺答案: ${nextQuestions.filter((q) => !answersData.answers[q.id]).length} 題`)
