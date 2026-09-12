'use client'

import type { InteractiveBlock as InteractiveBlockType } from '@/lib/learning'
import { InteractiveQuiz } from '@/components/exam/interactive-quiz'
import { InteractiveReveal } from '@/components/exam/interactive-reveal'
import { InteractiveSlider } from '@/components/exam/interactive-slider'

interface Props {
  block: InteractiveBlockType
}

export function InteractiveBlock({ block }: Props) {
  switch (block.type) {
    case 'quiz':
      return <InteractiveQuiz {...block} />
    case 'reveal':
      return <InteractiveReveal {...block} />
    case 'slider':
      return <InteractiveSlider {...block} />
  }
}
