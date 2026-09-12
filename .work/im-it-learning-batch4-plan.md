# IM-IT 第四批高頻學習模組

## 目標

延續第三批的 grouped lesson 與 evidence threshold，補齊目前尚未有課程、但 auto-grade eligible 考古題最多的 9 個子主題。NoSQL 題數稀疏且有一題 OCR 破損，因此與 Big Data 組成同一堂，不引用破損或 disputed 題湊數。

## 第四批 5 堂

- [ ] 新興科技與數位應用
- [ ] Big Data、分散式資料庫與 NoSQL
- [ ] IP 定址、路由與傳輸層
- [ ] 記憶體階層與資料表示
- [ ] CPU 排程與記憶體管理

## 品質門檻

- [ ] 每堂至少 4 sections、3 worked examples、6 cards
- [ ] 所有 past-paper refs 必須 autoGradeEligible 且落在 coveredSubtopicIds
- [ ] 稀疏主題以 reviewed minimumPastPaperRefs 明示門檻，不借題湊數
- [ ] 使用 reviewed source registry，答案明示為非官方技術覆核
- [ ] 作者以外 reviewer 完成技術、來源與 refs 複查
- [ ] 通過自然教學風格檢查：中文先行、短段落、考題線索導向、移除內部審核術語

## 驗收

- [ ] 更新 lessons/cards counts 與動態覆蓋率 tests
- [ ] 完整 tests、typecheck、paper integrity、production build
- [ ] 隔離 commit、push、Cloudflare deploy、production 驗證
