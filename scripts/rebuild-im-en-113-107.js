#!/usr/bin/env node
// 補回資管所英文卷 113 與 107 的題目。
//
// 這兩年原本的紀錄整份都是 114 卷的複本，已在先前的修復中刪除；本腳本以各自的
// 原始 PDF 重建：
//   pp-im-en-113 → 113-9.pdf（英文(B)，50 題）
//   pp-im-en-107 → 107_graduate_9.pdf（英文(B)，50 題，每小題 2 分）
//
// 慣例比照既有英文卷：points 為 null，克漏字與閱讀測驗把整篇文章掛在該組第一題
// 並以「(Question N)」帶出該題選項，讓 findPassageParent 能正確配對。

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
}
function save(file, data) {
  fs.writeFileSync(path.join(dataDir, file), `${JSON.stringify(data, null, 2)}\n`)
}

// ═══════════════════════════════════════════════════ 英文(B) 113

const EN113_SINGLES = [
  'The first time someone performs in public is a ____.\n(a) publicity  (b) debut  (c) trial  (d) outing',
  'She puts on a happy ____, but she is really very sad.\n(a) facade  (b) ego  (c) tempo  (d) pace',
  'They administered an injection which would help ____ the pain.\n(a) interpret  (b) alleviate  (c) aspire  (d) escalate',
  'The students had great difficulty trying to ____ the concept.\n(a) evoke  (b) facilitate  (c) encompass  (d) grasp',
  'Acid rain has caused direct damage to architectural ____ such as the Acropolis in Greece and the Taj Mahal in India.\n(a) tenements  (b) sculpture  (c) relics  (d) monuments',
  "The translators disagreed about the writer's intention because of ____ in the language used by the writer.\n(a) ambiguity  (b) blockage  (c) stupor  (d) hurdles",
  'Some people are urging the government to put more controls on automobile ____. They warn that if this is not done, air pollution will only get worse.\n(a) secretions  (b) emissions  (c) projections  (d) discharge',
  "When we hole up in our own trenches, we lose sight of reality. We're lured into thinking that a small, hate-mongering ____ reflects all humankind.\n(a) majority  (b) celebrity  (c) minority  (d) entity",
  'Epigenetics is the most monumental explanation to emerge in the social and biological sciences since Darwin proposed his theory of natural ____.\n(a) screening  (b) selection  (c) competition  (d) violation',
  'As AI models transition to becoming ____, there is a growing focus on maintaining performance while making them smaller and faster.\n(a) commercialized  (b) subsidized  (c) trivialized  (d) specialized',

  'I met ____ friendly college students at the swimming pool.\n(a) a  (b) an  (c) some',
  'Her daughter is in a special math class for ____ children.\n(a) gift  (b) gifted  (c) gifting',
  'The causes of the accident ____ analyzed by the police.\n(a) was  (b) were  (c) had been',
  'There ____ several reasons for my decision.\n(a) is  (b) are  (c) may be',
  'My company pays workers ____.\n(a) good  (b) well  (c) fair',
  'I like to read ____ before bedtime.\n(a) in the night  (b) by night  (c) at night',
  'I saw a great documentary ____ tornados, hurricanes and typhoons.\n(a) with  (b) by  (c) about',
  "I'm afraid that I'm not very good ____ sports.\n(a) with  (b) in  (c) at",
  'I put the beautiful antique bowl ____ the new china cabinet.\n(a) on top of  (b) between  (c) over',
  "If Doris hadn't been feeling under the weather, she ____ to our party.\n(a) could come  (b) would come  (c) would have come",
]

