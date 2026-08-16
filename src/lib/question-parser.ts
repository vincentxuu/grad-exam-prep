// Parses MCQ options from question text
// Supports: "a. text", "(a) text", "(A) text", "A. text", "A) text"

const OPTION_LABELS = ['a', 'b', 'c', 'd', 'e']

interface ParsedQuestion {
  stem: string
  options: { label: string; text: string }[] | null
}

const OPTION_RE = /^[\(\[]?([a-eA-E])[\)\].][\s]+(.+)/

function parseOptionLine(line: string): { label: string; text: string } | null {
  const m = line.trim().match(OPTION_RE)
  if (!m) return null
  return { label: m[1].toLowerCase(), text: m[2].trim() }
}

interface ParsedInlineOptions {
  optionStart: number
  options: { label: string; text: string }[]
}

function parseInlineOptions(line: string): ParsedInlineOptions | null {
  const matches = [...line.matchAll(/\(([A-Ea-e])\)\s+(.*?)(?=\s+\([A-Ea-e]\)|$)/g)]
  if (matches.length < 2) return null
  return {
    optionStart: matches[0].index ?? 0,
    options: matches.map((m) => ({ label: m[1].toLowerCase(), text: m[2].trim() })),
  }
}

export function parseQuestion(text: string): ParsedQuestion {
  const lines = text.split('\n')
  const optionStartIdx = lines.findIndex((l) => {
    const parsed = parseOptionLine(l)
    return parsed?.label === 'a'
  })

  if (optionStartIdx !== -1) {
    const stem = lines.slice(0, optionStartIdx).join('\n').trim()
    const optionLines = lines.slice(optionStartIdx)

    // Merge continuation lines into options
    const options: { label: string; text: string }[] = []
    let current: { label: string; text: string } | null = null

    for (const line of optionLines) {
      const parsed = parseOptionLine(line)
      if (parsed && OPTION_LABELS.includes(parsed.label)) {
        if (current) options.push(current)
        current = parsed
      } else if (current && line.trim()) {
        current.text += ' ' + line.trim()
      }
    }
    if (current) options.push(current)

    if (options.length >= 2) {
      return { stem, options }
    }
  }

  // Fallback: try inline option parsing — e.g. "(A) word (B) word (C) word (D) word"
  for (let i = lines.length - 1; i >= 0; i--) {
    const inline = parseInlineOptions(lines[i])
    if (inline) {
      const stem = [...lines.slice(0, i), lines[i].slice(0, inline.optionStart)].join('\n').trim()
      return { stem, options: inline.options }
    }
  }

  return { stem: text.trim(), options: null }
}
