#!/usr/bin/env node
// 資料修復：pp-cs-arch-108 / pp-cs-algo-112 / pp-cs-en-110 這三份考卷的題目文字
// 當初是從錯的 PDF 抽出來的 —— arch-108 整份裝的是英文卷、algo-112 裝的是計結卷、
// en-110 前 10 題裝的是數學卷。past-papers.json 記的網址一直都是對的（頁面圖檔
// pp-cs-algo-112/page-3.jpg 的頁首「題號 347 資料結構與演算法」即為佐證），
// 因此本腳本以原始 PDF 的內容重建這三份卷子的題目。
//
// 題目文字取自台大圖書館考古題 PDF：
//   pp-cs-arch-108 → 108_graduate_412.pdf（計算機結構與作業系統，8 大題）
//   pp-cs-algo-112 → 2023-347.pdf（資料結構與演算法，選擇 1-14 ＋ 非選 15-16）
//   pp-cs-en-110   → 110/8.pdf（英文(A)，50 題）
//
// 慣例對齊既有資料：英文卷 points 為 null、克漏字與閱讀測驗把整篇文章掛在該組
// 第一題並以「(Question N)」帶出該題選項、hasImage 僅在確實有圖檔時為 true。

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
}
function save(file, data) {
  fs.writeFileSync(path.join(dataDir, file), `${JSON.stringify(data, null, 2)}\n`)
}

// ---------------------------------------------------------------- 英文(A) 110

const EN110_VOCAB = [
  'An ____ idea, system, person or society is one that expresses or supports the belief that all people are equal and should have the same rights and opportunities.\n(a) equivalent  (b) egalitarian  (c) efficacious  (d) effluent',
  'The document was found amid all the papers ____ strewn on her desk.\n(a) haphazardly  (b) coherently  (c) carefully  (d) accidentally',
  'This word list provides excellent illustrative sentences for each word; it cannot, however, explain all the ____ of current English usage.\n(a) positions  (b) edges  (c) niceties  (d) happenings',
  'Farmers have learned that it is advisable to permit land to lie ____ every few years.\n(a) shallow  (b) fallow  (c) mellow  (d) fertile',
  'The ____ odor of camphor clung to the clothes and did not fade away until they had been thoroughly aired.\n(a) perverse  (b) passive  (c) pervasive  (d) pertinent',
  'As Karen signed the contract, she suddenly had second thoughts and wanted to take it back, but she could not. Her action was ____.\n(a) irreverent  (b) irrelevant  (c) irrevocable  (d) irreproachable',
  'The challenge for church people nowadays is how to be ____ in the best sense, that is to be devout without becoming narrowminded.\n(a) sanctimonious  (b) pious  (c) biased  (d) prejudiced',
  'A ____ editor, she double-checked every definition for its accuracy.\n(a) conscientious  (b) cavalier  (c) continuous  (d) callous',
  'Josh was fired from his position as supervisor because of his constant ____.\n(a) sobriety  (b) inebriety  (c) piety  (d) variety',
  'During the war, ____, though they refused to bear arms, nevertheless served in the frontlines as ambulance drivers and medics.\n(a) anarchists  (b) nihilists  (c) pacifists  (d) insurrectionists',
]

const EN110_STRUCTURE = [
  "It's getting dark, please ____ the lights.\n(a) open  (b) turn on  (c) touch",
  'When Jane arrived ____ the restaurant, her friends sang happy birthday to her.\n(a) in  (b) to  (c) at',
  'Can you meet me ____ near the Taipei Train Station?\n(a) anywhere  (b) somewhere  (c) elsewhere',
  "Pavlov's experiment ____ he trains a dog to salivate on hearing a bell is a paradigm of the conditioned response in behavioral psychology.\n(a) on which  (b) in which  (c) with which",
  '____ the twins were separated at birth and grew up in different families, a striking similarity exists between their lives.\n(a) However  (b) Hence  (c) Although',
  'This is the crux of the entire problem: everything centers on its ____.\n(a) resolve  (b) being resolved  (c) with resolve',
  'The dog cringed, ____ a blow.\n(a) expect  (b) to expect  (c) expecting',
  "If Morris hadn't been sick, he ____ to our BBQ party.\n(a) could come  (b) will come  (c) would have come",
  'Sushi is ____ raw fish.\n(a) made from  (b) made with  (c) made of',
  'He ____ passed the test, but he spent too much time surfing the Internet.\n(a) should have  (b) would have  (c) could have',
]