const EN113_PASSAGES = [
  [
    21,
    'Like all hormones, insulin has widespread and varied __21__ in the body even though doctors typically pay attention to only one of them: the facilitation of transport of glucose from the blood into the cells. We now know that insulin also __22__ the body to store up calories as fat, can promote arterial damage, and may even accelerate the growth of tumors. Moreover, in some people, frequent outbursts of insulin from the pancreas may encourage cells to decrease their __23__ to that hormone. By making fewer insulin receptors, they become insulin resistant. Insulin resistance is __24__ with stubborn obesity, abnormalities of blood fats, high blood pressure, adult-onset diabetes, and cardiovascular disease, including increased risk of death from heart attacks and strokes. Is it possible that all those satisfying, filling, life-sustaining carbohydrate foods that became available to us following the __25__ of starch-bearing plants are the root cause of these calamities?',
    [
      '(a) affects  (b) effects  (c) impacts',
      '(a) encourages  (b) discourages  (c) provokes',
      '(a) sensibility  (b) sensitivity  (c) sensation',
      '(a) pertinent  (b) relevant  (c) associated',
      '(a) solicitation  (b) domestication  (c) eradication',
    ],
  ],
  [
    26,
    "In this digital age, the news we are being fed is only getting more __26__. In the old days, journalists didn't know much about their individual readers. They wrote for the __27__. But the people behind Facebook, Twitter and Google know you well. They know what makes you __28__. They know how to grab your attention and hold it so they can serve you the most lucrative helping of personalized ads. This modern frenzy is nothing less than an assault on the __29__. Because, let's be honest, the lives of most people are quite predictable. Nice, but boring. So, while we'd prefer having nice neighbors with boring lives, 'boring' won't make you sit up and take notice. 'Nice' doesn't sell ads. Therefore, Silicon Valley keeps __30__ ever more sensational clickbait, knowing full well, as a Swiss novelist once quipped, that 'News is to the mind what sugar is to the body.'",
    [
      '(a) moderate  (b) insipid  (c) extreme',
      '(a) elite  (b) masses  (c) intellectuals',
      '(a) flick  (b) click  (c) think',
      '(a) mundane  (b) unusual  (c) extraordinary',
      '(a) digging up  (b) dishing up  (c) pushing up',
    ],
  ],
  [
    31,
    "There are people who want a stable marriage but continue to cheat on their wives. There are people who want a successful career but continue to __31__ themselves at work. Aristotle defined man as a __32__ animal. Contradictions like these show that we are not. All people live with the conflicts between what they want and how they live. For most of human history we had no way to explain this __33__, until Freud's discovery of the unconscious resolved it. Before Freud we were restricted to our conscious awareness when looking for answers regarding what we knew and felt. All we had to explain __34__ thoughts, feelings and motivations was limited to what we could access in consciousness. We knew what we knew and we felt what we felt. Freud's explanation __35__ a conceptual space, not manifest to us, where irrationality rules.",
    [
      '(a) push  (b) undermine  (c) overcome',
      '(a) conventional  (b) hysterical  (c) rational',
      '(a) parable  (b) paradox  (c) paragon',
      '(a) incompatible  (b) explicable  (c) inherent',
      '(a) capitulated  (b) stipulated  (c) postulated',
    ],
  ],
  [
    36,
    'Statistics is not most students’ __36__ subject. Next to calculus and organic chemistry, it might be the most avoided class in any college undergraduate program. The truth, however, is that statistics __37__ our lives every minute of every day. Suffice to say, all of us are pawns of probability. Given enough time, enough drivers, enough __38__ problems in the water main—eventually someone will stop their car over a manhole cover that is about to __39__. It may happen only once in a year, or ten years, or maybe more, but it will happen. How do we know this? Because it happened. The words random and luck are really __40__ for a more jargony term: probabilistic outcomes.',
    [
      '(a) challenging  (b) difficult  (c) favorite',
      '(a) run down  (b) lord over  (c) come up',
      '(a) partial  (b) elemental  (c) incremental',
      '(a) slip  (b) fall  (c) blow',
      '(a) stand-ins  (b) prop-ups  (c) show-offs',
    ],
  ],
  [
    41,
    'In order to establish photography as art, members of the Aesthetic Movement modeled their work on classical paintings, even copying the subjects and poses popularized by artists of the Classical Period. As the movement gained in popularity, photographers made a clear distinction between the elegant, artistic photography that conformed to the aesthetic standard used for paintings and the work of more realistic photographers that was beginning to appear. Since they were cloudy because of the gum bichromate plate that allowed for manual intervention, the aesthetic prints were easily distinguished from the more modern prints, which came to be called straightforward photographs. In contrast, the straightforward photographers produced images that were sharp and clear. Whereas the proponents of the Aesthetic movement continued to hand color their photographs, adding details and textures to conform to the art of printmakers, the philosophy that surrounded new photography rejected manipulation of either the subject matter or the print. The subjects included nature in its undisturbed state and people in everyday situations.\n\nA number of major exhibitions and the formation of photographic clubs during the late nineteenth century provided the impetus for the Photo-Secession Movement. Founded by Alfred Steiglitz in New York City in 1902, Photo-Secession had as its proposition the promotion of straightforward photography through exhibits and publications. One of the publications, Camera Work, has been recognized among the most beautiful journals ever produced. By the 1920s, the mechanical precision that had once been criticized as a defect by members of the Aesthetic movement had become a hallmark of modern photography. Chiefly through the efforts of Steiglitz, modern photography had seceded from painting and emerged as a legitimate art form. In summary, the Aesthetic Movement rejected reality for beauty, but the Photo-Secessionists embraced realism as even more beautiful.',
    [
      'Which of the following would be an appropriate title for the passage?\n(a) The Photo-Secession Movement\n(b) The Aesthetic Movement\n(c) Alfred Steiglitz\n(d) The Evolution of Photography',
      'How can earlier photographs be distinguished from more modern photographs?\n(a) They were not the same color\n(b) They were not as clear\n(c) They did not look like paintings\n(d) They were not retouched',
      'What is NOT true of Camera Work?\n(a) It is considered among the most attractive magazines\n(b) It encouraged members of the Aesthetic Movement\n(c) It was promoted by Alfred Steiglitz\n(d) It was a vehicle for realistic beauty',
      'The Photo-Secession Movement is described as including all the following EXCEPT\n(a) straightforward photographs\n(b) mechanical precision\n(c) sharp, clear images\n(d) manipulation of prints',
      'It can be inferred from the passage that the author\n(a) knew Alfred Steiglitz personally\n(b) was not interested in Alfred Steiglitz\n(c) disagreed with Alfred Steiglitz\n(d) admired Alfred Steiglitz',
    ],
  ],
  [
    46,
    'I consider myself a scientist, and the theory of evolution is central to my thinking. I am a social scientist and have been informed by insights from many social sciences, including economics. Yet I have very little sympathy with hegemonic attempts to explain all human behaviors via evolutionary psychology, via rational-choice economics and/or by a combination of these two frameworks.\n\nIn a planet occupied by over 7 billion inhabitants, I am amazed by the difference one human being can make. Think of classical music with Mozart or Stravinsky; of painting without Caravaggio, Picasso or Pollock; of drama with Shakespeare or Beckett. Think of the incredible contributions of Michelangelo or Leonardo, or, in recent times, the outpouring of deep feeling at the death of Steve Jobs (or, for that matter, Michael Jackson or Princess Diana). Think of human values in the absence of Moses or Christ.\n\nAlas, not all singular individuals make a positive difference. The history of the 20th century would be far happier had it not been for Hitler, Stalin, or Mao (or the 21st century without Bin Laden). But in reaction to these individuals, there sometimes arise more praiseworthy figures: Konrad Adenauer in Germany, Mikhail Gorbachev in the Soviet Union, Deng Xiaoping in China. These successors also make a signal difference.\n\nI consider Mahatma Gandhi to be the most important human being of the last millennium. His achievements in India speak for themselves. But even if Gandhi had not contributed vital energy and leadership in his own country, he had enormous influence on peaceful resisters across the globe: Nelson Mandela in South Africa, Martin Luther King Jr. in the United States, and the solitary figures in Tiananmen Square in 1989 and Tahrir Square in 2011.\n\nDespite the laudatory efforts of scientists to ferret out patterns in human behavior, I continue to be struck by the impact of single individuals, or of small groups, working against the odds. As scholars, we cannot and should not sweep these instances under the investigative rug. We should bear in mind anthropologist Margaret Mead’s famous injunction: “Never doubt that a small group of thoughtful committed citizens can change the world, indeed, it is the only thing that ever has.”\n\n— Howard Gardner',
    [
      'What is an appropriate title for this passage?\n(a) The History of Mankind\n(b) Patterns of Human Behavior\n(c) The Importance of Individuals\n(d) Great Men in History',
      "Which of the following statements is FALSE?\n(a) The author believes all human behaviors can be explained by evolutionary psychology.\n(b) The global population exceeds 7 billion.\n(c) One cannot think of classical music without thinking of Mozart.\n(d) People all over the world grieved over Princess Diana's death.",
      "Which statement does NOT reflect the author's views?\n(a) A single person can make a big difference in the world.\n(b) Hitler, Stalin and Mao have made the world a better place.\n(c) Nelson Mandela was inspired by Mahatma Gandhi.\n(d) Not all singular individuals make a positive difference.",
      "Which statement reflects the author's views?\n(a) Gandhi failed to bring about change to India, his own country.\n(b) Solidarity is power. We must stand together to bring about change.\n(c) There is strength in numbers.\n(d) Solitary figures can change the world.",
      'According to Margaret Mead, the anthropologist quoted at the end of the passage:\n(a) Individuals are powerless when they stand alone\n(b) Successful attempts to change the world are always group efforts\n(c) We must question the intention of small groups of citizens\n(d) Most changes that have taken place in the world have been made possible by a small group of people',
    ],
  ],
]

