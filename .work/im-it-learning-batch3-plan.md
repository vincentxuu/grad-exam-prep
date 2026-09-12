# IM-IT 第三批：taxonomy 清理與跨子主題課程

## 目標

先修正已知錯置題與單一 subtopic lesson 限制，再補齊資料結構、程式語言與 AI 三個目前沒有課程的頂層主題。

## Taxonomy

- [x] Heap 題從 trees-bst 移到 heaps-priority-queues
- [x] precision／accuracy 題移到 training-evaluation
- [x] Big Data 題移到獨立的「資料分析與新興科技」主題
- [x] Fintech／MOOC／行動支付等題移到 emerging-digital-applications
- [x] blockchain／mining 題移到新的 blockchain 子主題
- [x] malware／social engineering／DDoS 題移到正確資安子主題
- [x] 全部 metadata、counts 與 concept-master tests 同步

## Lesson schema

- [x] 新增 `coveredSubtopicIds`
- [x] 每題 primarySubtopicId 必須落在 lesson coveredSubtopicIds
- [x] Card refs 仍須屬於 lesson refs 子集
- [x] 單一 subtopic 舊課程遷移為單元素 coveredSubtopicIds

## 第三批 5 堂

- [x] 複雜度、排序與搜尋
- [x] Tree、Heap 與 Priority Queue
- [x] 物件導向程式設計
- [x] AI／機器學習與模型評估基礎
- [x] SQL 查詢

每堂至少 4 sections、3 worked examples、6 cards，所有考古題 refs 經 auto-grade gate 且答案標示非官方。

## 驗收

- [x] 作者以外 reviewer 完成技術與 refs 複查
- [x] 科目頁顯示動態 covered subtopics，而不是 lessons 數量
- [x] 完整 tests、typecheck、paper integrity、production build
- [x] 隔離 commit、push、Cloudflare deploy、production 驗證