// 克漏字與閱讀測驗：[起始題號, 文章, 該組每一題的選項]
const EN110_PASSAGES = [
  [
    21,
    "A lot of young people have great difficulty __21__ themselves to a relationship or a career because of the feeling that once they do, they're __22__ for a long, long time. On the other hand, they feel they've got to get on the right \"track,\" because, after all, this is a long and terrifying commitment. I think it is very __23__ for college students when an older person says to them, \"Your first job after college need not be the beginning of an ascending curve that's going to take you through your life. It can be a __24__. You might be doing something different in five years.\" That's something that young people need to hear: that the continuous story, where the whole of a person's life is prefigured very early on, is a cultural creation, not a __25__ of life as it is really lived.",
    [
      '(a) constraining  (b) containing  (c) committing  (d) detaining',
      '(a) trapped  (b) tracked  (c) tackled  (d) convicted',
      '(a) restricting  (b) liberating  (c) condemning  (d) demeaning',
      '(a) zigzag  (b) dead end  (c) conclusion  (d) solution',
      '(a) retraction  (b) reflection  (c) resolution  (d) revolution',
    ],
  ],
  [
    26,
    'Communication among members of international cultures poses one of the most perplexing __26__ communication problems. How are we to understand others when they come from different parts of the global village is a most difficult question. We only need to look around the world at any particular moment in time to find disagreement, __27__, and fighting—the locations may change, but the problems __28__. Nations become prominent in the news, and what happens within them and between them directly __29__ the entire world. To help us better understand people from different cultures, we must learn to appreciate their __30__.',
    [
      '(a) interstellar  (b) intercultural  (c) intertextual  (d) internal',
      '(a) accord  (b) appeasement  (c) strife  (d) settlement',
      '(a) persist  (b) cease  (c) increase  (d) deter',
      '(a) effects  (b) affects  (c) detects  (d) attacks',
      '(a) diversity  (b) adversity  (c) atrocity  (d) sagacity',
    ],
  ],
  [
    31,
    'For a habit to change, people must believe that change is __31__. And most often, that belief only emerges with the help of a group. If you want to quit smoking, figure out a different routine that will __32__ the cravings filled by cigarettes. Then find a support group, a collection of former smokers, or a community that will help you believe you can stay away from nicotine, and use that group when you feel you might __33__. If you want to lose weight, study your habits to determine why you leave your desk for a snack each day, and then find someone else to take a walk with you, to gossip with at their desk rather than in the cafeteria, a group that tracks weight-loss goals together, or someone who snacks on apples rather than chips. The evidence is clear: if you want to change a habit, you must find an __34__ routine and your odds of __35__ go up dramatically when you commit to changing as part of a group.',
    [
      '(a) passable  (b) possible  (c) impossible  (d) improbable',
      '(a) attain  (b) pertain  (c) satisfy  (d) deprive',
      '(a) stumble  (b) bumble  (c) humble  (d) fumble',
      '(a) other  (b) alternative  (c) substitute  (d) different',
      '(a) failure  (b) success  (c) loss  (d) gain',
    ],
  ],
  [
    36,
    'Human nature seems to regard perpetual scarcity as the law of life. Daily I am astonished at how readily I believe that something I need is in short supply. If I __36__ possessions, it is because I believe that there is not enough to go around. If I struggle with others over power, it is because I believe power is limited. If I become jealous in relationships, it is because I believe that if you get too much love I will be __37__. The irony, often tragic, is that by embracing the scarcity __38__, we create the very scarcities we fear. If I hoard material goods, others will have too little and I will never have enough. If I fight my way up the ladder of __39__, others will be defeated and I will never feel secure. If I get jealous of someone I love, I am likely to drive that person away. If I cling to the words I have written as if they were the last of their kind, the pool of new possibilities will surely go dry. We create scarcity by fearfully accepting it as law, and by competing with others for resources as if we were __40__ on the Sahara at the last oasis.',
    [
      '(a) discard  (b) hoard  (c) give away  (d) give up',
      '(a) shortchanged  (b) blacklisted  (c) enlisted  (d) detested',
      '(a) solution  (b) assumption  (c) supposition  (d) proposition',
      '(a) years  (b) life  (c) power  (d) knowledge',
      '(a) landed  (b) branded  (c) stranded  (d) arrived',
    ],
  ],
  [
    41,
    "Seventy thousand years ago, Homo Sapiens was still an insignificant animal minding its own business in a corner of Africa. In the following millennia it transformed itself into the master of the entire planet and the terror of the ecosystem. Today it stands on the verge of becoming a god, poised to acquire not only eternal youth, but also the divine abilities of creation and destruction.\n\nUnfortunately, the Sapiens regime on earth has so far produced little that we can be proud of. We have mastered our surroundings, increased food production, built cities, established empires and created far-flung trade networks. But did we decrease the amount of suffering in the world? Time and again, massive increases in human power did not necessarily improve the well-being of individual Sapiens, and usually caused immense misery to other animals.\n\nIn the last few decades we have at least made some real progress as far as the human condition is concerned, with the reduction of famine, plague and war. Yet the situation of other animals is deteriorating more rapidly than ever before, and the improvement in the lot of humanity is too recent and fragile to be certain of.\n\nMoreover, despite the astonishing things that humans are capable of doing, we remain unsure of our goals and we seem to be as discontented as ever. We have advanced from canoes to galleys to steamships to space shuttles—but nobody knows where we're going. We are more powerful than ever before, but have very little idea what to do with all that power. Worse still, humans seems to be more irresponsible than ever. Self-made gods only with the laws of physics to keep us company, we are accountable to no one. We are constantly wreaking havoc on our fellow animals and on the surrounding ecosystem, seeking little more than our own comfort and amusement, yet never finding satisfaction.\n\nIs there anything more dangerous than dissatisfied and irresponsible gods who don't know what they want?\n\n(excerpt from Sapiens—A Brief History of Humankind by Yuval Noah Hariri)",
    [
      'According to the author, we have made real progress in\n(a) environmental protection\n(b) ecological conservation\n(c) technological advancement\n(d) spiritual development',
      "Which adjective best reflects the author's sentiments?\n(a) optimistic  (b) indifferent  (c) apprehensive  (d) defensive",
      'As self-made gods, humans are\n(a) arrogant and reckless\n(b) benevolent and compassionate\n(c) calculating and devious\n(d) omniscient and omnipotent',
      "Which statement reflects the author's views?\n(a) Homo sapiens and animals co-exist peacefully on earth.\n(b) Animals exist to serve humankind.\n(c) Homo sapiens have contributed to improving the well-being of other animals.\n(d) Humans have abused other animals.",
      'What does the author consider to be the greatest danger to humankind?\n(a) Famine and war\n(b) Cruelty towards animals\n(c) Human suffering\n(d) Power and greed',
    ],
  ],
  [
    46,
    "The Internet has produced a foaming Niagara of writing. Consider these current rough estimates: Each day we compose 154 billion emails and more than 500 million tweets on Twitter. On Facebook, we write about 16 billion words per day. That's just in the United States. In China, it's 100 million updates each day on Sina Weibo, the country's most popular microblogging tool, and millions more on social networks in other languages worldwide, including Russia's VK. Text messages are terse, but globally they're our most frequent piece of writing: 12 billion per day.\n\nHow much writing is that, precisely? Well, doing an extraordinarily crude back-of-the-napkin calculation, and sticking only to email and utterances in social media, I calculate that we're composing at least 3.6 trillions words daily, or the equivalent of 36 million books every day. The entire U. S. Library of Congress, by comparison, holds around 35 million books.\n\nIs any of the writing good? Well, that depends on your standards of course. The science fiction writer Theodore Sturgeon famously said something like, \"Ninety percent of everything is crap,\" a formulation that geeks now refer to as Sturgeon's Law. Anyone who's spent time slogging through the swamp of books, journalism, TV and movies know that Sturgeon's Law holds pretty well even for edited and curated culture. So a global eruption of unedited, everyday self-expression is probably even more likely to produce this 90-10 split—an ocean of dreck, dotted sporadically by islands of genius. Nor is the volume of production uniform. Surveys of commenting and posting generally find that a minority of people are doing most of the creation we see online. They're ferociously over productive, while the rest of the online crowd is quieter. Still, the sheer profusion of thoughtful material that is produced everyday online is enormous.\n\nAnd what makes this explosion truly remarkable is what came before: comparatively little. For many people, almost nothing. Before the Internet came along, most people rarely wrote anything at all for pleasure or intellectual satisfaction after graduating from high school or college. This is something that's hard to grasp for professionals whose jobs require incessant writing, like academics, journalists, lawyers, or marketers.\n\n(excerpt from Smarter Than You Think: How Technology is Changing Our Minds for the Better by Clive Thomson)",
    [
      'The most prolific form of writing nowadays is:\n(a) blog posts  (b) tweets on twitter  (c) text messages  (d) Facebook posts',
      "According to Sturgeon's Law,\n(a) Only a fraction of the written content on the Internet is any good\n(b) A minority of the people are doing most of the writing online\n(c) Online content has to be carefully edited and curated\n(d) Only ten percent of the population can produce readable content",
      'Which statement is true?\n(a) With the advent of the Internet, writing has become a lost skill.\n(b) Thirty six million books are being published every day.\n(c) People are expressing themselves through writing more than ever before on social media\n(d) Before the Internet, people often wrote for pleasure and intellectual satisfaction. Nowadays, a lot of the stuff written is garbage.',
      "Which statement is false?\n(a) The proliferation of online writing is a western phenomenon.\n(b) Sturgeon's Law can be applied to edited and curated culture.\n(c) Professionals can't wrap their heads around the fact that most people stop writing once they graduate from school.\n(d) Most of the online content we read have actually been created by a small group of people so there is very little thoughtful material that matters.",
      'Which is the best headline for this passage?\n(a) Writing for Self-Expression Explodes on the Internet\n(b) 90% of the Content on the Internet is Crap\n(c) 36 Million Books Published Daily on Internet\n(d) The Importance of Digital Literacy',
    ],
  ],
]