// ═══════════════════════════════════════════════════ 英文(B) 107

const EN107_SINGLES = [
  'When a series of pictures of an object is presented in steady, rapid ____, with the position of the object slightly altered in each picture, our brain blends these pictures into one another, creating the illusion of motion.\n(A) subordination  (B) succession  (C) explosion  (D) predecessor',
  'The time ____ between images is normally 1/24 of a second in most cameras.\n(A) lapse  (B) languor  (C) larceny  (D) lard',
  'To our surprise, he urged the ____ of hanging and flogging.\n(A) restoration  (B) resuscitation  (C) resonance  (D) resilience',
  'The communication ____ of animals like apes, chimpanzees and dolphins is limited to simple gestures and a very limited range of vocal utterances.\n(A) apprentice  (B) apparel  (C) apparatus  (D) apprehension',
  "The basic premise of this concept ____ in the realization that neither theism nor deism can adequately answer the burning question of man's relationship with God.\n(A) retorts  (B) retreats  (C) resigns  (D) resides",
  'After the chemotherapy, her cancer has been in ____ for several years.\n(A) recess  (B) remission  (C) regret  (D) remiss',
  'John has been addicted to drugs. This year he managed to stop using them for a month, but then ____.\n(A) relaxed  (B) relapsed  (C) relayed  (D) replied',
  'The revolt in the northern part of this country is thought to have been ____ by a high-ranking general.\n(A) instilled  (B) insighted  (C) instigated  (D) installed',
  'After the trial, the ____, all under the age of eighteen, were detained and their appeals were dismissed.\n(A) lampoons  (B) barristers  (C) shrines  (D) litigants',
  'The bedrooms were ____ with bare mattresses, and the refrigerator was dirty, the report says.\n(A) melancholy  (B) concave  (C) unkempt  (D) burly',

  '____ brings about particular allergic reactions to something around us is usually referred to as an allergen.\n(A) Those  (B) There  (C) When  (D) Whatever',
  "____ one third of a car's fuel consumption is spent in overcoming friction, and this friction loss has a direct impact on both fuel consumption and emissions.\n(A) Following  (B) No less than  (C) Regarding  (D) Given",
  'Anyone ____ getting information about the new political party should email us.\n(A) interested in  (B) interesting to  (C) who interested  (D) who is interested',
  'There was a time when people anticipated racial prejudice to eventually dissipate ____ a more enlightened and better-educated group of youth replaced generations of racial chauvinism and bigotry throughout the world.\n(A) through  (B) though  (C) as  (D) for',
  '____ on our cover this month is an electron micrograph of a human sperm that even the student of oncogenes might recognize as being "just not right".\n(A) Featured  (B) Featuring  (C) Be featured  (D) Be featuring',
  'I am almost finished. This is ____ to empty.\n(A) the last one but  (B) the one but last  (C) one but the last  (D) the last but one',
  'Cabin fever is essentially a response to ____ inside a confined indoor area for a prolonged period of time.\n(A) stick  (B) being stuck  (C) stuck  (D) have stuck',
  'Hardly had she seen me ____ she burst out laughing.\n(A) what  (B) where  (C) when  (D) why',
  'If nothing else, voters will question the integrity of the process and may question the results of the election ____.\n(A) regarded  (B) regard of  (C) regarding  (D) regardless',
  '____ with just standing here, I took out my cellphone to play online games.\n(A) Felt bored  (B) Feeling boring  (C) Feeling bored  (D) Felt boring',
]

