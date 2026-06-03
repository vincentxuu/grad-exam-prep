import type { Metadata } from 'next'
import { exams, getSubjectsByExam } from '@/lib/content'

export const metadata: Metadata = { title: '兩所比較 | 台大研所備考' }

const rows = [
  {
    label: '考試形式',
    im: '筆試 60% + 口試 40%',
    cs: '100% 筆試（無口試）',
  },
  {
    label: '錄取率',
    im: '≈ 7–8%（115年：240人報名，19正取）',
    cs: '≈ 5.3%（115年：1243人報名，66正取）',
  },
  {
    label: '核心考科',
    im: '英文B + 計概 + MIS + 統計',
    cs: '英文A + 數學（線代+離散）+ 計結OS + 資結演算法',
  },
  {
    label: '記憶 vs 理解',
    im: '記憶比重較高（MIS申論、時事）',
    cs: '理解與推導比重高（數學推導、演算法）',
  },
  {
    label: '備考時間',
    im: '6–8 個月（全職）',
    cs: '6–9 個月（有CS基礎）',
  },
  {
    label: '跨考難度',
    im: '中等（商管背景可跨）',
    cs: '高（需扎實CS基礎）',
  },
  {
    label: '補習建議',
    im: '強烈建議（MIS申論難自學）',
    cs: '建議（或搭配公開課）',
  },
  {
    label: '一階 vs 二階',
    im: '口試是關鍵，需提早準備',
    cs: '無口試，筆試決勝負',
  },
  {
    label: '共同考科',
    im: '英文（與資工所不共通，英文B較難）',
    cs: '英文（英文A，佔10%）',
  },
]

export default function ComparePage() {
  const imExam = exams.find((e) => e.id === 'im')!
  const csExam = exams.find((e) => e.id === 'cs')!
  const imSubjects = getSubjectsByExam('im')
  const csSubjects = getSubjectsByExam('cs')

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">兩所比較</h1>
        <p className="text-muted-foreground text-sm mt-1">
          台大資管所 vs 台大資工所 — 考試形式、難度、備考策略全面對比
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground w-28">維度</th>
              <th className="text-left p-3 font-medium">
                <span className="text-blue-600 dark:text-blue-400">資管所</span>
                <span className="text-xs text-muted-foreground ml-1">（代碼709）</span>
              </th>
              <th className="text-left p-3 font-medium">
                <span className="text-violet-600 dark:text-violet-400">資工所</span>
                <span className="text-xs text-muted-foreground ml-1">（代碼905）</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                <td className="p-3 font-medium text-muted-foreground">{row.label}</td>
                <td className="p-3">{row.im}</td>
                <td className="p-3">{row.cs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold text-blue-600 dark:text-blue-400">
            適合報考資管所，如果你⋯
          </h2>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>✓ 有管理或商管背景</li>
            <li>✓ 擅長記憶與文字表達</li>
            <li>✓ 對MIS、數位轉型感興趣</li>
            <li>✓ 可以接受口試評分機制</li>
            <li>✓ 目標企業管理顧問或PM職涯</li>
          </ul>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold text-violet-600 dark:text-violet-400">
            適合報考資工所，如果你⋯
          </h2>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>✓ 有扎實的CS/數學基礎</li>
            <li>✓ 擅長推導與程式設計</li>
            <li>✓ 對演算法、系統軟體感興趣</li>
            <li>✓ 不喜歡口試不確定性</li>
            <li>✓ 目標系統工程師或研究職涯</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