function buildEn110() {
  const texts = new Array(50)
  EN110_VOCAB.forEach((t, i) => {
    texts[i] = t
  })
  EN110_STRUCTURE.forEach((t, i) => {
    texts[10 + i] = t
  })

  for (const [start, passage, options] of EN110_PASSAGES) {
    const end = start + options.length - 1
    texts[start - 1] =
      `Questions ${start}-${end} refer to the following passage.\n\n${passage}\n\n(Question ${start}) ${options[0]}`
    for (let i = 1; i < options.length; i++) {
      texts[start - 1 + i] = options[i]
    }
  }

  return texts.map((text, i) => ({
    id: `q-pp-cs-en-110-${i + 1}`,
    paperId: 'pp-cs-en-110',
    examId: 'cs',
    subjectId: 'cs-english',
    year: 110,
    number: i + 1,
    text,
    points: null,
    hasImage: false,
    subQuestions: [],
  }))
}

// ------------------------------------------- 計算機結構與作業系統 108（8 大題）

const ARCH108 = [
  [
    4,
    '（本卷說明：NOTE that in the question, it is intended to provide redundant or miss certain assumption to disguise you. Please make your own assumption if necessary to answer the questions.）\n\nTrue or False? Answer TRUE or FALSE for the following statements.\na) [2 pt.] You must have multi-issue machines to benefit from software-pipelining or global instruction scheduling.\nb) [2 pt.] Two instructions with data dependencies will cause pipeline stall(s) in execution.',
  ],
  [
    12,
    "Multiple Choices (One correct answer only)\n\na) [4 pt.] Increasing the page size from 4 KB to 2048 KB on modern Intel/AMD x86-64 CPUs has reduced one application's execution time by 40%. The measured working set size of this application is about 2 GBytes. Assume the swap is disabled and this application randomly accesses 4 bytes at a time over the entire working set repeatedly. Select one main reason from below.\n1) Prevents the need for pipeline bubbles.\n2) Improves the efficiency of adjacent cache line prefetcher.\n3) Keeps data in a more continuous address in physical memory to reduce memory access latency.\n4) Reduces the number of completed page walks.\n5) Reduces the rate of page fault.\n\nb) [4 pt.] Which one is FALSE for an out-of-order execution superscalar CPU?\n1) It is typically also pipelined.\n2) It may execute multiple instructions per clock cycle.\n3) It will check data dependencies between instructions dynamically at run time.\n4) It exploits data-level parallelism primarily by the out-of-order execution mechanism.\n5) It could be a RISC or CISC CPU.\n\nc) [4 pt.] Security architecture is important. Many smartphones support TEE (Trusted Execution Environment). What function below does NOT make sense to be put in the TEE secure area of your smartphone?\n1) Fingerprint authentication, which needs to access the fingerprint sensor hardware\n2) Blockchain cryptocurrency mining, as in the recent HTC's blockchain phone\n3) Storing my bitcoin wallet's private key\n4) Supporting Android keystore system\n5) Random number generation",
  ],
  [
    8,
    'ISA (Instruction Set Architecture)\n\nPre-increment and post-increment addressing modes are often adopted in processor ISA such as x86 and Itanium. In ARM, the post-increment load instruction is like\n\n  ldr r1, [r2], #4   // r1<--mem[r2], r2<-r2+4\n\nHowever, this is actually a pseudo instruction in ARM. In x86, push and pop are real pre-increment and post-increment instructions. The pre-increment instruction changes the base address in a register by the offset value, and then performs the data transfer using the new address in the register. The post-increment instruction performs the data transfer first, then changes the base address register.\n\na) [2 pt.] What is a pseudo instruction? What is the advantage of having pseudo instructions?\nb) [3 pt.] What are the advantages to have pre-increment and post-increment real instructions? What type of high level language code structures would benefit from them?\nc) [1 pt.] Why Intel/HP Itanium supports only post-increment instructions but not pre-increment instructions?\nd) [2 pt.] What are the disadvantages of having such instructions in the ISA?',
  ],
  [
    8,
    'Exceptions and Interrupts.\n\na) [2 pt.] Which of the follow are considered as exceptions and which are considered as interrupts?\n\nPage fault\nTLB miss\nFloating point arithmetic underflow\nI/O device request\nUndefined instruction\nUser defined interrupt\nExecution abort\nSystem call\n\nb) [3 pt.] Some microarchitectures (implementation) are more difficult to handle exceptions, please rank the following implementations in terms of difficulties in handling exceptions, rank from the most difficult one.\n\nPipelined implementation\nSuperscalar implementation\nOut-of-order superscalar\nSpeculative execution\nHierarchical data caches\nSingle issue In-order processor\n\nc) [3 pt.] Which of the following are most difficult to handle interrupts, please rank from the most difficult one.\n\nGPGPU\nHyper-threaded processor\nPipelined processor\nSuperscalar processor\nContainers\nVirtual Machines',
  ],
  [
    9,
    'Parallel Execution\n\na) [2 pt.] What are the meanings of the following acronyms?\n\nILP\nDLP\nMLP\nTLP\n\nb) [4 pt.] For the above four items in (a), give at least one architecture/microarchitecture technique that can effectively exploit each of them.\n\nc) [3 pt.] For the above four items in (a), give at least one software technique that can increase the degree of parallelism for each of them.',
  ],
  [
    9,
    "Multi-core\n[9 pt.] Many of your smart phones use 8-core Qualcomm processors. For example, the recent Snapdragon 670 and 850 processors both have 8 cores. Let us say the 8-core processor has B big cores and L little cores, where B + L = 8. For Snapdragon 670, B_670 = 2 and L_670 = 6. For Snapdragon 850, B_850 = 4 and L_850 = 4. Big core: consumes more power and deliver higher performance than little cores. Assume you are in charge of the design of an 8-core Processor 2020 of Year 2020 and\n\na) If I suggest to you that B_2020 = 6 and L_2020 = 2, what will be your response? Agree to or object to it? Explain the rationale behind your response. You get 0 point if you don't explain.\n\nb) In Processor 2020, you will have a CPU_CLUSTER_big and a CPU_CLUSTER_little; Explain why and how to maintain cache coherence between the two clusters.",
  ],
  [
    25,
    '(25 pt.) The logic and physical computation resources in computing systems are shared among processes and threads.\n\na) (10 pt.) In order to control the access rights of the processes in a computer, process IDs are assigned to every process. Please answer the following questions.\n1) (6 pt.) Please describe the property of the following three IDs of one process and their difference: real UID, effective UID, and saved UID.\n2) (4 pt.) When one process requires additional permission to access certain resources, which of the three aforementioned IDs should be changed?\n\nb) (15 pt.) Multi-tasking is well supported in modern operating systems. Please answer the following questions.\n1) (5 pt.) Please describe the difference of using multi-process and multi-thread for multi-tasks from the perspective of memory usages, CPU scheduling, and resource sharing.\n2) (3 pt.) Please read the following code segment in C for multi-processing. Will the variable printed on Line 24 be \'C\'? If yes, please describe the reason of changing from \'P\' to \'C\'. Otherwise, please describe the cause of having different values in two processes.\n\n```c\n#include <stdio.h>\n#include <sys/types.h>\n\nint main(void)\n{\n    pid_t pid;\n    char sharedVariable=\'P\';\n    char *ptrSharedVariable;\n    ptrSharedVariable=&sharedVariable;\n    printf("Address is %p\\n",ptrSharedVariable);\n    printf("char value is %c\\n",sharedVariable);\n    pid = fork();\n    if (pid == 0) {\n        sharedVariable=\'C\';\n        printf("*** Child process ***\\n");\n        printf("Address is %p\\n",ptrSharedVariable);\n        printf("char value is %c\\n",sharedVariable);\n        sleep(5);\n    }\n    else {\n        sleep(5);\n        printf("\\n *** Parent process ***\\n");\n        printf("Address is %p\\n",ptrSharedVariable);\n        printf("char value is %c\\n",sharedVariable);\n    }\n}\n```\n\n3) (3 pt.) Are the addresses printed on Line 16 and 23 same from each other? If yes, please describe the reasons of having the same value. Otherwise, please describe the cause in details.\n4) (4 pt.) What\'s the results of Line 24 after fork() on Line 12 is replaced by vfork()?',
  ],
  [
    25,
    '(25 pt.) On Singles Day (光棍節), millions of on-line shopping transactions are processed in a very short period of time. The supply of each product is limited. We need to make sure there is enough supply for each commit transaction and processing should be as soon as possible.\n\na) (5 pt.) What kind of transaction scheduling algorithm can generate the most revenue for the shopping service provider (such as PCHome)?\nb) (5 pt.) How do we guarantee that the earlier transaction is the earlier processed? Hint: The earlier sent or arrived? There is no global clock.\nc) (5 pt.) If we would concurrently process the transactions in a distributed manner, how to synchronize so that the products are not over sold while the process time is minimized as possible.\nd) (5 pt.) The transactions might be cancelled by users for any reason or by the system because there is no enough supply. How do we design the file system to store transactions so that it is both trustful and efficient?\ne) (5 pt.) What attacks need to be handled at this high-speed transaction? How?',
  ],
]

