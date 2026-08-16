# 資管所新手名詞層 Goal

## Scope

讓完全沒有背景的讀者也能讀完 IM-IT 35 堂（覆蓋 61 子主題）、IM-MIS 7 堂（24 子主題）與 IM-STAT 6 堂（11 子主題）；不是另外做一頁孤立字典，而是把必要解釋放回每堂課的閱讀動線。

## Content

- [x] 盤點三科所有 lessons 的未解釋縮寫、英文術語、符號與抽象概念。
- [x] 建立 reviewed glossary authority：preferred label、aliases、白話定義、生活例子、易混淆邊界、lesson IDs。
- [x] 每堂課精選 3–6 個「先懂這些詞」，避免堆成另一面術語牆。
- [x] 正文第一次出現的裸縮寫與高門檻詞改成新手可讀寫法。

## Product integration

- [x] 共用 lesson UI 在課程摘要前顯示完整可見的新手名詞卡。
- [x] 保持 Server Component，不新增 client JavaScript、遠端 fetch 或 hydration 成本。
- [x] 手機版不使用擁擠表格；鍵盤、螢幕閱讀器與深色模式可用。

## Release gates

- [x] 48/48 lessons（共覆蓋 96 子主題）皆有 3–6 個閉合且不重複的 glossary refs。
- [x] glossary aliases、lesson refs 與正文術語通過 validators／tests。
- [x] 既有 content、paper integrity、Jest、typecheck、build 無回歸。
- [x] PR Checks、main 合併、Cloudflare deploy 與 production 抽查完成。

## Completion evidence

- PR #17 merged as `5f5b21a`；GitHub Checks 與 Cloudflare deployment run `31956671413` 成功。
- Production 已抽查 IM-IT、IM-MIS、IM-STAT 代表課程，三頁皆在摘要前呈現「這堂先懂這些詞」、生活例子與易混淆提醒。