const EN107_PASSAGES = [
  [
    21,
    'Revolutions in the quest for new knowledge __21__ many appearances. In biology and medicine, there has been no shortage of breakthroughs that forever change the way we think about a __22__ topic once a new set of observations are collected and shared with colleagues whose ambitions are aimed in a similar direction. The broad spectrum of disciplines comprising our __23__ scientific enterprise continue to seek and obtain “truths” __24__ the benefit of humankind as preventive, diagnostic, and treatment strategies evolve from __25__ they resided 10, 50, or 100 years ago.\n\nThe __26__ forward in what we perceive as the quest for new knowledge is inextricably linked to advances in technology. In the distant past, the roots of discovery rested firmly in the hands of those able to keenly observe and associate using __27__ the naked eye. Introducing microscopes __28__ the next era of observation and analysis that brought to the surface both cell theory and the cellular basis of disease. Fast forward to the mid twentieth century, when the electron microscope __29__ on the scene. An entirely new landscape of the inner workings of cells, tissues, and the assorted pathogens amongst us revealed a level of organization and complexity that both enhanced and revolutionized our powers of observation and conceptualization when it came to matters of life and death. Enter the world of molecular genetics, and the landscape of biology and medicine has taken up residence in an __30__ universe of new knowledge that students of human health and disease will be wedded to for years to come.',
    [
      '(A) take on  (B) take in  (C) take out  (D) take to',
      '(A) give  (B) giving  (C) given  (D) gave',
      '(A) collecting  (B) collect  (C) collected  (D) collective',
      '(A) into  (B) to  (C) since  (D) from',
      '(A) X  (B) when  (C) where  (D) how',
      '(A) parch  (B) march  (C) arch  (D) archive',
      '(A) nothing more than  (B) nothing less than  (C) more than  (D) less than',
      '(A) revealed  (B) populated  (C) ushered in  (D) connected by',
      '(A) appealed  (B) arrested  (C) allotted  (D) arrived',
      '(A) expanded ever  (B) ever-expanding  (C) expended ever  (D) ever-expending',
    ],
  ],
  [
    31,
    "Our desire to understand how the dead __31__ their fate isn't a recent phenomenon. More than 750 years ago, in 1247, a handbook for coroners called The Washing Away of Wrongs was produced by a Chinese official named Song Ci. It contained the first example of forensic entomology – the use of insect biology in the solution of a crime. The victim had been stabbed to death by a roadside. The coroner examined the slashes on the man's body, then tested an assortment of blades on a cow __32__. He concluded that the murder weapon was a sickle. But knowing what caused the wounds was a long way from identifying whose hand had __33__ the blade. So the coroner turned to possible __34__. The victim’s possessions were still __35__, which ruled out robbery. According to his widow, he had no enemies. The best __36__ was the revelation that the victim hadn’t been able to satisfy a man who had recently demanded the repayment of a debt.\n\nThe coroner accused the money lender, who denied the murder had __37__ to do with him. But the coroner was as __38__ as any TV detective. He ordered all seventy adults in the neighborhood to stand in a line, their sickles at their feet. There were no visible traces of blood on any of the sickles. But within seconds a fly landed enthusiastically on the money lender’s blade, attracted by __39__ traces of blood. A second fly followed, then another. When confronted again by the coroner, the money lender “knocked his head on the floor” and gave a full confession. He’d tried to clean his blade, but his attempt to conceal his crime had been __40__ by the insect informers humming quietly at his feet.",
    [
      '(A) meet  (B) met  (C) wind  (D) wound',
      '(A) car  (B) carriage  (C) carcass  (D) carrier',
      '(A) wretched  (B) wielded  (C) wired  (D) warranted',
      '(A) merchants  (B) metropolis  (C) migrants  (D) motives',
      '(A) intact  (B) impact  (C) indelible  (D) indistinct',
      '(A) momentum  (B) placebo  (C) phobia  (D) lead',
      '(A) anywhere  (B) anything  (C) everywhere  (D) nothing',
      '(A) tentative  (B) precocious  (C) tenacious  (D) viable',
      '(A) nonchalant  (B) vibrant  (C) minute  (D) full-blown',
      '(A) overheard  (B) sentenced  (C) foiled  (D) measured',
    ],
  ],
  [
    41,
    'A man would like to keep improving, even in his declining years, and surprise himself with some little feat now and then, such as begetting a daughter, as I did recently, a lovely one with bright eyes and long, delicate fingers. She is not an easy baby you can shoehorn into your busy schedule the way people do nowadays. Not a hobby baby. It would take a village to raise this child – about 68 people, in other words: walkers, feeders, scrapers, dressers, bouncers and maybe the Mormon Tabernacle Choir to come in for an hour or two in the evening and hum.\n\nMy daughter lives on Australian Standard Time, eats like a wolverine, gulps down air, stores up pockets of gas that are not easily jiggled out of her. She poops with gay abandon. Her deepest pleasure comes from pooping while feeding, to engage the entire digestive tract at once. Pure bliss. She fights off sleep, afraid she might miss something. Midnight to 6 a.m. is prime time, and if she dozes, she keeps one eye open for the main action. My maneuver for laying her in the crib is very involved, something I learned from a National Geographic special on the praying mantis: I do it in slow motion. When her tiny, beautiful head touches the mattress, her eyes fly open and tears well up in them. She cries, she keens, she wails and howls. She has no middle range; she is louder than anyone else whom I know personally. She cannot be ignored. And so I sling the spit rag over my shoulder and resume walking the floor, a foot soldier in the old campaign, exhausted, milk stained, borderline paranoid, poorly informed, a man nobody would ever hire to look after a six-week-old infant.\n\nWell, what else did I have in mind for my twilight years? Not that much. A writer turns ____, the old double nickel, and the slender thread of inspiration has unraveled and you clomp around in circles like an old pony at the pony ride and beautiful women come up and tell you how much their mothers liked something you did in 1975. Your prose style turns flabby. Your work has the shelf life of tropical fish. Compared to that, fathering a baby is sheer nobility, a shot at immortality.',
    [
      'Which of the following number best completes the blank in the passage?\n(A) 25  (B) 35  (C) 45  (D) 55',
      'Which of the following can be inferred from the passage?\n(A) The author and his daughter live in Australia.\n(B) The author’s daughter falls into sleep quickly.\n(C) The author’s daughter shows many psychological disorders in early life.\n(D) The author feels very exhausted taking care of the baby.',
      'Which of the following best describes the author’s sentence: “It would take a village to raise this child – about 68 people…”?\n(A) An overstatement\n(B) An understatement\n(C) A metaphor\n(D) A simile',
      'According to the passage, what can we learn about hobby babies?\n(A) Those who enjoy pooping while feeding.\n(B) Those who don’t bother their parents too much.\n(C) Those whose hobbies are similar to their parents’.\n(D) Those whose hobbies are hard to find.',
    ],
  ],
  [
    45,
    'First things first. "Kingdom of Heaven," director Ridley Scott\'s return to the sword-and-sandals genre he revived with "Gladiator," is nowhere near as entertaining as that 2000 film. It\'s also nowhere near as awful as the inert bores that followed "Gladiator" into theaters — the wooden "Troy" and the demented "Alexander." It is, instead, a mostly lumbering, occasionally rousing epic that walks a bizarre line between historical fact and Hollywood wishful thinking.\n\nMore than anything, this often fascinatingly confused Crusades epic lacks a leading man with the stature to put it over. Audiences know Russell Crowe, Russell Crowe is their friend. Orlando Bloom is no Russell Crowe. To be fair, Bloom is not actively bad as Balian of Ibelin, a French blacksmith who becomes the defender of 12th-century Jerusalem against religious fanatics of all stripes. The face that launched a million adolescent sighs as Legolas in "The Lord of the Rings" is handsome and sincere; he reads his lines well and tosses a sword like a man trained in the finest fencing academies of Brentwood. He is not unlikable. But he seems like a man holding the fort for a genuine star who never arrives.',
    [
      'What’s the author’s attitude toward "Kingdom of Heaven"?\n(A) It is as confusing as Crusades.\n(B) It is as terrific as "Alexander."\n(C) It is not as terrific as "Troy."\n(D) It is not as terrific as "Gladiator."',
      'Which of the following is TRUE about this passage?\n(A) Ridley Scott revived both "Gladiator" and "Kingdom of Heaven"\n(B) "Kingdom of Heaven" does not have a leading man.\n(C) Both "Troy" and "Alexander" are much more boring than "Gladiator"\n(D) Orlando Bloom is not as handsome as Legolas.',
      'Which of the following explanations best captures the meaning of "religious fanatics of all stripes"?\n(A) all kinds of stripes people with religions like to wear\n(B) all kinds of people with excessive religious enthusiasm\n(C) all kinds of behaviors crazy religious people display\n(D) all kinds of activities an active blacksmith likes to do',
    ],
  ],
  [
    48,
    'There are cities that reveal their charms on introduction, shamelessly, and there are others that give you more time to get to know them, cities which are not voluptuous but viable, easy to get around, good humored, self-effacing without being apologetic.\n\nManchester, 200 miles to the northwest of London, and just a half-hour drive from its noisier neighbor Liverpool, is one of the latter. It would be incorrect to say it lacks beauty, for the great mills and warehouses built in the days when cotton was king, and Manchester was its Versailles, are on the scale of Italian Renaissance palazzi and can indeed look like Italian Renaissance palazzi on sunny days and when, standing on a bridge over, say, the Rochdale Canal, you are in the mood to see the best in things. Hotels, clubs, apartment blocks now, the old mills and warehouses have made the change well from temples of ceaseless industriousness to palaces of ceaseless pleasure. Victorian neogothic architecture enjoyed a flowering in Manchester too, most notably in the great spired almost fairy-tale Town Hall, a sort of cathedral to commerce that exudes confidence and prosperity yet is not without delight in magniloquence for its own sake.\n\nMoonlight on wet streets, the distant prospect of chimneys made phosphorescent by their own smoke, industrial valleys looking nostalgic in these nonproductive times, and on Saturday nights, whatever the weather, girls with mottled thighs and boys in shortsleeved shirts drinking mojitos en plein-air—such are the city’s sights. But it’s substance rather than poetry that Manchester has always sought to convey, a no-nonsense stolidity reflected in all the public buildings, squares, and statuary, commemorating men of affairs, free traders, and reformers rather than artists or adventurers.\n\nIf Manchester wears its cultural achievements lightly, that is because it finds showiness, like its geography—the city is positioned in the very path of wet clouds coming in low off the Pennine Hills—absurd. A hundred years ago Manchester rivaled Berlin and Vienna as a city of music. The Hallé, founded by a German immigrant 50 years before, had become one of the world’s great orchestras. It tells you something about Manchester at that time that a young Westphalian musical prodigy such as Charles Hallé should have chosen to make Manchester his home. A small but active population of German expatriates—some in flight from religious intolerance, others simply doing business—was already established in Manchester, making music, meeting to discuss ideas, encouraging an interest in literature and in art. If the native Mancunian needed this spur to his own hesitant creativity, it is to his credit that he welcomed it wholeheartedly.',
    [
      'According to the passage, which of the following can be inferred about Manchester?\n(A) It is a city which impresses you at the first sight.\n(B) It is a city which tries to convey poetry.\n(C) It is a city which likes showiness.\n(D) It is a city which has lots of cultural achievements.',
      'According to the passage, which of the following is TRUE about the description of Victorian neogothic architecture in Manchester?\n(A) It displays total magnificence in its exterior.\n(B) It enjoys using flowers as decoration.\n(C) It commemorates more on men of affairs than on adventures.\n(D) Its typical representation is its self-effacing Town Hall.',
      'According to the passage, what can we learn about the Hallé in Manchester?\n(A) Charles Hallé was the founder of the Hallé orchestra.\n(B) It was founded by German expatriates years ago.\n(C) It encourages people in Manchester to discuss literature and art.\n(D) The author encourages native Mancunians to join the orchestra.',
    ],
  ],
]