// ------------------------------------------ 資料結構與演算法 112（16 題）

const MISSING_FIGURE = (what) => `\n\n[原卷此處有${what}，本題庫尚未收錄該頁圖檔]`

const ALGO112 = [
  [
    5,
    false,
    '（本卷說明：選擇題共 14 題，第 4、5、7 題為單選題，其餘為複選題。單選題答對得 5 分、答錯倒扣 1 分；複選題每個選項單獨計分，答對得 1 分、答錯倒扣 0.5 分。）\n\nAssuming we have n data points. Among the variant characteristics of the data points, please select the correct descriptions.\n(A) If the worst-case running time is the most important, merge sort can be a good choice with O(n log n) time.\n(B) If the input happens to be sorted already, bubble sort can be a best choice with O(n) time.\n(C) If the input array is in random order and the average sorting time is most important, quick sort can be a good choice with O(n log n) time.\n(D) If the exchanges of the items in the array are very expensive, selection sort will incur the least "swaps" or "moves".\n(E) If the input array consists of integers in the range 1...n^k, radix sort with radix n with O(k log n) time.',
  ],
  [
    5,
    false,
    `B+ tree is an extension of B tree. The major differences from B tree are (1) all leaf nodes are linked together in a doubly-linked list, and (2) data points are stored on the leaf nodes only; internal nodes only hold keys and act as routers to the correct leaf node; the left child is smaller than the key and the right child is larger or equal than that. Please find any/all violations of a B+ tree structure in the following diagram. Assume the tree node can at most contain 4 data points (keys).${MISSING_FIGURE('一張 B+ tree 結構圖')}`,
  ],
  [
    5,
    false,
    'Please find the following table for the characters and their corresponding occurring probabilities. Please design a Huffman encoding tree and select the correct descriptions.\n\n| Symbol(X) | A | B | C | D | E | F | G |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n| Prob(X) | 0.15 | 0.06 | 0.24 | 0.21 | 0.09 | 0.21 | 0.03 |\n\n(A) The codeword length for symbol C is 3\n(B) The codeword length for symbol G is 5\n(C) The codeword length for symbol E is 5\n(D) The codeword length for symbol A is 4\n(E) none of above is correct',
  ],
  [
    5,
    false,
    '（單選）We now use several algorithms to traverse a binary tree. Assuming there are a total number of N nodes, how many of the following statements about the worst-case space complexity are TRUE?\n\n- Using DFS to traverse a balanced binary tree takes O(N).\n- Using DFS to traverse a binary tree takes O(N).\n- Using BFS to traverse a balanced binary tree takes O(N).\n- Using BFS to traverse a binary tree takes O(N).\n\n(A) 0  (B) 1  (C) 2  (D) 3  (E) 4',
  ],
  [
    5,
    false,
    '（單選）In a traditional merge sort, two sorted sub-arrays are combined to form a single, fully sorted array. This is referred to as a 2-way merge. The problem at hand is to extend this concept by merging N sorted arrays of integers, where N and M are given integers representing the number of arrays and the number of integers in each array, respectively. Please choose the correct worst-case time complexity of this N-way merge.\n(A) O(N log M)  (B) O(NM log M)  (C) O(N^2 log M)  (D) O(NM log N)  (E) none of the above is correct.',
  ],
  [
    5,
    true,
    'The following is a binary tree and the alphabet on the node is simply the "name" (instead of value) of the node. Please select the correct statements from the following:\n(A) The successor of node B is E.\n(B) The successor of node A is C.\n(C) The tree is not a AVL tree.\n(D) If we remove node J, the result is an AVL tree.\n(E) If we remove node H, the result is an AVL tree.',
  ],
  [
    5,
    true,
    '（單選）Given a list of binary trees T = {t₁, t₂, ..., t₇} where each node is 0 or 1 shown as below, we would like to insert these trees into a linear-probing hash table of length N = 11. The hash function f(t) = g(h(t)) mod N, where h(t) is the binary sequence obtained from in-order traversal of tree t and g(·) converts a binary sequence to a decimal number. For instance, g("1111111") = 127. Here\'s the question: how many collisions occur during the insertion process?\n\n(A) 0  (B) 1  (C) 2  (D) 3  (E) 4',
  ],
  [
    5,
    false,
    'Postfix advantages: What is/are the advantage(s) of using postfix notation for math expressions?\n(A) No need to use parentheses\n(B) No need to consider precedence of operators\n(C) Easier for human to read\n(D) Easier for computers to evaluate\n(E) More concise when compared with prefix notation',
  ],
  [
    5,
    false,
    'DFS advantages: To find a feasible solution to the eight-queen problem, what is/are the reason(s) that we prefer to use DFS (depth-first search) instead of BFS (breadth-first search)?\n(A) DFS is more memory efficient.\n(B) DFS can be implemented using a stack.\n(C) DFS usually reaches the terminal states of "good" or "bad" faster.\n(D) DFS is conceptually simpler than BFS.\n(E) BFS cannot be implemented using a stack.',
  ],
  [
    5,
    false,
    'Heap applications: Which one(s) of the following applications may involve the use of heaps to increase time efficiency?\n(A) Find the k largest numbers from a given stream of numbers.\n(B) Given a stream of numbers coming one after another, calculate the median of the currently received set of numbers.\n(C) Compute the page rank of a given set of web pages\n(D) Detect appropriate "buy" and "sell" requests to create transactions in stock market\n(E) Identify the next timing for collisions in event-driven simulation for molecular dynamics',
  ],
  [
    5,
    false,
    'Properties of dynamic programming (DP): Which of the following statements is/are correct about DP?\n(A) Any DP problem can be visualized as the optimal path finding problem.\n(B) Once a DP problem is solved, all the related sub-problems are also solved.\n(C) Once a DP problem is solved, it is straightforward to obtain the second-best solution.\n(D) The optimal solution of a DP problem can be obtained using optimal solutions of its sub-problems.\n(E) A DP problem has overlapping sub-problems which are reused several times when solving the original problem.',
  ],
  [
    5,
    false,
    "Properties of shortest path problem: Which of the following statements is/are correct?\n(A) Dijkstra's algorithm can be applied to any directed graph with no negative cycle.\n(B) The heap data structure is likely to be used in Dijkstra's algorithm.\n(C) Floyd-Warshall algorithm can be applied to any directed graph with negative weights.\n(D) Floyd-Warshall algorithm is based on the concept of dynamic programming.\n(E) Every shortest path in a weighted directed graph G will not change if an extra weight is added on every edge of G",
  ],
  [
    5,
    false,
    'Properties of min. spanning tree (MST): Let T be a MST of a weighted graph G with at least 3 vertices. Which of the following statements is/are correct?\n(A) Given an edge e in G but not in T, we can form a cycle C by putting e to T. Then e has the largest weight among edges in C.\n(B) If we partition G into two subsets, and let e be the smallest-weight edge across the partition. Then e belongs to some MST in G.\n(C) The edge with the smallest weight in G must belong to some MST of G.\n(D) The edge with the second smallest weight in G must belong to some MST of G.\n(E) The edge with the third smallest weight in G must belong to some MST of G.',
  ],
  [
    5,
    false,
    'Prefix, infix, and postfix: Which of the following statements is/are correct?\n(A) We can use a stack to convert an infix to postfix expression.\n(B) We can use a stack to convert a postfix to an infix expression.\n(C) We can derive a binary tree from its infix and prefix notations.\n(D) We can derive a binary tree from its infix and postfix notations.\n(E) We can derive a binary tree from its prefix and postfix notations.',
  ],
  [
    21,
    false,
    `(21 points) Given k singly linked lists, each of which has n nodes. The numbers in the nodes of the i-th list are given by a_{i,1}, a_{i,2}, ..., a_{i,n}, as shown in the figure below. Each of the k lists has the numbers sorted in non-decreasing order, i.e., a_{i,1} ≤ a_{i,2} ≤ ... ≤ a_{i,n}, where i is the index of the list. Professor Q asks the students to develop an algorithm to merge these k lists into one singly linked list sorted in non-decreasing order. Three students have come up with different algorithms, which are given below in pseudo code.${MISSING_FIGURE('一張 k 條已排序 linked list 的示意圖')}\n\nStudent A:\nL1. Create an empty singly linked list S to collect the result.\nL2. DO\nL3.   Iterate over the numbers in the head nodes of the k lists, and find the node with the smallest number, denoted as node M.\nL4.   Remove node M from the original list, and insert it into the result list S from the tail.\nL5. UNTIL all original k lists are empty\nL6. Return the result list S, which contains all nodes from the original k lists and sorted in non-decreasing order.\n\nStudent B:\nL1. Create an empty singly linked list S to collect the result.\nL2. Create an empty min heap H.\nL3. Remove the k head nodes from the k lists and insert them into H. Each node in H also contains the index number i of the list where it is from.\nL4. DO\nL5.   Remove the min node M from the heap. Insert this node into S from the tail. Take note of the index number stored in M, denoted as m.\nL6.   If list m is not empty, remove the head node from list m and insert it into H.\nL7. WHILE H is not empty\nL8. Return the result list S, which contains all nodes from the original k lists and sorted in non-decreasing order.\n\nStudent C:\nCall the recursive divide-and-conquer function MergeTwoGroupLists (k sorted linked lists). The return value of the function is a list containing all nodes from the original k lists and sorted in non-decreasing order.\n\nL1. Function MergeTwoGroupLists (m sorted linked lists)\nL2. If m == 1 then return the only list from the input.\nL3. Divide the input m lists into two groups of lists, with ⌈m/2⌉ and ⌊m/2⌋ lists, respectively.\nL4. Recursively call MergeTwoGroupLists for each of these two groups of lists, merging the first group of the lists into one sorted list, S₁, and the second group of the lists into one sorted list, S₂.\nL5. Merge the two sorted lists S₁ and S₂ into one sorted list S.\nL6. Return S.\n\nFor each of these three algorithms, analyze and give their asymptotic worst-case running times with the big-O notation and in terms of k and n.\n\nNote:\n• Lower-order terms and constant factors (excluding k and n) should be removed in the big-O notation in the answer.\n• The bound in the answer needs to be tight.\n• Only the final result will be graded and only fully correct answers will be given points. Please clearly mark your final result in the answer sheet.`,
  ],
  [
    9,
    false,
    '(9 points) The pseudo code function to compute the prefix function in the Knuth-Morris-Pratt (KMP) string matching algorithm is given below. Given a pattern string P[1..m], the prefix function for this pattern P is the function π: {1,2,...,m} → {0,1,...,m-1} such that π[q] is the length of the longest prefix of P that is a proper suffix of P_q, where P_q denotes the q-character prefix of the string P. For pattern string P=ABACABACABACABAD, how many times is line 7 executed? (Note: only the final answer will be graded and only fully correct answer will be given points)\n\nCOMPUTE-PREFIX-FUNCTION(P)\n1  m = P.length\n2  let π[1..m] be a new array\n3  π[1] = 0\n4  k = 0\n5  for q = 2 to m\n6      while k > 0 and P[k+1] ≠ P[q]\n7          k = π[k]\n8      if P[k+1] == P[q]\n9          k = k+1\n10     π[q] = k\n11 return π',
  ],
]

