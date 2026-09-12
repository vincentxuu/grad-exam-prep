import type { LearningBeginnerGlossaryTerm } from '@/lib/learning'

interface Props {
  terms: LearningBeginnerGlossaryTerm[]
}

export function LearningBeginnerGlossary({ terms }: Props) {
  if (terms.length === 0) return null

  return (
    <section className="space-y-4" aria-labelledby="beginner-glossary-title">
      <div>
        <p className="text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-300">
          第一次接觸也沒關係
        </p>
        <h2 id="beginner-glossary-title" className="mt-1 text-balance text-lg font-semibold">
          這堂先懂這些詞
        </h2>
        <p className="mt-1 text-pretty text-sm leading-6 text-muted-foreground">
          先記住白話意思，不必急著背英文。看到正文時，再把正式名稱接回來。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {terms.map((term) => (
          <article key={term.id} className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h3 className="text-base font-semibold">{term.label}</h3>
              {term.aliases.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  也會看到：{term.aliases.join('、')}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-pretty text-sm font-medium leading-6">{term.plainDefinition}</p>
            <dl className="mt-3 space-y-2 border-t pt-3 text-xs leading-5 text-muted-foreground">
              <div>
                <dt className="inline font-semibold text-foreground">生活例子：</dt>{' '}
                <dd className="inline">{term.everydayExample}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-foreground">別搞混：</dt>{' '}
                <dd className="inline">{term.confusionNote}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
