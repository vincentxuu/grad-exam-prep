# 資管所完整學習內容發布 Goal

## Scope

以 `origin/main` 為唯一程式基線，完成 IM-MIS 與 IM-STAT 的正式學習內容；維持 IM-IT 61/61 無回歸。CS 科目不在本次範圍，舊 dirty worktree 只作 evidence 來源，不直接合併。

## Authority and safety

- [x] 從最新 `origin/main` 建立獨立 `agent/im-completion` worktree。
- [x] 逐項搬移並驗證 MIS／STAT 的 PDF-backed repairs，不採用舊錯置 `answers.json`。
- [x] 建立可重跑的 builders、validators 與 review artifacts，讓 `public/data`、catalog registration、tests 成為發布 authority。

## IM-MIS

- [x] 37/37 大題與 76 個子題完成 PDF fidelity、canonical taxonomy 與 question metadata。
- [x] 所有題目標示 open-ended；移除 A–E 假判分並建立逐小題 self-review rubric。
- [x] 建立 answer provenance、review count、confidence、unresolved issues 與 eligibility gate。
- [x] 建立 reviewed source registry、完整 lessons、生活情境／mapping／boundary 與課內概念卡。
- [x] 重建正式 curated SRS deck，不恢復無來源 legacy cards。

## IM-STAT

- [x] 鎖定 114–115 共 5 大題的 PDF-backed 題面與子題結構；106–113 明示考科不適用。
- [x] 完成非官方解答雙審、公式／數值步驟 rubric、容差或 self-review grading policy。
- [x] 建立 canonical concepts、reviewed sources、4 堂 PDF-backed 微課與必要先備課。
- [x] 建立生活情境／mapping／boundary、課內概念卡與 curated SRS deck。

## Shared product integration

- [x] MIS／STAT 正式註冊 learning catalog、科目首頁、lesson static params 與今日學習入口。
- [x] Open-ended／manual-review 題不進 auto-grade 或 full mock；練習可揭露 rubric、自評並返回課程。
- [x] SRS、lesson concept cards 與題庫三者命名及數量不混淆。
- [x] 手機與桌面閱讀、練習 queue、進度與空狀態皆有 regression tests。

## Release gates

- [x] MIS／STAT 專用 validators 與 cross-file closure 全過。
- [x] `validate:content`、paper integrity、Jest、typecheck、production build 全過。
- [x] Ready PR Checks 成功並合併至 `main`。
- [x] Cloudflare deploy 成功，production 實頁完成抽查。

## Completion evidence

- PR: `#16`，squash merge `0672c975dd5b20efc12c36540179b00833f48e71`
- Checks: GitHub `Typecheck, test & content integrity` 成功
- Deploy: GitHub run `31954921113` 成功，Cloudflare version `ca97ee58-bb2a-4cec-a16c-8973e593d6ff`
- Production: `https://grad-exam-prep.vincent-xu-work.workers.dev`
- Smoke test: MIS 7 堂／24 子主題、STAT 6 堂／11 子主題；API 提供 48 張 MIS 與 18 張 STAT curated cards，IM-IT legacy deck 仍隔離
