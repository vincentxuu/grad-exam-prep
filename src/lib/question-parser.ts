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

export function parseQuestion(text: string): ParsedQuestion {
  const lines = text.split('\n')
  const optionStartIdx = lines.findIndex((l) => {
    const parsed = parseOptionLine(l)
    return parsed?.label === 'a'
  })

  if (optionStartIdx === -1) {
    return { stem: text.trim(), options: null }
  }

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

  if (options.length < 2) {
    return { stem: text.trim(), options: null }
  }

  return { stem, options }
}
