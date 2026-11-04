import { Scramble } from '../hud/Scramble'
import { useReveal } from '../scroll/useReveal'

interface Props {
  /** Small mono line above the heading, e.g. "01 · home planet". */
  kicker: string
  title: string
  id?: string
}

/** Section h2 that "decrypts" the first time it scrolls into view (part of the scroll reveal, so always on). */
export function SectionHeading({ kicker, title, id }: Props) {
  const [ref, state] = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className="section-heading" data-reveal={state}>
      <p className="section-kicker mono">
        <span className="dot" aria-hidden="true" /> {kicker}
      </p>
      <h2 id={id}>
        <Scramble text={title} active={state === 'in'} />
      </h2>
    </div>
  )
}