// ═══════════════════════════════════════════════════ 組裝

function buildPaper({ paperId, idPrefix, year, singles, passages }) {
  const texts = new Array(50)
  singles.forEach((t, i) => {
    texts[i] = t
  })
  for (const [start, passage, items] of passages) {
    const end = start + items.length - 1
    texts[start - 1] =
      `Questions ${start}-${end} refer to the following passage.\n\n${passage}\n\n(Question ${start}) ${items[0]}`
    for (let i = 1; i < items.length; i++) {
      texts[start - 1 + i] = items[i]
    }
  }

  const missing = texts.findIndex((t) => t === undefined)
  if (missing !== -1) {
    console.error(`❌ ${paperId} 第 ${missing + 1} 題沒有內容`)
    process.exit(1)
  }

  return texts.map((text, i) => ({
    id: `${idPrefix}-${i + 1}`,
    paperId,
    examId: 'im',
    subjectId: 'im-english',
    year,
    number: i + 1,
    text,
    points: null,
    hasImage: false,
    subQuestions: [],
  }))
}

const EN113 = buildPaper({
  paperId: 'pp-im-en-113',
  idPrefix: 'q-pp-im-en-113',
  year: 113,
  singles: EN113_SINGLES,
  passages: EN113_PASSAGES,
})
const EN107 = buildPaper({
  paperId: 'pp-im-en-107',
  idPrefix: 'q-pp-im-en-107',
  year: 107,
  singles: EN107_SINGLES,
  passages: EN107_PASSAGES,
})

const questionsData = load('questions.json')
const existing = new Set(questionsData.questions.map((q) => q.paperId))
if (existing.has('pp-im-en-113') || existing.has('pp-im-en-107')) {
  console.error('❌ 這兩份考卷已有題目，請先確認資料狀態')
  process.exit(1)
}

// 插在 pp-im-en-114 之後，維持年份由新到舊的既有排列
const out = []
for (const q of questionsData.questions) {
  out.push(q)
}
const idx = out.map((q) => q.paperId).lastIndexOf('pp-im-en-114')
out.splice(idx + 1, 0, ...EN113, ...EN107)

questionsData.questions = out
questionsData.totalQuestions = out.length
save('questions.json', questionsData)

console.log(`✅ 補回 pp-im-en-113（${EN113.length} 題）、pp-im-en-107（${EN107.length} 題）`)
console.log(`   總題數: ${out.length}`)
