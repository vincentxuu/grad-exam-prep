import { cn } from '@/lib/utils'

interface Props {
  text: string
  className?: string
}

// Parse markdown table rows: | a | b | c |
function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .map((c) => c.trim())
    .filter((_, i, arr) => i > 0 && i < arr.length - 1)
}

function isTableRow(line: string) {
  return line.trim().startsWith('|') && line.trim().endsWith('|')
}

function isSeparatorRow(line: string) {
  return isTableRow(line) && /^\|[\s\-:|]+\|$/.test(line.trim())
}

// Split text into alternating plain-text and table segments
function parseSegments(text: string): Array<{ type: 'text' | 'table'; content: string }> {
  const lines = text.split('\n')
  const segments: Array<{ type: 'text' | 'table'; content: string }> = []
  let i = 0

  while (i < lines.length) {
    // Look ahead: is this the start of a markdown table?
    if (isTableRow(lines[i]) && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      // Collect all table lines
      const tableLines: string[] = []
      while (i < lines.length && isTableRow(lines[i])) {
        if (!isSeparatorRow(lines[i])) tableLines.push(lines[i])
        i++
      }
      segments.push({ type: 'table', content: tableLines.join('\n') })
    } else {
      // Collect consecutive non-table lines
      const textLines: string[] = []
      while (
        i < lines.length &&
        !(isTableRow(lines[i]) && i + 1 < lines.length && isSeparatorRow(lines[i + 1]))
      ) {
        textLines.push(lines[i])
        i++
      }
      const content = textLines.join('\n').trim()
      if (content) segments.push({ type: 'text', content })
    }
  }

  return segments
}

function MarkdownTable({ content }: { content: string }) {
  const rows = content.split('\n').filter(Boolean).map(parseTableRow)
  if (rows.length === 0) return null

  const [header, ...body] = rows

  return (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-sm border-collapse border border-border">
        <thead>
          <tr className="bg-muted/50">
            {header.map((cell, j) => (
              <th
                key={j}
                className="border border-border px-2 py-1.5 text-left font-medium text-xs"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-muted/20' : ''}>
              {row.map((cell, j) => (
                <td key={j} className="border border-border px-2 py-1.5 text-xs">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function QuestionText({ text, className }: Props) {
  const segments = parseSegments(text)

  return (
    <div className={cn('text-sm leading-relaxed', className)}>
      {segments.map((seg, i) =>
        seg.type === 'table' ? (
          <MarkdownTable key={i} content={seg.content} />
        ) : (
          <p key={i} className="whitespace-pre-wrap">
            {seg.content}
          </p>
        )
      )}
    </div>
  )
}