function buildEssayPaper(rows, { paperId, subjectId, year, idPrefix }) {
  return rows.map((row, i) => {
    const [points, hasImage, text] = row.length === 3 ? row : [row[0], false, row[1]]
    return {
      id: `${idPrefix}-${i + 1}`,
      paperId,
      examId: 'cs',
      subjectId,
      year,
      number: i + 1,
      text,
      points,
      hasImage,
      subQuestions: [],
    }
  })
}

// ---------------------------------------------------------------------- 寫回

const REBUILT = {
  'pp-cs-en-110': buildEn110(),
  'pp-cs-arch-108': buildEssayPaper(ARCH108, {
    paperId: 'pp-cs-arch-108',
    subjectId: 'cs-arch',
    year: 108,
    idPrefix: 'q-pp-cs-arch-108',
  }),
  'pp-cs-algo-112': buildEssayPaper(ALGO112, {
    paperId: 'pp-cs-algo-112',
    subjectId: 'cs-algo',
    year: 112,
    idPrefix: 'q-pp-cs-algo-112',
  }),
}

const questionsData = load('questions.json')
const answersData = load('answers.json')
const images = load('question-images.json')

const oldIds = new Set(questionsData.questions.filter((q) => REBUILT[q.paperId]).map((q) => q.id))

