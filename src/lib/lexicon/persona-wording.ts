import { toTaiwanTraditional } from '@/lib/llm/traditional-chinese'
import type { PersonalBridge, PersonaProfile } from '@/types/lexicon'

/**
 * OpenCC should normalize model-authored prose, not silently rename concepts the
 * user supplied in their persona. Restore those terms after normalization so a
 * persona containing `攀岩` cannot come back as `攀巖` from either generation or
 * an older cache row.
 */
export function preservePersonaWording(
  bridge: PersonalBridge,
  persona: PersonaProfile
): PersonalBridge {
  const originalTerms = [persona.work, persona.goal ?? '', ...persona.interests]
    .map((term) => term.trim())
    .filter(Boolean)

  const replacements = Array.from(new Set(originalTerms))
    .map((original) => ({ original, normalized: toTaiwanTraditional(original) }))
    .filter(({ original, normalized }) => original !== normalized)
    .sort((a, b) => b.normalized.length - a.normalized.length)

  if (replacements.length === 0) return bridge

  const restore = (text: string) =>
    replacements.reduce(
      (current, { original, normalized }) => current.replaceAll(normalized, original),
      text
    )

  return {
    ...bridge,
    examples: bridge.examples.map((example) => ({ ...example, zh: restore(example.zh) })),
    mnemonic: restore(bridge.mnemonic),
  }
}
