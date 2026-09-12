# IM-IT 第一批學習路線

## 範圍

依 260 題 taxonomy 的出題頻率，先完成五個最高頻且可形成完整概念閉環的子主題：

1. Network models & encapsulation：16 題
2. Application protocols：12 題
3. Relational model：10 題
4. Processes & threads：10 題
5. Database transactions：10 題

taxonomy 內合計 58 題；發布時只連結其中 51 題已通過自動判分 gate 的考古題。

## 交付

- [x] 5 份短講義：目標、核心概念、worked examples、常見錯誤
- [x] 32 張重新策展且有來源的概念卡
- [x] source registry 與穩定 source ID
- [x] 每份講義連到已覆核真題
- [x] lesson/card validator 與回歸測試
- [x] 科目頁顯示「第一批可學內容」
- [x] lesson 詳情頁：講義 → 概念卡 → 真題入口
- [x] 不重新啟用 quarantined legacy flashcards
- [x] 隔離提交、推送、部署與線上確認

## 發布 gate

- 草稿須經另一個獨立 reviewer 檢查技術正確性、文字清楚度與 refs。
- 所有 `pastPaperRefs` 必須存在且符合相同 subtopic。
- card 必須指向已發布 lesson，且至少一個 source ref 與一個 past-paper ref。
- 只開放本批五個模組；其餘 53 個子主題仍顯示題數，但不顯示假講義入口。
