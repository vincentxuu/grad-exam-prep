import fs from 'node:fs'

const targets = [
  '.work/im-it-lessons-os.json',
  '.work/im-it-lessons-db.json',
  'public/data/im-it-lessons.json',
]

const scenarios = {
  'lesson-im-it-os-processes-threads': {
    title: '一間忙碌的餐廳',
    hook:
      '把一個 process 想成一間有自己廚房、食材和設備的餐廳；同一間廚房裡可以有多位廚師同時工作，就像一個 process 裡有多條 threads。廚師共享廚房，所以傳遞材料很快，但兩個人同時改同一張訂單也可能互相覆蓋。',
    predict:
      '兩位廚師都看得到同一張訂單，是否代表他們可以同時修改，而且一定不會出錯？',
    mapping: [
      { everyday: '各自獨立的餐廳與廚房', technical: '不同 processes 的受保護位址空間與資源' },
      { everyday: '同一間廚房裡的多位廚師', technical: '同一 process 裡共享 code、heap 與資源的 threads' },
      { everyday: '每位廚師自己的工作小抄與手上進度', technical: '每條 thread 獨立的 stack、program counter 與 registers' },
      { everyday: '分店之間透過電話或外送單傳話', technical: 'processes 透過 IPC 或明確 shared memory 交換資料' },
      { everyday: '暫停一位廚師，讓另一位接著工作', technical: '保存與恢復 execution state 的 context switch' },
    ],
    boundary:
      '真實 thread 沒有人的自主判斷，何時執行由 scheduler 與硬體決定；餐廳也無法完整呈現記憶體保護、同步原語與切換成本。',
    examCues: [
      '同一個 process、共享 code 與 heap：先想到 threads。',
      '各自擁有 stack、program counter、registers：仍然是在描述每條 thread 的獨立狀態。',
      '不同 processes 要交換資料：先找 pipe、message passing、socket 或 shared memory。',
      'system call 進入 kernel：一定有 mode switch，但不一定換了執行主體。',
    ],
  },
  'lesson-im-it-db-transactions-01': {
    title: '轉帳到一半，銀行突然斷電',
    hook:
      '你從帳戶 A 轉 200 元給朋友：A 扣款與 B 入帳必須被當成同一件事。如果扣完款就斷電，系統不能留下錢憑空消失的結果；如果兩位行員同時用舊餘額更新同一帳戶，也不能讓其中一筆修改悄悄被蓋掉。',
    predict:
      '畫面已經顯示「轉帳成功」，但最新資料頁還沒寫回磁碟就斷電，重新開機後應該取消這筆轉帳，還是把它恢復完成？',
    mapping: [
      { everyday: '扣款與入帳合在同一筆轉帳', technical: '一個 transaction 的操作邊界' },
      { everyday: '銀行正式確認轉帳成功', technical: 'COMMIT；結果進入必須保留的狀態' },
      { everyday: '尚未確認就把途中修改撤回', technical: 'ROLLBACK 或復原時 UNDO 未提交交易' },
      { everyday: '先留下可追查的交易紀錄', technical: 'write-ahead logging：log 必須先於 data page 持久化' },
      { everyday: '兩位行員同時更新同一筆餘額', technical: '並行 transactions 可能產生 lost update 等異常' },
    ],
    boundary:
      '銀行故事最適合解釋 atomicity 與 durability，但 consistency 還依賴資料庫限制和業務規則；isolation 也不是禁止並行，而是要求並行結果符合指定保證。',
    examCues: [
      'all or nothing、只完成一半：先想到 Atomicity。',
      '已 COMMIT、故障後仍要存在：先想到 Durability 與 REDO。',
      '讀到之後可能 ROLLBACK 的值：先想到 dirty read。',
      '兩次都用舊值計算，後寫者覆蓋前寫者：先想到 lost update。',
    ],
  },
}

for (const file of targets) {
  const document = JSON.parse(fs.readFileSync(file, 'utf8'))
  let changed = 0

  for (const lesson of document.lessons) {
    const scenario = scenarios[lesson.id]
    if (!scenario) continue
    lesson.learningScenario = scenario
    changed += 1
  }

  if (changed === 0) throw new Error(`${file}: no target lessons found`)
  fs.writeFileSync(file, `${JSON.stringify(document, null, 2)}\n`)
  console.log(`${file}: updated ${changed} lesson(s)`)
}