// 保留其他考卷的題目，並把重建的三份插回原本的位置
const rebuiltPapers = new Set(Object.keys(REBUILT))
const inserted = new Set()
const nextQuestions = []
for (const q of questionsData.questions) {
  if (!rebuiltPapers.has(q.paperId)) {
    nextQuestions.push(q)
    continue
  }
  if (!inserted.has(q.paperId)) {
    nextQuestions.push(...REBUILT[q.paperId])
    inserted.add(q.paperId)
  }
}

questionsData.questions = nextQuestions
questionsData.totalQuestions = nextQuestions.length

const newIds = new Set(nextQuestions.map((q) => q.id))

// 舊題目的答案是針對錯誤內容產生的，一律清掉
let removedAnswers = 0
for (const id of Object.keys(answersData.answers)) {
  if (oldIds.has(id) && !newIds.has(id)) {
    delete answersData.answers[id]
    removedAnswers++
  }
}
for (const id of oldIds) {
  if (answersData.answers[id]) {
    delete answersData.answers[id]
    removedAnswers++
  }
}

// 圖檔對應：只保留確實有圖檔、且新題目仍需要圖的項目
for (const id of Object.keys(images)) {
  if (oldIds.has(id)) delete images[id]
}
// page-3.jpg 這一頁同時含第 6 題的二元樹（頁首那棵 A~M 的樹）與第 7 題的七棵樹
images['q-pp-cs-algo-112-6'] = ['/images/papers/pp-cs-algo-112/page-3.jpg']
images['q-pp-cs-algo-112-7'] = ['/images/papers/pp-cs-algo-112/page-3.jpg']

save('questions.json', questionsData)
save('answers.json', answersData)
save('question-images.json', images)

console.log(`✅ 重建 3 份考卷，移除 ${oldIds.size} 題錯誤題目、${removedAnswers} 筆對應答案`)
for (const [paperId, qs] of Object.entries(REBUILT)) {
  const pts = qs.reduce((s, q) => s + (q.points ?? 0), 0)
  console.log(`   ${paperId}: ${qs.length} 題${pts ? `（配分合計 ${pts}）` : '（不計配分）'}`)
}
console.log(`   總題數: ${nextQuestions.length}`)
console.log(`   缺答案: ${nextQuestions.filter((q) => !answersData.answers[q.id]).length} 題`)
