import { TriangleAlert } from '@sketchyicons/react'
import { getPaperContentIssue } from '@/lib/content'

const LABEL = {
  incomplete: '這份卷子的內容不完整',
  suspect: '這份卷子的內容可能不屬於這一年',
} as const

/**
 * 掛在題目上方的警告。
 *
 * 存在的理由：壞掉的卷子在畫面上與正常卷子長得一模一樣 —— 題數齊、每題有答案、
 * 每題有詳解 —— 使用者沒有辦法自己看出來哪一份不能信。
 */
export function PaperContentWarning({ paperId }: { paperId: string }) {
  const paper = getPaperContentIssue(paperId)
  if (!paper?.contentStatus) return null

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950">
      <p className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
        <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
        {LABEL[paper.contentStatus]}
      </p>
      <p className="mt-1 text-amber-800 dark:text-amber-300">{paper.contentIssue}</p>
      <p className="mt-1 text-amber-800 dark:text-amber-300">
        修好之前這份不計入模擬考。
        {paper.url ? (
          <>
            {' '}
            要對答案請看{' '}
            <a className="underline" href={paper.url} rel="noreferrer" target="_blank">
              原始考卷 PDF
            </a>
            。
          </>
        ) : null}
      </p>
    </div>
  )
}
