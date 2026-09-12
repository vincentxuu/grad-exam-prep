import fs from 'node:fs'

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)

const networkPath = '.work/im-it-lessons-network.json'
const network = read(networkPath)
const models = network.lessons.find(
  (lesson) => lesson.subtopicId === 'im-it-network-models-encapsulation',
)
const protocols = network.lessons.find(
  (lesson) => lesson.subtopicId === 'im-it-network-application-protocols',
)

const unrelatedNetworkRefs = new Set([
  'q-pp-im-it-106-24',
  'q-pp-im-it-108-7',
  'q-pp-im-it-109-14',
  'q-pp-im-it-109-20',
])
models.pastPaperRefs = models.pastPaperRefs.filter((id) => !unrelatedNetworkRefs.has(id))
for (const card of network.cards.filter((card) => card.lessonId === models.id)) {
  card.pastPaperRefs = card.pastPaperRefs.filter((id) => !unrelatedNetworkRefs.has(id))
}
models.workedExamples.push({
  prompt:
    '一個 IP packet 經過 router 從校園 LAN 前往外部網站。哪些識別資訊通常維持端到端，哪些會在下一條鏈路重建？',
  steps: [
    '目的 port 用來識別終點應用，正常轉送時維持不變。',
    '來源與目的 IP 用於端到端路由；若沒有 NAT，位址通常維持不變，但 TTL 會逐跳遞減。',
    'router 移除收到的 data-link frame，再為下一條鏈路建立新的 frame。',
    '因此來源與目的 MAC 會改成下一條鏈路的送端介面與下一跳。',
  ],
  answer:
    'transport ports 與端點 IP 通常維持；IP 的 TTL 等逐跳欄位會更新；data-link frame 與 MAC 位址每一跳重建。',
})

protocols.sections[1].body =
  'HTTP 的每次 request 本身可獨立處理，伺服器不會只靠協定自動記得上一次互動。Cookie 可由伺服器透過 Set-Cookie 設定，也可在安全與作用域限制允許時由瀏覽器端程式管理；之後由瀏覽器依 Domain、Path 等規則附加到請求，常用來攜帶 session identifier 或偏好設定。'
protocols.workedExamples.push({
  prompt:
    '使用者從筆電寄信給同學，之後又希望在手機與筆電同步讀信狀態。寄送、郵件伺服器轉送與多裝置讀信各應使用什麼協定？',
  steps: [
    '寄件軟體把郵件提交給寄件伺服器，使用 SMTP。',
    '寄件伺服器查詢收件網域並把郵件 relay 給對方郵件伺服器，仍使用 SMTP。',
    '使用者希望多裝置保留並同步伺服器上的信件與狀態，使用 IMAP。',
    'POP3 偏向下載郵件，雖可保留副本，但不是多裝置狀態同步的首選。',
  ],
  answer: '提交與 server-to-server relay 使用 SMTP；多裝置同步讀信使用 IMAP。',
})

const databasePath = '.work/im-it-lessons-db.json'
const database = read(databasePath)
const relational = database.lessons.find(
  (lesson) => lesson.subtopicId === 'im-it-db-relational-model',
)
relational.workedExamples[0].prompt =
  '有 Student(sid PRIMARY KEY, email UNIQUE NOT NULL, name)、Course(cid PRIMARY KEY, title) 與 Enrollment(sid REFERENCES Student(sid), cid REFERENCES Course(cid), grade, PRIMARY KEY (sid, cid))。已知 sid 與 cid 皆不可為 NULL。請找出候選鍵、主鍵與外鍵。'
relational.workedExamples[1].prompt =
  "Enrollment.sid 已宣告為參照 Student.sid 的 foreign key，grade 未宣告 NOT NULL。現在出現 (sid='S9', cid='DB01')，但 Student 沒有 S9；另一列的 grade 為 NULL。哪一筆必然違反關聯限制？"

const cardById = new Map(database.cards.map((card) => [card.id, card]))
cardById.get('card-im-it-db-relational-model-02').pastPaperRefs = [
  'q-pp-im-it-106-2',
  'q-pp-im-it-114-18',
]
cardById.get('card-im-it-db-relational-model-03').pastPaperRefs = ['q-pp-im-it-106-4']
cardById.get('card-im-it-db-relational-model-05').pastPaperRefs = ['q-pp-im-it-110-23']
cardById.get('card-im-it-db-relational-model-06').front =
  '請列舉 DBMS 相較一般檔案系統的三項常見優勢。'
cardById.get('card-im-it-db-relational-model-06').pastPaperRefs = ['q-pp-im-it-110-23']
cardById.get('card-im-it-db-transactions-04').pastPaperRefs = ['q-pp-im-it-107-7']

const osPath = '.work/im-it-lessons-os.json'
const os = read(osPath)
const processLesson = os.lessons[0]
processLesson.sections[1].body =
  'program 是靜態的指令與資料，process 則是程式的一次執行實例。作業系統為 process 維護 PID、位址空間與已開啟資源，並為其中每個 thread 維護 program counter、register state 與 stack。不同 process 原則上受記憶體保護而隔離，不會因為由同一 parent 建立就自動共享位址空間。'
processLesson.sections[3].body = processLesson.sections[3].body.replace(
  'mode switch 是權限層級改變，不一定等同切換到另一個 process。',
  'mode switch 是權限層級改變，不一定等同 scheduler 切換到另一個 process/thread；本文的 context switch 專指這種 execution entity 的切換。',
)
processLesson.workedExamples[0].answer =
  '不會。兩個 processes 各有自己的受保護位址空間；各 process 內的 threads 分別持有 stack、program counter 與 registers，只有透過明確 IPC 機制才交換資料。'
processLesson.workedExamples[2].prompt =
  '程式呼叫 read() 讀檔，CPU 進入 kernel mode，完成後回到同一 thread。這一定是 process/thread context switch 嗎？'
processLesson.workedExamples[2].answer =
  '不一定。這一定發生 mode switch，但只有 scheduler 實際換到另一個 thread/process 時才是 process/thread context switch。'
const osContextCard = os.cards.find((card) => card.id === 'card-im-it-os-processes-threads-06')
osContextCard.front = 'system call 一定會造成 process/thread context switch 嗎？'

for (const artifact of [network, database, os]) {
  for (const lesson of artifact.lessons) lesson.reviewStatus = 'reviewed'
  for (const card of artifact.cards) card.reviewStatus = 'reviewed'
}

write(networkPath, network)
write(databasePath, database)
write(osPath, os)

console.log(
  JSON.stringify({
    networkExamples: network.lessons.map((lesson) => lesson.workedExamples.length),
    networkModelRefs: models.pastPaperRefs.length,
    dbExamples: database.lessons.map((lesson) => lesson.workedExamples.length),
    osExamples: processLesson.workedExamples.length,
  }),
)
