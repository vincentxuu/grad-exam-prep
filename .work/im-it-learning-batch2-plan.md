# IM-IT 第二批學習模組

## 目標

在第一批 5 個子主題之後，再發布 5 個高頻且可形成完整概念閉環的子主題。選擇依序考量：

1. 已通過 auto-grade gate 的考古題數
2. 是否能以可信來源寫成獨立短課
3. 是否能擴張目前只涵蓋網路、資料庫、作業系統的主題面

## 候選範圍

- [x] CPU 與指令架構：9 題，8 題可判分
- [x] 密碼學：9 題，排除 2 題錯置 blockchain/mining 後 6 題可用
- [x] 檔案、儲存與 I/O：8 題，8 題可判分
- [x] 虛擬化與容器：6 題，6 題可判分
- [x] 資料鏈結層與區域網路：7 題，7 題可判分

密碼學原 taxonomy 的 8 題 eligible 中有 2 題其實是 blockchain/mining，本批排除。預計新增 5 堂課、至少 30 張概念卡，串接 35 題可判分考古題；總覆蓋從 5/58 提升到 10/58 子主題。

## 發布 gate

- [x] 每堂至少 3 個目標、4 段核心內容、2 個 worked examples、3 個常見陷阱
- [x] 每堂與每張卡都有 reviewed source refs 與同 subtopic 的 past-paper refs
- [x] 所有 past-paper refs 必須 autoGradeEligible，排除 disputed/self-review 題
- [x] 草稿由非作者 reviewer 做技術與 refs 複查
- [x] 科目頁覆蓋率與課程列表由資料自動計算，不硬編碼第一批數字
- [x] 完整 tests、typecheck、paper integrity、production build
- [x] 隔離 commit、push、Cloudflare deploy 與 production 驗證

## 不做

- 不把 legacy 非英文閃卡重新放回 SRS
- 不為題數低或 disputed 比例高的子主題製造空課程
- 不把技術覆核答案標成官方答案
